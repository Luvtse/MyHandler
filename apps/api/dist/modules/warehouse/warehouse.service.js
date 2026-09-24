"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWarehouseDashboard = getWarehouseDashboard;
exports.listInventory = listInventory;
exports.createInventoryItem = createInventoryItem;
exports.updateInventoryItem = updateInventoryItem;
exports.deleteInventoryItem = deleteInventoryItem;
exports.recordScan = recordScan;
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
const prisma_1 = __importDefault(require("../../utils/prisma"));
// ─── Helpers ─────────────────────────────────────────────────────────────────
const DAY_MS = 24 * 60 * 60 * 1000;
/** Default reorder point when not explicitly set: 20% of peak-ish stock. */
function deriveReorderPoint(quantity) {
    return Math.max(5, Math.round(quantity * 0.25));
}
function stockStatus(quantity, reorderPoint) {
    if (quantity <= 0)
        return 'out_of_stock';
    if (quantity <= reorderPoint)
        return 'low_stock';
    return 'in_stock';
}
function toRow(item) {
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
];
const OUTBOUND_STATUSES = [
    'DISPATCHED_FOR_DELIVERY',
    'IN_LOCAL_DELIVERY_FACILITY',
    'OUT_FOR_DELIVERY',
    'DELIVERY_ATTEMPTED',
];
const DELIVERED_STATUSES = ['DELIVERED_SUCCESSFULLY', 'DELIVERY_CONFIRMED'];
const EXCEPTION_STATUSES = [
    'WEATHER_DELAY',
    'TRANSPORTATION_DELAY',
    'CLEARANCE_DELAY',
    'SHIPMENT_ON_HOLD',
    'MISROUTED',
    'DELIVERY_EXCEPTION',
    'LOST_EXCEPTION',
    'DAMAGED_UPON_ARRIVAL',
];
function vehicleEquipmentStatus(status, needsService) {
    if (status === 'decommissioned')
        return 'Decommissioned';
    if (status === 'maintenance' || needsService)
        return 'Maintenance Required';
    if (status === 'inTransit')
        return 'In Transit';
    return 'Operational';
}
// ─── Loaders ─────────────────────────────────────────────────────────────────
async function loadInventory() {
    const items = await prisma_1.default.inventoryItem.findMany({ orderBy: { updatedAt: 'desc' } });
    return items.map(toRow);
}
async function loadEquipment() {
    const vehicles = await prisma_1.default.vehicle.findMany({
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
        const needsService = v.status === 'maintenance' ||
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
function buildZones(rows, totalUnits) {
    const byZone = new Map();
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
async function getWarehouseDashboard() {
    const startOfToday = new Date(new Date().setHours(0, 0, 0, 0));
    const [rows, equipment, incoming, outgoing, deliveredToday, exceptions] = await Promise.all([
        loadInventory(),
        loadEquipment(),
        prisma_1.default.shipment.count({
            where: { status: { in: [...INBOUND_STATUSES] }, updatedAt: { gte: startOfToday } },
        }),
        prisma_1.default.shipment.count({
            where: { status: { in: [...OUTBOUND_STATUSES] }, updatedAt: { gte: startOfToday } },
        }),
        prisma_1.default.shipment.count({
            where: { status: { in: [...DELIVERED_STATUSES] }, updatedAt: { gte: startOfToday } },
        }),
        prisma_1.default.shipment.count({ where: { status: { in: [...EXCEPTION_STATUSES] } } }),
    ]);
    const totalUnits = rows.reduce((sum, r) => sum + r.quantity, 0);
    const totalCapacity = Math.max(totalUnits, 1) * 2; // modeled headroom: ~50% target utilization
    const usedCapacity = totalUnits;
    const operational = equipment.filter((e) => e.status === 'Operational' || e.status === 'In Transit').length;
    const operationalRatePct = equipment.length > 0 ? Math.round((operational / equipment.length) * 100) : 100;
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
async function listInventory() {
    return loadInventory();
}
async function createInventoryItem(input) {
    const existing = await prisma_1.default.inventoryItem.findUnique({ where: { sku: input.sku } });
    if (existing)
        throw Object.assign(new Error(`SKU ${input.sku} already exists`), { status: 409 });
    const item = await prisma_1.default.inventoryItem.create({
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
async function updateInventoryItem(id, patch) {
    const current = await prisma_1.default.inventoryItem.findUnique({ where: { id } });
    if (!current)
        throw Object.assign(new Error('Inventory item not found'), { status: 404 });
    if (patch.sku && patch.sku !== current.sku) {
        const dupe = await prisma_1.default.inventoryItem.findUnique({ where: { sku: patch.sku } });
        if (dupe)
            throw Object.assign(new Error(`SKU ${patch.sku} already exists`), { status: 409 });
    }
    const item = await prisma_1.default.inventoryItem.update({
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
async function deleteInventoryItem(id) {
    const current = await prisma_1.default.inventoryItem.findUnique({ where: { id } });
    if (!current)
        throw Object.assign(new Error('Inventory item not found'), { status: 404 });
    await prisma_1.default.inventoryItem.delete({ where: { id } });
}
/**
 * Record a warehouse scan (barcode/QR). Persists a TrackingEvent on the matching
 * shipment so scans show up in ops/tracking views too.
 */
async function recordScan(code, location) {
    const trimmed = (code ?? '').trim();
    if (!trimmed)
        throw Object.assign(new Error('Scan code is required'), { status: 400 });
    const shipment = await prisma_1.default.shipment.findFirst({
        where: { OR: [{ reference: trimmed }, { accountNumber: trimmed }] },
        orderBy: { createdAt: 'desc' },
    });
    if (!shipment) {
        return { found: false, message: `No shipment found for code "${trimmed}"` };
    }
    const event = await prisma_1.default.trackingEvent.create({
        data: {
            shipmentId: shipment.id,
            status: shipment.status,
            location: location || 'Warehouse',
            description: `Warehouse scan: ${trimmed}`,
        },
    });
    return {
        found: true,
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
