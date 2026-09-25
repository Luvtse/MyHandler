import { describe, it, vi, beforeEach } from 'vitest';
const prismaMock = vi.hoisted(() => ({
  airport: { findMany: vi.fn() }, flightSchedule: { findMany: vi.fn() },
  serviceLevelSettings: { findMany: vi.fn() }, operatingCalendar: { findMany: vi.fn() },
  regionalHub: { findMany: vi.fn() },
}) as any);
vi.mock('../../../utils/prisma', () => ({ default: prismaMock }));
import { etaService } from '../eta.service';
import { AIRPORTS, SCHEDULES, SL_SETTINGS, REGIONAL_HUBS, calendarRow } from './etaFixtures';
beforeEach(() => {
  prismaMock.airport.findMany.mockResolvedValue(AIRPORTS);
  prismaMock.flightSchedule.findMany.mockResolvedValue(SCHEDULES);
  prismaMock.serviceLevelSettings.findMany.mockResolvedValue(SL_SETTINGS);
  prismaMock.operatingCalendar.findMany.mockResolvedValue([]);
  prismaMock.regionalHub.findMany.mockResolvedValue(REGIONAL_HUBS);
});
const fmt = (d: any) => d ? new Date(d).toISOString() : String(d);
describe('probe', () => {
  it('records', async () => {
    const r1 = await etaService.calculateETA({ originCode: 'BJR', destinationCode: 'ADD', serviceLevel: 'standard', dropoffTime: new Date(2026,8,23,9,0).toISOString() });
    console.log('T1 BJR->ADD std:', JSON.stringify({ est: r1.estimatedDelivery, th: r1.totalHours, td: r1.totalDays, nf: r1.flights.length, steps: (r1.steps as any[]).map(s=>s.name+'='+fmt(s.time)) }));
    const r2 = await etaService.calculateETA({ originCode: 'ADD', destinationCode: 'BJR', serviceLevel: 'express-domestic', dropoffTime: new Date(2026,8,23,9,0).toISOString() });
    console.log('T2 ADD->BJR exp:', JSON.stringify({ est: r2.estimatedDelivery, th: r2.totalHours, td: r2.totalDays }));
    const r3 = await etaService.calculateETA({ originCode: 'BJR', destinationCode: 'ADD', serviceLevel: 'standard', dropoffTime: new Date(2026,8,20,12,0).toISOString() });
    console.log('T3 Sunday:', JSON.stringify({ est: r3.estimatedDelivery, td: r3.totalDays }));
    const r4 = await etaService.calculateETA({ originCode: 'ADD', destinationCode: 'JNB', serviceLevel: 'standard', dropoffTime: new Date(2026,8,23,9,0).toISOString() });
    console.log('T4 JNB:', JSON.stringify({ est: r4.estimatedDelivery, flights: (r4.flights as any[]).map(f=>({o:f.origin,d:f.destination,dep:fmt(f.departure),arr:fmt(f.arrival)})) }));
    const r5 = await etaService.calculateETA({ originCode: 'BJR', destinationCode: 'ADD', serviceLevel: 'standard', dropoffTime: new Date(2026,8,23,9,0).toISOString(), currentStatus: 'RECEIVED_AT_HUB' });
    console.log('T5 hub-status:', JSON.stringify({ est: r5.estimatedDelivery }));
    // holiday Thu on ADD
    const thu = new Date(2026,8,24,12);
    prismaMock.operatingCalendar.findMany.mockImplementation(async ({ where }: any) => (where?.date && thu >= where.date.gte && thu <= where.date.lte) ? [calendarRow(thu, { airportCode: 'ADD' })] : []);
    const r6 = await etaService.calculateETA({ originCode: 'BJR', destinationCode: 'ADD', serviceLevel: 'standard', dropoffTime: new Date(2026,8,23,9,0).toISOString() });
    console.log('T6 holThu:', JSON.stringify({ est: r6.estimatedDelivery, calCalls: prismaMock.operatingCalendar.findMany.mock.calls.length }));
    // Friday closure instead
    prismaMock.operatingCalendar.findMany.mockReset();
    const fri = new Date(2026,8,25,12);
    prismaMock.operatingCalendar.findMany.mockImplementation(async ({ where }: any) => (where?.date && fri >= where.date.gte && fri <= where.date.lte) ? [calendarRow(fri, { airportCode: 'ADD' })] : []);
    const r7 = await etaService.calculateETA({ originCode: 'BJR', destinationCode: 'ADD', serviceLevel: 'standard', dropoffTime: new Date(2026,8,23,9,0).toISOString() });
    console.log('T7 holFri:', JSON.stringify({ est: r7.estimatedDelivery }));
    // calendar call count with empty calendar
    prismaMock.operatingCalendar.findMany.mockReset();
    prismaMock.operatingCalendar.findMany.mockResolvedValue([]);
    await etaService.calculateETA({ originCode: 'BJR', destinationCode: 'ADD', serviceLevel: 'standard', dropoffTime: new Date(2026,8,23,9,0).toISOString() });
    console.log('T8 calCalls baseline:', prismaMock.operatingCalendar.findMany.mock.calls.length);
    const a1 = await etaService.availability({ originCode: 'BJR', destinationCode: 'DIR', date: new Date(2026,8,23,9,0).toISOString() });
    console.log('T9 avail BJR-DIR:', JSON.stringify({ available: a1.available, first: a1.flights[0] && { o: a1.flights[0].origin, d: a1.flights[0].destination, dep: fmt(a1.flights[0].departure) }, n: a1.flights.length }));
  });
});
