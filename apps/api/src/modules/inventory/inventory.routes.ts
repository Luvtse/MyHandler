import { Router } from 'express';
import { requireAuth, requireRole } from '../../services/authService';
import { catchAsync } from '../../middlewares/catchAsync';
import prisma from '../../utils/prisma';

export const inventoryRouter = Router();
inventoryRouter.use(requireAuth);

// GET /api/inventory?page=1&limit=10&search=sku&location=addis
inventoryRouter.get(
  '/',
  catchAsync(async (req, res) => {
    const page   = Math.max(1, parseInt(req.query.page   as string) || 1);
    const limit  = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
    const skip   = (page - 1) * limit;

    const where: any = {};
    if (req.query.location) where.location = { contains: String(req.query.location), mode: 'insensitive' };
    if (req.query.search) {
      where.OR = [
        { sku:  { contains: String(req.query.search), mode: 'insensitive' } },
        { name: { contains: String(req.query.search), mode: 'insensitive' } },
      ];
    }
    if (req.query.outOfStock === 'true') where.quantity = 0;

    const [total, items] = await Promise.all([
      prisma.inventoryItem.count({ where }),
      prisma.inventoryItem.findMany({
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
  }),
);

// POST /api/inventory
inventoryRouter.post(
  '/',
  requireRole(['admin', 'warehouse']),
  catchAsync(async (req, res) => {
    const { sku, name, description, quantity, location } = req.body;
    if (!sku || !name || !description || !location) {
      return res.status(400).json({ success: false, error: 'sku, name, description, and location are required' });
    }
    const qty = quantity === undefined ? 0 : Number(quantity);
    if (!Number.isFinite(qty) || !Number.isInteger(qty) || qty < 0) {
      return res.status(400).json({ success: false, error: 'quantity must be a non-negative integer' });
    }
    const existing = await prisma.inventoryItem.findUnique({ where: { sku } });
    if (existing) return res.status(409).json({ success: false, error: 'SKU already exists' });

    const item = await prisma.inventoryItem.create({ data: { sku, name, description, quantity: qty, location } });
    res.status(201).json({ success: true, data: item });
  }),
);

// PUT /api/inventory/:id
inventoryRouter.put(
  '/:id',
  requireRole(['admin', 'warehouse']),
  catchAsync(async (req, res) => {
    const { name, description, quantity, location } = req.body;
    if (quantity !== undefined) {
      const qty = Number(quantity);
      if (!Number.isFinite(qty) || !Number.isInteger(qty) || qty < 0) {
        return res.status(400).json({ success: false, error: 'quantity must be a non-negative integer' });
      }
    }
    const data: Record<string, unknown> = {};
    if (name        !== undefined) data.name        = name;
    if (description !== undefined) data.description = description;
    if (quantity    !== undefined) data.quantity    = Number(quantity);
    if (location    !== undefined) data.location    = location;

    const item = await prisma.inventoryItem.update({ where: { id: req.params.id }, data });
    res.json({ success: true, data: item });
  }),
);
