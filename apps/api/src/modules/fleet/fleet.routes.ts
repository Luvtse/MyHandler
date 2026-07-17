import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../../services/authService';

const prisma = new PrismaClient();
export const fleetRouter = Router();

fleetRouter.use(requireAuth);

// Simple nearest-neighbor route optimization (placeholder for AI-based)
fleetRouter.get('/route-optimize', async (req, res) => {
  const stops = (req.query.stops as string | undefined)?.split('|').map((s) => {
    const [lat, lng] = s.split(',').map(Number);
    return { lat, lng };
  }) || [];
  if (stops.length === 0) return res.status(400).json({ error: 'Provide stops as lat,lng|lat,lng' });
  const start = stops[0];
  const remaining = stops.slice(1);
  const route = [start];
  let current = start;
  while (remaining.length) {
    let nearestIdx = 0;
    let nearestDist = Number.MAX_VALUE;
    for (let i = 0; i < remaining.length; i++) {
      const d = Math.hypot(current.lat - remaining[i].lat, current.lng - remaining[i].lng);
      if (d < nearestDist) {
        nearestDist = d;
        nearestIdx = i;
      }
    }
    current = remaining.splice(nearestIdx, 1)[0];
    route.push(current);
  }
  res.json({ route });
});

fleetRouter.get('/vehicles', async (_req, res) => {
  const vehicles = await prisma.vehicle.findMany();
  res.json({ vehicles });
});