import { describe, it, vi, beforeEach } from 'vitest';
const prismaMock = vi.hoisted(() => ({
  airport: { findMany: vi.fn() },
  flightSchedule: { findMany: vi.fn() },
  serviceLevelSettings: { findMany: vi.fn() },
  operatingCalendar: { findMany: vi.fn() },
  regionalHub: { findMany: vi.fn() },
}) as any);
vi.mock('../../../utils/prisma', () => ({ default: prismaMock }));
import { etaService } from '../eta.service';
import { AIRPORTS, SCHEDULES, SL_SETTINGS, REGIONAL_HUBS } from './etaFixtures';
beforeEach(() => {
  prismaMock.airport.findMany.mockResolvedValue(AIRPORTS);
  prismaMock.flightSchedule.findMany.mockResolvedValue(SCHEDULES);
  prismaMock.serviceLevelSettings.findMany.mockResolvedValue(SL_SETTINGS);
  prismaMock.operatingCalendar.findMany.mockResolvedValue([]);
  prismaMock.regionalHub.findMany.mockResolvedValue(REGIONAL_HUBS);
});
describe('debug', () => {
  it('BJR->ADD', async () => {
    const r = await etaService.calculateETA({
      originCode: 'BJR', destinationCode: 'ADD',
      serviceLevel: 'standard', dropoffTime: new Date(2026, 8, 23, 9, 0).toISOString(),
    });
    console.log('RESULT', JSON.stringify(r, null, 1));
    console.log('calls airport', prismaMock.airport.findMany.mock.calls.length, JSON.stringify(prismaMock.airport.findMany.mock.calls[0]));
    console.log('calls sched', prismaMock.flightSchedule.findMany.mock.calls.length, JSON.stringify(prismaMock.flightSchedule.findMany.mock.calls[0]));
    console.log('calls hub', prismaMock.regionalHub.findMany.mock.calls.length, JSON.stringify(prismaMock.regionalHub.findMany.mock.calls[0]));
    console.log('calls sls', prismaMock.serviceLevelSettings.findMany.mock.calls.length);
  });
});
