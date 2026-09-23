import { Router } from 'express';
import { requireAuth, requireRole } from '../../services/authService';
import { catchAsync } from '../../middlewares/catchAsync';
import {
  getLiveShipmentFlow,
  getSlaSummary,
  getActiveIncidents,
} from './ops.service';

export const opsRouter = Router();

opsRouter.use(requireAuth);
// Role gating: live operations data is restricted to ops staff, fleet
// managers, regional managers, and admins — mirrors executive/fleet pattern.
opsRouter.use(requireRole(['admin', 'operations', 'fleet_manager', 'regional_manager']));

// GET /api/ops/shipments/live — in-flight shipment flow (last scan, ETA hint, load %)
opsRouter.get(
  '/shipments/live',
  catchAsync(async (req, res) => {
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const data = await getLiveShipmentFlow(limit);
    res.json({ success: true, data });
  }),
);

// GET /api/ops/sla — today's on-time rate, delivery count, at-risk shipments
opsRouter.get(
  '/sla',
  catchAsync(async (_req, res) => {
    const data = await getSlaSummary();
    res.json({ success: true, data });
  }),
);

// GET /api/ops/incidents/active — exception shipments classified as incidents
opsRouter.get(
  '/incidents/active',
  catchAsync(async (req, res) => {
    const limit = Math.min(Number(req.query.limit) || 25, 100);
    const data = await getActiveIncidents(limit);
    res.json({ success: true, data });
  }),
);
