"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsRouter = void 0;
const express_1 = require("express");
const authService_1 = require("../../services/authService");
const catchAsync_1 = require("../../middlewares/catchAsync");
const regional_service_1 = require("./regional.service");
exports.analyticsRouter = (0, express_1.Router)();
exports.analyticsRouter.use(authService_1.requireAuth);
// GET /api/analytics/regional/:region — regional metrics for the Regional Manager dashboard.
// Role-gated: only admins and regional managers may read regional performance data.
exports.analyticsRouter.get('/regional/:region', (0, authService_1.requireRole)(['admin', 'regional_manager']), (0, catchAsync_1.catchAsync)(async (req, res) => {
    const data = await (0, regional_service_1.getRegionalData)(String(req.params.region));
    res.json({ success: true, data });
}));
exports.analyticsRouter.get('/kpis', async (_req, res) => {
    // Placeholder KPIs
    res.json({
        kpis: {
            onTimeDeliveryRate: 0.96,
            orderAccuracy: 0.994,
            transportationCostPerOrder: 12.43,
            inventoryTurnover: 8.2,
        },
    });
});
exports.analyticsRouter.get('/forecast', async (_req, res) => {
    // Placeholder simple forecast
    const next30DaysDemand = Array.from({ length: 30 }, (_, i) => ({ day: i + 1, demand: Math.round(100 + Math.sin(i / 3) * 10) }));
    res.json({ forecast: next30DaysDemand });
});
