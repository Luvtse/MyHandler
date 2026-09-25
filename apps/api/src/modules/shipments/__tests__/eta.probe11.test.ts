import { describe, it } from 'vitest';
describe('probe11', () => {
  it('replicate nextFlightTimeByCodes for ADD->ADD', () => {
    const list = [
      { originCode: 'ADD', destinationCode: 'BJR', daysOfWeek: [1,2,3,4,5,6], lastDepartureLocal: '14:30' },
      { originCode: 'BJR', destinationCode: 'ADD', daysOfWeek: [1,2,3,4,5,6], lastDepartureLocal: '12:00' },
    ];
    const sch = list.find(s => (s.originCode || '').toLowerCase() === 'add' && (s.destinationCode || '').toLowerCase() === 'add');
    console.log('YPROBE sch =', sch);
    if (!sch) { console.log('YPROBE -> null path'); return; }
    const ready = new Date(Date.UTC(2026, 8, 23, 14, 5));
    const d = new Date(ready); d.setUTCHours(d.getUTCHours()+0);
    // simulate exactly like the service under TZ=UTC
    const dep = { h: 14, m: 30 };
    const candidate = new Date(ready); candidate.setHours(dep.h, dep.m, 0, 0);
    console.log('YPROBE candidate', candidate.toISOString(), 'ready.getHours()', ready.getHours(), 'dep.h', dep.h);
    for (let i = 1; i <= 7; i++) {
      const dd = new Date(ready); dd.setDate(dd.getDate() + i);
      console.log('YPROBE loop i=', i, 'day', dd.getDay(), 'hours', dd.getHours());
    }
  });
});
