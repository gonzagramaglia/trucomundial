import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { MatchSummary } from "./hooks/useAdminData";

interface MatchLogModalProps {
  selectedMatch: MatchSummary | null;
  setSelectedMatch: (match: MatchSummary | null) => void;
  formatDate: (dateStr: string) => string;
}

export const MatchLogModal: React.FC<MatchLogModalProps> = ({
  selectedMatch,
  setSelectedMatch,
  formatDate,
}) => {
  return (
    <AnimatePresence>
      {selectedMatch && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.85)",
            backdropFilter: "blur(12px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 3000,
            padding: "1.5rem",
          }}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            style={{
              background: "rgba(20, 15, 30, 0.95)",
              border: "1.5px solid rgba(168, 85, 247, 0.4)",
              borderRadius: "2.5rem",
              padding: "2.5rem",
              width: "100%",
              maxWidth: "600px",
              maxHeight: "80vh",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 0 40px rgba(168, 85, 247, 0.15)",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "1.5rem",
              }}
            >
              <div>
                <h3
                  className="text-display"
                  style={{
                    fontSize: "1.5rem",
                    color: "#a855f7",
                    margin: 0,
                    letterSpacing: "0.05em",
                  }}
                >
                  Match Log
                </h3>
                <div
                  style={{
                    opacity: 0.5,
                    fontSize: "0.75rem",
                    marginTop: "0.25rem",
                  }}
                >
                  vs {selectedMatch.rivalName} ·{" "}
                  {formatDate(selectedMatch.date)}
                </div>
              </div>
              <div style={{ fontSize: "1.5rem", fontWeight: 900 }}>
                <span
                  style={{
                    color:
                      selectedMatch.winner === "player"
                        ? "#10b981"
                        : "#fff",
                  }}
                >
                  {selectedMatch.myScore}
                </span>
                <span style={{ opacity: 0.3, margin: "0 0.4rem" }}>-</span>
                <span
                  style={{
                    color:
                      selectedMatch.winner !== "player"
                        ? "#ef4444"
                        : "#fff",
                  }}
                >
                  {selectedMatch.rivalScore}
                </span>
              </div>
            </div>

            {/* Log Timeline list */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                paddingRight: "8px",
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
                scrollbarWidth: "thin",
                scrollbarColor: "rgba(255, 255, 255, 0.1) transparent",
              }}
            >
              {selectedMatch.log.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "2rem 0",
                    opacity: 0.5,
                    fontSize: "0.85rem",
                  }}
                >
                  No hay registro detallado de eventos para esta partida.
                </div>
              ) : (
                selectedMatch.log.map((logItem, index) => {
                  const isSystem =
                    logItem.startsWith("★") ||
                    logItem.toLowerCase().includes("gana");
                  return (
                    <div
                      key={index}
                      style={{
                        background: isSystem
                          ? "rgba(168, 85, 247, 0.1)"
                          : "rgba(255, 255, 255, 0.02)",
                        borderLeft: isSystem
                          ? "3px solid #a855f7"
                          : "2px solid rgba(255, 255, 255, 0.1)",
                        padding: "0.6rem 1rem",
                        borderRadius: "0.5rem",
                        fontSize: "0.85rem",
                        lineHeight: "1.4",
                        color: isSystem
                          ? "#e9d5ff"
                          : "rgba(255, 255, 255, 0.85)",
                        display: "flex",
                        gap: "0.5rem",
                        alignItems: "flex-start",
                      }}
                    >
                      <span style={{ opacity: 0.3, fontWeight: "bold" }}>
                        #{index + 1}
                      </span>
                      <span>{logItem}</span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={() => setSelectedMatch(null)}
              className="btn-hover-dark"
              style={{
                background: "#fff",
                border: "none",
                color: "#000",
                height: "42px",
                borderRadius: "1rem",
                marginTop: "1.5rem",
                fontSize: "0.9rem",
                fontWeight: 900,
                cursor: "pointer",
                width: "100%",
                boxShadow: "4px 4px 0px #000",
              }}
            >
              CERRAR
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
