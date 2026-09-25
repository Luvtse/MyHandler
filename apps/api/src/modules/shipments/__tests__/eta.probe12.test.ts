import { describe, it } from 'vitest';

function parseTime(hm: string) { const [h, m] = hm.split(':').map(Number); return { h, m }; }
function dayOfWeek(dt: Date) { const d = dt.getDay(); return d === 0 ? 7 : d; }
function findScheduleByCodes(list: any[], o: string, d: string) {
  return list.find(s => (s.originCode || '').toLowerCase() === o.toLowerCase() && (s.destinationCode || '').toLowerCase() === d.toLowerCase());
}
function nextFlightTimeByCodes(schedList: any[], fromCode: string, toCode: string, ready: Date) {
  const sch = findScheduleByCodes(schedList, fromCode, toCode);
  if (!sch) return null;
  const curDow = dayOfWeek(ready);
  const dep = parseTime(sch.lastDepartureLocal);
  const candidate = new Date(ready);
  candidate.setHours(dep.h, dep.m, 0, 0);
  if (sch.daysOfWeek.includes(curDow) && ready.getHours() <= dep.h) return candidate;
  for (let i = 1; i <= 7; i++) {
    const d = new Date(ready);
    d.setDate(d.getDate() + i);
    const dow = dayOfWeek(d);
    if (sch.daysOfWeek.includes(dow)) { d.setHours(dep.h, dep.m, 0, 0); return d; }
  }
  return null;
}

describe('probe12', () => {
  it('exact leg2 replication', () => {
    const SCHEDULES = [
      { originCode: 'ADD', destinationCode: 'BJR', originCity: 'Addis Ababa', destinationCity: 'Bahir Dar', daysOfWeek: [1,2,3,4,5,6], dailyFrequency: 2, lastDepartureLocal: '14:30', flightMinutes: 65 },
      { originCode: 'BJR', destinationCode: 'ADD', originCity: 'Bahir Dar', destinationCity: 'Addis Ababa', daysOfWeek: [1,2,3,4,5,6], dailyFrequency: 2, lastDepartureLocal: '12:00', flightMinutes: 65 },
    ];
    const leg2Ready = new Date(Date.UTC(2026, 8, 23, 14, 5));
    const r = nextFlightTimeByCodes(SCHEDULES as any, 'ADD', 'ADD', leg2Ready);
    console.log('ZPROBE ADD->ADD result:', r && r.toISOString());
    const r2 = nextFlightTimeByCodes(SCHEDULES as any, 'BJR', 'ADD', leg2Ready);
    console.log('ZPROBE BJR->ADD result:', r2 && r2.toISOString());
  });
});
