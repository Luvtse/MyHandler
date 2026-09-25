import { describe, it } from 'vitest';
import { DateTime } from 'luxon';

describe('probe7', () => {
  it('check TZ and luxon zone', () => {
    console.log('TZ env =', process.env.TZ);
    const d = new Date(2026, 8, 23, 9, 0);
    console.log('local date iso:', d.toISOString(), 'getHours:', d.getHours());
    console.log('luxon fromJSDate zone Africa/Addis_Ababa hour:', DateTime.fromJSDate(d, { zone: 'Africa/Addis_Ababa' }).hour);
  });
});
