import { describe, it, expect, vi } from 'vitest';
import type { Card } from '../../../data/cards';
import type { PlayedCard } from '../../../lib/truco/types';

// Mock votesStore before importing engine
vi.mock('../../../lib/votesStore', () => ({
  getCardVotes: vi.fn((id: string) => {
    const votes: Record<string, number> = {
      'messi': 100,
      'mbappe': 90,
      'bellingham': 80,
      'yamal': 70,
      'kane': 60,
      'tied_player': 50,
      'tied_cpu': 50,
      'tied_hero1': 50,
      'tied_hero2': 50,
    };
    return votes[id.replace(/(_rem|_cpu)?_\d+$/, '')] || 0;
  }),
}));

import { calculateEnvido, getCardValue, determineWinner } from '../../../lib/truco/engine';

const makeCard = (overrides: Partial<Card>): Card => ({
  id: 'test',
  name: 'Test',
  env: 0,
  image: '',
  country: 'Argentina',
  club: 'Test FC',
  stickerNumber: 'TST 1',
  ...overrides,
});

describe('calculateEnvido', () => {
  it('returns 0 for empty hand', () => {
    expect(calculateEnvido([])).toBe(0);
  });

  it('returns 0 for null/undefined hand', () => {
    expect(calculateEnvido(null as unknown as Card[])).toBe(0);
    expect(calculateEnvido(undefined as unknown as Card[])).toBe(0);
  });

  it('returns single card env value', () => {
    const hand = [makeCard({ env: 7 })];
    expect(calculateEnvido(hand)).toBe(7);
  });

  it('returns max single env when no pair matches', () => {
    const hand = [
      makeCard({ id: 'a', env: 5, country: 'Argentina', club: 'Club A' }),
      makeCard({ id: 'b', env: 3, country: 'Brasil', club: 'Club B' }),
      makeCard({ id: 'c', env: 7, country: 'Francia', club: 'Club C' }),
    ];
    expect(calculateEnvido(hand)).toBe(7);
  });

  it('sums env values for same country pair', () => {
    const hand = [
      makeCard({ id: 'a', env: 5, country: 'Argentina', club: 'Club A' }),
      makeCard({ id: 'b', env: 7, country: 'Argentina', club: 'Club B' }),
      makeCard({ id: 'c', env: 2, country: 'Brasil', club: 'Club C' }),
    ];
    expect(calculateEnvido(hand)).toBe(12); // 5 + 7
  });

  it('sums env values for same club pair', () => {
    const hand = [
      makeCard({ id: 'a', env: 6, country: 'Argentina', club: 'Real Madrid' }),
      makeCard({ id: 'b', env: 4, country: 'Francia', club: 'Real Madrid' }),
      makeCard({ id: 'c', env: 1, country: 'Brasil', club: 'PSG' }),
    ];
    expect(calculateEnvido(hand)).toBe(10); // 6 + 4
  });

  it('picks the best pair when multiple pairs exist', () => {
    const hand = [
      makeCard({ id: 'a', env: 3, country: 'Argentina', club: 'Club A' }),
      makeCard({ id: 'b', env: 7, country: 'Argentina', club: 'Club B' }),
      makeCard({ id: 'c', env: 6, country: 'Argentina', club: 'Club C' }),
    ];
    // Pairs: a+b=10, a+c=9, b+c=13
    expect(calculateEnvido(hand)).toBe(13);
  });
});

describe('getCardValue', () => {
  it('returns vote count for a card', () => {
    const card = makeCard({ id: 'messi' });
    expect(getCardValue(card)).toBe(100);
  });

  it('returns 0 for card with no votes', () => {
    const card = makeCard({ id: 'unknown_player' });
    expect(getCardValue(card)).toBe(0);
  });
});

describe('determineWinner', () => {
  it('returns draw for empty played cards', () => {
    expect(determineWinner([])).toBe('draw');
  });

  it('returns the player with highest card value', () => {
    const played: PlayedCard[] = [
      { ...makeCard({ id: 'messi' }), owner: 'player', rotation: 0, x: 0, y: 0 },
      { ...makeCard({ id: 'mbappe' }), owner: 'cpu', rotation: 0, x: 0, y: 0 },
    ];
    expect(determineWinner(played)).toBe('player'); // messi=100 > mbappe=90
  });

  it('returns draw when tied across different teams', () => {
    const played: PlayedCard[] = [
      { ...makeCard({ id: 'tied_player' }), owner: 'player', rotation: 0, x: 0, y: 0 },
      { ...makeCard({ id: 'tied_cpu' }), owner: 'cpu', rotation: 0, x: 0, y: 0 },
    ];
    // Both have 50 votes = tie between different teams
    expect(determineWinner(played)).toBe('draw');
  });

  it('returns same-team winner when tied within same team', () => {
    const played: PlayedCard[] = [
      { ...makeCard({ id: 'tied_hero1' }), owner: 'player', rotation: 0, x: 0, y: 0 },
      { ...makeCard({ id: 'tied_hero2' }), owner: 'partner', rotation: 0, x: 0, y: 0 },
    ];
    // Both have 50 votes, both on "hero" team — same team tie returns first winner's owner
    expect(determineWinner(played)).toBe('player');
  });

  it('handles single card played', () => {
    const played: PlayedCard[] = [
      { ...makeCard({ id: 'bellingham' }), owner: 'cpu', rotation: 0, x: 0, y: 0 },
    ];
    expect(determineWinner(played)).toBe('cpu');
  });
});
