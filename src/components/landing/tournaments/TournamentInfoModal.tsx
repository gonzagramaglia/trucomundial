import React from "react";
import { motion } from "framer-motion";
import TournamentDetails from "./TournamentDetails";
import type { Tournament } from "./types";
interface Props {
  infoModalTournament: Tournament | null;
  setInfoModalTournament: (t: Tournament | null) => void;
}

const TournamentInfoModal: React.FC<Props> = ({
  infoModalTournament,
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

        <TournamentDetails
          tournament={infoModalTournament}
          registrations={[]}
        />
      </motion.div>
    </motion.div>
  );
};

export default TournamentInfoModal;
