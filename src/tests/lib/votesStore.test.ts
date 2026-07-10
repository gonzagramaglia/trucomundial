import { describe, it, expect, beforeEach } from 'vitest';
import {
  updateVotesRegistry,
  getCardVotes,
  isTopCard,
  snapshotVotesForGame,
  setGameActive,
  setTournamentVotesSnapshot,
  votesRegistry,
} from '../../lib/votesStore';

describe('votesStore', () => {
  beforeEach(() => {
    // Reset state
    setGameActive(false);
    setTournamentVotesSnapshot(null);
    updateVotesRegistry({});
  });

  describe('updateVotesRegistry', () => {
    it('updates the registry with new votes', () => {
      updateVotesRegistry({ messi: 100, mbappe: 90 });
      expect(getCardVotes('messi')).toBe(100);
      expect(getCardVotes('mbappe')).toBe(90);
    });

    it('replaces previous votes entirely', () => {
      updateVotesRegistry({ messi: 100 });
      updateVotesRegistry({ mbappe: 50 });
      expect(getCardVotes('messi')).toBe(0);
      expect(getCardVotes('mbappe')).toBe(50);
    });

    it('syncs the mutable votesRegistry export', () => {
      updateVotesRegistry({ messi: 42 });
      expect(votesRegistry['messi']).toBe(42);
    });
  });

  describe('getCardVotes', () => {
    it('returns 0 for unknown card', () => {
      updateVotesRegistry({ messi: 100 });
      expect(getCardVotes('nonexistent')).toBe(0);
    });

    it('strips _rem_TIMESTAMP suffix', () => {
      updateVotesRegistry({ messi: 100 });
      expect(getCardVotes('messi_rem_1234567890')).toBe(100);
    });

    it('strips _cpu_TIMESTAMP suffix', () => {
      updateVotesRegistry({ mbappe: 90 });
      expect(getCardVotes('mbappe_cpu_9876543210')).toBe(90);
    });

    it('does not strip underscores in card id (e.g. nico_williams)', () => {
      updateVotesRegistry({ nico_williams: 75 });
      expect(getCardVotes('nico_williams')).toBe(75);
    });

    it('uses gameVotesRegistry when game is active', () => {
      updateVotesRegistry({ messi: 100 });
      snapshotVotesForGame();
      setGameActive(true);
      // Update live registry (shouldn't affect in-game value)
      updateVotesRegistry({ messi: 200 });
      expect(getCardVotes('messi')).toBe(100); // snapshot value
    });

    it('uses tournamentVotesSnapshot when game active and snapshot set', () => {
      updateVotesRegistry({ messi: 100 });
      snapshotVotesForGame();
      setGameActive(true);
      setTournamentVotesSnapshot({ messi: 55 });
      expect(getCardVotes('messi')).toBe(55);
    });
  });

  describe('isTopCard', () => {
    it('identifies top voted cards correctly', () => {
      // Need enough high-value cards to create a meaningful cutoff
      // calculateTopCards uses index 5 (6th position) as cutoff
      updateVotesRegistry({
        messi: 999,
        mbappe: 998,
        bellingham: 997,
        yamal: 996,
        kane: 995,
        saka: 994,
      });
      expect(isTopCard('messi')).toBe(true);
      expect(isTopCard('saka')).toBe(true);
      // A card not in registry should have 0 votes, below cutoff of 994
      expect(isTopCard('dibu')).toBe(false);
    });
  });

  describe('snapshotVotesForGame', () => {
    it('freezes current votes for game use', () => {
      updateVotesRegistry({ messi: 100, mbappe: 90 });
      snapshotVotesForGame();
      setGameActive(true);
      expect(getCardVotes('messi')).toBe(100);
      expect(getCardVotes('mbappe')).toBe(90);
    });
  });
});
