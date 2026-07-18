import { Router } from 'express';
import { authRouter } from './authService';
import { ordersRouter } from '../modules/orders/orders.routes';
import { inventoryRouter } from '../modules/inventory/inventory.routes';
import { fleetRouter } from '../modules/fleet/fleet.routes';
import { returnsRouter } from '../modules/returns/returns.routes';
import { analyticsRouter } from '../modules/analytics/analytics.routes';
import { integrationsRouter } from '../modules/integrations/integrations.routes';
import { usersRouter } from '../modules/users/users.routes';
import { shipmentsRouter } from '../modules/shipments/shipments.routes';
import { trackingRouter } from '../modules/tracking/tracking.routes';
import { documentsRouter } from '../modules/documents/documents.routes';
import { financeRouter } from '../modules/finance/finance.routes';
import warehouseRouter from '../modules/warehouse/warehouse.routes';
import partnersRouter from '../modules/partners/partners.routes';
import { hrRouter } from '../modules/hr/hr.routes';
import { notificationRouter } from '../modules/notifications/notification.routes';
import { adminRouter } from '../modules/admin/admin.routes';
import { reportRouter } from '../modules/reports/report.routes';
import { executiveRouter } from '../modules/executive/executive.routes';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

import { oauthRouter } from '../routes/auth';
import { string } from 'zod';

export const apiRouter = Router();
const prisma = new PrismaClient();

apiRouter.get('/health', (_req, res) => res.json({ status: 'ok' }));

apiRouter.use('/auth', authRouter);
apiRouter.use('/oauth', oauthRouter);
apiRouter.use('/users', usersRouter);
apiRouter.use('/orders', ordersRouter);
apiRouter.use('/inventory', inventoryRouter);
apiRouter.use('/fleet', fleetRouter);
apiRouter.use('/returns', returnsRouter);
apiRouter.use('/analytics', analyticsRouter);
apiRouter.use('/integrations', integrationsRouter);
apiRouter.use('/shipments', shipmentsRouter);
apiRouter.use('/tracking', trackingRouter);
apiRouter.use('/documents', documentsRouter);
apiRouter.use('/finance', financeRouter);
apiRouter.use('/warehouse', warehouseRouter);
apiRouter.use('/partners', partnersRouter);
apiRouter.use('/hr', hrRouter);
apiRouter.use('/notifications', notificationRouter);
apiRouter.use('/admin', adminRouter);
apiRouter.use('/reports', reportRouter);
apiRouter.use('/executive', executiveRouter);


// Complete invitation: set password for invited internal users
apiRouter.post('/invite/complete', async (req, res) => {
  try {
    const { token, password } = req.body as { token?: string; password?: string };
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
        position: user.role as any, // Default; HR will update
        employmentStatus: 'ACTIVE',
        joinDate: new Date(),
        
        // All other fields (department, manager, etc.) left null — HR will complete later
      }
    });
  }
}
    return res.json({ success: true });
  } catch {
    return res.status(500).json({ error: 'Failed to complete invitation' });
  }
});
