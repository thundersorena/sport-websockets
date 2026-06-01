import { describe, it, expect } from 'vitest';
import {
  MATCH_STATUS,
  listMatchesQuerySchema,
  matchIdParamSchema,
  createMatchSchema,
  updateScoreSchema,
} from './matches.js';

describe('MATCH_STATUS', () => {
  it('has the correct string values', () => {
    expect(MATCH_STATUS.SCHEDULED).toBe('scheduled');
    expect(MATCH_STATUS.LIVE).toBe('live');
    expect(MATCH_STATUS.FINISHED).toBe('finished');
  });
});

describe('listMatchesQuerySchema', () => {
  it('accepts a valid limit', () => {
    const result = listMatchesQuerySchema.safeParse({ limit: '10' });
    expect(result.success).toBe(true);
    expect(result.data.limit).toBe(10);
  });

  it('accepts limit at maximum boundary (100)', () => {
    const result = listMatchesQuerySchema.safeParse({ limit: '100' });
    expect(result.success).toBe(true);
    expect(result.data.limit).toBe(100);
  });

  it('accepts limit at minimum boundary (1)', () => {
    const result = listMatchesQuerySchema.safeParse({ limit: '1' });
    expect(result.success).toBe(true);
    expect(result.data.limit).toBe(1);
  });

  it('accepts missing limit (optional)', () => {
    const result = listMatchesQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    expect(result.data.limit).toBeUndefined();
  });

  it('rejects limit above 100', () => {
    const result = listMatchesQuerySchema.safeParse({ limit: '101' });
    expect(result.success).toBe(false);
  });

  it('rejects limit of 0', () => {
    const result = listMatchesQuerySchema.safeParse({ limit: '0' });
    expect(result.success).toBe(false);
  });

  it('rejects negative limit', () => {
    const result = listMatchesQuerySchema.safeParse({ limit: '-1' });
    expect(result.success).toBe(false);
  });

  it('rejects non-integer limit', () => {
    const result = listMatchesQuerySchema.safeParse({ limit: '1.5' });
    expect(result.success).toBe(false);
  });

  it('rejects non-numeric limit string', () => {
    const result = listMatchesQuerySchema.safeParse({ limit: 'abc' });
    expect(result.success).toBe(false);
  });
});

describe('matchIdParamSchema', () => {
  it('accepts a valid positive integer id', () => {
    const result = matchIdParamSchema.safeParse({ id: '42' });
    expect(result.success).toBe(true);
    expect(result.data.id).toBe(42);
  });

  it('accepts id of 1', () => {
    const result = matchIdParamSchema.safeParse({ id: '1' });
    expect(result.success).toBe(true);
    expect(result.data.id).toBe(1);
  });

  it('rejects id of 0', () => {
    const result = matchIdParamSchema.safeParse({ id: '0' });
    expect(result.success).toBe(false);
  });

  it('rejects negative id', () => {
    const result = matchIdParamSchema.safeParse({ id: '-5' });
    expect(result.success).toBe(false);
  });

  it('rejects non-numeric id', () => {
    const result = matchIdParamSchema.safeParse({ id: 'abc' });
    expect(result.success).toBe(false);
  });

  it('rejects missing id', () => {
    const result = matchIdParamSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('rejects float id', () => {
    const result = matchIdParamSchema.safeParse({ id: '1.5' });
    expect(result.success).toBe(false);
  });
});

describe('createMatchSchema', () => {
  const validPayload = {
    sport: 'Football',
    homeTeam: 'Arsenal',
    awayTeam: 'Chelsea',
    startTime: '2026-06-01T15:00:00Z',
    endTime: '2026-06-01T17:00:00Z',
  };

  it('accepts valid payload with all required fields', () => {
    const result = createMatchSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
    expect(result.data.sport).toBe('Football');
    expect(result.data.homeTeam).toBe('Arsenal');
    expect(result.data.awayTeam).toBe('Chelsea');
  });

  it('accepts valid payload with optional scores', () => {
    const result = createMatchSchema.safeParse({ ...validPayload, homeScore: 1, awayScore: 2 });
    expect(result.success).toBe(true);
    expect(result.data.homeScore).toBe(1);
    expect(result.data.awayScore).toBe(2);
  });

  it('accepts scores of 0', () => {
    const result = createMatchSchema.safeParse({ ...validPayload, homeScore: 0, awayScore: 0 });
    expect(result.success).toBe(true);
  });

  it('trims whitespace from string fields', () => {
    const result = createMatchSchema.safeParse({
      ...validPayload,
      sport: '  Football  ',
      homeTeam: '  Arsenal  ',
      awayTeam: '  Chelsea  ',
    });
    expect(result.success).toBe(true);
    expect(result.data.sport).toBe('Football');
    expect(result.data.homeTeam).toBe('Arsenal');
    expect(result.data.awayTeam).toBe('Chelsea');
  });

  it('rejects missing sport', () => {
    const { sport, ...rest } = validPayload;
    const result = createMatchSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('rejects empty sport string', () => {
    const result = createMatchSchema.safeParse({ ...validPayload, sport: '' });
    expect(result.success).toBe(false);
  });

  it('rejects whitespace-only sport string', () => {
    const result = createMatchSchema.safeParse({ ...validPayload, sport: '   ' });
    expect(result.success).toBe(false);
  });

  it('rejects missing homeTeam', () => {
    const { homeTeam, ...rest } = validPayload;
    const result = createMatchSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('rejects missing awayTeam', () => {
    const { awayTeam, ...rest } = validPayload;
    const result = createMatchSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('rejects missing startTime', () => {
    const { startTime, ...rest } = validPayload;
    const result = createMatchSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('rejects missing endTime', () => {
    const { endTime, ...rest } = validPayload;
    const result = createMatchSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('rejects invalid startTime format', () => {
    const result = createMatchSchema.safeParse({ ...validPayload, startTime: '2026-06-01' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid endTime format', () => {
    const result = createMatchSchema.safeParse({ ...validPayload, endTime: 'not-a-date' });
    expect(result.success).toBe(false);
  });

  it('rejects when endTime equals startTime', () => {
    const result = createMatchSchema.safeParse({
      ...validPayload,
      startTime: '2026-06-01T15:00:00Z',
      endTime: '2026-06-01T15:00:00Z',
    });
    expect(result.success).toBe(false);
    const issues = result.error.flatten().fieldErrors;
    expect(issues.endTime).toBeDefined();
  });

  it('rejects when endTime is before startTime', () => {
    const result = createMatchSchema.safeParse({
      ...validPayload,
      startTime: '2026-06-01T17:00:00Z',
      endTime: '2026-06-01T15:00:00Z',
    });
    expect(result.success).toBe(false);
    const issues = result.error.flatten().fieldErrors;
    expect(issues.endTime).toBeDefined();
  });

  it('rejects negative homeScore', () => {
    const result = createMatchSchema.safeParse({ ...validPayload, homeScore: -1 });
    expect(result.success).toBe(false);
  });

  it('rejects negative awayScore', () => {
    const result = createMatchSchema.safeParse({ ...validPayload, awayScore: -1 });
    expect(result.success).toBe(false);
  });

  it('accepts ISO date with milliseconds', () => {
    const result = createMatchSchema.safeParse({
      ...validPayload,
      startTime: '2026-06-01T15:00:00.000Z',
      endTime: '2026-06-01T17:00:00.000Z',
    });
    expect(result.success).toBe(true);
  });

  it('accepts ISO date with timezone offset', () => {
    const result = createMatchSchema.safeParse({
      ...validPayload,
      startTime: '2026-06-01T15:00:00+01:00',
      endTime: '2026-06-01T17:00:00+01:00',
    });
    expect(result.success).toBe(true);
  });

  it('rejects ISO date without timezone', () => {
    const result = createMatchSchema.safeParse({
      ...validPayload,
      startTime: '2026-06-01T15:00:00',
    });
    expect(result.success).toBe(false);
  });
});

describe('updateScoreSchema', () => {
  it('accepts valid scores', () => {
    const result = updateScoreSchema.safeParse({ homeScore: 2, awayScore: 1 });
    expect(result.success).toBe(true);
    expect(result.data.homeScore).toBe(2);
    expect(result.data.awayScore).toBe(1);
  });

  it('accepts scores of 0', () => {
    const result = updateScoreSchema.safeParse({ homeScore: 0, awayScore: 0 });
    expect(result.success).toBe(true);
  });

  it('coerces string scores to numbers', () => {
    const result = updateScoreSchema.safeParse({ homeScore: '3', awayScore: '0' });
    expect(result.success).toBe(true);
    expect(result.data.homeScore).toBe(3);
    expect(result.data.awayScore).toBe(0);
  });

  it('rejects missing homeScore', () => {
    const result = updateScoreSchema.safeParse({ awayScore: 1 });
    expect(result.success).toBe(false);
  });

  it('rejects missing awayScore', () => {
    const result = updateScoreSchema.safeParse({ homeScore: 1 });
    expect(result.success).toBe(false);
  });

  it('rejects negative homeScore', () => {
    const result = updateScoreSchema.safeParse({ homeScore: -1, awayScore: 0 });
    expect(result.success).toBe(false);
  });

  it('rejects negative awayScore', () => {
    const result = updateScoreSchema.safeParse({ homeScore: 0, awayScore: -1 });
    expect(result.success).toBe(false);
  });

  it('rejects non-integer homeScore', () => {
    const result = updateScoreSchema.safeParse({ homeScore: 1.5, awayScore: 0 });
    expect(result.success).toBe(false);
  });

  it('rejects non-numeric homeScore string', () => {
    const result = updateScoreSchema.safeParse({ homeScore: 'abc', awayScore: 0 });
    expect(result.success).toBe(false);
  });
});
