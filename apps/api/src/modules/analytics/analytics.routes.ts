import { Router } from 'express';
import { requireAuth, requireRole } from '../../services/authService';
import { catchAsync } from '../../middlewares/catchAsync';
import { getRegionalData } from './regional.service';

export const analyticsRouter = Router();

analyticsRouter.use(requireAuth);

// GET /api/analytics/regional/:region — regional metrics for the Regional Manager dashboard.
// Role-gated: only admins and regional managers may read regional performance data.
analyticsRouter.get(
  '/regional/:region',
  requireRole(['admin', 'regional_manager']),
  catchAsync(async (req, res) => {
    const data = await getRegionalData(req.params.region);
    res.json({ success: true, data });
  }),
);

analyticsRouter.get('/kpis', async (_req, res) => {
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

analyticsRouter.get('/forecast', async (_req, res) => {
  // Placeholder simple forecast
  const next30DaysDemand = Array.from({ length: 30 }, (_, i) => ({ day: i + 1, demand: Math.round(100 + Math.sin(i / 3) * 10) }));
  res.json({ forecast: next30DaysDemand });
});