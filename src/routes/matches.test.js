import { describe, it, expect, vi, beforeAll, afterAll, beforeEach } from 'vitest';
import express from 'express';

// vi.mock is hoisted — these mocks intercept imports before the route module loads
vi.mock('../db/db.js', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock('../db/schema.js', () => ({
  matches: Symbol('matches'),
}));

vi.mock('drizzle-orm', () => ({
  eq: vi.fn((_col, _val) => 'eq-filter'),
  desc: vi.fn((_col) => 'desc-order'),
}));

import { db } from '../db/db.js';
import { matchesRouter } from './matches.js';

// ─── Test server setup ───────────────────────────────────────────────────────

const app = express();
app.use(express.json());
app.use('/api/matches', matchesRouter);

let server;
let baseUrl;

beforeAll(
  () =>
    new Promise((resolve) => {
      server = app.listen(0, () => {
        baseUrl = `http://localhost:${server.address().port}/api/matches`;
        resolve();
      });
    }),
);

afterAll(() => new Promise((resolve) => server.close(resolve)));

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

const sampleMatch = {
  id: 1,
  sport: 'Football',
  homeTeam: 'Arsenal',
  awayTeam: 'Chelsea',
  status: 'scheduled',
  startTime: '2026-06-01T15:00:00.000Z',
  endTime: '2026-06-01T17:00:00.000Z',
  homeScore: 0,
  awayScore: 0,
  createdAt: '2026-05-01T10:00:00.000Z',
};

/** Returns a Proxy that mimics a Drizzle ORM chainable query builder and resolves to `value`. */
function chainResolving(value) {
  const awaitableHandler = {
    get(target, prop) {
      if (prop === 'then') {
        return (resolve, reject) => Promise.resolve(value).then(resolve, reject);
      }
      // Any further chained call returns the same awaitable proxy
      return (..._args) => new Proxy({}, awaitableHandler);
    },
  };
  const chainHandler = {
    get(_target, prop) {
      if (prop === 'then') return undefined; // not thenable at this level
      return (..._args) => new Proxy({}, awaitableHandler);
    },
  };
  return new Proxy({}, chainHandler);
}

/** Returns a Proxy that mimics a Drizzle ORM chainable query builder and rejects with `error`. */
function chainRejecting(error) {
  const awaitableHandler = {
    get(target, prop) {
      if (prop === 'then') {
        return (resolve, reject) => Promise.reject(error).then(resolve, reject);
      }
      return (..._args) => new Proxy({}, awaitableHandler);
    },
  };
  const chainHandler = {
    get(_target, prop) {
      if (prop === 'then') return undefined;
      return (..._args) => new Proxy({}, awaitableHandler);
    },
  };
  return new Proxy({}, chainHandler);
}

async function get(path, query = '') {
  return fetch(`${baseUrl}${path}${query ? '?' + query : ''}`);
}

async function post(path, body) {
  return fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function patch(path, body) {
  return fetch(`${baseUrl}${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

// ─── GET /api/matches ────────────────────────────────────────────────────────

describe('GET /api/matches', () => {
  it('returns 200 with data array on success', async () => {
    db.select.mockReturnValue(chainResolving([sampleMatch]));

    const res = await get('/');
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toHaveProperty('data');
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data[0].id).toBe(1);
  });

  it('returns 200 with empty array when no matches exist', async () => {
    db.select.mockReturnValue(chainResolving([]));

    const res = await get('/');
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data).toEqual([]);
  });

  it('accepts a valid limit query parameter', async () => {
    db.select.mockReturnValue(chainResolving([sampleMatch]));

    const res = await get('/', 'limit=10');
    expect(res.status).toBe(200);
  });

  it('accepts limit at maximum boundary (100)', async () => {
    db.select.mockReturnValue(chainResolving([]));

    const res = await get('/', 'limit=100');
    expect(res.status).toBe(200);
  });

  it('returns 400 for limit above 100', async () => {
    const res = await get('/', 'limit=101');
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe('Invalid query parameters');
  });

  it('returns 400 for limit of 0', async () => {
    const res = await get('/', 'limit=0');
    expect(res.status).toBe(400);
  });

  it('returns 400 for negative limit', async () => {
    const res = await get('/', 'limit=-1');
    expect(res.status).toBe(400);
  });

  it('returns 400 for non-numeric limit', async () => {
    const res = await get('/', 'limit=abc');
    expect(res.status).toBe(400);
  });

  it('returns 500 when db throws an error', async () => {
    db.select.mockReturnValue(chainRejecting(new Error('DB connection failed')));

    const res = await get('/');
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toBe('An error occurred while fetching matches');
  });
});

// ─── POST /api/matches ───────────────────────────────────────────────────────

describe('POST /api/matches', () => {
  const validBody = {
    sport: 'Football',
    homeTeam: 'Arsenal',
    awayTeam: 'Chelsea',
    startTime: '2026-06-01T15:00:00Z',
    endTime: '2026-06-01T17:00:00Z',
  };

  it('returns 201 with created match on success', async () => {
    db.insert.mockReturnValue(chainResolving([sampleMatch]));

    const res = await post('/', validBody);
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body).toHaveProperty('data');
    expect(body.data.id).toBe(1);
  });

  it('accepts optional homeScore and awayScore', async () => {
    const created = { ...sampleMatch, homeScore: 2, awayScore: 1 };
    db.insert.mockReturnValue(chainResolving([created]));

    const res = await post('/', { ...validBody, homeScore: 2, awayScore: 1 });
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.data.homeScore).toBe(2);
    expect(body.data.awayScore).toBe(1);
  });

  it('returns 400 when sport is missing', async () => {
    const { sport, ...rest } = validBody;
    const res = await post('/', rest);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe('Invalid data');
  });

  it('returns 400 when homeTeam is missing', async () => {
    const { homeTeam, ...rest } = validBody;
    const res = await post('/', rest);
    expect(res.status).toBe(400);
  });

  it('returns 400 when awayTeam is missing', async () => {
    const { awayTeam, ...rest } = validBody;
    const res = await post('/', rest);
    expect(res.status).toBe(400);
  });

  it('returns 400 when startTime is invalid', async () => {
    const res = await post('/', { ...validBody, startTime: 'not-a-date' });
    expect(res.status).toBe(400);
  });

  it('returns 400 when endTime is invalid', async () => {
    const res = await post('/', { ...validBody, endTime: 'bad' });
    expect(res.status).toBe(400);
  });

  it('returns 400 when endTime is before startTime', async () => {
    const res = await post('/', {
      ...validBody,
      startTime: '2026-06-01T17:00:00Z',
      endTime: '2026-06-01T15:00:00Z',
    });
    expect(res.status).toBe(400);
  });

  it('returns 400 when endTime equals startTime', async () => {
    const res = await post('/', {
      ...validBody,
      startTime: '2026-06-01T15:00:00Z',
      endTime: '2026-06-01T15:00:00Z',
    });
    expect(res.status).toBe(400);
  });

  it('returns 400 when body is empty', async () => {
    const res = await post('/', {});
    expect(res.status).toBe(400);
  });

  it('returns 400 for negative homeScore', async () => {
    const res = await post('/', { ...validBody, homeScore: -1 });
    expect(res.status).toBe(400);
  });

  it('returns 500 when db throws an error', async () => {
    db.insert.mockReturnValue(chainRejecting(new Error('DB insert failed')));

    const res = await post('/', validBody);
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toBe('An error occurred while creating the match');
  });
});

// ─── GET /api/matches/:id ────────────────────────────────────────────────────

describe('GET /api/matches/:id', () => {
  it('returns 200 with match data when found', async () => {
    db.select.mockReturnValue(chainResolving([sampleMatch]));

    const res = await get('/1');
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.id).toBe(1);
    expect(body.data.sport).toBe('Football');
  });

  it('returns 404 when match is not found', async () => {
    db.select.mockReturnValue(chainResolving([]));

    const res = await get('/999');
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error).toBe('Match not found');
  });

  it('returns 400 for non-numeric id', async () => {
    const res = await get('/abc');
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe('Invalid ID');
  });

  it('returns 400 for id of 0', async () => {
    const res = await get('/0');
    expect(res.status).toBe(400);
  });

  it('returns 400 for negative id', async () => {
    const res = await get('/-5');
    expect(res.status).toBe(400);
  });

  it('returns 500 when db throws an error', async () => {
    db.select.mockReturnValue(chainRejecting(new Error('DB error')));

    const res = await get('/1');
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toBe('An error occurred while fetching the match');
  });
});

// ─── PATCH /api/matches/:id/score ────────────────────────────────────────────

describe('PATCH /api/matches/:id/score', () => {
  const scoreBody = { homeScore: 2, awayScore: 1 };

  it('returns 200 with updated match on success', async () => {
    const updated = { ...sampleMatch, homeScore: 2, awayScore: 1 };
    db.update.mockReturnValue(chainResolving([updated]));

    const res = await patch('/1/score', scoreBody);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.homeScore).toBe(2);
    expect(body.data.awayScore).toBe(1);
  });

  it('accepts scores of 0', async () => {
    db.update.mockReturnValue(chainResolving([{ ...sampleMatch, homeScore: 0, awayScore: 0 }]));

    const res = await patch('/1/score', { homeScore: 0, awayScore: 0 });
    expect(res.status).toBe(200);
  });

  it('returns 404 when match not found', async () => {
    db.update.mockReturnValue(chainResolving([]));

    const res = await patch('/999/score', scoreBody);
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error).toBe('Match not found');
  });

  it('returns 400 for non-numeric id', async () => {
    const res = await patch('/abc/score', scoreBody);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe('Invalid ID');
  });

  it('returns 400 for id of 0', async () => {
    const res = await patch('/0/score', scoreBody);
    expect(res.status).toBe(400);
  });

  it('returns 400 when homeScore is missing', async () => {
    const res = await patch('/1/score', { awayScore: 1 });
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe('Invalid score data');
  });

  it('returns 400 when awayScore is missing', async () => {
    const res = await patch('/1/score', { homeScore: 1 });
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe('Invalid score data');
  });

  it('returns 400 for negative homeScore', async () => {
    const res = await patch('/1/score', { homeScore: -1, awayScore: 0 });
    expect(res.status).toBe(400);
  });

  it('returns 400 for negative awayScore', async () => {
    const res = await patch('/1/score', { homeScore: 0, awayScore: -1 });
    expect(res.status).toBe(400);
  });

  it('returns 400 when body is empty', async () => {
    const res = await patch('/1/score', {});
    expect(res.status).toBe(400);
  });

  it('returns 500 when db throws an error', async () => {
    db.update.mockReturnValue(chainRejecting(new Error('DB error')));

    const res = await patch('/1/score', scoreBody);
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toBe('An error occurred while updating the score');
  });
});