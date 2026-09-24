"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.financeRouter = void 0;
const express_1 = require("express");
const invoice_controller_1 = require("./invoice.controller");
const payment_controller_1 = require("./payment.controller");
const payout_request_controller_1 = require("./payout-request.controller");
const authService_1 = require("../../services/authService");
const analytics_controller_1 = require("./analytics.controller");
const router = (0, express_1.Router)();
// Apply auth middleware to all routes
router.use(authService_1.requireAuth);
// Invoice routes
router.post('/invoices', invoice_controller_1.invoiceController.create);
router.get('/invoices', invoice_controller_1.invoiceController.getAll);
router.get('/invoices/:id', invoice_controller_1.invoiceController.getById);
router.patch('/invoices/:id/status', invoice_controller_1.invoiceController.updateStatus);
router.delete('/invoices/:id', invoice_controller_1.invoiceController.delete);
// Payment routes
router.post('/payments', payment_controller_1.paymentController.create);
router.post('/payments/process', payment_controller_1.paymentController.processPayment);
router.put('/payments/:id/status', payment_controller_1.paymentController.updateStatus);
router.get('/invoices/:invoiceId/payments', payment_controller_1.paymentController.getByInvoice);
// Payout request routes — approve/reject/process/delete are staff-only.
// (hasAnyRole also honors DB-stored secondary roles.)
router.post('/payout-requests', payout_request_controller_1.payoutRequestController.create);
router.get('/payout-requests', payout_request_controller_1.payoutRequestController.getAll);
router.get('/payout-requests/:id', payout_request_controller_1.payoutRequestController.getById);
router.patch('/payout-requests/:id/status', (0, authService_1.requireAnyRole)(payout_request_controller_1.PAYOUT_STAFF_ROLES), payout_request_controller_1.payoutRequestController.updateStatus);
router.delete(
// Owners may cancel their own pending requests; staff may delete any.
// Ownership is enforced in the controller.
'/payout-requests/:id', (0, authService_1.requireAnyRole)([...payout_request_controller_1.PAYOUT_STAFF_ROLES, 'customer']), payout_request_controller_1.payoutRequestController.delete);
// Analytics routes
router.get('/analytics/metrics', analytics_controller_1.analyticsController.getMetrics);
router.get('/analytics/revenue', analytics_controller_1.analyticsController.getRevenue);
router.get('/analytics/payment-methods', analytics_controller_1.analyticsController.getPaymentMethodStats);
router.get('/reports/aging', analytics_controller_1.analyticsController.getAgingReport);
exports.financeRouter = router;
