import { describe, it, vi } from 'vitest';
const prismaMock = vi.hoisted(() => ({
  airport: { findMany: vi.fn() }, flightSchedule: { findMany: vi.fn() },
  serviceLevelSettings: { findMany: vi.fn() }, operatingCalendar: { findMany: vi.fn() },
  regionalHub: { findMany: vi.fn() },
}) as any);
vi.mock('../../../utils/prisma', () => ({ default: prismaMock }));
import { etaService } from '../eta.service';
import { AIRPORTS, SCHEDULES, SL_SETTINGS, REGIONAL_HUBS } from './etaFixtures';

describe('probe2', () => {
  it('flights leg by leg', async () => {
    // no hub rows -> destHub fallback ADD -> direct BJR->ADD
    prismaMock.airport.findMany.mockResolvedValue(AIRPORTS);
    prismaMock.flightSchedule.findMany.mockResolvedValue(SCHEDULES);
    prismaMock.serviceLevelSettings.findMany.mockResolvedValue(SL_SETTINGS);
    prismaMock.operatingCalendar.findMany.mockResolvedValue([]);
    prismaMock.regionalHub.findMany.mockResolvedValue([]);
    const r = await etaService.calculateETA({ originCode: 'BJR', destinationCode: 'ADD', serviceLevel: 'standard', dropoffTime: new Date(2026,8,23,9,0).toISOString() });
    console.log('NOHUB BJR->ADD:', JSON.stringify(r, (k,v)=> v instanceof Date ? v.toISOString() : v));

    // city-based lookup with hubs present
    prismaMock.regionalHub.findMany.mockResolvedValue(REGIONAL_HUBS);
    const r2 = await etaService.calculateETA({ originCity: 'Bahir Dar', destinationCity: 'Addis Ababa', serviceLevel: 'standard', dropoffTime: new Date(2026,8,23,9,0).toISOString() });
    console.log('CITY BJR->ADD:', JSON.stringify({ est: r2.estimatedDelivery, th: r2.totalHours, td: r2.totalDays, nf: r2.flights.length }));

    // code path WITH hubs for comparison - dump raw error by instrumenting: rerun and print flights/steps
    const r3 = await etaService.calculateETA({ originCode: 'BJR', destinationCode: 'ADD', serviceLevel: 'standard', dropoffTime: new Date(2026,8,23,9,0).toISOString() });
    console.log('CODE+HUBS:', JSON.stringify({ est: r3.estimatedDelivery, steps: (r3.steps as any[]).length, flights: (r3.flights as any[]).length }));
  });
});
