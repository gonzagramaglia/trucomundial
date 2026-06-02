import { useState, useEffect } from "react";
import { CARDS } from "../data/cards";

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

// Store the original base powers from CARDS
const basePowerMap: Record<string, number> = {};
CARDS.forEach(c => {
  basePowerMap[c.id] = c.power;
});

export function updateVotesRegistry(newVotes: Record<string, number>) {
  Object.keys(votesRegistry).forEach(key => {
    delete votesRegistry[key];
  });
  Object.assign(votesRegistry, newVotes);
  
  // Also initialize gameVotesRegistry if it's empty
  if (Object.keys(gameVotesRegistry).length === 0) {
    Object.assign(gameVotesRegistry, votesRegistry);
  }

  // Also update CARDS array directly so legacy accesses get the updated values
  CARDS.forEach(c => {
    c.power = (basePowerMap[c.id] || 0) + (votesRegistry[c.id] || 0);
  });

  listeners.forEach(l => l());
}

export function getCardPower(cardId: string): number {
  const baseId = cardId.split('_')[0];
  const base = basePowerMap[baseId] || 0;
  const extra = (isGameActive ? gameVotesRegistry[baseId] : votesRegistry[baseId]) || 0;
  return base + extra;
}

export function useCardPower(cardId: string): number {
  const [power, setPower] = useState(() => getCardPower(cardId));

  useEffect(() => {
    setPower(getCardPower(cardId));
    return subscribeToVotes(() => {
      setPower(getCardPower(cardId));
    });
  }, [cardId]);

  return power;
}

export function getCardVotes(cardId: string): number {
  const baseId = cardId.split('_')[0];
  return (isGameActive ? gameVotesRegistry[baseId] : votesRegistry[baseId]) || 0;
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
