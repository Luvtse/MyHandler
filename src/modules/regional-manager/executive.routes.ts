// src/routes/executive.routes.ts

import { Router } from 'express';
import { authenticate, authorizeRole } from '../middleware/auth.middleware';
import { getRegionalMetricsHandler } from '../controllers/executive.controller';

const executiveRouter = Router();

// GET /api/executive/regional/:region
executiveRouter.get(
  '/regional/:region',
  authenticate,
  authorizeRole(['admin', 'regional_manager', 'coo', 'ceo']),
  getRegionalMetricsHandler
);

export default executiveRouter;