import { Router } from 'express';
import { requireAuth, requireRole } from '../../services/authService';
import { catchAsync } from '../../middlewares/catchAsync';
import { getCeoData, getCfoData, getCooData, getCmoData } from './executive.service';

export const executiveRouter = Router();

executiveRouter.use(requireAuth);

// GET /api/executive/ceo
executiveRouter.get(
  '/ceo',
  requireRole(['admin', 'ceo']),
  catchAsync(async (_req, res) => {
    const data = await getCeoData();
    res.json({ success: true, data });
  }),
);

// GET /api/executive/cfo
executiveRouter.get(
  '/cfo',
  requireRole(['admin', 'cfo', 'finance']),
  catchAsync(async (_req, res) => {
    const data = await getCfoData();
    res.json({ success: true, data });
  }),
);

// GET /api/executive/coo
executiveRouter.get(
  '/coo',
  requireRole(['admin', 'coo', 'operations']),
  catchAsync(async (_req, res) => {
    const data = await getCooData();
    res.json({ success: true, data });
  }),
);

// GET /api/executive/cmo
executiveRouter.get(
  '/cmo',
  requireRole(['admin', 'cmo', 'account_manager']),
  catchAsync(async (_req, res) => {
    const data = await getCmoData();
    res.json({ success: true, data });
  }),
);
