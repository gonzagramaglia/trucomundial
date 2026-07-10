import type { FixtureMatch } from './fixtureData';

export interface BracketPlayer {
  name: string;
  flag: string;
  score: number | undefined;
}

export interface BracketMatch {
  p1: BracketPlayer;
  p2: BracketPlayer;
  id?: string;
}

type LiveResults = Record<string, { scoreA: number; scoreB: number; status: string }>;

/** FIFA bracket order for 16vos de final (Round of 32). */
export const R1_ORDER = [73, 75, 74, 77, 83, 84, 81, 82, 76, 78, 79, 80, 86, 88, 85, 87];

/** Explicit ID mapping for each knockout round. */
export const KNOCKOUT_IDS = [
  [89, 90, 93, 94, 91, 92, 95, 96],  // Octavos de final
  [97, 98, 99, 100],                   // Cuartos de final
  [101, 102],                           // Semifinales
  [104],                                // Final
];

/** Internal resolver that determines winner or loser of a bracket match. */
function resolveMatchResult(
  matchId: string | undefined,
  teamA: string, teamB: string,
  flagA: string, flagB: string,
  liveResults: LiveResults,
  side: 'winner' | 'loser'
): { team: string; flag: string } {
  if (!matchId) return { team: "?", flag: "" };
  const res = liveResults[matchId];
  if (!res || !res.status?.startsWith('finished')) return { team: "?", flag: "" };

  let winnerTeam: string;
  let winnerFlag: string;
  let loserTeam: string;
  let loserFlag: string;

  if (res.status?.startsWith('finished_penalties_A')) {
    winnerTeam = teamA; winnerFlag = flagA;
    loserTeam = teamB; loserFlag = flagB;
  } else if (res.status?.startsWith('finished_penalties_B')) {
    winnerTeam = teamB; winnerFlag = flagB;
    loserTeam = teamA; loserFlag = flagA;
  } else if (res.scoreA > res.scoreB) {
    winnerTeam = teamA; winnerFlag = flagA;
    loserTeam = teamB; loserFlag = flagB;
  } else if (res.scoreB > res.scoreA) {
    winnerTeam = teamB; winnerFlag = flagB;
    loserTeam = teamA; loserFlag = flagA;
  } else {
    // Draw with no penalty resolution
    return side === 'winner'
      ? { team: `${teamA}/${teamB}`, flag: "🏁" }
      : { team: "?", flag: "" };
  }

  return side === 'winner'
    ? { team: winnerTeam, flag: winnerFlag }
    : { team: loserTeam, flag: loserFlag };
}

/** Determines the winner of a bracket match based on live results. */
export function getMatchWinner(
  matchId: string | undefined,
  teamA: string, teamB: string,
  flagA: string, flagB: string,
  liveResults: LiveResults
): { team: string; flag: string } {
  return resolveMatchResult(matchId, teamA, teamB, flagA, flagB, liveResults, 'winner');
}

/** Determines the loser of a bracket match based on live results. */
export function getMatchLoser(
  matchId: string | undefined,
  teamA: string, teamB: string,
  flagA: string, flagB: string,
  liveResults: LiveResults
): { team: string; flag: string } {
  return resolveMatchResult(matchId, teamA, teamB, flagA, flagB, liveResults, 'loser');
}

/**
 * Builds the full bracket rounds array from fixture data and live results.
 * Returns 5 rounds: 16vos, Octavos, Cuartos, Semis, Final.
 */
export function buildBracketRounds(
  fixtureMatches: FixtureMatch[],
  liveResults: LiveResults
): BracketMatch[][] {
  const r1Matches = R1_ORDER.map(matchId => {
    const id = matchId.toString();
    const match = fixtureMatches.find(m => m.id === id);
    if (!match) return { teamA: "?", teamB: "?", flagA: "", flagB: "", id };
    return { teamA: match.teamA, teamB: match.teamB, flagA: match.flagA, flagB: match.flagB, id };
  });

  const rounds: BracketMatch[][] = [];
  let currentRoundMatches: BracketMatch[] = r1Matches.map(m => ({
    p1: { name: m.teamA, flag: m.flagA, score: undefined },
    p2: { name: m.teamB, flag: m.flagB, score: undefined },
    id: m.id
  }));

  for (let r = 0; r < 4; r++) {
    // Populate scores for current round
    currentRoundMatches.forEach(match => {
      if (match.id && liveResults[match.id]?.status?.startsWith('finished')) {
        match.p1.score = liveResults[match.id].scoreA;
        match.p2.score = liveResults[match.id].scoreB;
      }
    });
    rounds.push(currentRoundMatches);

    const nextRoundIds = KNOCKOUT_IDS[r];
    const nextRound: BracketMatch[] = [];
    for (let i = 0; i < currentRoundMatches.length / 2; i++) {
      const match1 = currentRoundMatches[i * 2];
      const match2 = currentRoundMatches[i * 2 + 1];

      const winner1 = getMatchWinner(match1.id, match1.p1.name, match1.p2.name, match1.p1.flag, match1.p2.flag, liveResults);
      const winner2 = getMatchWinner(match2.id, match2.p1.name, match2.p2.name, match2.p1.flag, match2.p2.flag, liveResults);

      const nextId = nextRoundIds[i]?.toString();
      const nextFixture = nextId ? fixtureMatches.find(m => m.id === nextId) : undefined;

      if (nextFixture) {
        nextRound.push({
          p1: { name: nextFixture.teamA, flag: nextFixture.flagA, score: undefined },
          p2: { name: nextFixture.teamB, flag: nextFixture.flagB, score: undefined },
          id: nextId
        });
      } else {
        nextRound.push({
          p1: { name: winner1.team, flag: winner1.flag, score: undefined },
          p2: { name: winner2.team, flag: winner2.flag, score: undefined },
          id: nextId
        });
      }
    }
    currentRoundMatches = nextRound;
  }

  // Process final match scores
  currentRoundMatches.forEach(match => {
    if (match.id && liveResults[match.id]?.status?.startsWith('finished')) {
      match.p1.score = liveResults[match.id].scoreA;
      match.p2.score = liveResults[match.id].scoreB;
    }
  });
  rounds.push(currentRoundMatches);

  return rounds;
}
