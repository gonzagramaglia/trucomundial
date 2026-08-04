import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../../lib/supabase';
import { useTranslation } from 'react-i18next';
import type { User } from '@supabase/supabase-js';

export interface MatchSummary {
  id: string;
  match_id: string;
  rivalName: string;
  myScore: number;
  rivalScore: number;
  winner: 'player' | 'cpu';
  date: string;
  log: string[];
}

export const useProfileData = (user: User | null) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<MatchSummary[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<MatchSummary | null>(null);

  const fetchMatchHistory = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('game_sync')
        .select('id, match_id, last_move, updated_at')
        .like('match_id', `user_history_${user.id}_%`);

      if (error) {
        console.error('Error fetching history:', error);
      } else if (data) {
        const formattedHistory: MatchSummary[] = data
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
          })
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        setHistory(formattedHistory);
      }
    } catch (err) {
      console.error('Unexpected error fetching history:', err);
    } finally {
      setLoading(false);
    }
  }, [user, t]);

  useEffect(() => {
    fetchMatchHistory();
  }, [fetchMatchHistory]);

  const totalPlayed = history.length;

  return {
    loading,
    history,
    totalPlayed,
    selectedMatch,
    setSelectedMatch,
    fetchMatchHistory
  };
};
