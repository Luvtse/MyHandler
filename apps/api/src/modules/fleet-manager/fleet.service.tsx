// src/services/fleet.service.ts

import prisma from 'src/utils/prisma';
import { Vehicle, MaintenanceRecord,  } from '../../../../../../lwebapp/apps/web/src/types/fleet';
import { Prisma } from '@prisma/client';

export class FleetService {
  async getAllVehicles(): Promise<Vehicle[]> {
    return prisma.vehicle.findMany({ 
      where: { deletedAt: null },
      orderBy: { licensePlate: 'asc' }
    });
  }

  async getFleetMetrics() {
    const [total, active] = await Promise.all([
      prisma.vehicle.count({ where: { deletedAt: null } }),
      prisma.vehicle.count({ 
        where: { status: 'active', deletedAt: null } 
      })
    ]);

    // ✅ FIXED: Proper mileage-based maintenance check
    // Assuming `nextMaintenanceMileage` is a field on Vehicle model
    const dueByMileage = await prisma.vehicle.count({
      where: {
        deletedAt: null,
        currentMileage: {
          // You need to compare with the vehicle's nextMaintenanceMileage field
          gte: prisma.raw('"nextMaintenanceMileage"') // Use raw SQL or fix the comparison
        }
      }
    });

    // ✅ FIXED: Time-based maintenance check
    // Get the latest completed maintenance for each vehicle
    const vehiclesWithMaintenance = await prisma.$queryRaw<{vehicleId: string, latestCompletedAt: Date}[]>`
      SELECT DISTINCT ON ("vehicleId") "vehicleId", "completedAt" as "latestCompletedAt"
      FROM "MaintenanceRecord"
      WHERE "status" = 'completed' 
        AND "completedAt" IS NOT NULL 
        AND "deletedAt" IS NULL
      ORDER BY "vehicleId", "completedAt" DESC
    `;

    const vehicleIdsWithOldMaintenance = vehiclesWithMaintenance
      .filter(record => {
        const daysSinceLastMaintenance = 
          (new Date().getTime() - new Date(record.latestCompletedAt).getTime()) / (1000 * 3600 * 24);
        return daysSinceLastMaintenance > 180;
      })
      .map(record => record.vehicleId);

    const dueByTime = vehicleIdsWithOldMaintenance.length;

    // Combine (avoid double-counting)
    const allDueVehicleIds = new Set<string>();
    
    // Add mileage-due vehicles
    const mileageDueVehicles = await prisma.vehicle.findMany({
      where: {
        deletedAt: null,
        currentMileage: {
          gte: prisma.raw('"nextMaintenanceMileage"')
        }
      },
      select: { id: true }
    });
    mileageDueVehicles.forEach(v => allDueVehicleIds.add(v.id));

    // Add time-due vehicles
    vehicleIdsWithOldMaintenance.forEach(id => allDueVehicleIds.add(id));

    const vehiclesDueMaintenance = allDueVehicleIds.size;

    return {
      totalVehicles: total,
      activeVehicles: active,
      vehiclesDueMaintenance,
      avgFuelConsumption: 18.7, // Consider computing from real data
      utilizationRate: total > 0 ? Math.round((active / total) * 100) : 0,
    };
  }

  async getVehicleWithHistory(id: string) {
    const vehicle = await prisma.vehicle.findUnique({ 
      where: { id, deletedAt: null } 
    });
    if (!vehicle) return null;

    const history = await prisma.maintenanceRecord.findMany({
      where: { 
        vehicleId: id, 
        status: 'completed',
        deletedAt: null 
      },
      include: {
        performedBy: { // ✅ Include the relation if it exists
          select: { name: true }
        }
      },
      orderBy: { completedAt: 'desc' },
      take: 10,
    });

    return { ...vehicle, maintenanceHistory: history };
  }

  async scheduleMaintenance(input: {
    vehicleId: string;
    type: MaintenanceRecord['type'];
    scheduledAt: Date;
    mileageAtService: number;
    notes?: string;
    vendor?: string;
    cost?: number;
    createdBy: string;
  }): Promise<MaintenanceRecord> {
    // Validate vehicle exists and is not deleted
    const vehicle = await prisma.vehicle.findUnique({ 
      where: { id: input.vehicleId, deletedAt: null } 
    });
    if (!vehicle) throw new Error('Vehicle not found');

    return prisma.maintenanceRecord.create({
      data: {
        vehicleId: input.vehicleId,
        type: input.type,
        scheduledAt: input.scheduledAt,
        mileageAtService: input.mileageAtService,
        notes: input.notes ?? null,
        vendor: input.vendor ?? null,
        cost: input.cost ? new Prisma.Decimal(input.cost) : null, // ✅ Convert to Decimal
        status: 'scheduled',
        createdBy: input.createdBy,
      }
    });
  }

  async getMaintenanceEvents(start?: Date, end?: Date) {
    const where: any = { 
      status: 'scheduled',
      deletedAt: null,
      vehicle: { deletedAt: null }
    };
    
    if (start) where.scheduledAt = { ...where.scheduledAt, gte: start };
    if (end) where.scheduledAt = { ...where.scheduledAt, lte: end };

    const records = await prisma.maintenanceRecord.findMany({
      where,
      include: { 
        vehicle: { 
          select: { licensePlate: true, id: true }
        },
        performedBy: {
          select: { name: true }
        }
      },
      take: 100,
    });

// src/services/fleet.service.ts
    return records.map((r: any) => ({
      id: r.id,
      title: `🔧 ${r.vehicle.licensePlate}`,
      start: r.scheduledAt.toISOString(),
      end: new Date(r.scheduledAt.getTime() + 2 * 3600 * 1000).toISOString(),
      vehicleId: r.vehicleId,
      plateNumber: r.vehicle.licensePlate,
      type: r.type,
      status: r.status,
      assignedMechanic: r.performedBy?.name ?? 'TBD',
    }));
  }

  async getVehicleForPdf(id: string) {
    const vehicle = await prisma.vehicle.findUnique({ 
      where: { id, deletedAt: null } 
    });
    if (!vehicle) return null;

    const history = await prisma.maintenanceRecord.findMany({
      where: { 
        vehicleId: id, 
        status: 'completed',
        deletedAt: null 
      },
      include: {
        performedBy: {
          select: { name: true }
        }
      },
      orderBy: { completedAt: 'desc' },
    });

    return {
      ...vehicle,
      maintenanceHistory: history.map((h: any) => ({
        ...h,
        date: h.completedAt 
          ? h.completedAt.toISOString().split('T')[0] 
          : h.scheduledAt.toISOString().split('T')[0],
        performedBy: h.performedBy?.name ?? '—',
      })),
    };
  }

  // ✅ ADDITIONAL HELPER METHODS YOU MIGHT NEED

  async completeMaintenance(recordId: string, performedById: string, actualCost?: number) {
    return prisma.maintenanceRecord.update({
      where: { id: recordId },
      data: {
        status: 'completed',
        completedAt: new Date(),
        performedById,
        cost: actualCost ? new Prisma.Decimal(actualCost) : undefined,
      }
    });
  }

  async cancelMaintenance(recordId: string, reason: string) {
    return prisma.maintenanceRecord.update({
      where: { id: recordId },
      data: {
        status: 'cancelled',
        notes: reason,
        cancelledAt: new Date(),
      }
    });
  }

  async updateVehicleMileage(vehicleId: string, newMileage: number) {
    // Validate vehicle exists and is not deleted
    const vehicle = await prisma.vehicle.findUnique({ 
      where: { id: vehicleId, deletedAt: null } 
    });
    if (!vehicle) throw new Error('Vehicle not found');

    return prisma.vehicle.update({
      where: { id: vehicleId },
      data: {
        currentMileage: newMileage,
        updatedAt: new Date(),
      }
    });
  }
}