// Golden-file characterization tests for etaService.calculateETA.
// These pin the CURRENT output (including known timezone drift and silent-failure
// semantics) so the Luxon rewrite and fail-loud refactor can be verified as
// behavior-preserving-except-where-intended. Update goldens only via a PR whose
// title explicitly says which bug it fixes.
import { describe, it, expect, vi, beforeEach } from 'vitest';

const prismaMock = vi.hoisted(() => ({
  airport: { findMany: vi.fn() },
  flightSchedule: { findMany: vi.fn() },
  serviceLevelSettings: { findMany: vi.fn() },
  operatingCalendar: { findMany: vi.fn() },
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

const EMPTY_ETA = { estimatedDelivery: '', steps: [], totalHours: 0, totalDays: 0, flights: [] };

describe('calculateETA — golden outputs (server TZ pinned by vitest.config.ts)', () => {
  it('GOLDEN: BJR -> ADD direct, standard, Wed 2026-09-23 09:00 local', async () => {
    const r = await etaService.calculateETA({
      originCode: 'BJR', destinationCode: 'ADD',
      serviceLevel: 'standard', dropoffTime: new Date(2026, 8, 23, 9, 0).toISOString(),
    });
    // Wed 09:00 within business -> ready 11:00 -> next BJR->ADD dep is Thu 12:00
    // -> arr 13:05 -> layover 1h -> ADD hub proc 4h -> delivery 6h -> 23:05 Thu.
    expect(new Date(r.estimatedDelivery).getTime()).toBe(new Date(2026, 8, 24, 23, 5).getTime());
    expect(r.totalHours).toBe(38);
    expect(r.totalDays).toBe(2);
    expect(r.flights.length).toBe(1);
    expect(r.steps.map((s: any) => s.name)).toEqual([
      'Origin dropoff', 'Origin processing start', 'Origin ready',
      'Flight 1 depart BJR', 'Flight 1 arrive ADD',
      'Destination processing start', 'Local delivery complete',
    ]);
  });

  it('GOLDEN: ADD -> BJR express-domestic, Wed 2026-09-23 09:00 local', async () => {
    const r = await etaService.calculateETA({
      originCode: 'ADD', destinationCode: 'BJR',
      serviceLevel: 'express-domestic', dropoffTime: new Date(2026, 8, 23, 9, 0).toISOString(),
    });
    // Ready 13:00 -> same-day 14:30 dep -> arr 15:35 -> dest proc 2h + delivery 8h
    // -> 01:35 Thu (no weekend/holiday shift).
    expect(new Date(r.estimatedDelivery).getTime()).toBe(new Date(2026, 8, 24, 1, 35).getTime());
    expect(r.totalHours).toBe(16);
    expect(r.totalDays).toBe(1);
  });

  it('GOLDEN: Sunday dropoff rolls processing to Monday', async () => {
    const r = await etaService.calculateETA({
      originCode: 'BJR', destinationCode: 'ADD',
      serviceLevel: 'standard', dropoffTime: new Date(2026, 8, 20, 12, 0).toISOString(), // Sun
    });
    // Sun 12:00 -> nextWeekday Mon 08:00 -> ready 10:00 -> Mon 12:00 dep ->
    // arr 13:05 -> +1h -> proc 4h -> deliv 6h -> Mon 20:05.
    expect(new Date(r.estimatedDelivery).getTime()).toBe(new Date(2026, 8, 21, 20, 5).getTime());
    expect(r.totalDays).toBe(2);
  });

  it('GOLDEN: unknown airport returns the EMPTY payload with HTTP-level success shape (silent failure)', async () => {
    const r = await etaService.calculateETA({
      originCode: 'ZZZ', destinationCode: 'ADD',
      serviceLevel: 'standard', dropoffTime: new Date(2026, 8, 23, 9, 0).toISOString(),
    });
    expect(r).toEqual(EMPTY_ETA);
  });

  it('GOLDEN: no schedule between airports also returns EMPTY (indistinguishable from unknown airport)', async () => {
    prismaMock.flightSchedule.findMany.mockResolvedValue([]);
    const r = await etaService.calculateETA({
      originCode: 'BJR', destinationCode: 'ADD',
      serviceLevel: 'standard', dropoffTime: new Date(2026, 8, 23, 9, 0).toISOString(),
    });
    expect(r).toEqual(EMPTY_ETA);
  });

  it('KNOWN BUG (timezone): JNB leg adds flight minutes in server-local math but re-interprets them in Africa/Johannesburg — arrival lands 2h EARLIER than wall-clock-correct', async () => {
    const r = await etaService.calculateETA({
      originCode: 'ADD', destinationCode: 'JNB',
      serviceLevel: 'standard', dropoffTime: new Date(2026, 8, 23, 9, 0).toISOString(), // Wed
    });
    // Tue/Fri-only ADD->JNB dep 23:55. From Fri Sep 25 ready ~17:00 -> dep Fri 23:55.
    // Correct UTC instant of arrival: 23:55 SAST + 150m = Sat 02:25 SAST (= 00:25 UTC).
    // Current pipeline produces a JS Date of Sat 00:25 SERVER time instead.
    const arr = r.flights[0].arrival as Date;
    expect(arr.getDay()).toBe(6); // Saturday
    expect(arr.getHours()).toBe(0);
    expect(arr.getMinutes()).toBe(25);
    // The bug: treating that Date as JNB-local shifts everything downstream by the
    // zone offset. Pinned so the Luxon rewrite must consciously change this golden.
    expect(new Date(r.estimatedDelivery).getTime())
      .toBe(new Date(2026, 8, 26, 15, 25).getTime()); // Sun 15:25 server-local
  });

  it('GOLDEN: currentStatus RECEIVED_AT_HUB skips origin processing entirely', async () => {
    const r = await etaService.calculateETA({
      originCode: 'BJR', destinationCode: 'ADD',
      serviceLevel: 'standard',
      dropoffTime: new Date(2026, 8, 23, 9, 0).toISOString(),
      currentStatus: 'RECEIVED_AT_HUB',
    });
    // originReady == procStart (Wed 09:00) -> Thu 12:00 dep -> Thu 23:05 delivery
    // (same as the plain-direct golden because the cutoff already pushed past
    // the same-day flight — pins that status does NOT regress the ETA here).
    expect(new Date(r.estimatedDelivery).getTime()).toBe(new Date(2026, 8, 24, 23, 5).getTime());
  });

  it('HOLIDAY PRECEDENCE (current design): calendar is consulted ONCE, only on the final delivery timestamp', async () => {
    // Direct BJR->ADD lands delivery Thu 23:05. Mark Thursday closed for BJR...
    // (dest is ADD here, so use ADD) ...and verify the single-shot shift.
    const thu = new Date(2026, 8, 24, 12);
    prismaMock.operatingCalendar.findMany.mockImplementation(async ({ where }: any) => {
      return where?.date && thu >= where.date.gte && thu <= where.date.lte
        ? [calendarRow(thu, { airportCode: 'ADD' })]
        : [];
    });
    const r = await etaService.calculateETA({
      originCode: 'BJR', destinationCode: 'ADD',
      serviceLevel: 'standard', dropoffTime: new Date(2026, 8, 23, 9, 0).toISOString(),
    });
    // delivered Thu 23:05 is a holiday -> shift +24h then nextWeekday+businessStart
    // -> Fri Sep 25 08:00 (NOT Mon, NOT re-checked for another holiday).
    const d = new Date(r.estimatedDelivery);
    expect(d.getDay()).toBe(5); // Friday
    expect(d.getDate()).toBe(25);
    expect(d.getHours()).toBe(8);
    expect(d.getMinutes()).toBe(0);
  });

  it('HOLIDAY PRECEDENCE: the shift is NOT iterative — a second consecutive holiday day is ignored', async () => {
    const fri = new Date(2026, 8, 25, 12);
    prismaMock.operatingCalendar.findMany.mockImplementation(async ({ where }: any) => {
      return where?.date && fri >= where.date.gte && fri <= where.date.lte
        ? [calendarRow(fri, { airportCode: 'ADD' })]
        : [];
    });
    const r = await etaService.calculateETA({
      originCode: 'BJR', destinationCode: 'ADD',
      serviceLevel: 'standard', dropoffTime: new Date(2026, 8, 23, 9, 0).toISOString(),
    });
    // Baseline delivery Thu 23:05 -> shifted to Fri 08:00 even though Friday is
    // ALSO closed. Deliberate single-shot semantics; the precedence decision PR
    // must consciously flip this expectation.
    const d = new Date(r.estimatedDelivery);
    expect(d.getDate()).toBe(25);
    expect(d.getHours()).toBe(8);
  });

  it('HOLIDAY PRECEDENCE: flight legs and processing days are NEVER checked against the calendar', async () => {
    // Close ALL days; output must be identical to the no-holiday golden.
    prismaMock.operatingCalendar.findMany.mockImplementation(async () => {
      // Return closures covering every plausible date window.
      return [{ date: new Date(2026, 0, 1), country: 'ET', airportCode: null, city: null, closedAllDay: true }];
    });
    const withClosures = await etaService.calculateETA({
      originCode: 'BJR', destinationCode: 'ADD',
      serviceLevel: 'standard', dropoffTime: new Date(2026, 8, 23, 9, 0).toISOString(),
    });
    // Row date (Jan 1) doesn't fall in the queried windows, so still unchanged —
    // but crucially the ONLY calendar call happens once at the end:
    expect(prismaMock.operatingCalendar.findMany).toHaveBeenCalledTimes(1);
    expect(new Date(withClosures.estimatedDelivery).getTime()).toBe(new Date(2026, 8, 24, 23, 5).getTime());
  });

  it('GOLDEN: availability() falls back to hub routing when no direct schedule exists', async () => {
    const r = await etaService.availability({
      originCode: 'BJR', destinationCode: 'DIR', date: new Date(2026, 8, 23, 9, 0).toISOString(),
    });
    // No BJR->DIR direct; both hub via ADD -> two-leg listing, available if any
    // weekday within 7 days has both legs.
    expect(r.available).toBe(true);
    expect(r.flights.length).toBeGreaterThan(0);
    expect(r.flights[0].origin).toBe('BJR');
    expect(r.flights[0].destination).toBe('ADD');
  });

  it('GOLDEN: availability() unknown route returns { available:false, flights:[] } silently', async () => {
    const r = await etaService.availability({ originCode: 'XXX', destinationCode: 'ADD', date: new Date(2026, 8, 23).toISOString() });
    expect(r).toEqual({ available: false, flights: [] });
  });
});
