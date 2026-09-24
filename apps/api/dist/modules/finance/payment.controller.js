"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentController = void 0;
const authService_1 = require("../../services/authService");
const prisma_1 = __importDefault(require("../../utils/prisma"));
const zod_1 = require("zod");
const payment_processors_1 = require("./payment-processors");
// Validation schema for creating a payment
const createPaymentSchema = zod_1.z.object({
    invoiceId: zod_1.z.string(),
    amount: zod_1.z.number().positive(),
    currencyId: zod_1.z.string(),
    paymentMethod: zod_1.z.enum(['BANK_TRANSFER', 'CREDIT_CARD', 'PAYPAL', 'CHAPA', 'TELEBIRR', 'CASH', 'CHECK', 'OTHER']),
    transactionId: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
    returnUrl: zod_1.z.string().url().optional(),
    cancelUrl: zod_1.z.string().url().optional(),
});
exports.paymentController = {
    // Process a new payment using payment processors
    async processPayment(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }
            const userId = String(req.user.sub);
            const validatedData = createPaymentSchema.parse(req.body);
            // Check if invoice exists
            const invoice = await prisma_1.default.invoice.findUnique({
                where: { id: validatedData.invoiceId },
                include: {
                    currency: true
                }
            });
            if (!invoice) {
                return res.status(404).json({
                    success: false,
                    message: 'Invoice not found',
                });
            }
            // Get the appropriate payment processor
            try {
                const processor = payment_processors_1.PaymentProcessorFactory.getProcessor(validatedData.paymentMethod);
                // Process the payment
                const paymentResult = await processor.processPayment({
                    amount: validatedData.amount,
                    currency: invoice.currency.code,
                    description: `Payment for invoice #${invoice.invoiceNumber}`,
                    invoiceId: invoice.id,
                    returnUrl: validatedData.returnUrl || `${req.protocol}://${req.get('host')}/payment/success`,
                    cancelUrl: validatedData.cancelUrl || `${req.protocol}://${req.get('host')}/payment/cancel`,
                    metadata: {
                        userId,
                        invoiceId: invoice.id
                    }
                });
                if (!paymentResult.success) {
                    return res.status(400).json({
                        success: false,
                        message: paymentResult.error || 'Payment processing failed',
                    });
                }
                const transactionId = paymentResult.processorReference || paymentResult.paymentId;
                if (!transactionId) {
                    return res.status(400).json({
                        success: false,
                        message: 'Payment processor did not return a transaction id',
                    });
                }
                // Create payment record
                const payment = await prisma_1.default.payment.create({
                    data: {
                        invoiceId: validatedData.invoiceId,
                        userId,
                        amount: validatedData.amount,
                        currencyId: validatedData.currencyId,
                        paymentMethod: validatedData.paymentMethod,
                        transactionId,
                        notes: validatedData.notes,
                        status: 'PENDING',
                    },
                });
                return res.status(200).json({
                    success: true,
                    data: {
                        payment,
                        redirectUrl: paymentResult.redirectUrl,
                        paymentId: paymentResult.paymentId
                    },
                });
            }
            catch (error) {
                console.error('Payment processor error:', error);
                return res.status(400).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Payment method not supported',
                });
            }
        }
        catch (error) {
            console.error('Error processing payment:', error);
            return res.status(400).json({
                success: false,
                message: error instanceof zod_1.z.ZodError
                    ? error.errors.map(e => e.message).join(', ')
                    : 'Failed to process payment',
            });
        }
    },
    // Create a new payment (legacy method)
    async create(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }
            const userId = String(req.user.sub);
            const validatedData = createPaymentSchema.parse(req.body);
            // Check if invoice exists
            const invoice = await prisma_1.default.invoice.findUnique({
                where: { id: validatedData.invoiceId },
            });
            if (!invoice) {
                return res.status(404).json({
                    success: false,
                    message: 'Invoice not found',
                });
            }
            // Create payment
            if (!validatedData.transactionId) {
                return res.status(400).json({
                    success: false,
                    message: 'transactionId is required',
                });
            }
            const payment = await prisma_1.default.payment.create({
                data: {
                    invoiceId: validatedData.invoiceId,
                    userId,
                    amount: validatedData.amount,
                    currencyId: validatedData.currencyId,
                    paymentMethod: validatedData.paymentMethod,
                    transactionId: validatedData.transactionId,
                    notes: validatedData.notes,
                    status: 'PENDING',
                },
            });
            return res.status(201).json({
                success: true,
                data: payment,
            });
        }
        catch (error) {
            console.error('Error creating payment:', error);
            return res.status(400).json({
                success: false,
                message: error instanceof zod_1.z.ZodError
                    ? error.errors.map(e => e.message).join(', ')
                    : 'Failed to create payment',
            });
        }
    },
    // Update payment status (e.g., mark as completed)
    async updateStatus(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }
            const { id } = req.params;
            const { status } = req.body;
            const isAdmin = await (0, authService_1.hasAnyRole)(req, ['admin', 'finance']);
            // Only admins and finance users can update payment status
            if (!isAdmin) {
                return res.status(403).json({
                    success: false,
                    message: 'You do not have permission to update payment status',
                });
            }
            // Validate status
            if (!['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'].includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid status',
                });
            }
            // Update payment status
            const payment = await prisma_1.default.payment.update({
                where: { id },
                data: { status },
            });
            // If payment is completed, update invoice status if all payments cover the total
            if (status === 'COMPLETED') {
                const invoice = await prisma_1.default.invoice.findUnique({
                    where: { id: payment.invoiceId },
                    include: {
                        payments: {
                            where: { status: 'COMPLETED' },
                        },
                    },
                });
                if (invoice) {
                    const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
                    // If total paid equals or exceeds invoice total, mark invoice as paid
                    if (totalPaid >= invoice.totalAmount) {
                        await prisma_1.default.invoice.update({
                            where: { id: invoice.id },
                            data: { status: 'PAID' },
                        });
                    }
                }
            }
            return res.json({
                success: true,
                data: payment,
            });
        }
        catch (error) {
            console.error('Error updating payment status:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to update payment status',
            });
        }
    },
    // Get all payments for an invoice
    async getByInvoice(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }
            const { invoiceId } = req.params;
            const userId = String(req.user.sub);
            const isAdmin = await (0, authService_1.hasAnyRole)(req, ['admin', 'finance']);
            // Check if invoice exists and user has access
            const invoice = await prisma_1.default.invoice.findUnique({
                where: { id: invoiceId },
            });
            if (!invoice) {
                return res.status(404).json({
                    success: false,
                    message: 'Invoice not found',
                });
            }
            // Check if user has access to this invoice
            if (!isAdmin && invoice.userId !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'You do not have permission to view payments for this invoice',
                });
            }
            // Get payments
            const payments = await prisma_1.default.payment.findMany({
                where: { invoiceId },
                include: {
                    currency: true,
                },
                orderBy: {
                    paymentDate: 'desc',
                },
            });
            return res.json({
                success: true,
                data: payments,
            });
        }
        catch (error) {
            console.error('Error fetching payments:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch payments',
            });
        }
    },
};
