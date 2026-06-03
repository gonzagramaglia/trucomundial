import { useState, useEffect } from "react";

// Store the aggregate votes per card ID (live database status)
export const votesRegistry: Record<string, number> = {};

// Store the snapshot of votes taken when the match starts
export const gameVotesRegistry: Record<string, number> = {};

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

  listeners.forEach(l => l());
}

export function getCardVotes(cardId: string): number {
  // Strip instance suffixes added when playing a card: "_rem_TIMESTAMP" or "_TIMESTAMP"
  // Card IDs themselves may contain underscores (e.g. "nico_williams"), so we cannot
  // use split('_')[0] — instead we remove only the trailing numeric/remote suffix.
  const baseId = cardId.replace(/(_rem|_cpu)?_\d+$/, '');
  const extra = (isGameActive ? gameVotesRegistry[baseId] : votesRegistry[baseId]) || 0;
  return extra;
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
