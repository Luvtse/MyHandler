"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toFlowStatus = toFlowStatus;
exports.getLiveShipmentFlow = getLiveShipmentFlow;
exports.getSlaSummary = getSlaSummary;
exports.getActiveIncidents = getActiveIncidents;
/**
 * Ops Service
 * Aggregations powering the Operations Center dashboard:
 *   - live shipment flow (in-flight shipments + latest tracking event)
 *   - SLA / performance summary (today)
 *   - active incidents derived from exception statuses
 *
 * All data is computed from live Prisma models — no mocks.
 */
const prisma_1 = __importDefault(require("../../utils/prisma"));
// ─── Status buckets ───────────────────────────────────────────────────────────
const DELIVERED_STATUSES = [
    'DELIVERED_SUCCESSFULLY',
    'DELIVERY_CONFIRMED',
    'SIGNATURE_OBTAINED',
];
const TERMINAL_STATUSES = [
    ...DELIVERED_STATUSES,
    'CANCELLED',
    'RETURNED_TO_SENDER',
    'LOST_EXCEPTION',
];
const CUSTOMS_STATUSES = [
    'AWAITING_CLEARANCE',
    'CLEARANCE_DELAY',
    'CUSTOMS_CLEARANCE_INITIATED',
];
// Shipment statuses that mean "something is actively wrong right now".
const ACTIVE_INCIDENT_STATUSES = [
    'MISROUTED',
    'SHIPMENT_ON_HOLD',
    'HELD_AT_LOCATION',
    'DELIVERY_EXCEPTION',
    'WEATHER_DELAY',
    'TRANSPORTATION_DELAY',
    'CLEARANCE_DELAY',
    'DAMAGED_UPON_ARRIVAL',
    'LOST_EXCEPTION',
];
// Stalled threshold: an in-flight shipment whose last scan is older than this
// is considered delayed / at risk of missing SLA.
const AT_RISK_STALL_HOURS = 24;
// ─── Helpers ──────────────────────────────────────────────────────────────────
function startOfToday() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
}
function pct(numerator, denominator) {
    return denominator === 0 ? 0 : Math.round((numerator / denominator) * 1000) / 10;
}
/** Map a raw Prisma ShipmentStatus onto the frontend's coarse flow status. */
function toFlowStatus(status) {
    if (DELIVERED_STATUSES.includes(status))
        return 'delivered';
    if (CUSTOMS_STATUSES.includes(status))
        return 'customs_hold';
    if (status === 'MISROUTED')
        return 'misrouted';
    if (status === 'WEATHER_DELAY' ||
        status === 'TRANSPORTATION_DELAY' ||
        status === 'CLEARANCE_DELAY' ||
        status === 'DELIVERY_EXCEPTION' ||
        status === 'SHIPMENT_ON_HOLD') {
        return 'delayed';
    }
    return 'in_transit';
}
/**
 * Service-level promise windows (hours). Used to derive an ETA hint from the
 * shipment's own createdAt when no explicit promise date exists in the schema.
 */
const SERVICE_LEVEL_HOURS = {
    express: 24,
    priority: 48,
    economy: 96,
    standard: 96,
};
function etaLabel(createdAt, serviceLevel) {
    const windowHours = (serviceLevel && SERVICE_LEVEL_HOURS[serviceLevel.toLowerCase()]) || 72;
    const targetMs = createdAt.getTime() + windowHours * 3600000;
    const remainingMin = Math.round((targetMs - Date.now()) / 60000);
    if (remainingMin <= 0)
        return 'overdue';
    const h = Math.floor(remainingMin / 60);
    const m = remainingMin % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
}
function classifyIncidentType(status) {
    switch (status) {
        case 'WEATHER_DELAY':
            return 'weather';
        case 'CLEARANCE_DELAY':
            return 'customs';
        case 'MISROUTED':
        case 'SHIPMENT_ON_HOLD':
        case 'HELD_AT_LOCATION':
            return 'mechanical';
        default:
            return 'accident';
    }
}
function classifySeverity(status, ageHours) {
    if (status === 'LOST_EXCEPTION' || status === 'DAMAGED_UPON_ARRIVAL')
        return 'high';
    if (ageHours > 48)
        return 'high';
    if (ageHours > 12)
        return 'medium';
    return 'low';
}
// ─── Live shipment flow ───────────────────────────────────────────────────────
async function getLiveShipmentFlow(limit = 50) {
    const inFlight = await prisma_1.default.shipment.findMany({
        where: { status: { notIn: TERMINAL_STATUSES } },
        orderBy: { updatedAt: 'desc' },
        take: limit,
        select: {
            id: true,
            reference: true,
            originCity: true,
            destinationCity: true,
            status: true,
            serviceLevel: true,
            createdAt: true,
            weightKg: true,
        },
    });
    if (inFlight.length === 0)
        return [];
    // Latest tracking event per shipment (single grouped query).
    const latestEvents = await prisma_1.default.trackingEvent.groupBy({
        by: ['shipmentId'],
        where: { shipmentId: { in: inFlight.map((s) => s.id) } },
        _max: { eventTime: true },
    });
    const lastScanByShipment = new Map(latestEvents
        .filter((e) => e._max.eventTime != null)
        .map((e) => [e.shipmentId, e._max.eventTime]));
    // Vehicles currently on the road → used for load-factor hints.
    const activeVehicles = await prisma_1.default.vehicle.findMany({
        where: { status: 'inTransit', deletedAt: null },
        select: { capacityKg: true },
    });
    const avgCapacity = activeVehicles.length === 0
        ? 0
        : activeVehicles.reduce((sum, v) => sum + v.capacityKg, 0) / activeVehicles.length;
    return inFlight.map((s) => {
        const lastScan = lastScanByShipment.get(s.id) ?? null;
        const stalled = !lastScan || Date.now() - lastScan.getTime() > AT_RISK_STALL_HOURS * 3600000;
        const flowStatus = toFlowStatus(s.status);
        const routeLoadPct = avgCapacity > 0
            ? Math.max(5, Math.min(100, Math.round((s.weightKg / avgCapacity) * 100)))
            : 0;
        return {
            id: s.reference || s.id,
            origin: s.originCity || '—',
            destination: s.destinationCity || '—',
            status: stalled && flowStatus === 'in_transit' ? 'delayed' : flowStatus,
            estimatedArrival: stalled ? '—' : etaLabel(s.createdAt, s.serviceLevel),
            vehicleId: lastScan ? `last-scan:${lastScan.toISOString().slice(0, 10)}` : 'unassigned',
            routeLoadPct,
        };
    });
}
// ─── SLA summary (today) ──────────────────────────────────────────────────────
async function getSlaSummary() {
    const today = startOfToday();
    const [deliveredToday, delayedToday, inFlightIds] = await Promise.all([
        prisma_1.default.shipment.count({
            where: { status: { in: DELIVERED_STATUSES }, updatedAt: { gte: today } },
        }),
        prisma_1.default.shipment.count({
            where: {
                status: {
                    in: [
                        'WEATHER_DELAY',
                        'TRANSPORTATION_DELAY',
                        'CLEARANCE_DELAY',
                        'DELIVERY_EXCEPTION',
                    ],
                },
                updatedAt: { gte: today },
            },
        }),
        prisma_1.default.shipment
            .findMany({
            where: { status: { notIn: TERMINAL_STATUSES } },
            select: { id: true },
        })
            .then((rows) => rows.map((r) => r.id)),
    ]);
    // At-risk = in-flight shipments whose most recent tracking event is stale
    // (or which have never been scanned at all).
    let atRiskCount = 0;
    if (inFlightIds.length > 0) {
        const freshGroups = await prisma_1.default.trackingEvent.groupBy({
            by: ['shipmentId'],
            where: {
                shipmentId: { in: inFlightIds },
                eventTime: { gte: new Date(Date.now() - AT_RISK_STALL_HOURS * 3600000) },
            },
        });
        const freshIds = new Set(freshGroups.map((g) => g.shipmentId));
        atRiskCount = inFlightIds.filter((id) => !freshIds.has(id)).length;
    }
    const totalDeliveries = deliveredToday + delayedToday;
    return {
        onTimeRate: pct(deliveredToday, totalDeliveries),
        totalDeliveries,
        atRiskCount,
    };
}
// ─── Active incidents ─────────────────────────────────────────────────────────
async function getActiveIncidents(limit = 25) {
    const shipments = await prisma_1.default.shipment.findMany({
        where: { status: { in: ACTIVE_INCIDENT_STATUSES } },
        orderBy: { updatedAt: 'desc' },
        take: limit,
        select: {
            id: true,
            reference: true,
            status: true,
            originCity: true,
            destinationCity: true,
            destinationAirportCode: true,
            updatedAt: true,
        },
    });
    return shipments.map((s) => {
        const ageHours = (Date.now() - s.updatedAt.getTime()) / 3600000;
        const routes = [];
        if (s.originCity && s.destinationCity) {
            routes.push(`${s.originCity}→${s.destinationCity}`);
        }
        if (s.destinationAirportCode)
            routes.push(s.destinationAirportCode);
        return {
            id: s.reference || s.id,
            type: classifyIncidentType(s.status),
            location: s.destinationCity || s.originCity || 'Unknown',
            severity: classifySeverity(s.status, ageHours),
            affectedRoutes: routes.length > 0 ? routes : ['UNASSIGNED'],
        };
    });
}
