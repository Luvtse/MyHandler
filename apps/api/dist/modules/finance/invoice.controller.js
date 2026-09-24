"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.invoiceController = void 0;
const authService_1 = require("../../services/authService");
const prisma_1 = __importDefault(require("../../utils/prisma"));
const zod_1 = require("zod");
// Validation schema for creating an invoice
const createInvoiceSchema = zod_1.z.object({
    shipmentId: zod_1.z.string(),
    currencyId: zod_1.z.string(),
    subtotal: zod_1.z.number().positive(),
    taxAmount: zod_1.z.number().min(0),
    totalAmount: zod_1.z.number().positive(),
    dueDate: zod_1.z.string().transform(str => new Date(str)),
    notes: zod_1.z.string().optional(),
    items: zod_1.z.array(zod_1.z.object({
        description: zod_1.z.string(),
        quantity: zod_1.z.number().int().positive(),
        unitPrice: zod_1.z.number().positive(),
        taxRate: zod_1.z.number().min(0),
        amount: zod_1.z.number().positive(),
    })),
});
exports.invoiceController = {
    // Create a new invoice
    async create(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }
            // req.user is the JWT payload: the user id lives in `sub` (there is no `id`).
            const userId = String(req.user.sub);
            const validatedData = createInvoiceSchema.parse(req.body);
            // Generate invoice number (format: INV-YYYYMMDD-XXXX)
            const date = new Date();
            const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
            const randomPart = Math.floor(1000 + Math.random() * 9000);
            const invoiceNumber = `INV-${dateStr}-${randomPart}`;
            // Create invoice with items in a transaction
            const invoice = await prisma_1.default.$transaction(async (tx) => {
                // Create the invoice
                const newInvoice = await tx.invoice.create({
                    data: {
                        invoiceNumber,
                        userId,
                        shipmentId: validatedData.shipmentId,
                        currencyId: validatedData.currencyId,
                        subtotal: validatedData.subtotal,
                        taxAmount: validatedData.taxAmount,
                        totalAmount: validatedData.totalAmount,
                        dueDate: validatedData.dueDate,
                        notes: validatedData.notes,
                        status: 'DRAFT',
                    },
                });
                // Create invoice items
                for (const item of validatedData.items) {
                    await tx.invoiceItem.create({
                        data: {
                            invoiceId: newInvoice.id,
                            description: item.description,
                            quantity: item.quantity,
                            unitPrice: item.unitPrice,
                            taxRate: item.taxRate,
                            amount: item.amount,
                        },
                    });
                }
                return newInvoice;
            });
            return res.status(201).json({
                success: true,
                data: invoice,
            });
        }
        catch (error) {
            console.error('Error creating invoice:', error);
            return res.status(400).json({
                success: false,
                message: error instanceof zod_1.z.ZodError
                    ? error.errors.map(e => e.message).join(', ')
                    : 'Failed to create invoice',
            });
        }
    },
    // Get all invoices for the current user or all if admin
    async getAll(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }
            // req.user is the JWT payload: the user id lives in `sub` (there is no `id`).
            const userId = String(req.user.sub);
            // Secondary roles are stored in the DB, not in the token; check them server-side.
            const isAdmin = await (0, authService_1.hasAnyRole)(req, ['admin', 'finance']);
            const invoices = await prisma_1.default.invoice.findMany({
                where: isAdmin ? {} : { userId: String(userId) },
                include: {
                    currency: true,
                    shipment: {
                        select: {
                            id: true,
                            reference: true,
                            status: true,
                        },
                    },
                    invoiceItems: true,
                    payments: {
                        select: {
                            id: true,
                            amount: true,
                            status: true,
                            paymentDate: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });
            return res.json({
                success: true,
                data: invoices,
            });
        }
        catch (error) {
            console.error('Error fetching invoices:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch invoices',
            });
        }
    },
    // Get a single invoice by ID
    async getById(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }
            const { id } = req.params;
            // req.user is the JWT payload: the user id lives in `sub` (there is no `id`).
            const userId = String(req.user.sub);
            // Secondary roles are stored in the DB, not in the token; check them server-side.
            const isAdmin = await (0, authService_1.hasAnyRole)(req, ['admin', 'finance']);
            const invoice = await prisma_1.default.invoice.findUnique({
                where: { id },
                include: {
                    currency: true,
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            phone: true,
                            businessAccountCode: true,
                        },
                    },
                    shipment: {
                        select: {
                            id: true,
                            reference: true,
                            originAddress: true,
                            destinationAddress: true,
                            status: true,
                        },
                    },
                    invoiceItems: true,
                    payments: {
                        include: {
                            currency: true,
                        },
                    },
                },
            });
            if (!invoice) {
                return res.status(404).json({
                    success: false,
                    message: 'Invoice not found',
                });
            }
            // Check if user has access to this invoice
            if (!isAdmin && invoice.userId !== String(userId)) {
                return res.status(403).json({
                    success: false,
                    message: 'You do not have permission to view this invoice',
                });
            }
            return res.json({
                success: true,
                data: invoice,
            });
        }
        catch (error) {
            console.error('Error fetching invoice:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch invoice',
            });
        }
    },
    // Update invoice status
    async updateStatus(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }
            const { id } = req.params;
            const { status } = req.body;
            // req.user is the JWT payload: the user id lives in `sub` (there is no `id`).
            const userId = String(req.user.sub);
            // Secondary roles are stored in the DB, not in the token; check them server-side.
            const isAdmin = await (0, authService_1.hasAnyRole)(req, ['admin', 'finance']);
            // Validate status
            if (!['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED'].includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid status',
                });
            }
            // Check if invoice exists and user has access
            const invoice = await prisma_1.default.invoice.findUnique({
                where: { id },
            });
            if (!invoice) {
                return res.status(404).json({
                    success: false,
                    message: 'Invoice not found',
                });
            }
            // Check if user has access to this invoice
            if (!isAdmin && invoice.userId !== String(userId)) {
                return res.status(403).json({
                    success: false,
                    message: 'You do not have permission to update this invoice',
                });
            }
            // Update invoice status
            const updatedInvoice = await prisma_1.default.invoice.update({
                where: { id },
                data: { status },
            });
            return res.json({
                success: true,
                data: updatedInvoice,
            });
        }
        catch (error) {
            console.error('Error updating invoice status:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to update invoice status',
            });
        }
    },
    // Delete an invoice (only if it's a draft)
    async delete(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }
            const { id } = req.params;
            // req.user is the JWT payload: the user id lives in `sub` (there is no `id`).
            const userId = String(req.user.sub);
            // Secondary roles are stored in the DB, not in the token; check them server-side.
            const isAdmin = await (0, authService_1.hasAnyRole)(req, ['admin', 'finance']);
            // Check if invoice exists and user has access
            const invoice = await prisma_1.default.invoice.findUnique({
                where: { id },
            });
            if (!invoice) {
                return res.status(404).json({
                    success: false,
                    message: 'Invoice not found',
                });
            }
            // Check if user has access to this invoice
            if (!isAdmin && invoice.userId !== String(userId)) {
                return res.status(403).json({
                    success: false,
                    message: 'You do not have permission to delete this invoice',
                });
            }
            // Only allow deletion of draft invoices
            if (invoice.status !== 'DRAFT') {
                return res.status(400).json({
                    success: false,
                    message: 'Only draft invoices can be deleted',
                });
            }
            // Delete invoice and related items in a transaction
            await prisma_1.default.$transaction([
                prisma_1.default.invoiceItem.deleteMany({
                    where: { invoiceId: id },
                }),
                prisma_1.default.invoice.delete({
                    where: { id },
                }),
            ]);
            return res.json({
                success: true,
                message: 'Invoice deleted successfully',
            });
        }
        catch (error) {
            console.error('Error deleting invoice:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to delete invoice',
            });
        }
    },
};
