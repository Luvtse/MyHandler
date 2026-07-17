import { i18n } from '@/lib/i18n'
import { SHIPMENT_STATUSES } from '@/types/shipmentStatus';

const CANONICAL_STATUS_IDS = new Set<string>(SHIPMENT_STATUSES.map(s => s.id));

/**
 * Validate an incoming status ID strictly against canonical IDs.
 * Returns 'unknown' for any non-canonical value.
 */
export function normalizeStatusId(value: string): string {
  const v = String(value || '').trim().toLowerCase();
  return CANONICAL_STATUS_IDS.has(v) ? v : 'unknown';
}

/**
 * Convert Prisma enum snake_case (e.g., 'ORDER_RECEIVED') to canonical kebab-case ('order-received').
 */
export function prismaSnakeToCanonical(value: string): string {
  return String(value || '').trim().toLowerCase().replace(/_/g, '-');
}

/**
 * Convert canonical kebab-case (e.g., 'out-for-delivery') to Prisma enum snake_case ('OUT_FOR_DELIVERY').
 */
export function canonicalToPrismaSnake(canonical: string): string {
  const v = String(canonical || '').trim();
  // Enforce kebab-case to snake_case and uppercase, no legacy mappings
  return v.toUpperCase().replace(/-/g, '_');
}

// Locale-aware date formatting with app language/timezone
export function formatDate(
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  }
): string {
  const d = new Date(date);
  try {
    const lang = i18n.getCurrentLanguage();
    return new Intl.DateTimeFormat(lang, options).format(d);
  } catch {
    return new Intl.DateTimeFormat('en', options).format(d);
  }
}

// Shared ETA estimation used by UI as an immediate fallback before server result
export function estimateEta(
  shipDateStr: string,
  service: string,
  statusId: string,
  format: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }
): string {
  const normalizeDate = (v: any) => {
    const d = new Date(v || Date.now());
    return isNaN(d.getTime()) ? new Date() : d;
  };
  const dow = (d: Date) => d.getDay();
  const isWeekend = (d: Date) => dow(d) === 0 || dow(d) === 6;
  const nextBusinessDay = (d: Date) => {
    const x = new Date(d);
    while (isWeekend(x)) {
      x.setDate(x.getDate() + 1);
    }
    return x;
  };
  const addBusinessDays = (d: Date, days: number) => {
    const x = new Date(d);
    let remaining = Math.max(0, Math.floor(days));
    while (remaining > 0) {
      x.setDate(x.getDate() + 1);
      if (!isWeekend(x)) remaining--;
    }
    return x;
  };
  const status = normalizeStatusId(String(statusId || ''));
  const lowerService = String(service || '').toLowerCase();
  const domestic = /domestic/.test(lowerService) && !/worldwide|international/.test(lowerService);
  const international = /worldwide|international/.test(lowerService) || /customs|destination-hub|international/.test(status);
  const baseDays = (() => {
    if (/express/.test(lowerService)) return international ? 4 : 2;
    if (/priority/.test(lowerService)) return international ? 5 : 3;
    if (/standard/.test(lowerService)) return international ? 6 : 4;
    if (/economy/.test(lowerService)) return international ? 8 : 5;
    return international ? 6 : 4;
  })();
  const overrides: Record<string, number> = {
    'order-received': baseDays + 2,
    'shipment-scheduled': baseDays + 2,
    'awaiting-pickup': baseDays + 1,
    'picked-up': baseDays,
    'in-transit-to-sorting': Math.max(1, baseDays - 1),
    'received-at-hub': Math.max(1, baseDays - 1),
    'scanned-inbound': Math.max(1, baseDays - 1),
    'sorting-in-progress': Math.max(1, baseDays - 1),
    'departing-to-next-hub': Math.max(1, baseDays - 1),
    'in-transit-to-destination': Math.max(1, baseDays - 1),
    'arrived-at-destination-hub': domestic ? 1 : 2,
    'customs-clearance-initiated': 2,
    'customs-cleared': 1,
    'dispatched-for-delivery': 1,
    'in-local-delivery-facility': 1,
    'out-for-delivery': 0,
    'delivery-attempted': 1,
    'delivery-rescheduled': 2,
    'delivered-successfully': 0,
    'signature-obtained': 0,
    'returned-to-sender': baseDays + 5,
    'lost-exception': baseDays + 5,
    'damaged-upon-arrival': baseDays + 5,
    'cancelled': baseDays + 5,
  };
  const start = nextBusinessDay(normalizeDate(shipDateStr));
  const days = overrides[status] ?? baseDays;
  const eta = addBusinessDays(start, days);
  return formatDate(eta, format);
}

const COUNTRY_CODE_MAP: Record<string, string> = {
  ET: 'Ethiopia',
  US: 'United States',
  CA: 'Canada',
  GB: 'United Kingdom',
  KE: 'Kenya',
  AE: 'United Arab Emirates',
  ZA: 'South Africa',
  FR: 'France',
  DE: 'Germany',
  CN: 'China',
  JP: 'Japan',
  IN: 'India',
  BR: 'Brazil',
  RU: 'Russia',
  AU: 'Australia',
  IT: 'Italy',
  ES: 'Spain',
};

/**
 * Title-case utility for display labels.
 */
function titleCase(s: string): string {
  return s
    .toLowerCase()
    .split(/\s+/)
    .map(w => w ? w[0].toUpperCase() + w.slice(1) : w)
    .join(' ')
    .trim();
}

/**
 * Parse a combined "City • CountryOrCode" string into structured values.
 */
export function parseCityCountry(location: string): { city: string; country: string } {
  const raw = String(location || '').trim();
  if (!raw) return { city: '', country: '' };
  const parts = raw.split(/[-,•]/).map(p => p.trim()).filter(Boolean);
  if (parts.length === 0) return { city: '', country: '' };
  const cityRaw = parts[0];
  const countryRaw = parts[parts.length - 1];
  const city = titleCase(cityRaw);
  const cc = countryRaw.toUpperCase();
  const country =
    COUNTRY_CODE_MAP[cc] ||
    titleCase(countryRaw);
  return { city, country };
}
