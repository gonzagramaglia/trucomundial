import React from "react";
import { Trophy, Calendar, Scroll } from "lucide-react";
import type { MatchSummary } from "./types"; // Will need to define/export MatchSummary or import it

interface MatchesTabProps {
  history: MatchSummary[];
  formatDate: (dateStr: string) => string;
  setSelectedMatch: (match: MatchSummary) => void;
  isMobile: boolean;
}

export const MatchesTab: React.FC<MatchesTabProps> = ({
  history,
  formatDate,
  setSelectedMatch,
  isMobile,
}) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {history.map((match) => {
        const playerWon = match.winner === "player";
        return (
          <div
            key={match.id}
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "1.5rem",
              padding: "1.5rem",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "1rem",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "0.7rem",
                  fontFamily: "monospace",
                  opacity: 0.5,
                  marginBottom: "0.5rem",
                }}
              >
                Match: {match.match_id}
              </div>
              {match.isTournament && (
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.3rem",
                    background: "rgba(255, 120, 0, 0.15)",
                    border: "1px solid rgba(255, 120, 0, 0.3)",
                    color: "#ff7800",
                    padding: "0.2rem 0.6rem",
                    borderRadius: "0.4rem",
                    fontSize: "0.65rem",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    marginBottom: "0.5rem"
                  }}
                >
                  <Trophy size={10} /> Torneo: {match.tournamentName}
                </div>
              )}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontWeight: 800,
                  fontSize: "1.1rem",
                }}
              >
                <span style={{ color: playerWon ? "#10b981" : "#fff" }}>
                  Player
                </span>
                <span style={{ opacity: 0.3 }}>vs</span>
                <span style={{ color: !playerWon ? "#ef4444" : "#fff" }}>
                  {match.rivalName}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  opacity: 0.5,
                  fontSize: "0.75rem",
                  marginTop: "0.5rem",
                }}
              >
                <Calendar size={12} />
                {formatDate(match.date)}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "2rem",
              }}
            >
              <div style={{ fontSize: "1.75rem", fontWeight: 900 }}>
                <span style={{ color: playerWon ? "#10b981" : "#fff" }}>
                  {match.myScore}
                </span>
                <span style={{ opacity: 0.3, margin: "0 0.5rem" }}>
                  -
                </span>
                <span style={{ color: !playerWon ? "#ef4444" : "#fff" }}>
                  {match.rivalScore}
                </span>
              </div>

              <button
                onClick={() => setSelectedMatch(match)}
                className="btn-hover-dark"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "#fff",
                  height: "38px",
                  borderRadius: "0.85rem",
                  padding: "0 1rem",
                  fontSize: "0.8rem",
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  cursor: "pointer",
                  boxShadow: "3px 3px 0px #000",
                }}
              >
                <Scroll size={14} />
                {isMobile ? "" : "Log"}
              </button>
            </div>
          </div>
        );
      })}
      {history.length === 0 && (
        <div
          style={{ textAlign: "center", padding: "2rem 0", opacity: 0.5 }}
        >
          No hay partidas globales registradas.
        </div>
      )}
    </div>
  );
};
