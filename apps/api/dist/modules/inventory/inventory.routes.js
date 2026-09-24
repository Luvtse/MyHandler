"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.inventoryRouter = void 0;
const express_1 = require("express");
const authService_1 = require("../../services/authService");
const catchAsync_1 = require("../../middlewares/catchAsync");
const prisma_1 = __importDefault(require("../../utils/prisma"));
exports.inventoryRouter = (0, express_1.Router)();
exports.inventoryRouter.use(authService_1.requireAuth);
// GET /api/inventory?page=1&limit=10&search=sku&location=addis
exports.inventoryRouter.get('/', (0, catchAsync_1.catchAsync)(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;
    const where = {};
    if (req.query.location)
        where.location = { contains: String(req.query.location), mode: 'insensitive' };
    if (req.query.search) {
        where.OR = [
            { sku: { contains: String(req.query.search), mode: 'insensitive' } },
            { name: { contains: String(req.query.search), mode: 'insensitive' } },
        ];
    }
    if (req.query.outOfStock === 'true')
        where.quantity = 0;
    const [total, items] = await Promise.all([
        prisma_1.default.inventoryItem.count({ where }),
        prisma_1.default.inventoryItem.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip,
        }),
    ]);
    res.json({
        success: true,
        data: items,
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
// POST /api/inventory
exports.inventoryRouter.post('/', (0, authService_1.requireRole)(['admin', 'warehouse']), (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { sku, name, description, quantity, location } = req.body;
    if (!sku || !name || !description || !location) {
        return res.status(400).json({ success: false, error: 'sku, name, description, and location are required' });
    }
    const qty = quantity === undefined ? 0 : Number(quantity);
    if (!Number.isFinite(qty) || !Number.isInteger(qty) || qty < 0) {
        return res.status(400).json({ success: false, error: 'quantity must be a non-negative integer' });
    }
    const existing = await prisma_1.default.inventoryItem.findUnique({ where: { sku } });
    if (existing)
        return res.status(409).json({ success: false, error: 'SKU already exists' });
    const item = await prisma_1.default.inventoryItem.create({ data: { sku, name, description, quantity: qty, location } });
    res.status(201).json({ success: true, data: item });
}));
// PUT /api/inventory/:id
exports.inventoryRouter.put('/:id', (0, authService_1.requireRole)(['admin', 'warehouse']), (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { name, description, quantity, location } = req.body;
    if (quantity !== undefined) {
        const qty = Number(quantity);
        if (!Number.isFinite(qty) || !Number.isInteger(qty) || qty < 0) {
            return res.status(400).json({ success: false, error: 'quantity must be a non-negative integer' });
        }
    }
    const data = {};
    if (name !== undefined)
        data.name = name;
    if (description !== undefined)
        data.description = description;
    if (quantity !== undefined)
        data.quantity = Number(quantity);
    if (location !== undefined)
        data.location = location;
    const item = await prisma_1.default.inventoryItem.update({ where: { id: req.params.id }, data });
    res.json({ success: true, data: item });
}));
