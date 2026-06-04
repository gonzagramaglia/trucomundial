import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star, Gift, Medal, X } from "lucide-react";

interface TournamentResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: {
    finalPlacement: number;
    pointsEarned: number;
    prizes: string[];
    tournamentName: string;
  } | null;
}

export const TournamentResultModal: React.FC<TournamentResultModalProps> = ({
  isOpen,
  onClose,
  result,
}) => {
  if (!isOpen || !result) return null;

  const isChampion = result.finalPlacement === 1;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.85)",
          backdropFilter: "blur(12px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 5000,
          padding: "1rem",
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.8, y: 50 }}
          transition={{ type: "spring", bounce: 0.5 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: isChampion 
              ? "linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(14, 10, 24, 0.95) 100%)"
              : "rgba(14, 10, 24, 0.95)",
            border: isChampion 
              ? "2px solid rgba(251, 191, 36, 0.5)"
              : "1px solid rgba(255, 255, 255, 0.15)",
            borderRadius: "2rem",
            padding: "3rem 2rem",
            width: "100%",
            maxWidth: "480px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            boxShadow: isChampion 
              ? "0 20px 60px rgba(251, 191, 36, 0.2)"
              : "0 20px 60px rgba(0,0,0,0.5)",
            position: "relative",
            overflow: "hidden"
          }}
        >
          {/* Confetti / Glow effects */}
          {isChampion && (
            <div style={{
              position: "absolute",
              top: "-50px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "200px",
              height: "200px",
              background: "radial-gradient(circle, rgba(251, 191, 36, 0.4) 0%, transparent 70%)",
              filter: "blur(40px)",
              pointerEvents: "none"
            }} />
          )}

          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: "1.25rem",
              right: "1.25rem",
              background: "none",
              border: "none",
              color: "#fff",
              cursor: "pointer",
              opacity: 0.5,
            }}
          >
            <X size={24} />
          </button>

          {isChampion ? (
            <Trophy size={80} color="#fbbf24" style={{ marginBottom: "1rem", filter: "drop-shadow(0 0 20px rgba(251,191,36,0.6))" }} />
          ) : (
            <Medal size={64} color="#a855f7" style={{ marginBottom: "1rem" }} />
          )}

          <h2 style={{
            margin: "0 0 0.5rem 0",
            fontSize: "2rem",
            fontWeight: 900,
            color: isChampion ? "#fbbf24" : "#fff",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            textAlign: "center"
          }}>
            {isChampion ? "¡CAMPEÓN!" : "Eliminado"}
          </h2>
          
          <p style={{
            margin: "0 0 2rem 0",
            fontSize: "1rem",
            color: "rgba(255,255,255,0.7)",
            textAlign: "center"
          }}>
            Has {isChampion ? "ganado" : "finalizado tu participación en"} <strong>{result.tournamentName}</strong>
          </p>

          <div style={{
            display: "flex",
            gap: "1rem",
            width: "100%",
            marginBottom: "2rem"
          }}>
            <div style={{
              flex: 1,
              background: "rgba(255,255,255,0.05)",
              borderRadius: "1rem",
              padding: "1.25rem",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.5rem"
            }}>
              <div style={{ fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 800, opacity: 0.6 }}>
                Posición
              </div>
              <div style={{ fontSize: "1.75rem", fontWeight: 900, color: "#fff" }}>
                {result.finalPlacement}º
              </div>
            </div>

            <div style={{
              flex: 1,
              background: "rgba(255,255,255,0.05)",
              borderRadius: "1rem",
              padding: "1.25rem",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.5rem"
            }}>
              <div style={{ fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 800, opacity: 0.6 }}>
                Puntos Globales
              </div>
              <div style={{ fontSize: "1.75rem", fontWeight: 900, color: "#00f2ff", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                +{result.pointsEarned} <Star size={18} fill="#00f2ff" />
              </div>
            </div>
          </div>

          {result.prizes.length > 0 && (
            <div style={{
              width: "100%",
              background: "linear-gradient(90deg, rgba(255, 120, 0, 0.1) 0%, rgba(255, 120, 0, 0.02) 100%)",
              border: "1px solid rgba(255, 120, 0, 0.3)",
              borderRadius: "1rem",
              padding: "1.25rem",
              marginBottom: "2rem",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.5rem"
            }}>
              <Gift size={24} color="#ff7800" />
              <div style={{ fontSize: "0.85rem", textTransform: "uppercase", fontWeight: 800, color: "#ff7800" }}>
                Premios Ganados
              </div>
              <div style={{ fontSize: "1rem", fontWeight: 700, color: "#fff", textAlign: "center", lineHeight: 1.4 }}>
                {result.prizes.map((p, idx) => (
                  <div key={idx}>{p}</div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={onClose}
            style={{
              width: "100%",
              height: "56px",
              borderRadius: "1.25rem",
              background: isChampion ? "#fbbf24" : "#fff",
              color: "#000",
              border: "none",
              fontWeight: 900,
              fontSize: "1.1rem",
              cursor: "pointer",
              boxShadow: "0 8px 24px rgba(0,0,0,0.2)"
            }}
          >
            Aceptar
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
