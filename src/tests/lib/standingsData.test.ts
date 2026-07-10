import { describe, it, expect } from 'vitest';
import { groupStandings, thirdPlaceStandings, type GroupStanding } from '../../lib/standingsData';

describe('standingsData', () => {
  describe('groupStandings', () => {
    it('loads group standings from JSON', () => {
      expect(groupStandings).toBeDefined();
      expect(typeof groupStandings).toBe('object');
    });

    it('contains 12 groups (A-L)', () => {
      const groups = Object.keys(groupStandings);
      expect(groups.length).toBe(12);
    });

    it('each group has 4 teams', () => {
      Object.entries(groupStandings).forEach(([_group, teams]) => {
        expect(teams.length).toBe(4);
      });
    });

    it('each standing has required numeric fields', () => {
      Object.values(groupStandings).flat().forEach((team: GroupStanding) => {
        expect(typeof team.rank).toBe('number');
        expect(typeof team.team).toBe('string');
        expect(typeof team.pj).toBe('number');
        expect(typeof team.g).toBe('number');
        expect(typeof team.e).toBe('number');
        expect(typeof team.p).toBe('number');
        expect(typeof team.gf).toBe('number');
        expect(typeof team.gc).toBe('number');
        expect(typeof team.dg).toBe('number');
        expect(typeof team.pts).toBe('number');
      });
    });

    it('points = wins*3 + draws*1', () => {
      Object.values(groupStandings).flat().forEach((team: GroupStanding) => {
        expect(team.pts).toBe(team.g * 3 + team.e);
      });
    });

    it('games played = wins + draws + losses', () => {
      Object.values(groupStandings).flat().forEach((team: GroupStanding) => {
        expect(team.pj).toBe(team.g + team.e + team.p);
      });
    });

    it('goal difference = gf - gc', () => {
      Object.values(groupStandings).flat().forEach((team: GroupStanding) => {
        expect(team.dg).toBe(team.gf - team.gc);
      });
    });
  });

  describe('thirdPlaceStandings', () => {
    it('loads third place standings from JSON', () => {
      expect(thirdPlaceStandings).toBeDefined();
      expect(Array.isArray(thirdPlaceStandings)).toBe(true);
    });

    it('contains 12 third-placed teams', () => {
      expect(thirdPlaceStandings.length).toBe(12);
    });

    it('each entry has a group field', () => {
      thirdPlaceStandings.forEach((team: GroupStanding) => {
        expect(team.group).toBeDefined();
        expect(typeof team.group).toBe('string');
      });
    });

    it('is sorted by rank', () => {
      for (let i = 0; i < thirdPlaceStandings.length - 1; i++) {
        expect(thirdPlaceStandings[i].rank).toBeLessThanOrEqual(thirdPlaceStandings[i + 1].rank);
      }
    });
  });
});
