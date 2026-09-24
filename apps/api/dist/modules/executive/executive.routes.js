"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executiveRouter = void 0;
const express_1 = require("express");
const authService_1 = require("../../services/authService");
const catchAsync_1 = require("../../middlewares/catchAsync");
const executive_service_1 = require("./executive.service");
exports.executiveRouter = (0, express_1.Router)();
exports.executiveRouter.use(authService_1.requireAuth);
// GET /api/executive/ceo
exports.executiveRouter.get('/ceo', (0, authService_1.requireRole)(['admin', 'ceo']), (0, catchAsync_1.catchAsync)(async (_req, res) => {
    const data = await (0, executive_service_1.getCeoData)();
    res.json({ success: true, data });
}));
// GET /api/executive/cfo
exports.executiveRouter.get('/cfo', (0, authService_1.requireRole)(['admin', 'cfo', 'finance']), (0, catchAsync_1.catchAsync)(async (_req, res) => {
    const data = await (0, executive_service_1.getCfoData)();
    res.json({ success: true, data });
}));
// GET /api/executive/coo
exports.executiveRouter.get('/coo', (0, authService_1.requireRole)(['admin', 'coo', 'operations']), (0, catchAsync_1.catchAsync)(async (_req, res) => {
    const data = await (0, executive_service_1.getCooData)();
    res.json({ success: true, data });
}));
// GET /api/executive/cmo
exports.executiveRouter.get('/cmo', (0, authService_1.requireRole)(['admin', 'cmo', 'account_manager']), (0, catchAsync_1.catchAsync)(async (_req, res) => {
    const data = await (0, executive_service_1.getCmoData)();
    res.json({ success: true, data });
}));
