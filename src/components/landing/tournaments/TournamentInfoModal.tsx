import React from "react";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import type { Tournament, Registration } from "./types";

interface Props {
  infoModalTournament: Tournament | null;
  infoRegistrations: Registration[];
  infoCountdown: string;
  setInfoModalTournament: (t: Tournament | null) => void;
}

const TournamentInfoModal: React.FC<Props> = ({
  infoModalTournament,
  infoRegistrations,
  infoCountdown,
  setInfoModalTournament,
}) => {
  if (!infoModalTournament) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.8)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2500,
        padding: "1rem",
      }}
      onClick={() => setInfoModalTournament(null)}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "rgba(18, 12, 28, 0.98)",
          border: "1px solid rgba(168, 85, 247, 0.3)",
          borderRadius: "2rem",
          padding: "2rem",
          width: "100%",
          maxWidth: "520px",
          maxHeight: "85vh",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <h3
              className="text-display"
              style={{ margin: 0, fontSize: "1.4rem", color: "#a855f7" }}
            >
              {infoModalTournament.name}
            </h3>
            <div
              style={{ opacity: 0.5, fontSize: "0.8rem", marginTop: "0.25rem" }}
            >
              Organizado por {infoModalTournament.organizer}
            </div>
          </div>
          <button
            onClick={() => setInfoModalTournament(null)}
            style={{
              background: "none",
              border: "none",
              color: "#fff",
              cursor: "pointer",
              fontSize: "1.4rem",
              opacity: 0.6,
            }}
          >
            ✕
          </button>
        </div>

        {infoModalTournament.description && (
          <div
            style={{
              background: "rgba(255,255,255,0.03)",
              borderRadius: "1rem",
              padding: "1rem",
              fontSize: "0.9rem",
              lineHeight: 1.6,
              opacity: 0.85,
            }}
          >
            {infoModalTournament.description}
          </div>
        )}

        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
        >
          <div
            style={{
              background: "rgba(255, 120, 0, 0.08)",
              border: "1px solid rgba(255, 120, 0, 0.18)",
              borderRadius: "1rem",
              padding: "0.9rem 1rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.25rem",
            }}
          >
            <div
              style={{
                fontSize: "0.72rem",
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "#ff7800",
              }}
            >
              Premio
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.6rem",
              }}
            >
              {infoModalTournament.prize.map((prize, index) => (
                <div key={index} style={{ fontWeight: 800 }}>
                  {index + 1}. {prize}
                </div>
              ))}
            </div>
          </div>

          {infoModalTournament.status !== "finished" && infoCountdown && (
            <div
              style={{
                background: "rgba(0, 242, 255, 0.08)",
                border: "1px solid rgba(0, 242, 255, 0.18)",
                borderRadius: "1rem",
                padding: "0.9rem 1rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.25rem",
              }}
            >
              <div
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "#00f2ff",
                }}
              >
                Cuenta regresiva
              </div>
              <div
                style={{
                  fontSize: "1rem",
                  fontWeight: 800,
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <Clock size={16} style={{ color: "#00f2ff" }} /> {infoCountdown}
              </div>
              <div style={{ fontSize: "0.78rem", opacity: 0.65 }}>
                Inicio:{" "}
                {new Date(infoModalTournament.start_time).toLocaleString()}
              </div>
            </div>
          )}
        </div>

        <div>
          <div
            style={{
              fontSize: "0.8rem",
              fontWeight: 800,
              color: "#ff7800",
              marginBottom: "0.75rem",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Inscriptos ({infoRegistrations.length} /{" "}
            {infoModalTournament.max_participants})
          </div>
          {infoRegistrations.length === 0 ? (
            <div style={{ opacity: 0.4, fontSize: "0.85rem" }}>
              Nadie se inscribió todavía.
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              {infoRegistrations.map((r, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "rgba(255,255,255,0.02)",
                    padding: "0.6rem",
                    borderRadius: "0.6rem",
                  }}
                >
                  <div style={{ fontWeight: 800 }}>{r.user_id}</div>
                  <div style={{ opacity: 0.6 }}>{r.code_used}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TournamentInfoModal;
