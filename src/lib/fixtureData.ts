import fixtureMatchesData from '../data/fixtureMatches.json';

/** Represents a single match in the World Cup fixture. */
export interface FixtureMatch {
  id: string;
  date: string;
  time: string;
  group: string;
  teamA: string;
  flagA: string;
  teamB: string;
  flagB: string;
  status: 'upcoming' | 'live' | 'finished' | 'finished_penalties_A' | 'finished_penalties_B';
  scoreA?: number;
  scoreB?: number;
}

/** All fixture matches loaded from static JSON data. */
export const fixtureMatches: FixtureMatch[] = fixtureMatchesData as FixtureMatch[];
