import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../../services/authService';
import { catchAsync } from '../../middlewares/catchAsync';

const prisma = new PrismaClient();
export const fleetRouter = Router();

fleetRouter.use(requireAuth);

// ─── Route Optimization (Haversine + 2-opt) ──────────────────────────────────

interface Stop { lat: number; lng: number; label?: string }

/** Real geographic distance in km using the Haversine formula */
function haversine(a: Stop, b: Stop): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lng - a.lng) * Math.PI) / 180;
  const sin2Lat = Math.sin(dLat / 2) ** 2;
  const sin2Lon = Math.sin(dLon / 2) ** 2;
  const chord =
    sin2Lat +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      sin2Lon;
  return R * 2 * Math.atan2(Math.sqrt(chord), Math.sqrt(1 - chord));
}

function totalDistance(route: Stop[]): number {
  let d = 0;
  for (let i = 0; i < route.length - 1; i++) d += haversine(route[i], route[i + 1]);
  return d;
}

/** Greedy nearest-neighbour seed */
function nearestNeighbour(stops: Stop[]): Stop[] {
  const visited = new Set<number>();
  const route: Stop[] = [stops[0]];
  visited.add(0);

  while (route.length < stops.length) {
    const last = route[route.length - 1];
    let bestDist = Infinity;
    let bestIdx = -1;
    for (let i = 0; i < stops.length; i++) {
      if (visited.has(i)) continue;
      const d = haversine(last, stops[i]);
      if (d < bestDist) { bestDist = d; bestIdx = i; }
    }
    visited.add(bestIdx);
    route.push(stops[bestIdx]);
  }
  return route;
}

/** 2-opt improvement — iteratively reverses sub-segments to reduce total distance */
function twoOpt(route: Stop[], maxPasses = 100): Stop[] {
  let best = [...route];
  let improved = true;
  let passes = 0;

  while (improved && passes < maxPasses) {
    improved = false;
    passes++;
    for (let i = 1; i < best.length - 1; i++) {
      for (let j = i + 1; j < best.length; j++) {
        const before =
          haversine(best[i - 1], best[i]) +
          haversine(best[j], j + 1 < best.length ? best[j + 1] : best[0]);
        const after =
          haversine(best[i - 1], best[j]) +
          haversine(best[i], j + 1 < best.length ? best[j + 1] : best[0]);
        if (after < before - 0.001) {
          best = [
            ...best.slice(0, i),
            ...best.slice(i, j + 1).reverse(),
            ...best.slice(j + 1),
          ];
          improved = true;
        }
      }
    }
  }
  return best;
}

/**
 * GET /api/fleet/route-optimize?stops=lat,lng|lat,lng|...
 * Returns optimised stop order with per-leg distances and total km.
 */
fleetRouter.get(
  '/route-optimize',
  catchAsync(async (req, res) => {
    const raw = (req.query.stops as string | undefined) ?? '';
    if (!raw) {
      return res.status(400).json({ error: 'Provide stops as lat,lng|lat,lng|...' });
    }

    const stops: Stop[] = raw.split('|').map((s, i) => {
      const parts = s.split(',').map(Number);
      if (parts.length < 2 || parts.some(isNaN)) {
        throw Object.assign(new Error(`Invalid stop at index ${i}: "${s}"`), { status: 400 });
      }
      return { lat: parts[0], lng: parts[1], label: `Stop ${i + 1}` };
    });

    if (stops.length < 2) {
      return res.status(400).json({ error: 'At least 2 stops are required' });
    }

    // 1. Greedy seed   2. 2-opt refinement
    const seeded = nearestNeighbour(stops);
    const optimised = twoOpt(seeded);
    const distBefore = totalDistance(nearestNeighbour(stops));
    const distAfter = totalDistance(optimised);

    const legs = optimised.slice(0, -1).map((stop, i) => ({
      from: stop,
      to: optimised[i + 1],
      distanceKm: Math.round(haversine(stop, optimised[i + 1]) * 10) / 10,
    }));

    res.json({
      route: optimised,
      legs,
      totalDistanceKm: Math.round(distAfter * 10) / 10,
      savedKm: Math.round((distBefore - distAfter) * 10) / 10,
      algorithm: 'nearest-neighbour + 2-opt',
    });
  }),
);

// GET /api/fleet/vehicles
fleetRouter.get(
  '/vehicles',
  catchAsync(async (_req, res) => {
    const vehicles = await prisma.vehicle.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: vehicles });
  }),
);
