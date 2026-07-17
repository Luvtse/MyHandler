import { Router } from 'express';
import { PrismaClient, ShipmentStatus } from '@prisma/client';
import { requireAuth } from '../../services/authService';

const prisma = new PrismaClient();
export const trackingRouter = Router();

trackingRouter.use(requireAuth);

// List tracking events by shipment
trackingRouter.get('/', async (req, res) => {
  const { shipmentId } = req.query as { shipmentId?: string };
  if (!shipmentId) return res.status(400).json({ error: 'shipmentId is required' });
  const events = await prisma.trackingEvent.findMany({
    where: { shipmentId },
    orderBy: { eventTime: 'desc' },
  });
  res.json({ events });
});

// Add tracking event to shipment (owner or admin)
trackingRouter.post('/', async (req, res) => {
  const user = (req as any).user;
  const { shipmentId, status, location, description, eventTime } = req.body;
  if (!shipmentId || !status) return res.status(400).json({ error: 'shipmentId and status are required' });

  const shipment = await prisma.shipment.findUnique({ where: { id: shipmentId } });
  if (!shipment) return res.status(404).json({ error: 'Shipment not found' });
  if (shipment.userId !== user.sub && user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const toEnum = (s: string): ShipmentStatus => {
    const key = String(s || '').trim().toUpperCase().replace(/-/g, '_');
    return (ShipmentStatus as any)[key] ?? ShipmentStatus.IN_TRANSIT_TO_DESTINATION;
  };

  const event = await prisma.trackingEvent.create({
    data: {
      shipmentId,
      status: toEnum(status),
      location,
      description,
      eventTime: eventTime ? new Date(eventTime) : new Date(),
    },
  });
  res.status(201).json({ event });
});

// Delete tracking event (owner or admin)
trackingRouter.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const user = (req as any).user;
  const existing = await prisma.trackingEvent.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ error: 'Tracking event not found' });
  const shipment = await prisma.shipment.findUnique({ where: { id: existing.shipmentId } });
  if (!shipment) return res.status(404).json({ error: 'Shipment not found' });
  if (shipment.userId !== user.sub && user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  await prisma.trackingEvent.delete({ where: { id } });
  res.status(204).send();
});
