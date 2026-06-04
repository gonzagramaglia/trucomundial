import React, { useState } from "react";
import { Scroll, X, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { MatchRow } from "../../../lib/matches";

interface TournamentMatchHistoryProps {
  finishedMatches: MatchRow[];
  nameMap: Record<string, string>;
}

export const TournamentMatchHistory: React.FC<TournamentMatchHistoryProps> = ({ finishedMatches, nameMap }) => {
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  if (!finishedMatches) return null;

  return (
    <div
      style={{
        background: "rgba(30, 15, 50, 0.35)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "2.25rem",
        padding: "2rem",
        backdropFilter: "blur(8px)",
        marginTop: "2.5rem",
      }}
    >
      <h3
        className="text-display"
        style={{
          fontSize: "1.4rem",
          margin: "0 0 1.5rem 0",
          color: "#a855f7",
          letterSpacing: "0.05em",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem"
        }}
      >
        <Scroll size={20} color="#a855f7" /> Historial de Partidas
      </h3>

      {finishedMatches.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "2rem",
          opacity: 0.6,
          fontStyle: "italic",
          color: "#fff"
        }}>
          Aún no se ha jugado ninguna partida en este torneo.
        </div>
      ) : (
        <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
          {finishedMatches.map((m) => {
            const logData = m.log as any;
            if (!logData) return null;

            const playerAName = nameMap[m.player_a_id!] || `Jugador ${m.player_a_id?.slice(0, 5)}`;
            const playerBName = nameMap[m.player_b_id!] || `Jugador ${m.player_b_id?.slice(0, 5)}`;
            const aWon = m.winner_id === m.player_a_id;
            const bWon = m.winner_id === m.player_b_id;

            return (
              <div
                key={m.id}
                style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "1.25rem",
                  padding: "1.25rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: "0.75rem", opacity: 0.5, textTransform: "uppercase", fontWeight: 900, letterSpacing: "0.05em" }}>
                    Ronda {m.round}
                  </div>
                  <div style={{ fontSize: "0.75rem", opacity: 0.5 }}>
                    {new Date(m.ended_at!).toLocaleDateString()}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ flex: 1, textAlign: "right", fontWeight: aWon ? 900 : 500, color: aWon ? "#10b981" : "#fff" }}>
                    {aWon && <Trophy size={12} style={{ color: "#ffd700", marginRight: "0.25rem", display: "inline" }} />}
                    {playerAName}
                  </div>
                  <div style={{ padding: "0 1rem", fontSize: "0.8rem", opacity: 0.3 }}>vs</div>
                  <div style={{ flex: 1, textAlign: "left", fontWeight: bWon ? 900 : 500, color: bWon ? "#10b981" : "#fff" }}>
                    {playerBName}
                    {bWon && <Trophy size={12} style={{ color: "#ffd700", marginLeft: "0.25rem", display: "inline" }} />}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedLog(logData)}
                  className="btn-hover-dark"
                  style={{
                    background: "rgba(168, 85, 247, 0.15)",
                    border: "1px solid rgba(168, 85, 247, 0.3)",
                    color: "#d8b4fe",
                    padding: "0.6rem",
                    borderRadius: "0.85rem",
                    fontSize: "0.8rem",
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.4rem",
                    cursor: "pointer",
                    marginTop: "0.5rem"
                  }}
                >
                  <Scroll size={14} /> Ver Registro (Replay)
                </button>
              </div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {selectedLog && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0, 0, 0, 0.85)",
              backdropFilter: "blur(8px)",
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "1rem",
            }}
            onClick={() => setSelectedLog(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "linear-gradient(180deg, #1e0f32 0%, #130a1f 100%)",
                border: "1px solid rgba(168, 85, 247, 0.3)",
                borderRadius: "1.5rem",
                width: "100%",
                maxWidth: "600px",
                maxHeight: "85vh",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
              }}
            >
              <div
                style={{
                  padding: "1.25rem 1.5rem",
                  borderBottom: "1px solid rgba(255,255,255,0.1)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h3 style={{ margin: 0, color: "#fff", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Scroll size={20} color="#a855f7" /> Registro de Partida
                </h3>
                <button
                  onClick={() => setSelectedLog(null)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "rgba(255,255,255,0.5)",
                    cursor: "pointer",
                    padding: "0.25rem",
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              <div
                style={{
                  padding: "1.5rem",
                  overflowY: "auto",
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                {!selectedLog || selectedLog.length === 0 ? (
                  <div style={{ textAlign: "center", opacity: 0.5, padding: "2rem 0" }}>
                    No hay registro detallado para esta partida.
                  </div>
                ) : (
                  (Array.isArray(selectedLog) ? selectedLog : []).map((entry: any, i: number) => {
                    const isPlayer = entry.actor === "player";
                    return (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: isPlayer ? "flex-end" : "flex-start",
                        }}
                      >
                        <div
                          style={{
                            background: isPlayer ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                            border: `1px solid ${isPlayer ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
                            padding: "0.75rem 1rem",
                            borderRadius: "1rem",
                            borderBottomRightRadius: isPlayer ? "0.25rem" : "1rem",
                            borderBottomLeftRadius: !isPlayer ? "0.25rem" : "1rem",
                            maxWidth: "80%",
                          }}
                        >
                          <div style={{ fontSize: "0.7rem", opacity: 0.6, marginBottom: "0.25rem", fontWeight: 800, textTransform: "uppercase" }}>
                            {entry.actor}
                          </div>
                          <div style={{ fontSize: "0.9rem", color: "#fff", lineHeight: 1.4 }}>
                            {entry.action === "play_card" && (
                              <span>Jugó la carta <strong>{entry.card}</strong></span>
                            )}
                            {entry.action === "call" && (
                              <span style={{ color: "#ff7800", fontWeight: 800 }}>¡{entry.payload}!</span>
                            )}
                            {entry.action === "response" && (
                              <span style={{ color: entry.payload === "QUIERO" ? "#10b981" : "#ef4444", fontWeight: 800 }}>
                                {entry.payload}
                              </span>
                            )}
                            {entry.action === "end_hand" && (
                              <span style={{ color: "#a855f7" }}>
                                Fin de mano. Puntos: P {entry.scores?.player || 0} - C {entry.scores?.cpu || 0}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
