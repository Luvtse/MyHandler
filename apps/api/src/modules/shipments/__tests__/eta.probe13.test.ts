import { describe, it } from 'vitest';
import { SCHEDULES } from './etaFixtures';
describe('probe13', () => {
  it('inspect fixture rows', () => {
    for (const s of SCHEDULES) console.log('WPROBE', JSON.stringify(s));
    const bad = SCHEDULES.filter(s => typeof s.originCode !== 'string' || typeof s.destinationCode !== 'string');
    console.log('WPROBE non-string code rows:', bad.length);
    const self = SCHEDULES.find(s => (s.originCode||'').toLowerCase() === 'add' && (s.destinationCode||'').toLowerCase() === 'add');
    console.log('WPROBE add-add row:', JSON.stringify(self));
    if (self) console.log('WPROBE daysOfWeek type:', typeof self.daysOfWeek, Array.isArray(self.daysOfWeek), JSON.stringify(self.daysOfWeek));
  });
});
