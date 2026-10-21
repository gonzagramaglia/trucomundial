import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../../lib/supabase';
import { useTranslation } from 'react-i18next';
import type { User } from '@supabase/supabase-js';
import {
  type MatchSummary,
  deleteMatchHistoryRecord,
  clearAbandonedMatchesFromHistory
} from '../../../../lib/matchHistory';

export type { MatchSummary };

export const useProfileData = (user: User | null) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<MatchSummary[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<MatchSummary | null>(null);

  const fetchMatchHistory = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    let localMatches: MatchSummary[] = [];
    try {
      const storageKey = `trucomundial_match_history_${user.id}`;
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        localMatches = JSON.parse(raw);
      }
    } catch (e) {
      console.error('Error reading match history from storage:', e);
    }

    try {
      const { data, error } = await supabase
        .from('game_sync')
        .select('id, match_id, last_move, updated_at')
        .like('match_id', `user_history_${user.id}_%`);

      if (!error && data && data.length > 0) {
        const dbHistory: MatchSummary[] = data
          .map((item: any) => {
            const summary = item.last_move;
            return {
              id: item.id,
              match_id: item.match_id,
              rivalName: summary.rivalName || t('rival'),
              myScore: summary.myScore || 0,
              rivalScore: summary.rivalScore || 0,
              winner: summary.winner || 'cpu',
              date: summary.date || item.updated_at,
              log: summary.log || []
            };
          });

        const combined = [...localMatches];
        dbHistory.forEach((item) => {
          if (!combined.some(c => c.match_id === item.match_id)) {
            combined.push(item);
          }
        });
        combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setHistory(combined);
      } else {
        localMatches.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setHistory(localMatches);
      }
    } catch {
      localMatches.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setHistory(localMatches);
    } finally {
      setLoading(false);
    }
  }, [user, t]);

  useEffect(() => {
    fetchMatchHistory();
    const handleUpdate = () => fetchMatchHistory();
    window.addEventListener('trucomundial_history_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('trucomundial_history_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [fetchMatchHistory]);

  const totalPlayed = history.length;

  const deleteMatch = useCallback(async (matchId: string) => {
    if (!user) return;
    await deleteMatchHistoryRecord(matchId, user.id);
    setHistory(prev => prev.filter(m => m.id !== matchId && m.match_id !== matchId));
  }, [user]);

  const clearAbandoned = useCallback(async () => {
    if (!user) return;
    await clearAbandonedMatchesFromHistory(user.id);
    setHistory(prev => prev.filter(m => m.winner !== 'abandoned'));
  }, [user]);

  return {
    loading,
    history,
    totalPlayed,
    selectedMatch,
    setSelectedMatch,
    fetchMatchHistory,
    deleteMatch,
    clearAbandoned
  };
};
