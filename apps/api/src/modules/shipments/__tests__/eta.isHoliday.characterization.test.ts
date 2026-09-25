// Characterization tests for isHoliday — pins CURRENT OperatingCalendar matching
// semantics so the holiday-precedence change can be landed deliberately.
// KNOWN BEHAVIOR markers indicate quirks that are asserted, not endorsed.
import { describe, it, expect, vi, beforeEach } from 'vitest';

const prismaMock = vi.hoisted(() => ({
  operatingCalendar: { findMany: vi.fn() },
  airport: { findMany: vi.fn() },
  flightSchedule: { findMany: vi.fn() },
  serviceLevelSettings: { findMany: vi.fn() },
  regionalHub: { findMany: vi.fn() },
}));

vi.mock('../../../utils/prisma', () => ({ default: prismaMock }));

import { isHoliday } from '../eta.service';
import { calendarRow } from './etaFixtures';

beforeEach(() => {
  prismaMock.operatingCalendar.findMany.mockReset();
});

describe('isHoliday (characterization)', () => {
  it('returns false when no calendar rows exist', async () => {
    prismaMock.operatingCalendar.findMany.mockResolvedValue([]);
    await expect(isHoliday(new Date(2026, 8, 25), 'Bahir Dar', 'BJR', 'ET')).resolves.toBe(false);
  });

  it('matches an airport-specific closure by code (case-insensitive)', async () => {
    prismaMock.operatingCalendar.findMany.mockResolvedValue([
      calendarRow(new Date(2026, 8, 25, 12), { airportCode: 'bjr' }),
    ]);
    await expect(isHoliday(new Date(2026, 8, 25, 12), 'Bahir Dar', 'BJR', 'ET')).resolves.toBe(true);
  });

  it('airport-scoped row does NOT close a different airport... ', async () => {
    prismaMock.operatingCalendar.findMany.mockResolvedValue([
      calendarRow(new Date(2026, 8, 25, 12), { airportCode: 'DIR' }),
    ]);
    await expect(isHoliday(new Date(2026, 8, 25, 12), 'Bahir Dar', 'BJR', 'ET')).resolves.toBe(false);
  });

  it('KNOWN BUG: when caller passes an airportCode, a country-wide row (no airportCode) is IGNORED', async () => {
    // A national holiday with airportCode=null should arguably close every
    // airport in the country, but current logic only matches it when the
    // CALLER omits airportCode. Pinned here as current behavior.
    prismaMock.operatingCalendar.findMany.mockResolvedValue([
      calendarRow(new Date(2026, 8, 27, 12), { airportCode: undefined, city: undefined }), // nationwide
    ]);
    await expect(isHoliday(new Date(2026, 8, 27, 12), 'Bahir Dar', 'BJR', 'ET')).resolves.toBe(false);
  });

  it('country-wide row applies when caller has no airportCode and city matches or row city is null', async () => {
    prismaMock.operatingCalendar.findMany.mockResolvedValue([
      calendarRow(new Date(2026, 8, 27, 12), {}), // nationwide, no city
    ]);
    await expect(isHoliday(new Date(2026, 8, 27, 12), 'Bahir Dar', undefined, 'ET')).resolves.toBe(true);
  });

  it('closedAllDay=false rows never count as holidays', async () => {
    prismaMock.operatingCalendar.findMany.mockResolvedValue([
      calendarRow(new Date(2026, 8, 25, 12), { airportCode: 'BJR', closedAllDay: false }),
    ]);
    await expect(isHoliday(new Date(2026, 8, 25, 12), 'Bahir Dar', 'BJR', 'ET')).resolves.toBe(false);
  });

  it('defaults the country filter to ET when countryCode is omitted', async () => {
    prismaMock.operatingCalendar.findMany.mockResolvedValue([]);
    await isHoliday(new Date(2026, 8, 25), 'Bahir Dar', 'BJR');
    expect(prismaMock.operatingCalendar.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ country: 'ET' }) }),
    );
  });

  it('queries a full server-local day window (00:00–23:59:59.999)', async () => {
    prismaMock.operatingCalendar.findMany.mockResolvedValue([]);
    const d = new Date(2026, 8, 25, 14, 30);
    await isHoliday(d, 'Bahir Dar', 'BJR', 'ET');
    const arg = prismaMock.operatingCalendar.findMany.mock.calls[0][0];
    expect(arg.where.date.gte.getHours()).toBe(0);
    expect(arg.where.date.gte.getMinutes()).toBe(0);
    expect(arg.where.date.lte.getHours()).toBe(23);
    expect(arg.where.date.lte.getMinutes()).toBe(59);
  });

  it('KNOWN BEHAVIOR: swallows DB errors and reports "not a holiday" (fail-open)', async () => {
    prismaMock.operatingCalendar.findMany.mockRejectedValue(new Error('db down'));
    await expect(isHoliday(new Date(2026, 8, 25), 'Bahir Dar', 'BJR', 'ET')).resolves.toBe(false);
  });
});
