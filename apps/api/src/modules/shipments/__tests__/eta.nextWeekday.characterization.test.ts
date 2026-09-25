// Characterization tests for nextWeekday (pure function).
// These pin CURRENT behavior so the holiday-precedence change can be judged
// against a known baseline. Deliberately asserting today's semantics, some of
// which are bugs to be fixed deliberately later (marked KNOWN BEHAVIOR).
import { describe, it, expect, vi } from 'vitest';

// eta.service imports prisma at module load; stub it so tests don't need a
// generated client or a database. nextWeekday itself is pure.
vi.mock('../../../utils/prisma', () => ({ default: {} }));

import { nextWeekday } from '../eta.service';

describe('nextWeekday (characterization)', () => {
  it('leaves weekdays untouched (including time-of-day)', () => {
    const wed = new Date(2026, 8, 23, 15, 45); // Wed Sep 23 2026 15:45 local
    const out = nextWeekday(wed, 8);
    expect(out.getDay()).toBe(3);
    expect(out.getHours()).toBe(15);
    expect(out.getMinutes()).toBe(45);
  });

  it('Sunday rolls to Monday at businessStart', () => {
    const sun = new Date(2026, 8, 20, 13, 0); // Sun Sep 20 2026
    const out = nextWeekday(sun, 8);
    expect(out.getDay()).toBe(1); // Mon
    expect(out.getDate()).toBe(21);
    expect(out.getHours()).toBe(8);
    expect(out.getMinutes()).toBe(0);
  });

  it('Saturday rolls forward TWO days to Monday at businessStart', () => {
    const sat = new Date(2026, 8, 19, 13, 0); // Sat Sep 19 2026
    const out = nextWeekday(sat, 7);
    expect(out.getDay()).toBe(1); // Mon Sep 21
    expect(out.getDate()).toBe(21);
    expect(out.getHours()).toBe(7);
  });

  it('KNOWN BEHAVIOR: does not consult any calendar — Friday on a public holiday is returned unchanged', () => {
    // Ethiopian holidays frequently fall on Fridays; current code ignores them here.
    const fri = new Date(2026, 8, 25, 9, 0); // Fri Sep 25 2026 (today)
    const out = nextWeekday(fri, 8);
    expect(out.getDay()).toBe(5); // still Friday — no holiday awareness
  });

  it('does not mutate its input', () => {
    const sun = new Date(2026, 8, 20, 13, 0);
    const copy = new Date(sun.getTime());
    nextWeekday(sun, 8);
    expect(sun.getTime()).toBe(copy.getTime());
  });
});
