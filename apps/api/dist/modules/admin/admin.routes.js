"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRouter = void 0;
const express_1 = require("express");
const admin_controller_1 = require("./admin.controller");
const authService_1 = require("../../services/authService");
exports.adminRouter = (0, express_1.Router)();
// Apply authentication to all routes
exports.adminRouter.use(authService_1.requireAuth);
// Dashboard visibility settings
exports.adminRouter.get('/dashboard-visibility', (0, authService_1.requireRole)(['admin']), admin_controller_1.adminController.getDashboardVisibilitySettings);
exports.adminRouter.put('/dashboard-visibility', (0, authService_1.requireRole)(['admin']), admin_controller_1.adminController.updateDashboardVisibilitySettings);
// Shipment visibility roles
exports.adminRouter.get('/shipment-visibility-roles', (0, authService_1.requireRole)(['admin']), admin_controller_1.adminController.getShipmentVisibilityRoles);
exports.adminRouter.put('/shipment-visibility-roles', (0, authService_1.requireRole)(['admin']), admin_controller_1.adminController.updateShipmentVisibilityRoles);
