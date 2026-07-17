import { Router } from 'express';
import { adminController } from './admin.controller';
import { requireAuth, requireRole } from '../../services/authService';

export const adminRouter = Router();

// Apply authentication to all routes
adminRouter.use(requireAuth);

// Dashboard visibility settings
adminRouter.get('/dashboard-visibility', requireRole(['admin']), adminController.getDashboardVisibilitySettings);
adminRouter.put('/dashboard-visibility', requireRole(['admin']), adminController.updateDashboardVisibilitySettings);

// Shipment visibility roles
adminRouter.get('/shipment-visibility-roles', requireRole(['admin']), adminController.getShipmentVisibilityRoles);
adminRouter.put('/shipment-visibility-roles', requireRole(['admin']), adminController.updateShipmentVisibilityRoles);
