import { describe, it, vi } from 'vitest';
const prismaMock = vi.hoisted(() => ({
  airport: { findMany: vi.fn() }, flightSchedule: { findMany: vi.fn() },
  serviceLevelSettings: { findMany: vi.fn() }, operatingCalendar: { findMany: vi.fn() },
  regionalHub: { findMany: vi.fn() },
}) as any);
vi.mock('../../../utils/prisma', () => ({ default: prismaMock }));
import * as svc from '../eta.service';
import { AIRPORTS, SCHEDULES, SL_SETTINGS, REGIONAL_HUBS } from './etaFixtures';

describe('probe5', () => {
  it('trace nextWeekday and internals', async () => {
    prismaMock.airport.findMany.mockResolvedValue(AIRPORTS);
    const realNW = (svc as any).nextWeekday;
    let depth = 0;
    prismaMock.flightSchedule.findMany.mockImplementation(async (...a: any[]) => {
      depth++;
      if (depth < 4) console.trace('sched call #' + depth, a[0]);
      return SCHEDULES;
    });
    prismaMock.serviceLevelSettings.findMany.mockResolvedValue(SL_SETTINGS);
    prismaMock.operatingCalendar.findMany.mockResolvedValue([]);
    prismaMock.regionalHub.findMany.mockResolvedValue(REGIONAL_HUBS);
    try {
      const r = await svc.etaService.calculateETA({ originCode: 'BJR', destinationCode: 'ADD', serviceLevel: 'standard', dropoffTime: new Date(2026,8,23,9,0).toISOString() });
      console.log('RESULT est=', JSON.stringify(r.estimatedDelivery), 'flights=', r.flights.length);
    } catch (e: any) {
      console.log('calculateETA THREW:', e?.message);
      console.log(e?.stack?.split('\n').slice(0, 12).join('\n'));
    }
  });
});
