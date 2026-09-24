"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRegionalData = getRegionalData;
// apps/api/src/modules/analytics/regional.service.ts
// Real (DB-backed) regional metrics + rule-based insights for the Regional Manager dashboard.
const prisma_1 = __importDefault(require("../../utils/prisma"));
// ─── Constants ────────────────────────────────────────────────────────────────
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
// Canonical region keys used by the frontend URL param (/dashboard/regional/:region).
const REGION_ALIASES = {
    addis_ababa: ['addis ababa', 'addis-ababa', 'addis', 'aa'],
    dire_dawa: ['dire dawa', 'dire-dawa', 'diredawa'],
    hawassa: ['hawassa', 'hawasa'],
    bahir_dar: ['bahir dar', 'bahirdar', 'bedeh'],
    mekele: ['mekele', 'mekelle'],
    adama: ['adama', 'nazret'],
    jimma: ['jimma', 'jima'],
    gondar: ['gondar', 'ghondar'],
    harar: ['harar'],
    dessie: ['dessie', 'kombolcha'],
};
function normalizeRegion(raw) {
    return raw.trim().toLowerCase().replace(/[_\s]+/g, ' ');
}
/** Build a Prisma filter matching shipments whose origin or destination city belongs to the region. */
function regionCityFilter(region) {
    const norm = normalizeRegion(region);
    const aliases = REGION_ALIASES[norm.replace(/\s+/g, '_')] ?? [norm];
    const likeAny = (field) => aliases.map((a) => ({ [field]: { contains: a } }));
    return {
        OR: [...likeAny('originCity'), ...likeAny('destinationCity')],
    };
}
function startOfToday() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
}
function startOfMonth() {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
}
function daysAgo(n) {
    return new Date(Date.now() - n * 86400000);
}
const round1 = (n) => Math.round(n * 10) / 10;
const round2 = (n) => Math.round(n * 100) / 100;
// ─── Insights (rule-based, mirrors executive insight format) ─────────────────
function buildInsights(m) {
    const insights = [];
    if (m.fleetUtilization > 90) {
        insights.push({
            id: 'ins-01',
            title: 'Fleet Overutilization Alert',
            message: `Fleet utilization in ${m.region} is at ${m.fleetUtilization}%. Risk of vehicle breakdowns.`,
            confidence: 0.89,
            severity: 'medium',
            recommendation: 'Request additional vehicles from central pool or rebalance routes.',
        });
    }
    if (m.onTimeDelivery > 0 && m.onTimeDelivery < 90) {
        insights.push({
            id: 'ins-02',
            title: 'On-Time Delivery at Risk',
            message: `On-time delivery in ${m.region} is ${m.onTimeDelivery}% (below 90% target).`,
            confidence: 0.92,
            severity: 'medium',
            recommendation: 'Review route planning and driver assignments.',
        });
    }
    if (m.avgFulfillmentTime > 12) {
        insights.push({
            id: 'ins-03',
            title: 'Slow Fulfillment',
            message: `Average fulfillment time in ${m.region} is ${m.avgFulfillmentTime}h (target ≤ 12h).`,
            confidence: 0.85,
            severity: 'high',
            recommendation: 'Audit sorting and last-mile handoff times in the region.',
        });
    }
    if (m.clientRetention > 0 && m.clientRetention < 85) {
        insights.push({
            id: 'ins-04',
            title: 'Client Retention Below Target',
            message: `90-day client retention in ${m.region} is ${m.clientRetention}% (target ≥ 85%).`,
            confidence: 0.8,
            severity: 'medium',
            recommendation: 'Schedule check-ins with at-risk accounts this week.',
        });
    }
    return insights;
}
// ─── Main loader ──────────────────────────────────────────────────────────────
async function getRegionalData(regionParam) {
    const regionKey = normalizeRegion(regionParam || 'addis_ababa');
    const displayName = regionKey
        .split(/[\s_]+/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
    const cityFilter = regionCityFilter(regionKey);
    const today = startOfToday();
    const monthStart = startOfMonth();
    const d90 = daysAgo(90);
    const d30 = daysAgo(30);
    const d60 = daysAgo(60);
    const [shipmentsToday, revenueAgg, activeClients, vehicleCounts, deliveredLast90, totalTerminalLast90, fulfillmentRows, costAgg, prevCohort, currentCohort, nationalDelivered, nationalTerminal, nationalCostAgg,] = await Promise.all([
        prisma_1.default.shipment.count({ where: { ...cityFilter, createdAt: { gte: today } } }),
        prisma_1.default.shipment.aggregate({
            _sum: { chargesAmount: true },
            where: { ...cityFilter, createdAt: { gte: monthStart } },
        }),
        prisma_1.default.shipment.findMany({
            where: { ...cityFilter, createdAt: { gte: d90 } },
            select: { userId: true },
            distinct: ['userId'],
        }),
        Promise.all([
            prisma_1.default.vehicle.count({ where: { deletedAt: null } }),
            prisma_1.default.vehicle.count({
                where: {
                    deletedAt: null,
                    status: { in: ['inTransit', 'reserved'] },
                },
            }),
        ]),
        prisma_1.default.shipment.count({
            where: {
                ...cityFilter,
                status: { in: DELIVERED_STATUSES },
                updatedAt: { gte: d90 },
            },
        }),
        prisma_1.default.shipment.count({
            where: {
                ...cityFilter,
                status: { in: TERMINAL_STATUSES },
                updatedAt: { gte: d90 },
            },
        }),
        prisma_1.default.shipment.findMany({
            where: { ...cityFilter, status: { in: DELIVERED_STATUSES } },
            select: { createdAt: true, updatedAt: true },
            take: 1000,
            orderBy: { updatedAt: 'desc' },
        }),
        prisma_1.default.shipment.aggregate({
            _avg: { chargesAmount: true },
            where: { ...cityFilter, createdAt: { gte: d30 } },
        }),
        prisma_1.default.shipment.findMany({
            where: { ...cityFilter, createdAt: { gte: d60, lt: d30 } },
            select: { userId: true },
            distinct: ['userId'],
        }),
        prisma_1.default.shipment.findMany({
            where: { ...cityFilter, createdAt: { gte: d30 } },
            select: { userId: true },
            distinct: ['userId'],
        }),
        prisma_1.default.shipment.count({
            where: { status: { in: DELIVERED_STATUSES }, updatedAt: { gte: d90 } },
        }),
        prisma_1.default.shipment.count({
            where: { status: { in: TERMINAL_STATUSES }, updatedAt: { gte: d90 } },
        }),
        prisma_1.default.shipment.aggregate({
            _avg: { chargesAmount: true },
            where: { createdAt: { gte: d30 } },
        }),
    ]);
    // Fulfillment time = hours between creation and last update for delivered shipments.
    let fulfillmentSumHours = 0;
    for (const row of fulfillmentRows) {
        const durationH = (new Date(row.updatedAt).getTime() - new Date(row.createdAt).getTime()) / 3600000;
        if (durationH >= 0)
            fulfillmentSumHours += durationH;
    }
    const onTimeDelivery = totalTerminalLast90 > 0 ? round1((deliveredLast90 / totalTerminalLast90) * 100) : 0;
    const avgFulfillmentTime = fulfillmentRows.length > 0 ? round1(fulfillmentSumHours / fulfillmentRows.length) : 0;
    const [totalVehicles, activeVehicles] = vehicleCounts;
    const fleetUtilization = totalVehicles > 0 ? round1((activeVehicles / totalVehicles) * 100) : 0;
    const prevIds = new Set(prevCohort.map((s) => s.userId));
    const retained = currentCohort.filter((s) => prevIds.has(s.userId)).length;
    const clientRetention = prevIds.size > 0 ? round1((retained / prevIds.size) * 100) : 0;
    const metrics = {
        region: displayName,
        shipments: shipmentsToday,
        revenue: revenueAgg._sum.chargesAmount ?? 0,
        activeClients: activeClients.length,
        fleetUtilization,
        onTimeDelivery,
        avgFulfillmentTime,
        costPerShipment: round2(costAgg._avg.chargesAmount ?? 0),
        clientRetention,
    };
    return {
        metrics,
        insights: buildInsights(metrics),
        benchmarks: {
            nationalOnTimeDelivery: nationalTerminal > 0 ? round1((nationalDelivered / nationalTerminal) * 100) : 0,
            nationalCostPerShipment: round2(nationalCostAgg._avg.chargesAmount ?? 0),
        },
    };
}
