import { describe, it, expect, vi } from 'vitest';
import { getMatchStatus, syncMatchStatus } from './match-status.js';
import { MATCH_STATUS } from '../validation/matches.js';

describe('getMatchStatus', () => {
  const START = '2026-06-01T15:00:00Z';
  const END = '2026-06-01T17:00:00Z';

  it('returns SCHEDULED when now is before startTime', () => {
    const now = new Date('2026-06-01T14:59:59Z');
    expect(getMatchStatus(START, END, now)).toBe(MATCH_STATUS.SCHEDULED);
  });

  it('returns LIVE when now is exactly at startTime', () => {
    const now = new Date(START);
    expect(getMatchStatus(START, END, now)).toBe(MATCH_STATUS.LIVE);
  });

  it('returns LIVE when now is between startTime and endTime', () => {
    const now = new Date('2026-06-01T16:00:00Z');
    expect(getMatchStatus(START, END, now)).toBe(MATCH_STATUS.LIVE);
  });

  it('returns FINISHED when now is exactly at endTime', () => {
    const now = new Date(END);
    expect(getMatchStatus(START, END, now)).toBe(MATCH_STATUS.FINISHED);
  });

  it('returns FINISHED when now is after endTime', () => {
    const now = new Date('2026-06-01T17:00:01Z');
    expect(getMatchStatus(START, END, now)).toBe(MATCH_STATUS.FINISHED);
  });

  it('returns FINISHED well after endTime', () => {
    const now = new Date('2030-01-01T00:00:00Z');
    expect(getMatchStatus(START, END, now)).toBe(MATCH_STATUS.FINISHED);
  });

  it('returns null for invalid startTime', () => {
    const result = getMatchStatus('not-a-date', END, new Date());
    expect(result).toBeNull();
  });

  it('returns null for invalid endTime', () => {
    const result = getMatchStatus(START, 'not-a-date', new Date());
    expect(result).toBeNull();
  });

  it('returns null for both invalid times', () => {
    const result = getMatchStatus('bad', 'bad', new Date());
    expect(result).toBeNull();
  });

  it('uses current date by default (no now argument)', () => {
    // A match far in the future should be SCHEDULED
    const farFuture = new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString();
    const farFutureEnd = new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 * 2).toISOString();
    expect(getMatchStatus(farFuture, farFutureEnd)).toBe(MATCH_STATUS.SCHEDULED);
  });

  it('uses current date by default for a past match (FINISHED)', () => {
    // A match far in the past should be FINISHED
    const pastStart = new Date('2000-01-01T10:00:00Z').toISOString();
    const pastEnd = new Date('2000-01-01T12:00:00Z').toISOString();
    expect(getMatchStatus(pastStart, pastEnd)).toBe(MATCH_STATUS.FINISHED);
  });

  it('handles Date objects as start/endTime inputs', () => {
    const start = new Date('2026-06-01T15:00:00Z');
    const end = new Date('2026-06-01T17:00:00Z');
    const now = new Date('2026-06-01T16:00:00Z');
    expect(getMatchStatus(start, end, now)).toBe(MATCH_STATUS.LIVE);
  });

  it('returns SCHEDULED one millisecond before startTime', () => {
    const startMs = new Date(START).getTime();
    const now = new Date(startMs - 1);
    expect(getMatchStatus(START, END, now)).toBe(MATCH_STATUS.SCHEDULED);
  });

  it('returns LIVE one millisecond after startTime', () => {
    const startMs = new Date(START).getTime();
    const now = new Date(startMs + 1);
    expect(getMatchStatus(START, END, now)).toBe(MATCH_STATUS.LIVE);
  });
});

describe('syncMatchStatus', () => {
  const START = '2026-06-01T15:00:00Z';
  const END = '2026-06-01T17:00:00Z';

  it('updates status when it differs from computed status', async () => {
    const match = { startTime: START, endTime: END, status: 'scheduled' };
    const now = new Date('2026-06-01T16:00:00Z'); // should be LIVE
    const updateStatus = vi.fn();

    // We need to override getMatchStatus behavior; here we spy indirectly by setting time
    // Use the now parameter indirectly: syncMatchStatus calls getMatchStatus internally with default now
    // Instead, we manipulate startTime/endTime so the match is currently LIVE
    const pastStart = '2000-01-01T10:00:00Z';
    const pastEnd = '2000-01-01T12:00:00Z';
    const finishedMatch = { startTime: pastStart, endTime: pastEnd, status: 'scheduled' };
    const updateFn = vi.fn();

    const result = await syncMatchStatus(finishedMatch, updateFn);

    expect(updateFn).toHaveBeenCalledWith(MATCH_STATUS.FINISHED);
    expect(result).toBe(MATCH_STATUS.FINISHED);
    expect(finishedMatch.status).toBe(MATCH_STATUS.FINISHED);
  });

  it('does not call updateStatus when status is already correct', async () => {
    const pastStart = '2000-01-01T10:00:00Z';
    const pastEnd = '2000-01-01T12:00:00Z';
    const match = { startTime: pastStart, endTime: pastEnd, status: MATCH_STATUS.FINISHED };
    const updateFn = vi.fn();

    const result = await syncMatchStatus(match, updateFn);

    expect(updateFn).not.toHaveBeenCalled();
    expect(result).toBe(MATCH_STATUS.FINISHED);
  });

  it('returns current match status when getMatchStatus returns null (invalid dates)', async () => {
    const match = { startTime: 'invalid', endTime: 'invalid', status: 'live' };
    const updateFn = vi.fn();

    const result = await syncMatchStatus(match, updateFn);

    expect(updateFn).not.toHaveBeenCalled();
    expect(result).toBe('live');
  });

  it('mutates match.status to the new status', async () => {
    const futureStart = new Date(Date.now() + 1000 * 60 * 60).toISOString();
    const futureEnd = new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString();
    const match = { startTime: futureStart, endTime: futureEnd, status: 'finished' };
    const updateFn = vi.fn();

    await syncMatchStatus(match, updateFn);

    expect(match.status).toBe(MATCH_STATUS.SCHEDULED);
    expect(updateFn).toHaveBeenCalledWith(MATCH_STATUS.SCHEDULED);
  });

  it('awaits the updateStatus callback', async () => {
    const futureStart = new Date(Date.now() + 1000 * 60 * 60).toISOString();
    const futureEnd = new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString();
    const match = { startTime: futureStart, endTime: futureEnd, status: 'live' };
    let resolved = false;
    const updateFn = vi.fn(async () => {
      await new Promise((r) => setTimeout(r, 1));
      resolved = true;
    });

    await syncMatchStatus(match, updateFn);
    expect(resolved).toBe(true);
  });
});