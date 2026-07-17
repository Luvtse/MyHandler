import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../../services/authService';

const prisma = new PrismaClient();
export const ordersRouter = Router();

ordersRouter.use(requireAuth);

ordersRouter.get('/', async (_req, res) => {
  const orders = await prisma.order.findMany({ orderBy: { createdAt: 'desc' } });
  res.json({ orders });
});

ordersRouter.post('/', async (req, res) => {
  const { status, userId, shipmentId, totalAmount } = req.body;
  if (!userId || !shipmentId || totalAmount === undefined) {
    return res.status(400).json({ error: 'userId, shipmentId, and totalAmount are required' });
  }
  const totalAmountValue = Number(totalAmount);
  if (!Number.isFinite(totalAmountValue) || totalAmountValue < 0) {
    return res.status(400).json({ error: 'totalAmount must be a non-negative number' });
  }
  const order = await prisma.order.create({
    data: {
      status: String(status || 'pending'),
      userId: String(userId),
      shipmentId: String(shipmentId),
      totalAmount: totalAmountValue,
    },
  });
  res.status(201).json({ order });
});

ordersRouter.get('/:id', async (req, res) => {
  const { id } = req.params;
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json({ order });
});
