import React, { useState, useEffect } from "react";
import { Shuffle, Trophy, GripVertical, Play } from "lucide-react";
import { generateMatchCodes } from "../../../lib/matches";
import { supabase } from "../../../lib/supabase";
import { votesRegistry } from "../../../lib/votesStore";

interface Registration {
  user_id: string;
  code_used?: string;
}

interface BracketSlot {
  position: number;
  player_id: string | null;
  player_label: string;
}

interface InlineBracketManagerProps {
  tournament: any | null;
  registrations: Registration[];
  onSuccess: () => void;
  nameMap?: Record<string, string>;
}

// Compute next power of 2 >= n
const nextPow2 = (n: number) => {
  let p = 4;
  while (p < n) p *= 2;
  return p;
};

// Build initial round 1 slots from players
const buildSlots = (players: Registration[], size: number, nameMap?: Record<string, string>): BracketSlot[] => {
  const slots: BracketSlot[] = [];
  for (let i = 0; i < size; i++) {
    const p = players[i];
    let label = "BYE";
    if (p) {
      if (nameMap && nameMap[p.user_id]) {
        label = nameMap[p.user_id];
      } else {
        label = p.user_id.slice(0, 8) + "...";
      }
    }
    slots.push({
      position: i,
      player_id: p ? p.user_id : null,
      player_label: label,
    });
  }
  return slots;
};

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// Compute all rounds for the bracket tree (view-only after round 1)
const buildBracket = (slots: BracketSlot[]): BracketSlot[][] => {
  const size = slots.length;
  const rounds: BracketSlot[][] = [slots];
  let currentSize = size / 2;
  while (currentSize > 1) {
    rounds.push(
      Array.from({ length: currentSize }, (_, i) => ({
        position: i,
        player_id: null,
        player_label: "?",
      })),
    );
    currentSize /= 2;
  }
  return rounds;
};

const seedLabel = (userId: string | null) => {
  if (!userId) return "BYE";
  return userId.slice(0, 10) + "…";
};

export const InlineBracketManager: React.FC<InlineBracketManagerProps> = ({
  tournament,
  registrations,
  onSuccess,
  nameMap,
}) => {
  const [mode, setMode] = useState<"random" | "manual">("random");
  const [slots, setSlots] = useState<BracketSlot[]>([]);
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const bracketSize = nextPow2(Math.max(registrations.length, tournament?.max_participants || 4));
  const rounds = buildBracket(slots);
  const roundNames = ["Octavos", "Cuartos", "Semis", "Final"];

  useEffect(() => {
    if (tournament) {
      const players = registrations;
      setSlots(buildSlots(players, bracketSize, nameMap));
      setMode("random");
    }
  }, [tournament, registrations, nameMap]);

  const applyRandom = () => {
    const shuffled = shuffle(registrations);
    setSlots(buildSlots(shuffled, bracketSize, nameMap));
  };

  const swapSlots = (a: number, b: number) => {
    setSlots((prev) => {
      const next = [...prev];
      [next[a], next[b]] = [next[b], next[a]];
      return next;
    });
  };

  const handleSave = async () => {
    if (!tournament) return;
    setSaving(true);
    setError("");
    try {
      // Delete existing brackets
      await supabase
        .from("tournament_brackets")
        .delete()
        .eq("tournament_id", tournament.id);

      // Insert new slots
      const rows = slots.map((s, idx) => ({
        tournament_id: tournament.id,
        round: 1,
        position: idx,
        player_id: s.player_id,
        player_label: s.player_label,
      }));
      const { error: insertErr } = await supabase
        .from("tournament_brackets")
        .insert(rows);
      if (insertErr) throw insertErr;

      // Set tournament to active and snapshot the ratings
      const snapshot = { ...votesRegistry };
      const { error: updateErr } = await supabase
        .from("tournaments")
        .update({ status: "active", ranking_snapshot: snapshot })
        .eq("id", tournament.id);
      if (updateErr) throw updateErr;

      // Generate Match Codes
      const matchRows = [];
      const matchCount = slots.length / 2;
      for (let idx = 0; idx < matchCount; idx++) {
        const p1 = slots[idx * 2];
        const p2 = slots[idx * 2 + 1];
        
        // Skip match generation if BOTH are BYE (null)
        if (!p1.player_id && !p2.player_id) continue;
        
        matchRows.push({
          round: 1,
          match_position: idx,
          player_a_id: p1.player_id || null,
          player_b_id: p2.player_id || null,
        });
      }
      if (matchRows.length > 0) {
        await generateMatchCodes(tournament.id, matchRows as any);
      }

      onSuccess();
    } catch (err: any) {
      setError("Error al iniciar torneo: " + err.message);
    } finally {
      setSaving(false);
    }
  };



  if (!tournament) return null;

  const slotStyle = (
    isPlayer: boolean,
    isDragging: boolean,
  ): React.CSSProperties => ({
    background: isPlayer
      ? "rgba(168, 85, 247, 0.12)"
      : "rgba(255,255,255,0.03)",
    border: isDragging
      ? "2px dashed #a855f7"
      : isPlayer
        ? "1px solid rgba(168, 85, 247, 0.35)"
        : "1px solid rgba(255,255,255,0.08)",
    borderRadius: "0.6rem",
    padding: "0.45rem 0.75rem",
    fontSize: "0.78rem",
    fontFamily: "monospace",
    color: isPlayer ? "#e9d5ff" : "rgba(255,255,255,0.25)",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "120px",
    cursor: mode === "manual" && isPlayer ? "grab" : "default",
    userSelect: "none",
  });

  return (
    <div
      style={{
        background: "rgba(14, 10, 24, 0.4)",
        border: "1px dashed rgba(168, 85, 247, 0.3)",
        borderRadius: "1.5rem",
        padding: "2rem",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
        marginTop: "1rem",
      }}
    >
      {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <h3
                className="text-display"
                style={{ margin: 0, fontSize: "1.4rem", color: "#a855f7" }}
              >
                Configurar Bracket
              </h3>
              <div
                style={{
                  opacity: 0.5,
                  fontSize: "0.8rem",
                  marginTop: "0.2rem",
                }}
              >
                {tournament.name} · {registrations.length} jugadores · Bracket
                de {bracketSize}
              </div>
            </div>
          </div>

          {/* Mode Selector */}
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            {(["random", "manual"] as const).map((m) => (
              <button
                key={m}
                onClick={() => {
                  if (m === "random" && mode === "random") {
                    applyRandom();
                  } else {
                    setMode(m);
                  }
                }}
                style={{
                  background: mode === m ? "#a855f7" : "rgba(255,255,255,0.06)",
                  border:
                    mode === m ? "none" : "1px solid rgba(255,255,255,0.12)",
                  color: "#fff",
                  padding: "0.5rem 1.25rem",
                  borderRadius: "2rem",
                  fontWeight: 800,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  boxShadow: mode === m ? "4px 4px 0 #000" : "none",
                }}
              >
                {m === "random" && <Shuffle size={15} />}
                {m === "manual" && <GripVertical size={15} />}
                {m === "random" ? "Aleatorio" : "Manual"}
              </button>
            ))}
          </div>

          {mode === "manual" && (
            <div
              style={{
                fontSize: "0.8rem",
                opacity: 0.5,
                marginTop: "-0.75rem",
              }}
            >
              Arrastrá los jugadores para cambiar su posición en el bracket.
            </div>
          )}

          {/* Visual Bracket Tree */}
          <div style={{ overflowX: "auto", paddingBottom: "0.5rem" }}>
            <div
              style={{
                display: "flex",
                gap: "0",
                alignItems: "stretch",
                minWidth: `${rounds.length * 170}px`,
              }}
            >
              {rounds.map((round, roundIdx) => {
                const matchCount = round.length / 2;
                const isFirstRound = roundIdx === 0;
                const totalRounds = rounds.length;
                const roundName =
                  roundNames[roundNames.length - totalRounds + roundIdx] ??
                  `Ronda ${roundIdx + 1}`;

                return (
                  <div
                    key={roundIdx}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      flex: 1,
                      minWidth: "160px",
                    }}
                  >
                    {/* Round label */}
                    <div
                      style={{
                        fontSize: "0.7rem",
                        fontWeight: 800,
                        color: "#ff7800",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        textAlign: "center",
                        paddingBottom: "0.75rem",
                        opacity: isFirstRound ? 1 : 0.7,
                      }}
                    >
                      {roundName}
                    </div>

                    {/* Matches */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        flex: 1,
                      }}
                    >
                      {Array.from(
                        { length: Math.max(matchCount, 1) },
                        (_, matchIdx) => {
                          const p1Idx = matchIdx * 2;
                          const p2Idx = matchIdx * 2 + 1;
                          const p1 = round[p1Idx];
                          const p2 = round[p2Idx];

                          return (
                            <div
                              key={matchIdx}
                              style={{
                                flex: 1,
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                padding: `${roundIdx === 0 ? "0.4rem" : "0.75rem"} 0`,
                                position: "relative",
                              }}
                            >
                              {/* Connector line left */}
                              {roundIdx > 0 && (
                                <div
                                  style={{
                                    position: "absolute",
                                    left: 0,
                                    top: "50%",
                                    width: "20px",
                                    height: "1px",
                                    background: "rgba(168, 85, 247, 0.3)",
                                  }}
                                />
                              )}

                              {/* Match Box */}
                              <div
                                style={{
                                  marginLeft: roundIdx > 0 ? "20px" : "0",
                                  marginRight: "16px",
                                  border: "1px solid rgba(168, 85, 247, 0.2)",
                                  borderRadius: "0.75rem",
                                  overflow: "hidden",
                                  position: "relative",
                                }}
                              >
                                {[p1, p2]
                                  .filter(Boolean)
                                  .map((player, playerIdx) => {
                                    if (!player) return null;
                                    const isPlayer = !!player.player_id;
                                    const globalIdx = isFirstRound
                                      ? matchIdx * 2 + playerIdx
                                      : -1;
                                    const isDragging = dragFrom === globalIdx;

                                    return (
                                      <div
                                        key={playerIdx}
                                        draggable={
                                          mode === "manual" &&
                                          isFirstRound &&
                                          isPlayer
                                        }
                                        onDragStart={() =>
                                          isFirstRound && setDragFrom(globalIdx)
                                        }
                                        onDragEnd={() => setDragFrom(null)}
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={() => {
                                          if (
                                            dragFrom !== null &&
                                            isFirstRound
                                          ) {
                                            swapSlots(dragFrom, globalIdx);
                                            setDragFrom(null);
                                          }
                                        }}
                                        style={{
                                          ...slotStyle(isPlayer, isDragging),
                                          borderRadius: 0,
                                          maxWidth: "100%",
                                          borderLeft: "none",
                                          borderRight: "none",
                                          borderTop:
                                            playerIdx === 0
                                              ? "none"
                                              : "1px solid rgba(168, 85, 247, 0.15)",
                                          borderBottom: "none",
                                          display: "flex",
                                          alignItems: "center",
                                          gap: "0.3rem",
                                        }}
                                      >
                                        {mode === "manual" &&
                                          isFirstRound &&
                                          isPlayer && (
                                            <GripVertical
                                              size={10}
                                              style={{
                                                opacity: 0.4,
                                                flexShrink: 0,
                                              }}
                                            />
                                          )}
                                        <span
                                          style={{
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                          }}
                                        >
                                          {isFirstRound
                                            ? player.player_id
                                              ? seedLabel(player.player_id)
                                              : "BYE"
                                            : player.player_label}
                                        </span>
                                      </div>
                                    );
                                  })}
                              </div>

                              {/* Connector line right */}
                              {roundIdx < rounds.length - 1 && (
                                <div
                                  style={{
                                    position: "absolute",
                                    right: 0,
                                    top: "50%",
                                    width: "16px",
                                    height: "1px",
                                    background: "rgba(168, 85, 247, 0.3)",
                                  }}
                                />
                              )}
                            </div>
                          );
                        },
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Final winner slot */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  minWidth: "160px",
                  paddingLeft: "0px",
                }}
              >
                <div
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: 800,
                    color: "#fbbf24",
                    textAlign: "left",
                    marginBottom: "0.5rem",
                    textTransform: "uppercase",
                    paddingLeft: "0.2rem",
                  }}
                >
                  Ganador
                </div>
                <div
                  style={{
                    background: "rgba(251, 191, 36, 0.1)",
                    border: "1px solid rgba(251, 191, 36, 0.3)",
                    borderRadius: "0.75rem",
                    padding: "0.75rem 1rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    gap: "0.6rem",
                  }}
                >
                  <Trophy size={18} color="#fbbf24" />
                  <span style={{ color: "#fbbf24", fontWeight: 800, fontSize: "0.95rem" }}>?</span>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div
              style={{ color: "#ef4444", fontSize: "0.85rem", fontWeight: 700 }}
            >
              {error}
            </div>
          )}

          {/* Save Button & Notifications */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1rem" }}>
            <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.5)", fontStyle: "italic", textAlign: "center" }}>
              💡 Nota: Los espacios vacíos se emparejarán automáticamente con "BYE" (pase directo a la siguiente ronda).
            </div>
            <div style={{ fontSize: "0.85rem", color: "#fbbf24", fontWeight: 700, textAlign: "center", marginBottom: "0.5rem" }}>
              🏆 Puntos Globales: Semifinalistas +100 | Finalistas +200 | Ganador +300
            </div>
            
            <div
              style={{ display: "flex", gap: "0.75rem", alignItems: "center", justifyContent: "center" }}
            >
              <button
                onClick={handleSave}
                disabled={saving || registrations.length < tournament.min_participants}
                style={{
                  background: "#a855f7",
                  border: "none",
                  color: "#fff",
                  height: "50px",
                  borderRadius: "1.25rem",
                  fontWeight: 900,
                  fontSize: "1rem",
                  cursor: registrations.length < tournament.min_participants ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  boxShadow: registrations.length < tournament.min_participants ? "none" : "4px 4px 0 #000",
                  opacity: saving || registrations.length < tournament.min_participants ? 0.5 : 1,
                  padding: "0 1.5rem",
                }}
              >
                <Play size={18} /> Iniciar Torneo
              </button>
            </div>
            {registrations.length < tournament.min_participants && (
              <div style={{ color: "#ef4444", fontSize: "0.8rem", textAlign: "center", fontWeight: 700 }}>
                Faltan jugadores. Mínimo requerido: {tournament.min_participants}. Actual: {registrations.length}.
              </div>
            )}
          </div>
    </div>
  );
};
