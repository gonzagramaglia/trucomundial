import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import type { Tournament } from "./types";

interface Props {
  enrollModalTournament: Tournament | null;
  enrollCode: string;
  setEnrollCode: (v: string) => void;
  enrollError: string;
  enrolling: boolean;
  submitEnrollment: () => Promise<void>;
  setEnrollModalTournament: (t: Tournament | null) => void;
}

const EnrollmentModal: React.FC<Props> = ({
  enrollModalTournament,
  enrollCode,
  setEnrollCode,
  enrollError,
  enrolling,
  submitEnrollment,
  setEnrollModalTournament,
}) => {
  if (!enrollModalTournament) return null;

  return (
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
      onClick={() => setEnrollModalTournament(null)}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        style={{
          background: "rgba(20, 15, 30, 0.7)",
          backdropFilter: "blur(12px)",
          border: "1.5px solid rgba(168, 85, 247, 0.4)",
          borderRadius: "2.5rem",
          padding: "2.5rem",
          width: "100%",
          maxWidth: "450px",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 0 40px rgba(168, 85, 247, 0.15)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "1.5rem",
          }}
        >
          <h3
            className="text-display"
            style={{
              fontSize: "1.5rem",
              color: "#a855f7",
              margin: 0,
              letterSpacing: "0.05em",
            }}
          >
            Ingreso al Torneo
          </h3>
        </div>

        <div
          style={{
            fontSize: "0.9rem",
            marginBottom: "1.5rem",
            opacity: 0.8,
            lineHeight: 1.5,
          }}
        >
          Estás a punto de inscribirte al torneo{" "}
          <strong>{enrollModalTournament.name}</strong> organizado por{" "}
          <strong>{enrollModalTournament.organizer}</strong>.
          <br />
          <br />
          {enrollModalTournament.code_type === "unique"
            ? (
                <>Por favor, ingresá tu <strong>código de acceso</strong> personal y único.</>
              )
            : (
                <>Por favor, ingresá el <strong>código de acceso</strong> al torneo.</>
              )}
        </div>

        <input
          type="text"
          placeholder="CODE"
          value={enrollCode}
          onChange={(e) => setEnrollCode(e.target.value)}
          disabled={enrolling}
          maxLength={4}
          style={{
            width: "100%",
            background: "rgba(0,0,0,0.3)",
            border: enrollError
              ? "1px solid rgba(239, 68, 68, 0.5)"
              : "1px solid rgba(255,255,255,0.2)",
            color: "#fff",
            padding: "1rem",
            borderRadius: "1rem",
            fontSize: "1rem",
            fontWeight: 800,
            outline: "none",
            boxSizing: "border-box",
            textTransform: "uppercase",
            marginBottom: "1rem",
            fontFamily: "var(--font-display)",
            letterSpacing: "0.05em",
            textAlign: "center",
          }}
        />

        {enrollError && (
          <div
            style={{
              color: "#ef4444",
              fontSize: "0.85rem",
              fontWeight: 800,
              marginBottom: "1rem",
            }}
          >
            {enrollError}
          </div>
        )}

        <div style={{ display: "flex", gap: "1rem" }}>
          <button
            onClick={() => setEnrollModalTournament(null)}
            disabled={enrolling}
            style={{
              flex: 1,
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "#fff",
              height: "48px",
              borderRadius: "1rem",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Cancelar
          </button>
          <button
            onClick={async () => {
              await submitEnrollment();
              // if no error after submission, navigate to tournament page
              if (!enrollError && enrollModalTournament) {
                const path = window.location.pathname.startsWith("/en")
                  ? `/en/torneos/${enrollModalTournament.id}`
                  : `/torneos/${enrollModalTournament.id}`;
                window.history.pushState({}, "", path);
                window.dispatchEvent(new PopStateEvent("popstate"));
              }
            }}
            disabled={enrolling || !enrollCode}
            style={{
              flex: 1,
              background: "#a855f7",
              border: "none",
              color: "#fff",
              height: "48px",
              borderRadius: "1rem",
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              cursor: enrolling || !enrollCode ? "not-allowed" : "pointer",
              opacity: enrolling || !enrollCode ? 0.5 : 1,
            }}
          >
            <CheckCircle2 size={18} />{" "}
            {enrolling ? "Validando..." : "Inscribite"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EnrollmentModal;
