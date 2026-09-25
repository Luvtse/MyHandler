import { describe, it, vi } from 'vitest';
const prismaMock = vi.hoisted(() => ({
  airport: { findMany: vi.fn() }, flightSchedule: { findMany: vi.fn() },
  serviceLevelSettings: { findMany: vi.fn() }, operatingCalendar: { findMany: vi.fn() },
  regionalHub: { findMany: vi.fn() },
}) as any);
vi.mock('../../../utils/prisma', () => ({ default: prismaMock }));
import { etaService } from '../eta.service';
import { AIRPORTS, SCHEDULES, SL_SETTINGS, REGIONAL_HUBS } from './etaFixtures';

describe('probe6', () => {
  it('hub calls + first sched call log', async () => {
    prismaMock.airport.findMany.mockResolvedValue(AIRPORTS);
    let n = 0;
    prismaMock.flightSchedule.findMany.mockImplementation(async () => {
      n++;
      if (n === 1) console.log('first sched rows:', JSON.stringify(SCHEDULES[0]));
      return SCHEDULES;
    });
    prismaMock.serviceLevelSettings.findMany.mockResolvedValue(SL_SETTINGS);
    prismaMock.operatingCalendar.findMany.mockResolvedValue([]);
    prismaMock.regionalHub.findMany.mockResolvedValue(REGIONAL_HUBS);
    const r = await etaService.calculateETA({ originCode: 'BJR', destinationCode: 'ADD', serviceLevel: 'standard', dropoffTime: new Date(2026,8,23,9,0).toISOString() });
    console.log('RESULT est=', JSON.stringify(r.estimatedDelivery), 'flights=', r.flights.length, 'schedCalls=', n, 'hubCalls=', prismaMock.regionalHub.findMany.mock.calls.length);
  });
});
