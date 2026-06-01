import React from "react";
import { Clock } from "lucide-react";
import type { Tournament, Registration } from "./types";

interface Props {
  tournament: Tournament;
  registrations: Registration[];
  countdown?: string;
  showCountdown?: boolean;
}

const TournamentDetails: React.FC<Props> = ({
  tournament,
  registrations,
  countdown,
  showCountdown = true,
}) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
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
          style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}
        >
          {tournament.prize.map((prize, index) => (
            <div key={index} style={{ fontWeight: 800 }}>
              {index + 1}. {prize}
            </div>
          ))}
        </div>
      </div>

      {tournament.status !== "finished" && showCountdown && countdown && (
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
            <Clock size={16} style={{ color: "#00f2ff" }} /> {countdown}
          </div>
          <div style={{ fontSize: "0.78rem", opacity: 0.65 }}>
            Inicio: {new Date(tournament.start_time).toLocaleString()}
          </div>
        </div>
      )}

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
          Inscriptos ({registrations.length} / {tournament.max_participants})
        </div>
        {registrations.length === 0 ? (
          <div style={{ opacity: 0.4, fontSize: "0.85rem" }}>
            Nadie se inscribió todavía.
          </div>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            {registrations.map((r, idx) => (
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
    </div>
  );
};

export default TournamentDetails;
