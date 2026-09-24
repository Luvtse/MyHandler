"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ordersRouter = void 0;
const express_1 = require("express");
const authService_1 = require("../../services/authService");
const catchAsync_1 = require("../../middlewares/catchAsync");
const prisma_1 = __importDefault(require("../../utils/prisma"));
exports.ordersRouter = (0, express_1.Router)();
exports.ordersRouter.use(authService_1.requireAuth);
// GET /api/orders?page=1&limit=10&status=pending&userId=xxx
exports.ordersRouter.get('/', (0, catchAsync_1.catchAsync)(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;
    const where = {};
    if (req.query.status)
        where.status = String(req.query.status);
    if (req.query.userId)
        where.userId = String(req.query.userId);
    if (req.query.search) {
        where.OR = [
            { id: { contains: String(req.query.search), mode: 'insensitive' } },
            { status: { contains: String(req.query.search), mode: 'insensitive' } },
        ];
    }
    const [total, orders] = await Promise.all([
        prisma_1.default.order.count({ where }),
        prisma_1.default.order.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip,
            include: { user: { select: { id: true, name: true, email: true } } },
        }),
    ]);
    res.json({
        success: true,
        data: orders,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            hasNext: page * limit < total,
            hasPrev: page > 1,
        },
    });
}));
// POST /api/orders
exports.ordersRouter.post('/', (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { status, userId, shipmentId, totalAmount } = req.body;
    if (!userId || !shipmentId || totalAmount === undefined) {
        return res.status(400).json({ success: false, error: 'userId, shipmentId, and totalAmount are required' });
    }
    const amount = Number(totalAmount);
    if (!Number.isFinite(amount) || amount < 0) {
        return res.status(400).json({ success: false, error: 'totalAmount must be a non-negative number' });
    }
    const order = await prisma_1.default.order.create({
        data: {
            status: String(status || 'pending'),
            userId: String(userId),
            shipmentId: String(shipmentId),
            totalAmount: amount,
        },
    });
    res.status(201).json({ success: true, data: order });
}));
// GET /api/orders/:id
exports.ordersRouter.get('/:id', (0, catchAsync_1.catchAsync)(async (req, res) => {
    const order = await prisma_1.default.order.findUnique({
        where: { id: req.params.id },
        include: { user: { select: { id: true, name: true, email: true } } },
    });
    if (!order)
        return res.status(404).json({ success: false, error: 'Order not found' });
    res.json({ success: true, data: order });
}));
