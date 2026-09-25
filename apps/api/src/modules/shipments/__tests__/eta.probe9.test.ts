import { describe, it } from 'vitest';
describe('probe9', () => {
  it('direct findScheduleByCodes semantics', () => {
    const SCHEDULES = [
      { originCode: 'ADD', destinationCode: 'BJR', daysOfWeek: [1,2,3,4,5,6], lastDepartureLocal: '14:30', flightMinutes: 65 },
      { originCode: 'BJR', destinationCode: 'ADD', daysOfWeek: [1,2,3,4,5,6], lastDepartureLocal: '12:00', flightMinutes: 65 },
    ];
    const sch = SCHEDULES.find(s => (s.originCode || '').toLowerCase() === ('ADD').toLowerCase() && (s.destinationCode || '').toLowerCase() === ('ADD').toLowerCase());
    console.log('MARKER result =', sch);
    console.log('MARKER typeof', typeof sch, 'bool', !!sch);
  });
});
