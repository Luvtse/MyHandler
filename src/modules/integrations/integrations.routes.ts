import { Router } from 'express';
import { requireAuth } from '../../services/authService';

export const integrationsRouter = Router();

integrationsRouter.use(requireAuth);

integrationsRouter.get('/health', async (_req, res) => {
  res.json({ integrations: ['shopify', 'woocommerce', 'xero', 'quickbooks'], status: 'ready' });
});