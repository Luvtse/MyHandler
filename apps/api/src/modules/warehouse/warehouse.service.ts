/**
 * Warehouse Service
 * Real Prisma-backed data for the Warehouse Dashboard:
 *  - GET /api/warehouse/dashboard      aggregated metrics (inventory, shipments, equipment)
 *  - GET /api/warehouse/inventory      inventory items with derived stock status
 *  - POST /api/warehouse/inventory     create item
 *  - PATCH /api/warehouse/inventory/:id update item
 *  - DELETE /api/warehouse/inventory/:id delete item
 *  - POST /api/warehouse/scan          record a barcode/QR scan as a TrackingEvent
 */
import prisma from '../../utils/prisma';

// ─── Shared types (mirrored in apps/web/src/services/warehouse.ts) ──────────

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export interface InventoryRow {
  id: string;
  sku: string;
  name: string;
  description: string;
  quantity: number;
  location: string;
  reorderPoint: number;
  status: StockStatus;
  updatedAt: string;
}

export interface EquipmentRow {
  id: string;
  name: string;
  status: string; // Operational | Maintenance Required | In Transit | Decommissioned
  lastMaintenance: string | null;
  nextMaintenance: string | null;
}

export interface WarehouseDashboardData {
  inventory: InventoryRow[];
  equipment: EquipmentRow[];
  storage: {
    totalCapacity: number;
    usedCapacity: number;
    utilizationPct: number;
    zones: { zone: string; items: number; pct: number }[];
  };
  shipments: {
    incoming: number; // inbound awaiting processing today
    outgoing: number; // dispatched for delivery today
    deliveredToday: number;
    exceptions: number; // active exception/delay statuses
  };
  stats: {
    totalSkus: number;
    totalUnits: number;
    lowStockCount: number;
    outOfStockCount: number;
    operationalRatePct: number;
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const DAY_MS = 24 * 60 * 60 * 1000;

/** Default reorder point when not explicitly set: 20% of peak-ish stock. */
function deriveReorderPoint(quantity: number): number {
  return Math.max(5, Math.round(quantity * 0.25));
}

function stockStatus(quantity: number, reorderPoint: number): StockStatus {
  if (quantity <= 0) return 'out_of_stock';
  if (quantity <= reorderPoint) return 'low_stock';
  return 'in_stock';
}

function toRow(item: {
  id: string;
  sku: string;
  name: string;
  description: string;
  quantity: number;
  location: string;
  updatedAt: Date;
}): InventoryRow {
  const reorderPoint = deriveReorderPoint(item.quantity);
  return {
    id: item.id,
    sku: item.sku,
    name: item.name,
    description: item.description,
    quantity: item.quantity,
    location: item.location,
    reorderPoint,
    status: stockStatus(item.quantity, reorderPoint),
    updatedAt: item.updatedAt.toISOString(),
  };
}

const INBOUND_STATUSES = [
  'ORDER_RECEIVED',
  'LABEL_CREATED',
  'SHIPMENT_SCHEDULED',
  'AWAITING_PICKUP',
  'PICKED_UP',
  'IN_TRANSIT_TO_SORTING',
  'RECEIVED_AT_HUB',
  'ORIGIN_SCAN',
  'SCANNED_INBOUND',
  'SORTING_IN_PROGRESS',
] as const;

const OUTBOUND_STATUSES = [
  'DISPATCHED_FOR_DELIVERY',
  'IN_LOCAL_DELIVERY_FACILITY',
  'OUT_FOR_DELIVERY',
  'DELIVERY_ATTEMPTED',
] as const;

const DELIVERED_STATUSES = ['DELIVERED_SUCCESSFULLY', 'DELIVERY_CONFIRMED'] as const;

const EXCEPTION_STATUSES = [
  'WEATHER_DELAY',
  'TRANSPORTATION_DELAY',
  'CLEARANCE_DELAY',
  'SHIPMENT_ON_HOLD',
  'MISROUTED',
  'DELIVERY_EXCEPTION',
  'LOST_EXCEPTION',
  'DAMAGED_UPON_ARRIVAL',
] as const;

function vehicleEquipmentStatus(status: string, needsService: boolean): string {
  if (status === 'decommissioned') return 'Decommissioned';
  if (status === 'maintenance' || needsService) return 'Maintenance Required';
  if (status === 'inTransit') return 'In Transit';
  return 'Operational';
}

// ─── Loaders ─────────────────────────────────────────────────────────────────

async function loadInventory(): Promise<InventoryRow[]> {
  const items = await prisma.inventoryItem.findMany({ orderBy: { updatedAt: 'desc' } });
  return items.map(toRow);
}

async function loadEquipment(): Promise<EquipmentRow[]> {
  const vehicles = await prisma.vehicle.findMany({
    where: { deletedAt: null },
    orderBy: { updatedAt: 'desc' },
    include: {
      maintenanceRecords: {
        where: { deletedAt: null },
        orderBy: { scheduledAt: 'desc' },
        take: 2,
      },
    },
  });

  return vehicles.map((v) => {
    const completed = v.maintenanceRecords.filter((r) => r.status === 'completed');
    const upcoming = v.maintenanceRecords
      .filter((r) => r.status === 'scheduled' || r.status === 'inProgress' || r.status === 'delayed')
      .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime());

    const last = completed[0]?.scheduledAt ?? v.maintenanceRecords[0]?.scheduledAt ?? null;
    const next = upcoming[0]?.scheduledAt ?? null;
    const needsService =
      v.status === 'maintenance' ||
      upcoming.some((r) => r.scheduledAt.getTime() - Date.now() <= 7 * DAY_MS);

    return {
      id: v.id,
      name: `${v.make} ${v.model} (${v.vehicleNumber ?? v.vin.slice(-6)})`,
      status: vehicleEquipmentStatus(v.status, needsService),
      lastMaintenance: last ? last.toISOString().slice(0, 10) : null,
      nextMaintenance: next ? next.toISOString().slice(0, 10) : null,
    };
  });
}

function buildZones(rows: InventoryRow[], totalUnits: number) {
  const byZone = new Map<string, number>();
  for (const r of rows) {
    const zone = (r.location.split('-')[0] || 'UNASSIGNED').toUpperCase();
    byZone.set(zone, (byZone.get(zone) ?? 0) + r.quantity);
  }
  const capacityPerZone = Math.max(1, Math.ceil(totalUnits / Math.max(byZone.size, 1)));
  return [...byZone.entries()]
    .map(([zone, items]) => ({
      zone,
      items,
      pct: Math.min(100, Math.round((items / capacityPerZone) * 100)),
    }))
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 6);
}

// ─── Public API ──────────────────────────────────────────────────────────────

export async function getWarehouseDashboard(): Promise<WarehouseDashboardData> {
  const startOfToday = new Date(new Date().setHours(0, 0, 0, 0));

  const [rows, equipment, incoming, outgoing, deliveredToday, exceptions] = await Promise.all([
    loadInventory(),
    loadEquipment(),
    prisma.shipment.count({
      where: { status: { in: [...INBOUND_STATUSES] as any[] }, updatedAt: { gte: startOfToday } },
    }),
    prisma.shipment.count({
      where: { status: { in: [...OUTBOUND_STATUSES] as any[] }, updatedAt: { gte: startOfToday } },
    }),
    prisma.shipment.count({
      where: { status: { in: [...DELIVERED_STATUSES] as any[] }, updatedAt: { gte: startOfToday } },
    }),
    prisma.shipment.count({ where: { status: { in: [...EXCEPTION_STATUSES] as any[] } } }),
  ]);

  const totalUnits = rows.reduce((sum, r) => sum + r.quantity, 0);
  const totalCapacity = Math.max(totalUnits, 1) * 2; // modeled headroom: ~50% target utilization
  const usedCapacity = totalUnits;

  const operational = equipment.filter((e) => e.status === 'Operational' || e.status === 'In Transit').length;
  const operationalRatePct =
    equipment.length > 0 ? Math.round((operational / equipment.length) * 100) : 100;

  return {
    inventory: rows,
    equipment,
    storage: {
      totalCapacity,
      usedCapacity,
      utilizationPct: Math.round((usedCapacity / totalCapacity) * 100),
      zones: buildZones(rows, totalUnits),
    },
    shipments: { incoming, outgoing, deliveredToday, exceptions },
    stats: {
      totalSkus: rows.length,
      totalUnits,
      lowStockCount: rows.filter((r) => r.status === 'low_stock').length,
      outOfStockCount: rows.filter((r) => r.status === 'out_of_stock').length,
      operationalRatePct,
    },
  };
}

export async function listInventory(): Promise<InventoryRow[]> {
  return loadInventory();
}

export async function createInventoryItem(input: {
  sku: string;
  name: string;
  description?: string;
  quantity: number;
  location: string;
}): Promise<InventoryRow> {
  const existing = await prisma.inventoryItem.findUnique({ where: { sku: input.sku } });
  if (existing) throw Object.assign(new Error(`SKU ${input.sku} already exists`), { status: 409 });

  const item = await prisma.inventoryItem.create({
    data: {
      sku: input.sku,
      name: input.name,
      description: input.description ?? '',
      quantity: input.quantity,
      location: input.location,
    },
  });
  return toRow(item);
}

export async function updateInventoryItem(
  id: string,
  patch: Partial<{ sku: string; name: string; description: string; quantity: number; location: string }>,
): Promise<InventoryRow> {
  const current = await prisma.inventoryItem.findUnique({ where: { id } });
  if (!current) throw Object.assign(new Error('Inventory item not found'), { status: 404 });

  if (patch.sku && patch.sku !== current.sku) {
    const dupe = await prisma.inventoryItem.findUnique({ where: { sku: patch.sku } });
    if (dupe) throw Object.assign(new Error(`SKU ${patch.sku} already exists`), { status: 409 });
  }

  const item = await prisma.inventoryItem.update({
    where: { id },
    data: {
      ...(patch.sku !== undefined && { sku: patch.sku }),
      ...(patch.name !== undefined && { name: patch.name }),
      ...(patch.description !== undefined && { description: patch.description }),
      ...(patch.quantity !== undefined && { quantity: patch.quantity }),
      ...(patch.location !== undefined && { location: patch.location }),
    },
  });
  return toRow(item);
}

export async function deleteInventoryItem(id: string): Promise<void> {
  const current = await prisma.inventoryItem.findUnique({ where: { id } });
  if (!current) throw Object.assign(new Error('Inventory item not found'), { status: 404 });
  await prisma.inventoryItem.delete({ where: { id } });
}

/**
 * Record a warehouse scan (barcode/QR). Persists a TrackingEvent on the matching
 * shipment so scans show up in ops/tracking views too.
 */
export async function recordScan(code: string, location: string) {
  const trimmed = (code ?? '').trim();
  if (!trimmed) throw Object.assign(new Error('Scan code is required'), { status: 400 });

  const shipment = await prisma.shipment.findFirst({
    where: { OR: [{ reference: trimmed }, { accountNumber: trimmed }] },
    orderBy: { createdAt: 'desc' },
  });

  if (!shipment) {
    return { found: false as const, message: `No shipment found for code "${trimmed}"` };
  }

  const event = await prisma.trackingEvent.create({
    data: {
      shipmentId: shipment.id,
      status: shipment.status,
      location: location || 'Warehouse',
      description: `Warehouse scan: ${trimmed}`,
    },
  });

  return {
    found: true as const,
    event: { id: event.id, eventTime: event.eventTime.toISOString() },
    shipment: {
      id: shipment.id,
      reference: shipment.reference,
      status: shipment.status,
      destinationCity: shipment.destinationCity,
      destinationCountry: shipment.destinationCountry,
    },
  };
}
