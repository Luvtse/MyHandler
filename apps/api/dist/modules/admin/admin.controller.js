"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminController = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
exports.adminController = {
    // Get dashboard visibility settings
    async getDashboardVisibilitySettings(req, res) {
        try {
            const settings = await prisma_1.default.systemSetting.findFirst({
                where: { key: 'dashboard_visibility' }
            });
            res.json({
                success: true,
                settings: settings?.value || {}
            });
        }
        catch (error) {
            console.error('Error fetching dashboard visibility settings:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch dashboard visibility settings'
            });
        }
    },
    // Update dashboard visibility settings
    async updateDashboardVisibilitySettings(req, res) {
        try {
            const { settings } = req.body;
            await prisma_1.default.systemSetting.upsert({
                where: { key: 'dashboard_visibility' },
                update: { value: settings },
                create: { key: 'dashboard_visibility', value: settings }
            });
            res.json({
                success: true,
                message: 'Dashboard visibility settings updated successfully'
            });
        }
        catch (error) {
            console.error('Error updating dashboard visibility settings:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to update dashboard visibility settings'
            });
        }
    },
    // Get shipment visibility roles
    async getShipmentVisibilityRoles(req, res) {
        try {
            const settings = await prisma_1.default.systemSetting.findFirst({
                where: { key: 'shipment_visibility_roles' }
            });
            // Default roles that can see all shipments
            const defaultRoles = ['admin', 'finance', 'report', 'warehouse', 'marketing'];
            res.json({
                success: true,
                roles: settings?.value || defaultRoles
            });
        }
        catch (error) {
            console.error('Error fetching shipment visibility roles:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch shipment visibility roles'
            });
        }
    },
    // Update shipment visibility roles
    async updateShipmentVisibilityRoles(req, res) {
        try {
            const { roles } = req.body;
            if (!Array.isArray(roles)) {
                return res.status(400).json({
                    success: false,
                    error: 'Roles must be an array'
                });
            }
            await prisma_1.default.systemSetting.upsert({
                where: { key: 'shipment_visibility_roles' },
                update: { value: roles },
                create: { key: 'shipment_visibility_roles', value: roles }
            });
            res.json({
                success: true,
                message: 'Shipment visibility roles updated successfully'
            });
        }
        catch (error) {
            console.error('Error updating shipment visibility roles:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to update shipment visibility roles'
            });
        }
    }
};
