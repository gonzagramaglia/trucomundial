import { describe, it, expect } from 'vitest';
import { fixtureMatches, type FixtureMatch } from '../../lib/fixtureData';

describe('fixtureData', () => {
  it('loads fixture matches from JSON', () => {
    expect(fixtureMatches).toBeDefined();
    expect(Array.isArray(fixtureMatches)).toBe(true);
    expect(fixtureMatches.length).toBeGreaterThan(0);
  });

  it('each match has required fields', () => {
    fixtureMatches.forEach((match: FixtureMatch) => {
      expect(match.id).toBeDefined();
      expect(typeof match.id).toBe('string');
      expect(match.teamA).toBeDefined();
      expect(match.teamB).toBeDefined();
      expect(match.flagA).toBeDefined();
      expect(match.flagB).toBeDefined();
      expect(match.date).toBeDefined();
      expect(match.time).toBeDefined();
      expect(match.group).toBeDefined();
      expect(match.status).toBeDefined();
    });
  });

  it('has valid status values', () => {
    const validStatuses = ['upcoming', 'live', 'finished', 'finished_penalties_A', 'finished_penalties_B'];
    fixtureMatches.forEach((match: FixtureMatch) => {
      expect(validStatuses).toContain(match.status);
    });
  });

  it('has unique IDs', () => {
    const ids = fixtureMatches.map(m => m.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('contains quarterfinal matches (IDs 97-100)', () => {
    const qfIds = ['97', '98', '99', '100'];
    qfIds.forEach(id => {
      const match = fixtureMatches.find(m => m.id === id);
      expect(match).toBeDefined();
      expect(match!.group).toBe('Cuartos de final');
    });
  });

  it('finished matches have scores', () => {
    fixtureMatches
      .filter(m => m.status.startsWith('finished'))
      .forEach(match => {
        expect(match.scoreA).toBeDefined();
        expect(match.scoreB).toBeDefined();
        expect(typeof match.scoreA).toBe('number');
        expect(typeof match.scoreB).toBe('number');
      });
  });
});
