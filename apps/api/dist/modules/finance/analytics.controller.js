"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsController = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
exports.analyticsController = {
    async getMetrics(req, res) {
        try {
            const [invoiceAgg, overdueCount, pendingPayouts, customerCount] = await Promise.all([
                prisma_1.default.invoice.aggregate({
                    _sum: { totalAmount: true },
                    _avg: { totalAmount: true },
                    _count: { id: true },
                }),
                prisma_1.default.invoice.count({ where: { status: 'overdue' } }),
                prisma_1.default.payoutRequest.count({ where: { status: 'PENDING' } }),
                prisma_1.default.user.count({ where: { role: 'customer' } }),
            ]);
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
            const monthlyAgg = await prisma_1.default.invoice.aggregate({
                _sum: { totalAmount: true },
                where: { createdAt: { gte: startOfMonth, lte: endOfMonth } },
            });
            res.json({
                totalRevenue: Number(invoiceAgg._sum.totalAmount || 0),
                monthlyRevenue: Number(monthlyAgg._sum.totalAmount || 0),
                overdueInvoices: overdueCount || 0,
                pendingPayouts: pendingPayouts || 0,
                totalCustomers: customerCount || 0,
                averageInvoiceValue: Number(invoiceAgg._avg.totalAmount || 0),
            });
        }
        catch (error) {
            console.error('Finance analytics metrics error:', error);
            res.status(500).json({
                totalRevenue: 0,
                monthlyRevenue: 0,
                overdueInvoices: 0,
                pendingPayouts: 0,
                totalCustomers: 0,
                averageInvoiceValue: 0,
            });
        }
    },
    async getRevenue(req, res) {
        try {
            const { dateFrom, dateTo } = req.query;
            const from = dateFrom ? new Date(dateFrom) : undefined;
            const to = dateTo ? new Date(dateTo) : undefined;
            const invoices = await prisma_1.default.invoice.findMany({
                where: {
                    createdAt: {
                        gte: from,
                        lte: to,
                    },
                },
                select: { createdAt: true, totalAmount: true },
                orderBy: { createdAt: 'asc' },
            });
            const buckets = new Map();
            for (const inv of invoices) {
                const d = new Date(inv.createdAt);
                const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                buckets.set(key, (buckets.get(key) || 0) + Number(inv.totalAmount || 0));
            }
            const result = Array.from(buckets.entries()).map(([key, revenue]) => {
                const [year, monthNum] = key.split('-');
                const date = new Date(Number(year), Number(monthNum) - 1, 1);
                const month = date.toLocaleString('default', { month: 'short' });
                return { month, revenue, expenses: 0, profit: revenue };
            });
            res.json(result);
        }
        catch (error) {
            console.error('Finance analytics revenue error:', error);
            res.status(500).json([]);
        }
    },
    async getPaymentMethodStats(req, res) {
        try {
            const { dateFrom, dateTo } = req.query;
            const from = dateFrom ? new Date(dateFrom) : undefined;
            const to = dateTo ? new Date(dateTo) : undefined;
            const payments = await prisma_1.default.payment.findMany({
                where: {
                    createdAt: {
                        gte: from,
                        lte: to,
                    },
                },
                select: { paymentMethod: true, amount: true },
            });
            const totals = {};
            for (const p of payments) {
                const key = p.paymentMethod || 'UNKNOWN';
                if (!totals[key])
                    totals[key] = { count: 0, totalAmount: 0 };
                totals[key].count += 1;
                totals[key].totalAmount += Number(p.amount || 0);
            }
            const sumCount = Object.values(totals).reduce((acc, v) => acc + v.count, 0) || 1;
            const result = Object.entries(totals).map(([method, v]) => ({
                method,
                count: v.count,
                totalAmount: v.totalAmount,
                percentage: (v.count / sumCount) * 100,
            }));
            res.json(result);
        }
        catch (error) {
            console.error('Finance analytics payment method stats error:', error);
            res.status(500).json([]);
        }
    },
    async getAgingReport(req, res) {
        try {
            const invoices = await prisma_1.default.invoice.findMany({
                select: {
                    id: true,
                    userId: true,
                    subtotal: true,
                    taxAmount: true,
                    totalAmount: true,
                    dueDate: true,
                    status: true,
                    user: { select: { id: true, name: true } },
                },
            });
            const now = new Date();
            const byCustomer = {};
            for (const inv of invoices) {
                const customerId = String(inv.userId ?? 'unknown');
                const name = inv.user?.name ?? 'Unknown';
                if (!byCustomer[customerId]) {
                    byCustomer[customerId] = { name, current: 0, thirtyDays: 0, sixtyDays: 0, ninetyDays: 0, total: 0 };
                }
                const amount = Number(inv.totalAmount ?? 0);
                const statusStr = String(inv.status ?? '').toUpperCase();
                const isPaid = statusStr === 'PAID';
                if (isPaid || amount <= 0)
                    continue;
                const due = inv.dueDate ? new Date(inv.dueDate) : undefined;
                const diffDays = due ? Math.floor((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24)) : 0;
                if (diffDays <= 0)
                    byCustomer[customerId].current += amount;
                else if (diffDays <= 30)
                    byCustomer[customerId].thirtyDays += amount;
                else if (diffDays <= 60)
                    byCustomer[customerId].sixtyDays += amount;
                else
                    byCustomer[customerId].ninetyDays += amount;
                byCustomer[customerId].total += amount;
            }
            const result = Object.entries(byCustomer).map(([customerId, v]) => ({
                customerId,
                customerName: v.name,
                current: Math.round(v.current * 100) / 100,
                thirtyDays: Math.round(v.thirtyDays * 100) / 100,
                sixtyDays: Math.round(v.sixtyDays * 100) / 100,
                ninetyDays: Math.round(v.ninetyDays * 100) / 100,
                total: Math.round(v.total * 100) / 100,
            }));
            res.json(result);
        }
        catch (error) {
            console.error('Finance analytics aging report error:', error);
            res.status(500).json([]);
        }
    },
};
