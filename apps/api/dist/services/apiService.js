"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiRouter = void 0;
const express_1 = require("express");
const authService_1 = require("./authService");
const orders_routes_1 = require("../modules/orders/orders.routes");
const inventory_routes_1 = require("../modules/inventory/inventory.routes");
const fleet_routes_1 = require("../modules/fleet/fleet.routes");
const returns_routes_1 = require("../modules/returns/returns.routes");
const analytics_routes_1 = require("../modules/analytics/analytics.routes");
const integrations_routes_1 = require("../modules/integrations/integrations.routes");
const users_routes_1 = require("../modules/users/users.routes");
const shipments_routes_1 = require("../modules/shipments/shipments.routes");
const tracking_routes_1 = require("../modules/tracking/tracking.routes");
const documents_routes_1 = require("../modules/documents/documents.routes");
const finance_routes_1 = require("../modules/finance/finance.routes");
const warehouse_routes_1 = __importDefault(require("../modules/warehouse/warehouse.routes"));
const partners_routes_1 = __importDefault(require("../modules/partners/partners.routes"));
const hr_routes_1 = require("../modules/hr/hr.routes");
const notification_routes_1 = require("../modules/notifications/notification.routes");
const admin_routes_1 = require("../modules/admin/admin.routes");
const report_routes_1 = require("../modules/reports/report.routes");
const executive_routes_1 = require("../modules/executive/executive.routes");
const ops_routes_1 = require("../modules/ops/ops.routes");
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcryptjs"));
const auth_1 = require("../routes/auth");
exports.apiRouter = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
exports.apiRouter.get('/health', (_req, res) => res.json({ status: 'ok' }));
exports.apiRouter.use('/auth', authService_1.authRouter);
exports.apiRouter.use('/oauth', auth_1.oauthRouter);
exports.apiRouter.use('/users', users_routes_1.usersRouter);
exports.apiRouter.use('/orders', orders_routes_1.ordersRouter);
exports.apiRouter.use('/inventory', inventory_routes_1.inventoryRouter);
exports.apiRouter.use('/fleet', fleet_routes_1.fleetRouter);
exports.apiRouter.use('/returns', returns_routes_1.returnsRouter);
exports.apiRouter.use('/analytics', analytics_routes_1.analyticsRouter);
exports.apiRouter.use('/integrations', integrations_routes_1.integrationsRouter);
exports.apiRouter.use('/shipments', shipments_routes_1.shipmentsRouter);
exports.apiRouter.use('/tracking', tracking_routes_1.trackingRouter);
exports.apiRouter.use('/documents', documents_routes_1.documentsRouter);
exports.apiRouter.use('/finance', finance_routes_1.financeRouter);
exports.apiRouter.use('/warehouse', warehouse_routes_1.default);
exports.apiRouter.use('/partners', partners_routes_1.default);
exports.apiRouter.use('/hr', hr_routes_1.hrRouter);
exports.apiRouter.use('/notifications', notification_routes_1.notificationRouter);
exports.apiRouter.use('/admin', admin_routes_1.adminRouter);
exports.apiRouter.use('/reports', report_routes_1.reportRouter);
exports.apiRouter.use('/executive', executive_routes_1.executiveRouter);
exports.apiRouter.use('/ops', ops_routes_1.opsRouter);
// Complete invitation: set password for invited internal users
exports.apiRouter.post('/invite/complete', async (req, res) => {
    try {
        const { token, password } = req.body;
        if (!token || typeof token !== 'string') {
            return res.status(400).json({ error: 'Missing or invalid token' });
        }
        if (!password || String(password).length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters' });
        }
        const user = await prisma.user.findFirst({ where: { inviteToken: token } });
        if (!user) {
            return res.status(404).json({ error: 'Invalid or expired link' });
        }
        if (user.password) {
            return res.status(409).json({ error: 'Invitation already completed' });
        }
        if (!user.isInvited || !user.inviteToken) {
            return res.status(409).json({ error: 'Invitation not pending' });
        }
        if (user.inviteExpiresAt && new Date(user.inviteExpiresAt).getTime() < Date.now()) {
            return res.status(410).json({ error: 'Invitation link has expired' });
        }
        const hashed = await bcrypt.hash(String(password), 10);
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashed,
                isInvited: false,
                inviteToken: null,
                inviteExpiresAt: null,
            },
        });
        // Define internal roles that require an Employee record
        const INTERNAL_ROLES = [
            'driver', 'warehouse', 'finance', 'service_point_agent',
            'operations', 'fleet_manager', 'account_manager',
            'hr_staff', 'hr_manager', 'cmo', 'coo', 'cfo', 'ceo', 'regional_manager'
        ];
        // Auto-create Employee record for internal roles
        if (INTERNAL_ROLES.includes(user.role)) {
            // Check if Employee record already exists (idempotency)
            const existingEmployee = await prisma.employee.findUnique({
                where: { userId: user.id }
            });
            if (!existingEmployee) {
                // Use the staffId from the User record (generated during invite)
                const employeeId = user.staffId || `EMP-${user.id.substring(0, 8).toUpperCase()}`;
                await prisma.employee.create({
                    data: {
                        userId: user.id,
                        employeeId,
                        firstName: user.name.split(' ')[0] || 'Unknown',
                        lastName: user.name.split(' ').slice(1).join(' ') || '',
                        position: user.role, // Default; HR will update
                        employmentStatus: 'ACTIVE',
                        joinDate: new Date(),
                        // All other fields (department, manager, etc.) left null — HR will complete later
                    }
                });
            }
        }
        return res.json({ success: true });
    }
    catch {
        return res.status(500).json({ error: 'Failed to complete invitation' });
    }
});
