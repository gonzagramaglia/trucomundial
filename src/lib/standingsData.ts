import groupStandingsData from '../data/groupStandings.json';
import thirdPlaceStandingsData from '../data/thirdPlaceStandings.json';

/** Represents a team's standing within a group (points, goal difference, etc.). */
export interface GroupStanding {
  rank: number;
  team: string;
  pj: number;
  g: number;
  e: number;
  p: number;
  gf: number;
  gc: number;
  dg: number;
  pts: number;
  group?: string;
}

/** Group standings keyed by group name (e.g. "A", "B", etc.). */
export const groupStandings: Record<string, GroupStanding[]> = groupStandingsData as Record<string, GroupStanding[]>;

/** Standings of best third-placed teams across all groups. */
export const thirdPlaceStandings: GroupStanding[] = thirdPlaceStandingsData as GroupStanding[];
