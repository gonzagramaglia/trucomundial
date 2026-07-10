import { create } from 'zustand';
import { CARDS } from '../data/cards';

// --- Types ---

interface VotesState {
  votesRegistry: Record<string, number>;
  gameVotesRegistry: Record<string, number>;
  topCardsSet: Set<string>;
  tournamentVotesSnapshot: Record<string, number> | null;
  isGameActive: boolean;
}

interface VotesActions {
  updateVotesRegistry: (newVotes: Record<string, number>) => void;
  snapshotVotesForGame: () => void;
  setGameActive: (active: boolean) => void;
  setTournamentVotesSnapshot: (snapshot: Record<string, number> | null) => void;
}

// --- Helpers ---

function calculateTopCards(registry: Record<string, number>): Set<string> {
  const allTotals = CARDS.map(c => ({
    id: c.id,
    total: registry[c.id] || 0,
  }));

  const sorted = allTotals.sort((a, b) => b.total - a.total);
  if (sorted.length === 0) return new Set();

  const cutoffIndex = Math.min(5, sorted.length - 1);
  const cutoffValue = sorted[cutoffIndex].total;
  const set = new Set<string>();
  for (const item of sorted) {
    if (item.total >= cutoffValue) set.add(item.id);
    else break;
  }
  return set;
}

function stripCardSuffix(cardId: string): string {
  return cardId.replace(/(_rem|_cpu)?_\d+$/, '');
}

// --- Store ---

const useVotesStore = create<VotesState & VotesActions>((set, get) => ({
  votesRegistry: {},
  gameVotesRegistry: {},
  topCardsSet: new Set(),
  tournamentVotesSnapshot: null,
  isGameActive: false,

  updateVotesRegistry: (newVotes) => {
    const gameVotesRegistry = get().gameVotesRegistry;
    const updatedGameVotes = Object.keys(gameVotesRegistry).length === 0
      ? { ...newVotes }
      : gameVotesRegistry;

    set({
      votesRegistry: { ...newVotes },
      gameVotesRegistry: updatedGameVotes,
      topCardsSet: calculateTopCards(newVotes),
    });
  },

  snapshotVotesForGame: () => {
    set({ gameVotesRegistry: { ...get().votesRegistry } });
  },

  setGameActive: (active) => {
    set({ isGameActive: active });
  },

  setTournamentVotesSnapshot: (snapshot) => {
    set({ tournamentVotesSnapshot: snapshot });
  },
}));

// --- Backward-compatible exports ---

/** Mutable votes reference kept in sync with the store for non-React consumers (engine.ts, etc.) */
export const votesRegistry: Record<string, number> = {};

// Keep the mutable object in sync with the store (only when votesRegistry changes)
let prevVotesRef: Record<string, number> = {};
useVotesStore.subscribe((state) => {
  if (state.votesRegistry !== prevVotesRef) {
    prevVotesRef = state.votesRegistry;
    Object.keys(votesRegistry).forEach(k => delete votesRegistry[k]);
    Object.assign(votesRegistry, state.votesRegistry);
  }
});

/**
 * Returns the current vote count for a card, accounting for game/tournament state.
 * @param cardId - The card identifier (suffix is stripped automatically)
 * @returns The resolved vote count for the card
 */
export function getCardVotes(cardId: string): number {
  const baseId = stripCardSuffix(cardId);
  const { isGameActive, tournamentVotesSnapshot, gameVotesRegistry, votesRegistry } = useVotesStore.getState();

  if (isGameActive && tournamentVotesSnapshot) {
    return tournamentVotesSnapshot[baseId] || 0;
  }
  return (isGameActive ? gameVotesRegistry[baseId] : votesRegistry[baseId]) || 0;
}

/** Checks whether a card is among the top-voted cards. */
export function isTopCard(cardId: string): boolean {
  const baseId = stripCardSuffix(cardId);
  return useVotesStore.getState().topCardsSet.has(baseId);
}

/** Replaces the global votes registry with new vote data. */
export function updateVotesRegistry(newVotes: Record<string, number>): void {
  useVotesStore.getState().updateVotesRegistry(newVotes);
}

/** Snapshots current votes into the game registry so in-game values remain stable. */
export function snapshotVotesForGame(): void {
  useVotesStore.getState().snapshotVotesForGame();
}

/** Toggles the game-active flag, which controls which registry is used for vote lookups. */
export function setGameActive(active: boolean): void {
  useVotesStore.getState().setGameActive(active);
}

/** Sets or clears the tournament-specific votes snapshot used during tournament matches. */
export function setTournamentVotesSnapshot(snapshot: Record<string, number> | null): void {
  useVotesStore.getState().setTournamentVotesSnapshot(snapshot);
}

/**
 * Subscribes a listener to vote store changes (for non-React consumers).
 * @returns An unsubscribe function
 */
export function subscribeToVotes(listener: () => void): () => void {
  return useVotesStore.subscribe(listener);
}

// --- React Hooks ---

/** React hook that returns the reactive vote count for a given card. */
export function useCardVotes(cardId: string): number {
  return useVotesStore((state) => {
    const baseId = stripCardSuffix(cardId);
    if (state.isGameActive && state.tournamentVotesSnapshot) {
      return state.tournamentVotesSnapshot[baseId] || 0;
    }
    return (state.isGameActive ? state.gameVotesRegistry[baseId] : state.votesRegistry[baseId]) || 0;
  });
}

/** React hook that returns whether a card is among the top-voted cards. */
export function useIsTopCard(cardId: string): boolean {
  return useVotesStore((state) => {
    const baseId = stripCardSuffix(cardId);
    return state.topCardsSet.has(baseId);
  });
}
