import { describe, it, vi } from 'vitest';
const prismaMock = vi.hoisted(() => ({
  airport: { findMany: vi.fn() }, flightSchedule: { findMany: vi.fn() },
  serviceLevelSettings: { findMany: vi.fn() }, operatingCalendar: { findMany: vi.fn() },
  regionalHub: { findMany: vi.fn() },
}) as any);
vi.mock('../../../utils/prisma', () => ({ default: prismaMock }));
import { etaService } from '../eta.service';
import { AIRPORTS, SCHEDULES, SL_SETTINGS, REGIONAL_HUBS } from './etaFixtures';

describe('probe10', () => {
  it('log leg2 lookup inputs', async () => {
    prismaMock.airport.findMany.mockResolvedValue(AIRPORTS);
    prismaMock.flightSchedule.findMany.mockResolvedValue(SCHEDULES);
    prismaMock.serviceLevelSettings.findMany.mockResolvedValue(SL_SETTINGS);
    prismaMock.operatingCalendar.findMany.mockResolvedValue([]);
    prismaMock.regionalHub.findMany.mockResolvedValue(REGIONAL_HUBS);
    const r = await etaService.calculateETA({ originCode: 'BJR', destinationCode: 'ADD', serviceLevel: 'standard', dropoffTime: new Date(2026,8,23,9,0).toISOString() });
    console.log('XRESULT est=', JSON.stringify(r.estimatedDelivery), 'flights=', JSON.stringify(r.flights.map(f=>[f.origin,f.destination])));
  }, 15000);
});
