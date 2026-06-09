import React from "react";
import { Star, Search } from "lucide-react";

import type { PlayerStats, UserStarsPayload } from "./types";

interface PlayersTabProps {
  playerStats: PlayerStats[];
  playerSearchTerm: string;
  setPlayerSearchTerm: (term: string) => void;
  setSelectedUserStars: (user: UserStarsPayload) => void;
  getPlayerRole: (userId: string) => "normal" | "mod" | "admin" | "creator";
  handleRoleChange: (userId: string, newRole: string) => void;
  formatDate: (dateStr: string) => string;
}

export const PlayersTab: React.FC<PlayersTabProps> = ({
  playerStats,
  playerSearchTerm,
  setPlayerSearchTerm,
  setSelectedUserStars,
  getPlayerRole,
  handleRoleChange,
  formatDate,
}) => {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ position: "relative", marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Buscar por nombre o ID de usuario..."
          value={playerSearchTerm}
          onChange={(e) => setPlayerSearchTerm(e.target.value)}
          style={{
            width: "100%",
            padding: "1rem 1rem 1rem 3rem",
            borderRadius: "1rem",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#fff",
            fontSize: "1rem",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
        <Search
          size={20}
          color="rgba(255,255,255,0.4)"
          style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)" }}
        />
      </div>

      <div
        style={{
          background: "rgba(255, 255, 255, 0.03)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "1.5rem",
          overflow: "hidden",
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr
                style={{
                  background: "rgba(0, 0, 0, 0.2)",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                  textAlign: "left",
                }}
              >
                <th
                  style={{
                    padding: "1.25rem 1.5rem",
                    fontWeight: 800,
                    color: "rgba(255, 255, 255, 0.7)",
                    fontSize: "0.8rem",
                    textTransform: "uppercase",
                  }}
                >
                  Usuario
                </th>
                <th
                  style={{
                    padding: "1.25rem 1.5rem",
                    fontWeight: 800,
                    color: "rgba(255, 255, 255, 0.7)",
                    fontSize: "0.8rem",
                    textTransform: "uppercase",
                  }}
                >
                  Partidas
                </th>
                <th
                  style={{
                    padding: "1.25rem 1.5rem",
                    fontWeight: 800,
                    color: "#10b981",
                    fontSize: "0.8rem",
                    textTransform: "uppercase",
                  }}
                >
                  Victorias
                </th>
                <th
                  style={{
                    padding: "1.25rem 1.5rem",
                    fontWeight: 800,
                    color: "#ef4444",
                    fontSize: "0.8rem",
                    textTransform: "uppercase",
                  }}
                >
                  Derrotas
                </th>
                <th
                  style={{
                    padding: "1.25rem 1.5rem",
                    fontWeight: 800,
                    color: "rgba(255, 255, 255, 0.7)",
                    fontSize: "0.8rem",
                    textTransform: "uppercase",
                  }}
                >
                  Creado el
                </th>
                <th
                  style={{
                    padding: "1.25rem 1.5rem",
                    fontWeight: 800,
                    color: "rgba(255, 255, 255, 0.7)",
                    fontSize: "0.8rem",
                    textTransform: "uppercase",
                  }}
                >
                  Última Vez
                </th>
                <th
                  style={{
                    padding: "1.25rem 1.5rem",
                    fontWeight: 800,
                    color: "rgba(255, 255, 255, 0.7)",
                    fontSize: "0.8rem",
                    textTransform: "uppercase",
                    textAlign: "right",
                  }}
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {playerStats.map((stats, idx) => {
                return (
                  <tr
                    key={stats.userId}
                    style={{
                      borderBottom:
                        idx === playerStats.length - 1
                          ? "none"
                          : "1px solid rgba(255, 255, 255, 0.05)",
                    }}
                  >
                    <td
                      style={{
                        padding: "1rem 1.5rem",
                        fontSize: "0.95rem",
                      }}
                    >
                      <div style={{ fontWeight: 800, color: '#fff' }}>
                        {stats.userName}
                      </div>
                      <div style={{ fontSize: "0.75rem", opacity: 0.5, marginTop: "0.15rem", fontFamily: "monospace" }}>
                        {stats.email}
                      </div>
                    </td>
                    <td
                      style={{
                        padding: "1rem 1.5rem",
                        fontWeight: 800,
                        fontSize: "1rem",
                      }}
                    >
                      {stats.totalGames}
                    </td>
                    <td
                      style={{
                        padding: "1rem 1.5rem",
                        fontWeight: 800,
                        color: "#10b981",
                      }}
                    >
                      {stats.wins}
                    </td>
                    <td
                      style={{
                        padding: "1rem 1.5rem",
                        fontWeight: 800,
                        color: "#ef4444",
                      }}
                    >
                      {stats.losses}
                    </td>
                    <td
                      style={{
                        padding: "1rem 1.5rem",
                        fontSize: "0.85rem",
                        opacity: 0.6,
                      }}
                    >
                      {stats.createdAt ? formatDate(stats.createdAt) : "N/A"}
                    </td>
                    <td
                      style={{
                        padding: "1rem 1.5rem",
                        fontSize: "0.85rem",
                        opacity: 0.6,
                      }}
                    >
                      {formatDate(stats.lastPlayed)}
                    </td>
                    <td
                      style={{ padding: "1rem 1.5rem", textAlign: "right" }}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: "0.5rem",
                          justifyContent: "flex-end",
                        }}
                      >
                        <button
                          onClick={() =>
                            setSelectedUserStars({
                              userName: stats.userName,
                              userEmail: stats.email,
                              votes: stats.votes
                            })
                          }
                          style={{
                            background: "rgba(254, 240, 138, 0.15)",
                            border: "1px solid rgba(254, 240, 138, 0.3)",
                            color: "var(--color-accent)",
                            padding: "0.25rem 0.6rem",
                            borderRadius: "0.5rem",
                            fontSize: "0.75rem",
                            fontWeight: 800,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "0.25rem",
                            marginRight: "0.25rem"
                          }}
                          title="Ver Distribución de Estrellas"
                        >
                          <Star size={11} fill="var(--color-accent)" /> Estrellas
                        </button>
                        <select
                          value={getPlayerRole(stats.userId)}
                          onChange={(e) => handleRoleChange(stats.userId, e.target.value)}
                          style={{
                            background: "rgba(0, 0, 0, 0.4)",
                            border: "1px solid rgba(255, 255, 255, 0.2)",
                            color: "#fff",
                            padding: "0.35rem 1.6rem 0.35rem 0.65rem",
                            borderRadius: "0.5rem",
                            fontSize: "0.75rem",
                            fontWeight: 800,
                            cursor: "pointer",
                            outline: "none",
                            boxSizing: "border-box",
                            appearance: "none",
                            WebkitAppearance: "none",
                            backgroundImage: "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
                            backgroundRepeat: "no-repeat",
                            backgroundPosition: "right 0.55rem center",
                            backgroundSize: "0.7rem",
                          }}
                        >
                          <option value="normal" style={{ background: "#180c28", color: "#fff" }}>NORMAL</option>
                          <option value="mod" style={{ background: "#180c28", color: "#10b981" }}>MOD</option>
                          <option value="admin" style={{ background: "#180c28", color: "#ef4444" }}>ADMIN</option>
                          <option value="creator" style={{ background: "#180c28", color: "#ff7800" }}>CREADOR</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {playerStats.length === 0 && (
            <div
              style={{ textAlign: "center", padding: "2rem 0", opacity: 0.5 }}
            >
              No hay jugadores registrados con partidas.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
