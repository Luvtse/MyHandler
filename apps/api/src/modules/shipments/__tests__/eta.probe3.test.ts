import { describe, it, vi } from 'vitest';
const prismaMock = vi.hoisted(() => ({
  airport: { findMany: vi.fn() }, flightSchedule: { findMany: vi.fn() },
  serviceLevelSettings: { findMany: vi.fn() }, operatingCalendar: { findMany: vi.fn() },
  regionalHub: { findMany: vi.fn() },
}) as any);
vi.mock('../../../utils/prisma', () => ({ default: prismaMock }));
import { etaService } from '../eta.service';
import { AIRPORTS, SCHEDULES, SL_SETTINGS, REGIONAL_HUBS } from './etaFixtures';

describe('probe3', () => {
  it('instrumented', async () => {
    prismaMock.airport.findMany.mockResolvedValue(AIRPORTS);
    const orig = prismaMock.flightSchedule.findMany;
    let callN = 0;
    prismaMock.flightSchedule.findMany.mockImplementation(async (...args: any[]) => {
      callN++;
      try { const r = await orig(...args); console.log('sched call', callN, '-> rows', (r as any[]).length, 'first', JSON.stringify((r as any[])[0])); return r; }
      catch (e) { console.log('sched call', callN, 'THROWS', String(e)); throw e; }
    });
    prismaMock.serviceLevelSettings.findMany.mockResolvedValue(SL_SETTINGS);
    prismaMock.operatingCalendar.findMany.mockResolvedValue([]);
    prismaMock.regionalHub.findMany.mockResolvedValue(REGIONAL_HUBS);
    const r = await etaService.calculateETA({ originCode: 'BJR', destinationCode: 'ADD', serviceLevel: 'standard', dropoffTime: new Date(2026,8,23,9,0).toISOString() });
    console.log('RESULT est=', r.estimatedDelivery, 'flights=', r.flights.length, 'calls=', callN);
  });
});
