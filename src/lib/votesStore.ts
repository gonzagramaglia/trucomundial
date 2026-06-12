import { useState, useEffect } from "react";

import { CARDS } from "../data/cards";

// Store the aggregate votes per card ID (live database status)
export const votesRegistry: Record<string, number> = {};

// Store the snapshot of votes taken when the match starts
export const gameVotesRegistry: Record<string, number> = {};

export let topCardsSet: Set<string> = new Set();


function calculateTopCards(registry: Record<string, number>) {
  const allTotals = CARDS.map(c => {
    const total = registry[c.id] || 0;
    return { id: c.id, total };
  });

  const sorted = allTotals.sort((a, b) => b.total - a.total);
  if (sorted.length === 0) return new Set<string>();
  const cutoffIndex = Math.min(5, sorted.length - 1);
  const cutoffValue = sorted[cutoffIndex].total;
  const set = new Set<string>();
  for (const item of sorted) {
    if (item.total >= cutoffValue) set.add(item.id);
    else break;
  }
  return set;
}

export let tournamentVotesSnapshot: Record<string, number> | null = null;

export function setTournamentVotesSnapshot(snapshot: Record<string, number> | null) {
  tournamentVotesSnapshot = snapshot;
  listeners.forEach(l => l());
}

let isGameActive = false;

export function setGameActive(active: boolean) {
  isGameActive = active;
  listeners.forEach(l => l());
}

export function snapshotVotesForGame() {
  Object.keys(gameVotesRegistry).forEach(key => {
    delete gameVotesRegistry[key];
  });
  Object.assign(gameVotesRegistry, votesRegistry);
}

const listeners = new Set<() => void>();

export function subscribeToVotes(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function updateVotesRegistry(newVotes: Record<string, number>) {
  Object.keys(votesRegistry).forEach(key => {
    delete votesRegistry[key];
  });
  Object.assign(votesRegistry, newVotes);
  
  // Also initialize gameVotesRegistry if it's empty
  if (Object.keys(gameVotesRegistry).length === 0) {
    Object.assign(gameVotesRegistry, votesRegistry);
  }

  topCardsSet = calculateTopCards(votesRegistry);

  listeners.forEach(l => l());
}

export function getCardVotes(cardId: string): number {
  // Strip instance suffixes added when playing a card: "_rem_TIMESTAMP" or "_TIMESTAMP"
  // Card IDs themselves may contain underscores (e.g. "nico_williams"), so we cannot
  // use split('_')[0] — instead we remove only the trailing numeric/remote suffix.
  const baseId = cardId.replace(/(_rem|_cpu)?_\d+$/, '');

  if (isGameActive && tournamentVotesSnapshot) {
    return (tournamentVotesSnapshot[baseId] || 0);
  }
  return (isGameActive ? gameVotesRegistry[baseId] : votesRegistry[baseId]) || 0;
}

export function isTopCard(cardId: string): boolean {
  const baseId = cardId.replace(/(_rem|_cpu)?_\d+$/, '');
  return topCardsSet.has(baseId);
}

export function useCardVotes(cardId: string): number {
  const [votes, setVotes] = useState(() => getCardVotes(cardId));

  useEffect(() => {
    setVotes(getCardVotes(cardId));
    return subscribeToVotes(() => {
      setVotes(getCardVotes(cardId));
    });
  }, [cardId]);

  return votes;
}

export function useIsTopCard(cardId: string): boolean {
  const [isTop, setIsTop] = useState(() => isTopCard(cardId));

  useEffect(() => {
    setIsTop(isTopCard(cardId));
    return subscribeToVotes(() => {
      setIsTop(isTopCard(cardId));
    });
  }, [cardId]);

  return isTop;
}
