import { getLocalUser } from './localAuth';
import { supabase } from './supabase';

export interface MatchSummary {
  id: string;
  match_id: string;
  rivalName: string;
  myScore: number;
  rivalScore: number;
  winner: 'player' | 'cpu' | 'abandoned';
  date: string;
  log: string[];
}

export const readHistory = (userId: string): MatchSummary[] => {
  try {
    const storageKey = `trucomundial_match_history_${userId}`;
    const raw = localStorage.getItem(storageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as MatchSummary[]) : [];
  } catch {
    return [];
  }
};

export const saveMatchHistoryRecord = async (
  finalWinner: 'player' | 'cpu' | 'abandoned',
  score: { player: number; cpu: number },
  rivalName: string = 'CPU',
  matchLog: string[] = [],
  gameMode: string = '1v1'
): Promise<MatchSummary> => {
  const localUser = getLocalUser();
  const uniqueHistoryId = `user_history_${localUser.id}_${gameMode}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const summary: MatchSummary = {
    id: uniqueHistoryId,
    match_id: uniqueHistoryId,
    rivalName: rivalName || 'CPU',
    myScore: score.player,
    rivalScore: score.cpu,
    winner: finalWinner,
    date: new Date().toISOString(),
    log: matchLog || []
  };

  try {
    const storageKey = `trucomundial_match_history_${localUser.id}`;
    const historyList = readHistory(localUser.id);
    historyList.unshift(summary);
    localStorage.setItem(storageKey, JSON.stringify(historyList));
    window.dispatchEvent(new Event('trucomundial_history_updated'));
  } catch (e) {
    console.error('Error saving match history to localStorage:', e);
  }

  if (gameMode === 'multiplayer') {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (user) {
        await supabase
          .from('game_sync')
          .upsert({
            match_id: uniqueHistoryId,
            last_move: summary,
            updated_at: new Date().toISOString()
          }, { onConflict: 'match_id' });
      }
    } catch (err) {
      console.error('Error syncing match history to supabase:', err);
    }
  }

  return summary;
};

export const deleteMatchHistoryRecord = async (matchId: string, userId: string): Promise<void> => {
  try {
    const storageKey = `trucomundial_match_history_${userId}`;
    const historyList = readHistory(userId);
    const filtered = historyList.filter(m => m.id !== matchId && m.match_id !== matchId);
    localStorage.setItem(storageKey, JSON.stringify(filtered));
    window.dispatchEvent(new Event('trucomundial_history_updated'));

    if (matchId.startsWith('user_history_')) {
      await supabase.from('game_sync').delete().eq('match_id', matchId);
    }
  } catch (e) {
    console.error('Error deleting match from history:', e);
  }
};

export const clearAbandonedMatchesFromHistory = async (userId: string): Promise<void> => {
  try {
    const storageKey = `trucomundial_match_history_${userId}`;
    const historyList = readHistory(userId);
    const abandonedIds = historyList.filter(m => m.winner === 'abandoned').map(m => m.match_id || m.id);
    const filtered = historyList.filter(m => m.winner !== 'abandoned');
    localStorage.setItem(storageKey, JSON.stringify(filtered));
    window.dispatchEvent(new Event('trucomundial_history_updated'));

    for (const matchId of abandonedIds) {
      if (matchId && matchId.startsWith('user_history_')) {
        await supabase.from('game_sync').delete().eq('match_id', matchId);
      }
    }
  } catch (e) {
    console.error('Error clearing abandoned matches from history:', e);
  }
};
