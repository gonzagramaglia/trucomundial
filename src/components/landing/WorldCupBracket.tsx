import React from 'react';
import { Trophy } from 'lucide-react';
import type { FixtureMatch } from '../../lib/fixtureData';
import { useTranslation } from 'react-i18next';
import { ExternalLink } from 'lucide-react';

interface WorldCupBracketProps {
  fixtureMatches: FixtureMatch[];
  liveResults: Record<string, { scoreA: number; scoreB: number; status: string }>;
}

export const WorldCupBracket: React.FC<WorldCupBracketProps> = ({ fixtureMatches, liveResults }) => {
  const { t } = useTranslation();
  const roundNames = [t("bracket_round_32"), t("bracket_round_16"), t("bracket_quarterfinals"), t("bracket_semifinals")];
  
  // R1: 16 matches (73 to 88)
  const r1Matches = Array.from({ length: 16 }, (_, i) => {
    const id = (73 + i).toString();
    const match = fixtureMatches.find(m => m.id === id);
    if (!match) return { teamA: "?", teamB: "?", flagA: "", flagB: "" };
    return {
      teamA: match.teamA,
      teamB: match.teamB,
      flagA: match.flagA,
      flagB: match.flagB,
      id
    };
  });

  const getWinner = (matchId: string | undefined, teamA: string, teamB: string, flagA: string, flagB: string) => {
    if (!matchId) return { team: "?", flag: "" };
    const res = liveResults[matchId];
    if (res && res.status === 'finished') {
      if (res.scoreA > res.scoreB) return { team: teamA, flag: flagA };
      if (res.scoreB > res.scoreA) return { team: teamB, flag: flagB };
      return { team: `${teamA}/${teamB}`, flag: "🏁" };
    }
    return { team: "?", flag: "" };
  };

  const buildRounds = () => {
    const rounds = [];
    let currentRoundMatches = r1Matches.map(m => ({
      p1: { name: m.teamA, flag: m.flagA, score: undefined as number | undefined },
      p2: { name: m.teamB, flag: m.flagB, score: undefined as number | undefined },
      id: m.id
    }));

    let nextMatchId = 89;
    
    for (let r = 0; r < 4; r++) { // 4 iterations to build 5 rounds
      // Populate scores for current round
      currentRoundMatches.forEach(match => {
         if (match.id && liveResults[match.id]?.status === 'finished') {
           match.p1.score = liveResults[match.id].scoreA;
           match.p2.score = liveResults[match.id].scoreB;
         }
      });
      rounds.push(currentRoundMatches);

      const nextRound = [];
      for (let i = 0; i < currentRoundMatches.length / 2; i++) {
        const match1 = currentRoundMatches[i * 2];
        const match2 = currentRoundMatches[i * 2 + 1];
        
        const winner1 = getWinner(match1.id, match1.p1.name, match1.p2.name, match1.p1.flag, match1.p2.flag);
        const winner2 = getWinner(match2.id, match2.p1.name, match2.p2.name, match2.p1.flag, match2.p2.flag);
        
        nextRound.push({
          p1: { name: winner1.team, flag: winner1.flag, score: undefined as number | undefined },
          p2: { name: winner2.team, flag: winner2.flag, score: undefined as number | undefined },
          id: nextMatchId <= 104 ? nextMatchId.toString() : undefined
        });
        
        if (nextMatchId === 102) {
          nextMatchId = 104;
        } else {
          nextMatchId++;
        }
      }
      currentRoundMatches = nextRound;
    }
    
    // Process final match scores
    currentRoundMatches.forEach(match => {
      if (match.id && liveResults[match.id]?.status === 'finished') {
        match.p1.score = liveResults[match.id].scoreA;
        match.p2.score = liveResults[match.id].scoreB;
      }
    });
    rounds.push(currentRoundMatches);
    
    return rounds;
  };

  const rounds = buildRounds();
  const finalMatch = rounds[4][0];
  const champion = getWinner(finalMatch.id, finalMatch.p1.name, finalMatch.p2.name, finalMatch.p1.flag, finalMatch.p2.flag);

  // Divide the first 4 rounds into Left (0 to half) and Right (half to end)
  const leftRounds = rounds.slice(0, 4).map(r => r.slice(0, r.length / 2));
  const rightRounds = rounds.slice(0, 4).map(r => r.slice(r.length / 2));
  
  // Right side needs to be rendered from Semis (idx 3) down to 16vos (idx 0)
  // to converge to the center visually.
  const reversedRightRounds = [...rightRounds].reverse();
  const reversedRoundNames = [...roundNames].reverse();

  const renderMatchBox = (match: any, isRight: boolean, isFinal: boolean = false) => (
    <div style={{
      border: isFinal ? "2px solid rgba(251, 191, 36, 0.5)" : "1px solid rgba(255, 255, 255, 0.08)",
      borderRadius: "0.75rem",
      overflow: "hidden",
      background: isFinal ? "rgba(251, 191, 36, 0.1)" : "rgba(255,255,255,0.02)",
      position: "relative",
      boxShadow: isFinal ? "0 0 20px rgba(251, 191, 36, 0.2)" : "none",
      width: "100%",
    }}>
      {[match.p1, match.p2].map((p: any, pIdx: number) => (
        <div key={pIdx} style={{
          padding: "0.5rem 0.75rem",
          borderTop: pIdx === 0 ? "none" : "1px solid rgba(255, 255, 255, 0.05)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexDirection: isRight ? "row-reverse" : "row",
          gap: "0.5rem",
          fontSize: "0.85rem",
          fontWeight: p.name !== "?" ? 700 : 500,
          color: p.name !== "?" ? (isFinal ? "#fbbf24" : "#fff") : "rgba(255,255,255,0.3)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", overflow: "hidden" }}>
            {p.flag && <span style={{ fontSize: "1rem" }}>{p.flag}</span>}
            <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {p.name === 'Bosnia & Herzegovina' ? 'Bosnia & Herz' : p.name}
            </span>
          </div>
          {p.score !== undefined && (
            <div style={{
              fontWeight: 900,
              color: isFinal ? "#fbbf24" : "#00f2ff",
              marginLeft: isRight ? "0" : "0.5rem",
              marginRight: isRight ? "0.5rem" : "0",
            }}>
              {p.score}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div style={{
      background: "rgba(14, 10, 24, 0.4)",
      border: "1px solid rgba(0, 242, 255, 0.15)",
      borderRadius: "1.5rem",
      padding: typeof window !== 'undefined' && window.innerWidth < 768 ? "1rem" : "2rem",
      width: "100%",
      display: "flex",
      flexDirection: "column",
      gap: "1.5rem",
      marginTop: "5rem",
      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)"
    }}>
      <div style={{ textAlign: 'center' }}>
        <h3 className="text-display" style={{ margin: 0, fontSize: "1.6rem", color: "#00f2ff", textShadow: "0 0 10px rgba(0, 242, 255, 0.3)" }}>
          {t("bracket_title")}
        </h3>
        <div style={{ opacity: 0.6, fontSize: "0.9rem", marginTop: "0.2rem", fontWeight: 600 }}>
          {t("bracket_subtitle")}
        </div>
      </div>

      <div style={{ overflowX: "auto", paddingBottom: "1rem", scrollbarWidth: "none", msOverflowStyle: "none" }}>
        <div style={{ display: "flex", gap: "1rem", alignItems: "stretch", minWidth: "1200px", margin: "0 auto", padding: "0 1rem" }}>
          
          {/* LEFT SIDE */}
          <div style={{ display: "flex", gap: "0", flex: 1 }}>
            {leftRounds.map((round, roundIdx) => (
              <div key={roundIdx} style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: "170px" }}>
                <div style={{
                  fontSize: "0.75rem", fontWeight: 900, color: "#00f2ff",
                  textTransform: "uppercase", letterSpacing: "0.05em",
                  textAlign: "center", paddingBottom: "1rem", opacity: 0.8,
                }}>
                  {roundNames[roundIdx]}
                </div>
                <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                  {round.map((match, matchIdx) => (
                    <div key={matchIdx} style={{
                      flex: 1, display: "flex", flexDirection: "column",
                      justifyContent: "center", padding: "0.5rem 0", position: "relative"
                    }}>
                      {/* Left Connector (Incoming) */}
                      {roundIdx > 0 && (
                        <div style={{ position: "absolute", left: 0, top: "50%", width: "10px", height: "2px", background: "rgba(0, 242, 255, 0.2)" }} />
                      )}
                      
                      <div style={{ padding: "0 10px" }}>
                        {renderMatchBox(match, false)}
                      </div>

                      {/* Right Connector (Outgoing) */}
                      {roundIdx < leftRounds.length && (
                        <div style={{ position: "absolute", right: 0, top: "50%", width: "10px", height: "2px", background: "rgba(0, 242, 255, 0.2)" }} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* CENTER - FINAL & CHAMPION */}
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", minWidth: "200px", padding: "0 1rem" }}>
             <div style={{ fontSize: "0.8rem", fontWeight: 900, color: "#fbbf24", textAlign: "center", marginBottom: "0.75rem", textTransform: "uppercase" }}>
                {t("grand_final")}
             </div>
             
             {/* Final Match */}
             <div style={{ marginBottom: "1.5rem" }}>
               {renderMatchBox(finalMatch, false, true)}
             </div>

             <div style={{ fontSize: "0.8rem", fontWeight: 900, color: "#fbbf24", textAlign: "center", marginBottom: "0.75rem", textTransform: "uppercase" }}>
               {t("champion")}
             </div>
             <div style={{
                background: "rgba(251, 191, 36, 0.1)", border: "2px solid rgba(251, 191, 36, 0.4)",
                borderRadius: "1rem", padding: "1rem", display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", gap: "0.5rem",
                boxShadow: champion.team !== "?" ? "0 0 20px rgba(251, 191, 36, 0.2)" : "none"
             }}>
                <Trophy size={28} color="#fbbf24" />
                {champion.team !== "?" ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 800, color: "#fbbf24" }}>
                    <span>{champion.flag}</span>
                    <span>{champion.team === 'Bosnia & Herzegovina' ? 'Bosnia & Herz' : champion.team}</span>
                  </div>
                ) : (
                  <span style={{ color: "#fbbf24", fontWeight: 800, fontSize: "1rem" }}>?</span>
                )}
             </div>
          </div>

          {/* RIGHT SIDE */}
          <div style={{ display: "flex", gap: "0", flex: 1 }}>
            {reversedRightRounds.map((round, rIdx) => {
              return (
                <div key={rIdx} style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: "170px" }}>
                  <div style={{
                    fontSize: "0.75rem", fontWeight: 900, color: "#00f2ff",
                    textTransform: "uppercase", letterSpacing: "0.05em",
                    textAlign: "center", paddingBottom: "1rem", opacity: 0.8,
                  }}>
                    {reversedRoundNames[rIdx]}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                    {round.map((match, matchIdx) => (
                      <div key={matchIdx} style={{
                        flex: 1, display: "flex", flexDirection: "column",
                        justifyContent: "center", padding: "0.5rem 0", position: "relative"
                      }}>
                        {/* Left Connector (Outgoing to center) */}
                        {rIdx > 0 && (
                          <div style={{ position: "absolute", left: 0, top: "50%", width: "10px", height: "2px", background: "rgba(0, 242, 255, 0.2)" }} />
                        )}
                        
                        <div style={{ padding: "0 10px" }}>
                          {renderMatchBox(match, true)}
                        </div>

                        {/* Right Connector (Incoming from outside) */}
                        {rIdx < reversedRightRounds.length - 1 && (
                          <div style={{ position: "absolute", right: 0, top: "50%", width: "10px", height: "2px", background: "rgba(0, 242, 255, 0.2)" }} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* Official Link */}
      <div style={{ textAlign: "center", padding: "1rem 0 0.5rem 0", borderTop: "1px solid rgba(255, 255, 255, 0.05)" }}>
        <a 
          href="https://www.fifa.com/es/tournaments/mens/worldcup/canadamexicousa2026/standings"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            color: "#00f2ff",
            fontSize: "0.85rem",
            textDecoration: "none",
            opacity: 0.8,
            transition: "opacity 0.2s"
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = "1"}
          onMouseLeave={(e) => e.currentTarget.style.opacity = "0.8"}
        >
          <ExternalLink size={14} />
          {t("official_bracket_link")}
        </a>
      </div>

    </div>
  );
};
