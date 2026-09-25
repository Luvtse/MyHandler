// Shared fixtures for ETA characterization tests.
// These mirror the shapes returned by the private data loaders in eta.service.ts
// (getAirports / getSchedules / getServiceLevelSettings) and prisma.regionalHub.

export const AIRPORTS = [
  {
    code: 'ADD', city: 'Addis Ababa', name: 'Bole Intl', type: 'hub',
    processingHours: 4, businessStart: 8, businessEnd: 18, tzOffset: 3,
    countryCode: 'ET', country: 'Ethiopia', timezone: 'Africa/Addis_Ababa',
    operationalBufferHours: 0, loadFactor: 0, capacityStatus: 'NORMAL',
  },
  {
    code: 'BJR', city: 'Bahir Dar', name: 'Ginhi Airport', type: 'domestic',
    processingHours: 2, businessStart: 8, businessEnd: 17, tzOffset: 3,
    countryCode: 'ET', country: 'Ethiopia', timezone: 'Africa/Addis_Ababa',
    operationalBufferHours: 0, loadFactor: 0, capacityStatus: 'NORMAL',
  },
  {
    code: 'DIR', city: 'Dire Dawa', name: 'Dire Dawa Intl', type: 'regional',
    processingHours: 3, businessStart: 8, businessEnd: 17, tzOffset: 3,
    countryCode: 'ET', country: 'Ethiopia', timezone: 'Africa/Addis_Ababa',
    operationalBufferHours: 0, loadFactor: 0, capacityStatus: 'NORMAL',
  },
  {
    code: 'JNB', city: 'Johannesburg', name: 'O.R. Tambo', type: 'hub',
    processingHours: 5, businessStart: 8, businessEnd: 18, tzOffset: 2,
    countryCode: 'ZA', country: 'South Africa', timezone: 'Africa/Johannesburg',
    operationalBufferHours: 0, loadFactor: 0, capacityStatus: 'NORMAL',
  },
];

// daysOfWeek uses ISO numbering (Mon=1..Sun=7) as consumed by dayOfWeek().
export const SCHEDULES = [
  // ADD <-> BJR (daily except Sunday), 65 min legs
  { originCode: 'ADD', destinationCode: 'BJR', originCity: 'Addis Ababa', destinationCity: 'Bahir Dar', daysOfWeek: [1, 2, 3, 4, 5, 6], dailyFrequency: 2, lastDepartureLocal: '14:30', flightMinutes: 65 },
  { originCode: 'BJR', destinationCode: 'ADD', originCity: 'Bahir Dar', destinationCity: 'Addis Ababa', daysOfWeek: [1, 2, 3, 4, 5, 6], dailyFrequency: 2, lastDepartureLocal: '12:00', flightMinutes: 65 },
  // ADD <-> DIR (Mon-Fri), 90 min legs
  { originCode: 'ADD', destinationCode: 'DIR', originCity: 'Addis Ababa', destinationCity: 'Dire Dawa', daysOfWeek: [1, 2, 3, 4, 5], dailyFrequency: 1, lastDepartureLocal: '10:00', flightMinutes: 90 },
  { originCode: 'DIR', destinationCode: 'ADD', originCity: 'Dire Dawa', destinationCity: 'Addis Ababa', daysOfWeek: [1, 2, 3, 4, 5], dailyFrequency: 1, lastDepartureLocal: '08:30', flightMinutes: 90 },
  // ADD <-> JNB (Tue/Fri), 150 min legs
  { originCode: 'ADD', destinationCode: 'JNB', originCity: 'Addis Ababa', destinationCity: 'Johannesburg', daysOfWeek: [2, 5], dailyFrequency: 1, lastDepartureLocal: '23:55', flightMinutes: 150 },
  { originCode: 'JNB', destinationCode: 'ADD', originCity: 'Johannesburg', destinationCity: 'Addis Ababa', daysOfWeek: [2, 5], dailyFrequency: 1, lastDepartureLocal: '19:00', flightMinutes: 150 },
];

// Service-level settings keyed by airport type -> service level.
export const SL_SETTINGS = [
  { airportType: 'hub', serviceLevel: 'express-domestic', cutoffHour: 16, processingAdjustmentHours: 0 },
  { airportType: 'hub', serviceLevel: 'standard', cutoffHour: 14, processingAdjustmentHours: 1 },
  { airportType: 'domestic', serviceLevel: 'express-domestic', cutoffHour: 14, processingAdjustmentHours: 0 },
  { airportType: 'regional', serviceLevel: 'standard', cutoffHour: 13, processingAdjustmentHours: 2 },
];

export const REGIONAL_HUBS = [
  { country: 'ET', hubCode: 'ADD', priority: 1 },
  { country: 'ZA', hubCode: 'JNB', priority: 1 },
];

// OperatingCalendar rows shaped like prisma results.
export function calendarRow(date: Date, opts: { airportCode?: string; city?: string; country?: string; closedAllDay?: boolean } = {}) {
  return {
    date,
    country: opts.country || 'ET',
    airportCode: opts.airportCode ?? null,
    city: opts.city ?? null,
    closedAllDay: opts.closedAllDay ?? true,
  };
}

export function makePrismaMock(overrides: Record<string, any> = {}) {
  return {
    airport: { findMany: async () => AIRPORTS },
    flightSchedule: { findMany: async () => SCHEDULES },
    serviceLevelSettings: { findMany: async () => SL_SETTINGS },
    operatingCalendar: { findMany: async () => [] as any[] },
    regionalHub: { findMany: async () => REGIONAL_HUBS },
    ...overrides,
  };
}
