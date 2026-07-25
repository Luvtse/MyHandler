import { Router } from 'express';
import prisma from '../../utils/prisma';

import { requireAuth } from '../../services/authService';

export const returnsRouter = Router();

returnsRouter.use(requireAuth);

returnsRouter.get('/', async (_req, res) => {
  const returns = await prisma.return.findMany();
  res.json({ returns });
});

returnsRouter.post('/', async (req, res) => {
  const { orderId, reason, status } = req.body;
  const ret = await prisma.return.create({ data: { orderId, reason, status } });
  res.status(201).json({ return: ret });
});