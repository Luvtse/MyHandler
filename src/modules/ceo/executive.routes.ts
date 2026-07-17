import { Router } from 'express';
import { authenticate, authorizeRole } from '../middleware/auth.middleware';
import { getCeoMetricsHandler } from './executive.controller';

const router = Router();

// GET /api/executive/metrics?role=ceo
router.get(
  '/metrics',
  authenticate,
  authorizeRole(['admin', 'ceo']),
  getCeoMetricsHandler
);

export default router;