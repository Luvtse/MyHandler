import { Router } from 'express';
import { requireAuth } from '../../services/authService';

export const analyticsRouter = Router();

analyticsRouter.use(requireAuth);

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