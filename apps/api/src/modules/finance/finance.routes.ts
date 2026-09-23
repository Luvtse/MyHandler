import { Router } from 'express';
import { invoiceController } from './invoice.controller';
import { paymentController } from './payment.controller';
import { payoutRequestController, PAYOUT_STAFF_ROLES } from './payout-request.controller';
import { requireAuth, requireAnyRole } from '../../services/authService';
import { analyticsController } from './analytics.controller';

const router = Router();

// Apply auth middleware to all routes
router.use(requireAuth);

// Invoice routes
router.post('/invoices', invoiceController.create);
router.get('/invoices', invoiceController.getAll);
router.get('/invoices/:id', invoiceController.getById);
router.patch('/invoices/:id/status', invoiceController.updateStatus);
router.delete('/invoices/:id', invoiceController.delete);

// Payment routes
router.post('/payments', paymentController.create);
router.post('/payments/process', paymentController.processPayment);
router.put('/payments/:id/status', paymentController.updateStatus);
router.get('/invoices/:invoiceId/payments', paymentController.getByInvoice);

// Payout request routes — approve/reject/process/delete are staff-only.
// (hasAnyRole also honors DB-stored secondary roles.)
router.post('/payout-requests', payoutRequestController.create);
router.get('/payout-requests', payoutRequestController.getAll);
router.get('/payout-requests/:id', payoutRequestController.getById);
router.patch(
  '/payout-requests/:id/status',
  requireAnyRole(PAYOUT_STAFF_ROLES),
  payoutRequestController.updateStatus
);
router.delete(
  // Owners may cancel their own pending requests; staff may delete any.
  // Ownership is enforced in the controller.
  '/payout-requests/:id',
  requireAnyRole([...PAYOUT_STAFF_ROLES, 'customer']),
  payoutRequestController.delete
);

  // Analytics routes
  router.get('/analytics/metrics', analyticsController.getMetrics);
  router.get('/analytics/revenue', analyticsController.getRevenue);
  router.get('/analytics/payment-methods', analyticsController.getPaymentMethodStats);
  router.get('/reports/aging', analyticsController.getAgingReport);

export const financeRouter = router;
