"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fleetRouter = void 0;
const express_1 = require("express");
const prisma_1 = __importDefault(require("../../utils/prisma"));
const authService_1 = require("../../services/authService");
const catchAsync_1 = require("../../middlewares/catchAsync");
const AppError_1 = require("../../middlewares/AppError");
exports.fleetRouter = (0, express_1.Router)();
exports.fleetRouter.use(authService_1.requireAuth);
// Role gating: fleet data (vehicles, metrics, maintenance) is restricted to
// admins and fleet managers — mirrors the executive routes' requireRole pattern.
exports.fleetRouter.use((0, authService_1.requireRole)(['admin', 'fleet_manager']));
function haversine(a, b) {
    const R = 6371;
    const dLat = ((b.lat - a.lat) * Math.PI) / 180;
    const dLon = ((b.lng - a.lng) * Math.PI) / 180;
    const sin2Lat = Math.sin(dLat / 2) ** 2;
    const sin2Lon = Math.sin(dLon / 2) ** 2;
    const chord = sin2Lat +
        Math.cos((a.lat * Math.PI) / 180) *
            Math.cos((b.lat * Math.PI) / 180) *
            sin2Lon;
    return R * 2 * Math.atan2(Math.sqrt(chord), Math.sqrt(1 - chord));
}
function totalDistance(route) {
    let d = 0;
    for (let i = 0; i < route.length - 1; i++)
        d += haversine(route[i], route[i + 1]);
    return d;
}
function nearestNeighbour(stops) {
    const visited = new Set();
    const route = [stops[0]];
    visited.add(0);
    while (route.length < stops.length) {
        const last = route[route.length - 1];
        let bestDist = Infinity;
        let bestIdx = -1;
        for (let i = 0; i < stops.length; i++) {
            if (visited.has(i))
                continue;
            const d = haversine(last, stops[i]);
            if (d < bestDist) {
                bestDist = d;
                bestIdx = i;
            }
        }
        visited.add(bestIdx);
        route.push(stops[bestIdx]);
    }
    return route;
}
function twoOpt(route, maxPasses = 100) {
    let best = [...route];
    let improved = true;
    let passes = 0;
    while (improved && passes < maxPasses) {
        improved = false;
        passes++;
        for (let i = 1; i < best.length - 1; i++) {
            for (let j = i + 1; j < best.length; j++) {
                const before = haversine(best[i - 1], best[i]) +
                    haversine(best[j], j + 1 < best.length ? best[j + 1] : best[0]);
                const after = haversine(best[i - 1], best[j]) +
                    haversine(best[i], j + 1 < best.length ? best[j + 1] : best[0]);
                if (after < before - 0.001) {
                    best = [
                        ...best.slice(0, i),
                        ...best.slice(i, j + 1).reverse(),
                        ...best.slice(j + 1),
                    ];
                    improved = true;
                }
            }
        }
    }
    return best;
}
// GET /api/fleet/route-optimize?stops=lat,lng|lat,lng|...
exports.fleetRouter.get('/route-optimize', (0, catchAsync_1.catchAsync)(async (req, res) => {
    const raw = req.query.stops ?? '';
    if (!raw) {
        return res.status(400).json({ error: 'Provide stops as lat,lng|lat,lng|...' });
    }
    const stops = raw.split('|').map((s, i) => {
        const parts = s.split(',').map(Number);
        if (parts.length < 2 || parts.some(isNaN)) {
            throw new AppError_1.AppError(`Invalid stop at index ${i}: "${s}"`, 400);
        }
        return { lat: parts[0], lng: parts[1], label: `Stop ${i + 1}` };
    });
    if (stops.length < 2) {
        return res.status(400).json({ error: 'At least 2 stops are required' });
    }
    const seeded = nearestNeighbour(stops);
    const optimised = twoOpt(seeded);
    const distBefore = totalDistance(nearestNeighbour(stops));
    const distAfter = totalDistance(optimised);
    const legs = optimised.slice(0, -1).map((stop, i) => ({
        from: stop,
        to: optimised[i + 1],
        distanceKm: Math.round(haversine(stop, optimised[i + 1]) * 10) / 10,
    }));
    res.json({
        route: optimised,
        legs,
        totalDistanceKm: Math.round(distAfter * 10) / 10,
        savedKm: Math.round((distBefore - distAfter) * 10) / 10,
        algorithm: 'nearest-neighbour + 2-opt',
    });
}));
// ─── Helpers ──────────────────────────────────────────────────────────────────
function mapVehicle(v) {
    return {
        id: v.id,
        plateNumber: v.licensePlate,
        licensePlate: v.licensePlate,
        vehicleDetail: `${v.make} ${v.model}`,
        type: v.type,
        make: v.make,
        model: v.model,
        year: v.year,
        vin: v.vin,
        capacityKg: Number(v.capacityKg),
        currentMileage: Number(v.currentMileage),
        nextMaintenanceMileage: Number(v.nextMaintenanceMileage),
        fuelLevel: Number(v.fuelLevel),
        location: v.currentLocation,
        currentLocation: v.currentLocation,
        status: v.status,
        driverId: v.driverId ?? null,
        driverName: v.driver?.name ?? null,
        driverEmail: v.driver?.email ?? null,
        fleetManagerId: null,
        fleetManagerName: null,
        lastPing: v.lastPing ? new Date(v.lastPing).toISOString() : new Date().toISOString(),
        lastMaintenanceDate: v.maintenanceRecords?.[0]?.scheduledAt
            ? new Date(v.maintenanceRecords[0].scheduledAt).toISOString()
            : null,
        insuranceExpiry: v.insuranceExpiry
            ? new Date(v.insuranceExpiry).toISOString()
            : new Date(Date.now() + 365 * 86400000).toISOString(),
        registrationExpiry: v.registrationExpiry
            ? new Date(v.registrationExpiry).toISOString()
            : new Date(Date.now() + 365 * 86400000).toISOString(),
        totalTrips: v.totalTrips ?? 0,
        totalDistance: v.totalDistance ?? 0,
        createdAt: new Date(v.createdAt).toISOString(),
        updatedAt: new Date(v.updatedAt).toISOString(),
        deletedAt: v.deletedAt ? new Date(v.deletedAt).toISOString() : null,
    };
}
function mapMaintenanceRecord(r) {
    return {
        id: r.id,
        vehicleId: r.vehicleId,
        plateNumber: r.vehicle?.licensePlate ?? '',
        type: r.type,
        status: r.status,
        scheduledAt: new Date(r.scheduledAt).toISOString(),
        completedAt: r.completedAt ? new Date(r.completedAt).toISOString() : null,
        mileageAtService: Number(r.mileageAtService),
        cost: r.cost ? Number(r.cost) : null,
        notes: r.notes ?? null,
        vendor: r.vendor ?? null,
        performedById: r.performedById ?? null,
        performedByName: null,
        createdBy: r.createdBy,
        createdByName: null,
        calendarSyncButton: '',
        lastMaintenanceDate: new Date(r.scheduledAt).toISOString(),
        createdAt: new Date(r.createdAt).toISOString(),
        updatedAt: new Date(r.updatedAt).toISOString(),
        deletedAt: r.deletedAt ? new Date(r.deletedAt).toISOString() : null,
    };
}
// ─── Vehicles ─────────────────────────────────────────────────────────────────
// GET /api/fleet/vehicles
exports.fleetRouter.get('/vehicles', (0, catchAsync_1.catchAsync)(async (_req, res) => {
    const vehicles = await prisma_1.default.vehicle.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            maintenanceRecords: {
                where: { deletedAt: null },
                orderBy: { scheduledAt: 'desc' },
                take: 1,
            },
        },
    });
    res.json({ success: true, data: vehicles.map(mapVehicle) });
}));
// GET /api/fleet/vehicles/:id
exports.fleetRouter.get('/vehicles/:id', (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    const vehicle = await prisma_1.default.vehicle.findUnique({
        where: { id },
        include: {
            maintenanceRecords: {
                where: { deletedAt: null },
                orderBy: { scheduledAt: 'desc' },
            },
        },
    });
    if (!vehicle)
        throw new AppError_1.AppError('Vehicle not found', 404);
    const base = mapVehicle(vehicle);
    const maintenanceHistory = vehicle.maintenanceRecords.map(mapMaintenanceRecord);
    const upcomingServices = maintenanceHistory
        .filter((r) => r.status === 'scheduled')
        .map((r) => `${r.type.replace(/_/g, ' ')} — ${new Date(r.scheduledAt).toLocaleDateString()}`);
    res.json({
        success: true,
        data: { ...base, maintenanceHistory, upcomingServices },
    });
}));
// ─── Fleet Metrics ────────────────────────────────────────────────────────────
// GET /api/fleet/metrics
exports.fleetRouter.get('/metrics', (0, catchAsync_1.catchAsync)(async (_req, res) => {
    const sevenDays = new Date(Date.now() + 7 * 86400000);
    const [totalVehicles, inTransitVehicles, maintenanceDue, fuelAgg] = await Promise.all([
        prisma_1.default.vehicle.count(),
        prisma_1.default.vehicle.count({ where: { status: { in: ['inTransit', 'reserved'] } } }),
        prisma_1.default.maintenanceRecord.count({
            where: { status: 'scheduled', scheduledAt: { lte: sevenDays }, deletedAt: null },
        }),
        prisma_1.default.vehicle.aggregate({ _avg: { fuelLevel: true } }),
    ]);
    const utilizationRate = totalVehicles > 0 ? Math.round((inTransitVehicles / totalVehicles) * 1000) / 10 : 0;
    res.json({
        success: true,
        data: {
            totalVehicles,
            activeVehicles: inTransitVehicles,
            vehiclesDueMaintenance: maintenanceDue,
            avgFuelConsumption: Math.round((fuelAgg._avg.fuelLevel ?? 0) * 10) / 10,
            utilizationRate,
        },
    });
}));
// ─── Maintenance Records ──────────────────────────────────────────────────────
// GET /api/fleet/maintenance
exports.fleetRouter.get('/maintenance', (0, catchAsync_1.catchAsync)(async (_req, res) => {
    const records = await prisma_1.default.maintenanceRecord.findMany({
        where: { deletedAt: null },
        include: { vehicle: { select: { licensePlate: true } } },
        orderBy: { scheduledAt: 'asc' },
        take: 500,
    });
    res.json({ success: true, data: records.map(mapMaintenanceRecord) });
}));
// POST /api/fleet/maintenance
exports.fleetRouter.post('/maintenance', (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { vehicleId, type, scheduledDate, mileageAtService, notes, vendor, estimatedCost } = req.body;
    if (!vehicleId || !type || !scheduledDate || mileageAtService === undefined) {
        throw new AppError_1.AppError('vehicleId, type, scheduledDate, and mileageAtService are required', 400);
    }
    const vehicle = await prisma_1.default.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle)
        throw new AppError_1.AppError('Vehicle not found', 404);
    const record = await prisma_1.default.maintenanceRecord.create({
        data: {
            vehicleId,
            type: type,
            scheduledAt: new Date(scheduledDate),
            mileageAtService: Number(mileageAtService),
            notes: notes ?? null,
            vendor: vendor ?? null,
            cost: estimatedCost != null ? Number(estimatedCost) : null,
            createdBy: req.user?.sub ?? vehicleId,
            status: 'scheduled',
        },
    });
    res.status(201).json({ success: true, data: mapMaintenanceRecord({ ...record, vehicle }) });
}));
