import React, { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { Trophy } from "lucide-react";
import { useTranslation } from "react-i18next";
import { supabase } from "../../lib/supabase";
import { normalizeTournamentPrizes } from "../../lib/formatters";
import TournamentCard from "./tournaments/TournamentCard";
import TournamentInfoModal from "./tournaments/TournamentInfoModal";
import EnrollmentModal from "./tournaments/EnrollmentModal";
import type { Tournament, Registration } from "./tournaments/types";

interface LocalUser {
  id: string;
  user_metadata?: { custom_username?: string };
  email?: string;
}

interface TournamentScreenProps {
  user: LocalUser | null;
  handleAuth: () => void;
  onBack: () => void;
}

export const TournamentScreen: React.FC<TournamentScreenProps> = ({
  user,
  handleAuth,
  onBack,
}) => {
  const { t } = useTranslation();
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false,
  );
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [registeredIds, setRegisteredIds] = useState<string[]>([]);

  // modals state
  const [enrollModalTournament, setEnrollModalTournament] =
    useState<Tournament | null>(null);
  const [enrollCode, setEnrollCode] = useState("");
  const [enrollError, setEnrollError] = useState("");
  const [enrolling, setEnrolling] = useState(false);

  const [infoModalTournament, setInfoModalTournament] =
    useState<Tournament | null>(null);
  const [infoRegistrations, setInfoRegistrations] = useState<Registration[]>(
    [],
  );
  const [infoCountdown, setInfoCountdown] = useState("");

  useEffect(() => {
    const fetchRegs = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("tournament_registrations")
        .select("tournament_id")
        .eq("user_id", user.id);
      if (data)
        setRegisteredIds(
          (data as { tournament_id: string }[]).map((r) => r.tournament_id),
        );
    };
    fetchRegs();
  }, [user]);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("tournaments")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) console.error(error);
        else if (data) {
          const rows = data as Record<string, unknown>[];
          setTournaments(
            rows.map((t) => ({
              ...(t as unknown as Tournament),
              prize: normalizeTournamentPrizes(
                (t as Record<string, unknown>).prize,
              ),
            })),
          );
        }
      } catch (err: unknown) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const openInfoModal = async (tournament: Tournament) => {
    setInfoModalTournament(tournament);
    // initialize countdown immediately without setting state inside effect synchronously
    const start = new Date(tournament.start_time).getTime();
    const diff = start - Date.now();
    if (Number.isNaN(start) || diff <= 0) setInfoCountdown("Comienza pronto");
    else {
      const totalSeconds = Math.floor(diff / 1000);
      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      const parts = [
        days > 0 ? `${days}d` : null,
        hours > 0 || days > 0 ? `${hours}h` : null,
        `${minutes}m`,
        `${seconds}s`,
      ].filter(Boolean);
      setInfoCountdown(parts.join(" "));
    }
    const { data } = await supabase
      .from("tournament_registrations")
      .select("user_id, code_used")
      .eq("tournament_id", tournament.id);
    setInfoRegistrations(data || []);
  };

  const handleEnrollClick = (tournament: Tournament) => {
    if (!user) {
      handleAuth();
      return;
    }
    setEnrollModalTournament(tournament);
    setEnrollCode("");
    setEnrollError("");
  };

  const submitEnrollment = async () => {
    if (!enrollModalTournament || !user) return;
    setEnrolling(true);
    setEnrollError("");
    try {
      const t = enrollModalTournament;
      const { error } = await supabase.from("tournament_registrations").insert({
        tournament_id: t.id,
        user_id: user.id,
        code_used: enrollCode,
      });
      if (error) {
        setEnrollError(error.message || "Error");
      } else {
        setRegisteredIds((p) => [...p, t.id]);
        setTournaments((prev) =>
          prev.map((x) =>
            x.id === t.id ? { ...x, participants: x.participants + 1 } : x,
          ),
        );
        setEnrollModalTournament(null);
      }
    } catch (err: unknown) {
      if (err instanceof Error) setEnrollError(err.message || "Error");
      else setEnrollError(String(err) || "Error");
    } finally {
      setEnrolling(false);
    }
  };

  // simple countdown effect for info modal
  useEffect(() => {
    if (!infoModalTournament) return undefined;
    const update = () => {
      const start = new Date(infoModalTournament.start_time).getTime();
      const diff = start - Date.now();
      if (diff <= 0) {
        setInfoCountdown("Comienza pronto");
        return;
      }
      const s = Math.floor(diff / 1000);
      const h = Math.floor((s % 86400) / 3600);
      const m = Math.floor((s % 3600) / 60);
      const sec = s % 60;
      setInfoCountdown(`${h}h ${m}m ${sec}s`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [infoModalTournament]);

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "1200px",
        margin: "0 auto",
        minHeight: "100vh",
        padding: isMobile ? "1.5rem 1rem" : "1.1rem 1rem",
        color: "#fff",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          marginBottom: "1rem",
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: "none",
            border: "none",
            color: "#fff",
            cursor: "pointer",
            fontWeight: 800,
          }}
        >
          ←
        </button>
        <Trophy size={28} />
        <h2 style={{ margin: 0 }}>{t("tournaments")}</h2>
      </header>

      {loading ? (
        <div style={{ padding: "2rem", textAlign: "center" }}>
          Cargando torneos...
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
            gap: "2.5rem",
          }}
        >
          {tournaments.map((tournament) => (
            <TournamentCard
              key={tournament.id}
              tournament={tournament}
              isRegistered={registeredIds.includes(tournament.id)}
              openInfo={openInfoModal}
              handleEnrollClick={handleEnrollClick}
            />
          ))}
        </div>
      )}

      <AnimatePresence>
        <TournamentInfoModal
          infoModalTournament={infoModalTournament}
          infoRegistrations={infoRegistrations}
          infoCountdown={infoCountdown}
          setInfoModalTournament={setInfoModalTournament}
        />
        <EnrollmentModal
          enrollModalTournament={enrollModalTournament}
          enrollCode={enrollCode}
          setEnrollCode={setEnrollCode}
          enrollError={enrollError}
          enrolling={enrolling}
          submitEnrollment={submitEnrollment}
          setEnrollModalTournament={setEnrollModalTournament}
        />
      </AnimatePresence>
    </div>
  );
};

export default TournamentScreen;
