import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, requireRole } from '../../services/authService';

const prisma = new PrismaClient();
export const inventoryRouter = Router();

inventoryRouter.use(requireAuth);

inventoryRouter.get('/', async (_req, res) => {
  const items = await prisma.inventoryItem.findMany();
  res.json({ items });
});

inventoryRouter.post('/', requireRole(['admin', 'warehouse']), async (req, res) => {
  const { sku, name, description, quantity, location } = req.body;
  if (!sku || !name || !description || !location) return res.status(400).json({ error: 'Missing required fields' });
  const quantityValue = quantity === undefined ? 0 : Number(quantity);
  if (!Number.isFinite(quantityValue) || !Number.isInteger(quantityValue) || quantityValue < 0) {
    return res.status(400).json({ error: 'quantity must be a non-negative integer' });
  }
  const existing = await prisma.inventoryItem.findUnique({ where: { sku } });
  if (existing) return res.status(409).json({ error: 'SKU already exists' });
  const item = await prisma.inventoryItem.create({
    data: {
      sku,
      name,
      description,
      quantity: quantityValue,
      location,
    },
  });
  res.status(201).json({ item });
});

inventoryRouter.put('/:id', requireRole(['admin', 'warehouse']), async (req, res) => {
  const { id } = req.params;
  const { name, description, quantity, location } = req.body;
  if (quantity !== undefined) {
    const quantityValue = Number(quantity);
    if (!Number.isFinite(quantityValue) || !Number.isInteger(quantityValue) || quantityValue < 0) {
      return res.status(400).json({ error: 'quantity must be a non-negative integer' });
    }
  }
  const data: Record<string, unknown> = {};
  if (name !== undefined) data.name = name;
  if (description !== undefined) data.description = description;
  if (quantity !== undefined) data.quantity = Number(quantity);
  if (location !== undefined) data.location = location;

  const item = await prisma.inventoryItem.update({ where: { id }, data });
  res.json({ item });
});
