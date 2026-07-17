// src/modules/executive/executive.routes.ts
import { Router } from 'express';
import { authenticate, authorizeRole } from './services/authService'; // adjust path
import { getCmoIntegratedData } from './executive.controller';

const executiveRouter = Router();

executiveRouter.get(
  '/cmo-integrated',
  authenticate,
  authorizeRole(['admin', 'cmo', 'account_manager']),
  getCmoIntegratedData
);

export { executiveRouter };