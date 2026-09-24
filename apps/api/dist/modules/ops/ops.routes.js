"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.opsRouter = void 0;
const express_1 = require("express");
const authService_1 = require("../../services/authService");
const catchAsync_1 = require("../../middlewares/catchAsync");
const ops_service_1 = require("./ops.service");
exports.opsRouter = (0, express_1.Router)();
exports.opsRouter.use(authService_1.requireAuth);
// Role gating: live operations data is restricted to ops staff, fleet
// managers, regional managers, and admins — mirrors executive/fleet pattern.
exports.opsRouter.use((0, authService_1.requireRole)(['admin', 'operations', 'fleet_manager', 'regional_manager']));
// GET /api/ops/shipments/live — in-flight shipment flow (last scan, ETA hint, load %)
exports.opsRouter.get('/shipments/live', (0, catchAsync_1.catchAsync)(async (req, res) => {
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const data = await (0, ops_service_1.getLiveShipmentFlow)(limit);
    res.json({ success: true, data });
}));
// GET /api/ops/sla — today's on-time rate, delivery count, at-risk shipments
exports.opsRouter.get('/sla', (0, catchAsync_1.catchAsync)(async (_req, res) => {
    const data = await (0, ops_service_1.getSlaSummary)();
    res.json({ success: true, data });
}));
// GET /api/ops/incidents/active — exception shipments classified as incidents
exports.opsRouter.get('/incidents/active', (0, catchAsync_1.catchAsync)(async (req, res) => {
    const limit = Math.min(Number(req.query.limit) || 25, 100);
    const data = await (0, ops_service_1.getActiveIncidents)(limit);
    res.json({ success: true, data });
}));
