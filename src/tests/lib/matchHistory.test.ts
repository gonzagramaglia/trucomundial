import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  saveMatchHistoryRecord,
  deleteMatchHistoryRecord,
  clearAbandonedMatchesFromHistory
} from '../../lib/matchHistory';

describe('matchHistory helper', () => {
  const mockUserId = 'test-user-123';

  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('trucomundial_local_user', JSON.stringify({ id: mockUserId, name: 'Tester' }));
    vi.restoreAllMocks();
  });

  it('saves an abandoned match with current score', async () => {
    const summary = await saveMatchHistoryRecord(
      'abandoned',
      { player: 12, cpu: 8 },
      'CPU',
      ['Hand 1: Player won', 'Hand 2: CPU won'],
      '1v1'
    );

    expect(summary.winner).toBe('abandoned');
    expect(summary.myScore).toBe(12);
    expect(summary.rivalScore).toBe(8);

    const raw = localStorage.getItem(`trucomundial_match_history_${mockUserId}`);
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw!);
    expect(parsed.length).toBe(1);
    expect(parsed[0].winner).toBe('abandoned');
    expect(parsed[0].myScore).toBe(12);
    expect(parsed[0].rivalScore).toBe(8);
  });

  it('deletes an individual match from history', async () => {
    const m1 = await saveMatchHistoryRecord('player', { player: 30, cpu: 15 }, 'CPU');
    const m2 = await saveMatchHistoryRecord('abandoned', { player: 5, cpu: 10 }, 'CPU');

    let raw = localStorage.getItem(`trucomundial_match_history_${mockUserId}`);
    expect(JSON.parse(raw!).length).toBe(2);

    await deleteMatchHistoryRecord(m2.id, mockUserId);

    raw = localStorage.getItem(`trucomundial_match_history_${mockUserId}`);
    const remaining = JSON.parse(raw!);
    expect(remaining.length).toBe(1);
    expect(remaining[0].id).toBe(m1.id);
  });

  it('clears only abandoned matches from history', async () => {
    await saveMatchHistoryRecord('player', { player: 30, cpu: 20 }, 'CPU');
    await saveMatchHistoryRecord('abandoned', { player: 2, cpu: 4 }, 'CPU');
    await saveMatchHistoryRecord('cpu', { player: 18, cpu: 30 }, 'CPU');
    await saveMatchHistoryRecord('abandoned', { player: 10, cpu: 12 }, 'CPU');

    let raw = localStorage.getItem(`trucomundial_match_history_${mockUserId}`);
    expect(JSON.parse(raw!).length).toBe(4);

    await clearAbandonedMatchesFromHistory(mockUserId);

    raw = localStorage.getItem(`trucomundial_match_history_${mockUserId}`);
    const remaining = JSON.parse(raw!);
    expect(remaining.length).toBe(2);
    expect(remaining.every((m: any) => m.winner !== 'abandoned')).toBe(true);
  });
});
