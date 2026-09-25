import { describe, it } from 'vitest';

describe('probe8', () => {
  it('replicate leg2 lookup', () => {
    const SCHEDULES = [
      { originCode: 'ADD', destinationCode: 'BJR', daysOfWeek: [1,2,3,4,5,6], lastDepartureLocal: '14:30', flightMinutes: 65 },
      { originCode: 'BJR', destinationCode: 'ADD', daysOfWeek: [1,2,3,4,5,6], lastDepartureLocal: '12:00', flightMinutes: 65 },
    ];
    const find = (o: string, d: string) => SCHEDULES.find(s => s.originCode.toLowerCase() === o.toLowerCase() && s.destinationCode.toLowerCase() === d.toLowerCase());
    console.log('find(ADD,ADD) =', find('ADD','ADD'));
    console.log('find(BJR,ADD) =', !!find('BJR','ADD'));
    // dayOfWeek of Wed Sep 23 2026 UTC
    const ready = new Date(Date.UTC(2026, 8, 23, 14, 5));
    const dow = ready.getUTCDay() === 0 ? 7 : ready.getUTCDay();
    console.log('dow =', dow, 'includes:', find('ADD','ADD')?.daysOfWeek?.includes(dow));
  });
});
