import { useState, useEffect, useRef } from 'react';
import { CARDS } from '../data/cards';
import { supabase } from '../lib/supabase';
import { updateVotesRegistry } from '../lib/votesStore';
import { useBaseStars } from './useBaseStars';

interface RankingUser {
  id: string;
  email?: string;
  user_metadata?: { full_name?: string };
}

const BASE_PLAYERS = CARDS.map((card) => ({
  id: card.id,
  name: card.name,
  country: card.country,
  club: card.club,
  stars: 0,
  env: card.env,
  image: card.image,
  stickerNumber: card.stickerNumber,
  randomOffset: Math.random(),
}));

/** Hook that manages the voting system: fetch, aggregate, save, and rank. */
export function useRankingVotes(user: RankingUser | null, isAdmin: boolean) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [dbVotesData, setDbVotesData] = useState<any[]>([]);
  const [myVotes, setMyVotes] = useState<Record<string, number>>({});
  const lastSavedVotesRef = useRef<Record<string, number>>({});
  const baseStarsByCountry = useBaseStars();

  const LOCAL_STORAGE_KEY = `trucomundial-uservotes-${user?.id || 'anonymous'}`;
  const maxTotalVotes = 78;
  const totalMyVotes = Object.values(myVotes).reduce((sum, v) => sum + v, 0);
  const availableVotes = maxTotalVotes - totalMyVotes;

  // Load cached votes from localStorage
  useEffect(() => {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setMyVotes(parsed);
        lastSavedVotesRef.current = parsed;
      } catch {
        setMyVotes({});
        lastSavedVotesRef.current = {};
      }
    } else {
      setMyVotes({});
      lastSavedVotesRef.current = {};
    }
  }, [user, LOCAL_STORAGE_KEY]);

  // Fetch global votes from Supabase
  const fetchGlobalVotes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('game_sync')
        .select('match_id, last_move')
        .like('match_id', 'user_votes_%');

      if (error) {
        console.error('Error fetching votes:', error);
      } else if (data) {
        setDbVotesData(data);

        if (user) {
          const myDbRecord = data.find(item => item.match_id === `user_votes_${user.id}`);
          if (myDbRecord?.last_move?.votes) {
            lastSavedVotesRef.current = myDbRecord.last_move.votes;
            const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (!stored) {
              setMyVotes(myDbRecord.last_move.votes);
              localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(myDbRecord.last_move.votes));
            }
          } else {
            lastSavedVotesRef.current = {};
          }
        }
      }
    } catch (err) {
      console.error('Unexpected error fetching votes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGlobalVotes(); }, [user]);

  // Update global votes registry whenever local or DB data changes
  useEffect(() => {
    const aggregate: Record<string, number> = {};

    dbVotesData.forEach((item) => {
      if (user && item.match_id === `user_votes_${user.id}`) return;
      const recordVotes = item.last_move?.votes;
      if (recordVotes && typeof recordVotes === 'object') {
        Object.entries(recordVotes).forEach(([cardId, count]) => {
          if (typeof count === 'number') {
            aggregate[cardId] = (aggregate[cardId] || 0) + count;
          }
        });
      }
    });

    Object.entries(myVotes).forEach(([cardId, count]) => {
      if (typeof count === 'number') {
        aggregate[cardId] = (aggregate[cardId] || 0) + count;
      }
    });

    CARDS.forEach((c) => {
      const base = c.country === 'Argentina' ? 3 : c.country === 'Francia' ? 2 : c.country === 'Croacia' ? 1 : 0;
      const fix = baseStarsByCountry[c.country] || 0;
      aggregate[c.id] = Math.min(999, (aggregate[c.id] || 0) + base + fix);
    });

    updateVotesRegistry(aggregate);
  }, [myVotes, dbVotesData, user, baseStarsByCountry]);

  // Aggregate other users' votes (for ranking display)
  const aggregateOtherVotes: Record<string, number> = {};
  dbVotesData.forEach((item) => {
    if (user && item.match_id === `user_votes_${user.id}`) return;
    const recordVotes = item.last_move?.votes;
    if (recordVotes && typeof recordVotes === 'object') {
      Object.entries(recordVotes).forEach(([cardId, count]) => {
        if (typeof count === 'number') {
          aggregateOtherVotes[cardId] = (aggregateOtherVotes[cardId] ?? 0) + count;
        }
      });
    }
  });

  // Build sorted players with total votes
  const sortedPlayers = BASE_PLAYERS.map((player) => {
    const otherVotes = aggregateOtherVotes[player.id] ?? 0;
    const myActiveVotes = myVotes[player.id] ?? 0;
    const fixtureStars = baseStarsByCountry[player.country] || 0;
    const hardcodedBaseStars = player.country === 'Argentina' ? 3 : player.country === 'Francia' ? 2 : player.country === 'Croacia' ? 1 : 0;
    const totalVotes = Math.min(999, hardcodedBaseStars + fixtureStars + otherVotes + myActiveVotes);
    return { ...player, otherVotes, myActiveVotes, totalVotes };
  });

  // Absolute ranks
  const rankedList = [...sortedPlayers].sort((a, b) => b.totalVotes - a.totalVotes);
  const absoluteRanks = new Map<string, number>();
  let currentRank = 1;
  rankedList.forEach((p, idx) => {
    if (idx > 0 && p.totalVotes < rankedList[idx - 1].totalVotes) currentRank = idx + 1;
    absoluteRanks.set(p.id, currentRank);
  });

  // Vote handlers
  const handleAddVote = (cardId: string): boolean => {
    if (!user || availableVotes <= 0) return false;
    const currentMyVotes = myVotes[cardId] ?? 0;
    if (!isAdmin && currentMyVotes >= 3) return false; // max per card
    const player = sortedPlayers.find(p => p.id === cardId);
    if (player && player.totalVotes >= 999) return false;

    setMyVotes((prev) => {
      const updated = { ...prev, [cardId]: (prev[cardId] ?? 0) + 1 };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
    return true;
  };

  const handleSubVote = (cardId: string) => {
    if (!user) return;
    setMyVotes((prev) => {
      const current = prev[cardId] ?? 0;
      if (current <= 0) return prev;
      const updated = { ...prev, [cardId]: current - 1 };
      if (updated[cardId] === 0) delete updated[cardId];
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const handleSaveVotes = async () => {
    if (!user) return;
    setSaving(true);
    setSaveSuccess(false);
    try {
      const { error } = await supabase.from('game_sync').upsert({
        match_id: `user_votes_${user.id}`,
        last_move: {
          type: 'user_votes',
          userId: user.id,
          userName: user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0] || 'Usuario',
          votes: myVotes,
          updatedAt: new Date().toISOString(),
        },
        updated_at: new Date().toISOString(),
      }, { onConflict: 'match_id' });
      if (error) throw error;
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
      lastSavedVotesRef.current = myVotes;
      await fetchGlobalVotes();
    } catch (err) {
      console.error('Error saving votes:', err);
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const hasUnsavedChanges = (): boolean => {
    const currentKeys = Object.keys(myVotes);
    const savedKeys = Object.keys(lastSavedVotesRef.current);
    if (currentKeys.length !== savedKeys.length) return true;
    for (const key of currentKeys) {
      if (myVotes[key] !== lastSavedVotesRef.current[key]) return true;
    }
    return false;
  };

  return {
    loading,
    saving,
    saveSuccess,
    myVotes,
    availableVotes,
    maxTotalVotes,
    totalMyVotes,
    sortedPlayers,
    absoluteRanks,
    baseStarsByCountry,
    savedVotes: lastSavedVotesRef.current,
    handleAddVote,
    handleSubVote,
    handleSaveVotes,
    handleRestoreSavedVotes: () => {
      if (!user) return;
      setMyVotes(lastSavedVotesRef.current);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(lastSavedVotesRef.current));
    },
    hasUnsavedChanges,
  };
}

export { BASE_PLAYERS };
export type { RankingUser };
