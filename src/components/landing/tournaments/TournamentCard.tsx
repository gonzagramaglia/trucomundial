import React from "react";
import { motion } from "framer-motion";
import { Zap, Clock, Lock, CheckCircle2 } from "lucide-react";

import type { Tournament } from "./types";

interface Props {
  tournament: Tournament;
  isRegistered: boolean;
  handleEnrollClick: (t: Tournament) => void;
}

const TournamentCard: React.FC<Props> = ({
  tournament,
  isRegistered,
  handleEnrollClick,
}) => {
  return (
    <motion.div
      key={tournament.id}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      style={{
        background: tournament.bg_gradient,
        border: isRegistered
          ? "1.5px solid #10b981"
          : "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "2.25rem",
        padding: "1.75rem",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
        boxShadow: isRegistered
          ? "0 0 25px rgba(16, 185, 129, 0.15), 0 12px 30px rgba(0,0,0,0.2)"
          : "0 12px 30px rgba(0,0,0,0.15)",
        backdropFilter: "blur(8px)",
        transition: "all 0.3s ease",
      }}
    >
      {/* Main Content (simplified) */}
      <div style={{ marginTop: "0.5rem", marginBottom: "1.5rem" }}>
        <h3
          className="text-display"
          style={{
            fontSize: "1.4rem",
            margin: "0.5rem 0 0.75rem 0",
            color: isRegistered ? "#10b981" : "#fff",
            letterSpacing: "0.05em",
          }}
        >
          {tournament.name}
        </h3>

        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.8rem",
              opacity: 0.85,
            }}
          >
            <Clock size={15} style={{ color: "#00f2ff" }} />
            <span>{new Date(tournament.start_time).toLocaleString()}</span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "0.4rem",
              fontSize: "0.8rem",
              opacity: 0.85,
            }}
          >
            <Zap size={17} style={{ color: "#ff7800", marginTop: "0.15rem", flexShrink: 0 }} />
            <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
              <span>{tournament.prize.length > 1 ? "Premios:" : "Premio:"}</span>
              {tournament.prize.map((p, i) => (
                <strong key={i} style={{ color: "#ff7800" }}>
                  {i + 1}º {p}
                </strong>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: "0.75rem" }}>
        <button
          onClick={() => {
            const isEn =
              typeof window !== "undefined" &&
              window.location.pathname.startsWith("/en");
            window.history.pushState(
              {},
              "",
              isEn
                ? `/en/torneos/${tournament.id}`
                : `/torneos/${tournament.id}`,
            );
            window.dispatchEvent(new PopStateEvent("popstate"));
          }}
          className="btn-hover-dark"
          style={{
            height: "46px",
            minWidth: "64px",
            padding: "0 0.85rem",
            flexShrink: 0,
            borderRadius: "1.25rem",
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.2)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontWeight: 900,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            fontSize: "0.85rem",
          }}
          title="INFO"
        >
          INFO
        </button>

        <button
          onClick={() => handleEnrollClick(tournament)}
          disabled={
            isRegistered ||
            tournament.status !== "open" ||
            tournament.participants >= tournament.max_participants
          }
          className={`btn-hover-dark ${isRegistered ? "disabled-btn" : ""}`}
          style={{
            flex: 1,
            height: "46px",
            borderRadius: "1.25rem",
            background: isRegistered ? "rgba(16, 185, 129, 0.1)" : "#a855f7",
            border: isRegistered ? "1px solid rgba(16, 185, 129, 0.3)" : "none",
            color: isRegistered ? "#10b981" : "#fff",
            fontSize: "0.9rem",
            fontWeight: 950,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            cursor: isRegistered ? "not-allowed" : "pointer",
            boxShadow: isRegistered ? "none" : "4px 4px 0px #000",
          }}
        >
          {isRegistered ? (
            <>
              <CheckCircle2 size={16} /> INSCRIPTO
            </>
          ) : tournament.participants >= tournament.max_participants ? (
            <>
              <Lock size={16} /> TORNEO LLENO
            </>
          ) : (
            <>
              <Lock size={16} /> INSCRIBITE
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
};

export default TournamentCard;
