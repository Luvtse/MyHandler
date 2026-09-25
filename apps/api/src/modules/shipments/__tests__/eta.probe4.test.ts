import { describe, it, vi } from 'vitest';
const prismaMock = vi.hoisted(() => ({
  airport: { findMany: vi.fn() }, flightSchedule: { findMany: vi.fn() },
  serviceLevelSettings: { findMany: vi.fn() }, operatingCalendar: { findMany: vi.fn() },
  regionalHub: { findMany: vi.fn() },
}) as any);
vi.mock('../../../utils/prisma', () => ({ default: prismaMock }));
import { etaService } from '../eta.service';
import { AIRPORTS, SCHEDULES, SL_SETTINGS, REGIONAL_HUBS } from './etaFixtures';

describe('probe4', () => {
  it('instrumented v2', async () => {
    const schedCalls: string[] = [];
    prismaMock.airport.findMany.mockResolvedValue(AIRPORTS);
    prismaMock.flightSchedule.findMany.mockImplementation(async (args?: any) => {
      schedCalls.push(JSON.stringify(args ?? null).slice(0, 160));
      return SCHEDULES;
    });
    prismaMock.serviceLevelSettings.findMany.mockResolvedValue(SL_SETTINGS);
    prismaMock.operatingCalendar.findMany.mockResolvedValue([]);
    prismaMock.regionalHub.findMany.mockResolvedValue(REGIONAL_HUBS);
    let caught: any = null;
    try {
      const r = await etaService.calculateETA({ originCode: 'BJR', destinationCode: 'ADD', serviceLevel: 'standard', dropoffTime: new Date(2026,8,23,9,0).toISOString() });
      console.log('RESULT est=', JSON.stringify(r.estimatedDelivery), 'flights=', r.flights.length);
    } catch (e) { caught = e; console.log('calculateETA THREW:', e); }
    console.log('sched calls total:', schedCalls.length);
    console.log(schedCalls.slice(0, 5).join('\n'));
  });
});
