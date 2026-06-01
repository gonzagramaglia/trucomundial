import React, { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { getMatchesByTournament } from "../../../lib/matches";
import { normalizeTournamentPrizes } from "../../../lib/formatters";
import TournamentDetails from "./TournamentDetails";
import EnrollmentModal from "./EnrollmentModal";
import type { Tournament } from "./types";

interface Props {
  user: any;
  handleAuth: () => void;
  onBack: () => void;
}

const TournamentEventPage: React.FC<Props> = ({ user, handleAuth, onBack }) => {
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);

  // Enrollment modal state (reuse existing modal)
  const [enrollModalTournament, setEnrollModalTournament] =
    useState<Tournament | null>(null);
  const [enrollCode, setEnrollCode] = useState("");
  const [enrollError, setEnrollError] = useState("");
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    const path = typeof window !== "undefined" ? window.location.pathname : "";
    const parts = path.split("/").filter(Boolean);
    // parts: ['torneos', '<id>'] or ['en','torneos','<id>']
    const id =
      parts.length === 2 ? parts[1] : parts.length === 3 ? parts[2] : null;
    if (!id) return;

    const fetchAll = async () => {
      try {
        const { data: tdata } = await supabase
          .from("tournaments")
          .select("*")
          .eq("id", id)
          .single();
        if (tdata) {
          setTournament({
            ...tdata,
            prize: normalizeTournamentPrizes(tdata.prize),
          });
        }

        const regs = await supabase
          .from("tournament_registrations")
          .select("user_id, code_used")
          .eq("tournament_id", id);
        setRegistrations(regs.data || []);

        const ms = await getMatchesByTournament(id);
        setMatches(ms || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchAll();
  }, []);

  const submitEnrollment = async () => {
    if (!tournament) return;
    setEnrolling(true);
    setEnrollError("");
    try {
      if (tournament.code_type === "single") {
        if (!tournament.codes || tournament.codes[0] !== enrollCode) {
          setEnrollError("Código incorrecto");
          setEnrolling(false);
          return;
        }
      } else if (tournament.code_type === "unique") {
        if (!tournament.codes || !tournament.codes.includes(enrollCode)) {
          setEnrollError("Código inválido o no existe");
          setEnrolling(false);
          return;
        }
        const { data: usedData } = await supabase
          .from("tournament_registrations")
          .select("id")
          .eq("tournament_id", tournament.id)
          .eq("code_used", enrollCode);
        if (usedData && usedData.length > 0) {
          setEnrollError("Ese código ya fue utilizado");
          setEnrolling(false);
          return;
        }
      }

      if (tournament.participants >= tournament.max_participants) {
        setEnrollError("El torneo está lleno");
        setEnrolling(false);
        return;
      }

      const { error } = await supabase.from("tournament_registrations").insert({
        tournament_id: tournament.id,
        user_id: user.id,
        code_used: enrollCode,
      });

      if (error) {
        setEnrollError("Error al inscribirse: " + error.message);
        setEnrolling(false);
        return;
      }

      // update participants locally (optimistic)
      setTournament((prev) =>
        prev ? { ...prev, participants: prev.participants + 1 } : prev,
      );
      setRegistrations((p) => [
        ...p,
        { user_id: user.id, code_used: enrollCode },
      ]);
      setEnrollModalTournament(null);
    } catch (err: any) {
      setEnrollError(err.message || "Error");
    } finally {
      setEnrolling(false);
    }
  };

  if (!tournament) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.9)",
        zIndex: 2500,
        padding: "1.5rem",
        overflowY: "auto",
      }}
    >
      <div style={{ maxWidth: 900, margin: "0 auto", color: "#fff" }}>
        <button
          onClick={onBack}
          className="btn-hover-dark"
          style={{ marginBottom: "1rem" }}
        >
          ← Volver
        </button>

        <h2 style={{ color: "#a855f7" }}>{tournament.name}</h2>
        <div style={{ marginBottom: "1rem" }}>{tournament.description}</div>

        <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
          <TournamentDetails
            tournament={tournament}
            registrations={registrations}
            showCountdown={true}
            countdown={""}
          />
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <h3 style={{ margin: 0 }}>Llaves / Partidos</h3>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              marginTop: 8,
            }}
          >
            {matches.map((m) => (
              <div
                key={m.id}
                style={{
                  background: "rgba(255,255,255,0.02)",
                  padding: 8,
                  borderRadius: 8,
                }}
              >
                <div style={{ fontWeight: 800 }}>
                  Código: {m.match_code || "-"}
                </div>
                <div>
                  Ronda: {m.round} — Pos: {m.match_position}
                </div>
                <div>
                  Jugadores: {m.player_a_id || "-"} vs {m.player_b_id || "-"}
                </div>
                {m.log && (
                  <pre
                    style={{
                      marginTop: 6,
                      background: "rgba(0,0,0,0.6)",
                      padding: 8,
                      borderRadius: 6,
                      overflowX: "auto",
                    }}
                  >
                    {typeof m.log === "string"
                      ? m.log
                      : JSON.stringify(m.log, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <button
            onClick={() => {
              if (!user) {
                handleAuth();
                return;
              }
              setEnrollModalTournament(tournament);
            }}
            className="btn-hover-dark"
            style={{
              padding: "0.8rem 1.2rem",
              background: "#a855f7",
              color: "#fff",
              borderRadius: 12,
              fontWeight: 900,
            }}
          >
            Inscribite
          </button>
        </div>
      </div>

      <EnrollmentModal
        enrollModalTournament={enrollModalTournament}
        enrollCode={enrollCode}
        setEnrollCode={setEnrollCode}
        enrollError={enrollError}
        enrolling={enrolling}
        submitEnrollment={submitEnrollment}
        setEnrollModalTournament={setEnrollModalTournament}
      />
    </div>
  );
};

export default TournamentEventPage;
