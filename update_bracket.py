import os

path_bracket = "src/components/landing/WorldCupBracket.tsx"
with open(path_bracket, "r") as f:
    text_bracket = f.read()

s1 = """  const rounds = buildBracketRounds(fixtureMatches, liveResults);
  const finalMatch = rounds[4][0];
  const champion = getMatchWinner(finalMatch.id, finalMatch.p1.name, finalMatch.p2.name, finalMatch.p1.flag, finalMatch.p2.flag, liveResults);

  const semi1 = rounds[3][0];
  const semi2 = rounds[3][1];
  const thirdPlaceParticipant1 = getMatchLoser(semi1.id, semi1.p1.name, semi1.p2.name, semi1.p1.flag, semi1.p2.flag, liveResults);
  const thirdPlaceParticipant2 = getMatchLoser(semi2.id, semi2.p1.name, semi2.p2.name, semi2.p1.flag, semi2.p2.flag, liveResults);
  
  const thirdPlaceMatch = {
    id: "103",
    p1: { name: thirdPlaceParticipant1.team, flag: thirdPlaceParticipant1.flag, score: liveResults["103"]?.scoreA },
    p2: { name: thirdPlaceParticipant2.team, flag: thirdPlaceParticipant2.flag, score: liveResults["103"]?.scoreB }
  };"""

s1_rep = """  const rounds = buildBracketRounds(fixtureMatches, liveResults);
  const finalMatch = rounds[4][0];
  const champion = getMatchWinner(finalMatch.id, finalMatch.p1.name, finalMatch.p2.name, finalMatch.p1.flag, finalMatch.p2.flag, liveResults, fixtureMatches);

  const semi1 = rounds[3][0];
  const semi2 = rounds[3][1];
  const thirdPlaceParticipant1 = getMatchLoser(semi1.id, semi1.p1.name, semi1.p2.name, semi1.p1.flag, semi1.p2.flag, liveResults, fixtureMatches);
  const thirdPlaceParticipant2 = getMatchLoser(semi2.id, semi2.p1.name, semi2.p2.name, semi2.p1.flag, semi2.p2.flag, liveResults, fixtureMatches);
  
  const thirdPlaceMatchObj = fixtureMatches.find(m => m.id === "103");
  const thirdLive = liveResults["103"];
  const thirdScoreA = thirdLive?.status?.startsWith('finished') ? thirdLive.scoreA : thirdPlaceMatchObj?.scoreA;
  const thirdScoreB = thirdLive?.status?.startsWith('finished') ? thirdLive.scoreB : thirdPlaceMatchObj?.scoreB;

  const thirdPlaceMatch = {
    id: "103",
    p1: { name: thirdPlaceParticipant1.team, flag: thirdPlaceParticipant1.flag, score: thirdScoreA },
    p2: { name: thirdPlaceParticipant2.team, flag: thirdPlaceParticipant2.flag, score: thirdScoreB }
  };"""

if s1 in text_bracket:
    text_bracket = text_bracket.replace(s1, s1_rep)
    with open(path_bracket, "w") as f:
        f.write(text_bracket)


path_logic = "src/lib/bracketLogic.ts"
with open(path_logic, "r") as f:
    text_logic = f.read()


s2 = """function resolveMatchResult(
  matchId: string | undefined,
  teamA: string, teamB: string,
  flagA: string, flagB: string,
  liveResults: LiveResults,
  side: 'winner' | 'loser'
): { team: string; flag: string } {
  if (!matchId) return { team: "?", flag: "" };
  const res = liveResults[matchId];
  if (!res || !res.status?.startsWith('finished')) return { team: "?", flag: "" };"""

s2_rep = """function resolveMatchResult(
  matchId: string | undefined,
  teamA: string, teamB: string,
  flagA: string, flagB: string,
  liveResults: LiveResults,
  side: 'winner' | 'loser',
  fixtureMatches: FixtureMatch[]
): { team: string; flag: string } {
  if (!matchId) return { team: "?", flag: "" };
  
  let res: any = liveResults[matchId];
  if (!res || !res.status?.startsWith('finished')) {
    const fix = fixtureMatches.find(m => m.id === matchId);
    if (fix && fix.status?.startsWith('finished')) {
      res = { scoreA: fix.scoreA!, scoreB: fix.scoreB!, status: fix.status };
    } else {
      return { team: "?", flag: "" };
    }
  }"""

if s2 in text_logic:
    text_logic = text_logic.replace(s2, s2_rep)

text_logic = text_logic.replace(
    "export function getMatchWinner(\n  matchId: string | undefined,\n  teamA: string, teamB: string,\n  flagA: string, flagB: string,\n  liveResults: LiveResults\n): { team: string; flag: string } {\n  return resolveMatchResult(matchId, teamA, teamB, flagA, flagB, liveResults, 'winner');\n}",
    "export function getMatchWinner(\n  matchId: string | undefined,\n  teamA: string, teamB: string,\n  flagA: string, flagB: string,\n  liveResults: LiveResults,\n  fixtureMatches: FixtureMatch[]\n): { team: string; flag: string } {\n  return resolveMatchResult(matchId, teamA, teamB, flagA, flagB, liveResults, 'winner', fixtureMatches);\n}"
)

text_logic = text_logic.replace(
    "export function getMatchLoser(\n  matchId: string | undefined,\n  teamA: string, teamB: string,\n  flagA: string, flagB: string,\n  liveResults: LiveResults\n): { team: string; flag: string } {\n  return resolveMatchResult(matchId, teamA, teamB, flagA, flagB, liveResults, 'loser');\n}",
    "export function getMatchLoser(\n  matchId: string | undefined,\n  teamA: string, teamB: string,\n  flagA: string, flagB: string,\n  liveResults: LiveResults,\n  fixtureMatches: FixtureMatch[]\n): { team: string; flag: string } {\n  return resolveMatchResult(matchId, teamA, teamB, flagA, flagB, liveResults, 'loser', fixtureMatches);\n}"
)

text_logic = text_logic.replace(
    "const winner1 = getMatchWinner(match1.id, match1.p1.name, match1.p2.name, match1.p1.flag, match1.p2.flag, liveResults);",
    "const winner1 = getMatchWinner(match1.id, match1.p1.name, match1.p2.name, match1.p1.flag, match1.p2.flag, liveResults, fixtureMatches);"
)

text_logic = text_logic.replace(
    "const winner2 = getMatchWinner(match2.id, match2.p1.name, match2.p2.name, match2.p1.flag, match2.p2.flag, liveResults);",
    "const winner2 = getMatchWinner(match2.id, match2.p1.name, match2.p2.name, match2.p1.flag, match2.p2.flag, liveResults, fixtureMatches);"
)

s3 = """    // Populate scores for current round
    currentRoundMatches.forEach(match => {
      if (match.id && liveResults[match.id]?.status?.startsWith('finished')) {
        match.p1.score = liveResults[match.id].scoreA;
        match.p2.score = liveResults[match.id].scoreB;
      }
    });"""

s3_rep = """    // Populate scores for current round
    currentRoundMatches.forEach(match => {
      if (match.id) {
        if (liveResults[match.id]?.status?.startsWith('finished')) {
          match.p1.score = liveResults[match.id].scoreA;
          match.p2.score = liveResults[match.id].scoreB;
        } else {
          const fix = fixtureMatches.find(m => m.id === match.id);
          if (fix && fix.status?.startsWith('finished')) {
            match.p1.score = fix.scoreA;
            match.p2.score = fix.scoreB;
          }
        }
      }
    });"""

text_logic = text_logic.replace(s3, s3_rep)

s4 = """  // Process final match scores
  currentRoundMatches.forEach(match => {
    if (match.id && liveResults[match.id]?.status?.startsWith('finished')) {
      match.p1.score = liveResults[match.id].scoreA;
      match.p2.score = liveResults[match.id].scoreB;
    }
  });"""

s4_rep = """  // Process final match scores
  currentRoundMatches.forEach(match => {
    if (match.id) {
      if (liveResults[match.id]?.status?.startsWith('finished')) {
        match.p1.score = liveResults[match.id].scoreA;
        match.p2.score = liveResults[match.id].scoreB;
      } else {
        const fix = fixtureMatches.find(m => m.id === match.id);
        if (fix && fix.status?.startsWith('finished')) {
          match.p1.score = fix.scoreA;
          match.p2.score = fix.scoreB;
        }
      }
    }
  });"""

text_logic = text_logic.replace(s4, s4_rep)

with open(path_logic, "w") as f:
    f.write(text_logic)

print("Updated bracket files")
