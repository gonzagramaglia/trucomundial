import React, { useEffect, useState } from "react";
import { ArrowLeft, Clock, Trophy, Hourglass, LogOut, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "../../../lib/supabase";
import { getMatchesByTournament } from "../../../lib/matches";
import { InlineBracketManager } from "./TournamentBracketManager";
import { normalizeTournamentPrizes } from "../../../lib/formatters";
import TournamentDetails from "./TournamentDetails";
import EnrollmentModal from "./EnrollmentModal";
import { ActivePlayerMatch } from "./ActivePlayerMatch";
import { TournamentMatchHistory } from "./TournamentMatchHistory";
import { TournamentChat } from "./chat/TournamentChat";
import { TwitchButton } from "../../shared/TwitchButton";
import { useTranslation } from "react-i18next";
import type { Tournament } from "./types";

interface Props {
  user: any;
  handleAuth: () => void;
  onBack: () => void;
  onPlayMatch?: (matchCode: string, isHost: boolean) => void;
}

const TournamentEventPage: React.FC<Props> = ({ user, handleAuth, onBack, onPlayMatch }) => {
  const { t } = useTranslation();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [nameMap, setNameMap] = useState<Record<string, string>>({});

  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false,
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Enrollment modal state (reuse existing modal)
  const [enrollModalTournament, setEnrollModalTournament] =
    useState<Tournament | null>(null);
  const [enrollCode, setEnrollCode] = useState("");
  const [enrollError, setEnrollError] = useState("");
  const [enrolling, setEnrolling] = useState(false);

  // Unenroll modal state
  const [showUnenrollModal, setShowUnenrollModal] = useState(false);
  const [unenrolling, setUnenrolling] = useState(false);
  const [unenrollError, setUnenrollError] = useState("");

  // Player waiting state
  const [waitingMatchId, setWaitingMatchId] = useState<string | null>(null);

  // Organizer auth state
  const [isCreatorOrAdmin, setIsCreatorOrAdmin] = useState(false);

  useEffect(() => {
    const checkCreatorAuth = async () => {
      if (!user) {
        setIsCreatorOrAdmin(false);
        return;
      }
      
      const isSuperAdmin = ["gonzagramaglia@gmail.com", "ciberportero@gmail.com"].includes(user.email || "");
      if (isSuperAdmin) {
        setIsCreatorOrAdmin(true);
        return;
      }

      try {
        const { data } = await supabase
          .from("creator_applications")
          .select("id")
          .eq("user_id", user.id)
          .eq("status", "approved")
          .single();
        
        setIsCreatorOrAdmin(!!data);
      } catch (e) {
        setIsCreatorOrAdmin(false);
      }
    };
    checkCreatorAuth();
  }, [user]);

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
        const regsData = regs.data || [];
        setRegistrations(regsData);

        if (regsData && regsData.length > 0) {
          const userIds = regsData.map((r: any) => r.user_id);
          const { data: profilesData } = await supabase
            .from("profiles")
            .select("id, username")
            .in("id", userIds);
          
          const names: Record<string, string> = {};
          if (profilesData) {
            profilesData.forEach((profile: any) => {
              names[profile.id] = profile.username || "";
            });
          }
          setNameMap(names);
        }

        const ms = await getMatchesByTournament(id);
        setMatches(ms || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchAll();
  }, []);

  // Update document title and meta description dynamically
  useEffect(() => {
    if (!tournament) return;
    document.title = `${tournament.name} - Truco Mundial`;
    
    const updateMeta = (nameOrProp: string, content: string) => {
      const sel = nameOrProp.startsWith("og:") || nameOrProp.startsWith("twitter:")
        ? `meta[property="${nameOrProp}"]`
        : `meta[name="${nameOrProp}"]`;
      let el = document.querySelector(sel);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(nameOrProp.startsWith("og:") || nameOrProp.startsWith("twitter:") ? "property" : "name", nameOrProp);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    updateMeta("description", tournament.description || "");
    updateMeta("og:title", `${tournament.name} - Truco Mundial`);
    updateMeta("og:description", tournament.description || "");
    updateMeta("twitter:title", `${tournament.name} - Truco Mundial`);
    updateMeta("twitter:description", tournament.description || "");
  }, [tournament]);

  // Live countdown timer for the tournament start time
  const [countdown, setCountdown] = useState("");
  useEffect(() => {
    if (!tournament) return;

    const updateCountdown = () => {
      const startTime = new Date(tournament.start_time).getTime();
      const diff = startTime - Date.now();

      if (Number.isNaN(startTime) || diff <= 0) {
        setCountdown("Comienza pronto");
        return;
      }

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
      ];
      setCountdown(parts.filter(Boolean).join(" "));
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [tournament]);

  const submitEnrollment = async () => {
    if (!tournament) return;
    setEnrolling(true);
    setEnrollError("");
    try {
      if (tournament.code_type === "single") {
        if (!tournament.codes || tournament.codes[0] !== enrollCode) {
          setEnrollError(t("incorrect_code"));
          setEnrolling(false);
          return;
        }
      } else if (tournament.code_type === "unique") {
        if (!tournament.codes || !tournament.codes.includes(enrollCode)) {
          setEnrollError(t("invalid_code"));
          setEnrolling(false);
          return;
        }
        const { data: usedData } = await supabase
          .from("tournament_registrations")
          .select("id")
          .eq("tournament_id", tournament.id)
          .eq("code_used", enrollCode);
        if (usedData && usedData.length > 0) {
          setEnrollError(t("code_already_used"));
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

      const newCount = tournament.participants + 1;
      await supabase
        .from("tournaments")
        .update({ participants: newCount })
        .eq("id", tournament.id);

      // update participants locally (optimistic)
      setTournament((prev) =>
        prev ? { ...prev, participants: newCount } : prev,
      );
      setRegistrations((p) => [
        ...p,
        { user_id: user.id, code_used: enrollCode },
      ]);
      setNameMap((prev) => ({
        ...prev,
        [user.id]: user.user_metadata?.custom_username || user.email?.split("@")[0] || "Usuario",
      }));
      setEnrollModalTournament(null);
    } catch (err: any) {
      setEnrollError(err.message || "Error");
    } finally {
      setEnrolling(false);
    }
  };

  const handleUnenroll = async () => {
    if (!user || !tournament) return;
    setUnenrolling(true);
    setUnenrollError("");

    try {
      const { data, error } = await supabase
        .from("tournament_registrations")
        .delete()
        .eq("tournament_id", tournament.id)
        .eq("user_id", user.id)
        .select();

      if (error) {
        setUnenrollError("Error al desinscribirse: " + error.message);
        setUnenrolling(false);
        return;
      }

      if (!data || data.length === 0) {
        setUnenrollError("No se pudo eliminar la inscripción (revisá las políticas RLS en Supabase).");
        setUnenrolling(false);
        return;
      }

      const newCount = Math.max(0, tournament.participants - 1);
      await supabase
        .from("tournaments")
        .update({ participants: newCount })
        .eq("id", tournament.id);

      // update locally (optimistic)
      setTournament((prev) =>
        prev ? { ...prev, participants: newCount } : prev,
      );
      setRegistrations((p) => p.filter((r) => r.user_id !== user.id));
      setShowUnenrollModal(false);
    } catch (err: any) {
      setUnenrollError(err.message || "Error");
    } finally {
      setUnenrolling(false);
    }
  };

  if (!tournament) return null;

  const isRegistered = user && registrations.some((r) => r.user_id === user.id);

  // Group matches by round
  const maxRound = matches.length > 0 ? Math.max(...matches.map((m) => m.round), 0) : 0;
  const roundsArray = Array.from({ length: maxRound }, (_, i) => i + 1);

  const formatPlayerName = (pId: string | null) => {
    if (!pId) return "BYE (Pasa libre)";
    if (user && pId === user.id) {
      const myName = user.user_metadata?.custom_username || user.email?.split("@")[0] || "Usuario";
      return `${myName}`;
    }
    return nameMap[pId] || `Jugador ${pId.slice(0, 5)}`;
  };

  const getRoundLabel = (round: number, totalRounds: number) => {
    const diff = totalRounds - round;
    if (diff === 0) return "Final";
    if (diff === 1) return "Semifinales";
    if (diff === 2) return "Cuartos de Final";
    return `Ronda ${round}`;
  };

  const renderMatchStatus = (m: any) => {
    if (!m.player_a_id || !m.player_b_id) {
      return (
        <div style={{ fontSize: "0.72rem", color: "#ff7800", opacity: 0.9, marginTop: "0.25rem", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "0.25rem" }}>
          ℹ️ Pasa libre (BYE)
        </div>
      );
    }
    
    if (m.ended_at) {
      return (
        <div style={{ fontSize: "0.72rem", opacity: 0.5, marginTop: "0.25rem", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "0.25rem" }}>
          Terminada
        </div>
      );
    }

    if (user && (m.player_a_id === user.id || m.player_b_id === user.id)) {
      const isHost = m.player_a_id === user.id;
      const rivalId = isHost ? m.player_b_id : m.player_a_id;
      const rivalName = formatPlayerName(rivalId);
      const isWaiting = waitingMatchId === m.id;

      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          {tournament?.status === "active" && (
            <div style={{ fontSize: "0.7rem", color: "#a855f7", textAlign: "right", marginTop: "0.2rem", fontWeight: 700 }}>
              ⏱ 05:00
            </div>
          )}
          <button
            disabled={isWaiting}
            onClick={() => {
              setWaitingMatchId(m.id);
              setTimeout(() => {
                onPlayMatch?.(m.match_code, isHost);
              }, 600);
            }}
            className={!isWaiting ? "btn-hover-dark" : ""}
            style={{
              marginTop: "0.2rem",
              padding: "0.5rem 0",
              background: isWaiting ? "rgba(255, 120, 0, 0.2)" : "#ff7800",
              color: isWaiting ? "rgba(255, 255, 255, 0.7)" : "#000",
              border: isWaiting ? "1px solid rgba(255, 120, 0, 0.5)" : "none",
              borderRadius: "0.5rem",
              fontWeight: 900,
              cursor: isWaiting ? "not-allowed" : "pointer",
              fontSize: "0.8rem",
              boxShadow: isWaiting ? "none" : "2px 2px 0px #000",
              width: "100%",
              textAlign: "center",
              transition: "all 0.2s"
            }}
          >
            {isWaiting ? `Esperando a ${rivalName}...` : `Jugar contra ${rivalName}`}
          </button>
        </div>
      );
    }

    return (
      <div style={{ fontSize: "0.72rem", opacity: 0.5, marginTop: "0.25rem", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "0.25rem" }}>
        Esperando partida...
      </div>
    );
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "1200px",
        margin: "0 auto",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        padding: isMobile ? "1.5rem 1rem 4rem 1rem" : "1.1rem 1rem 4rem 1rem",
        color: "#fff",
        boxSizing: "border-box",
      }}
    >
      {/* HEADER SECTION (Centered column layout on desktop, responsive style on mobile) */}
      {!isMobile && (
        <button
          onClick={onBack}
          className="home-btn-fixed btn-hover-dark profile-nav-btn"
          style={{
            position: "fixed",
            top: "1.5rem",
            left: "1.5rem",
            background: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(12px)",
            zIndex: 2000,
            height: "40px",
            borderRadius: "1rem",
            padding: "0 1.25rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            color: "white",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            boxShadow: "none",
            fontWeight: 900,
            fontSize: "0.75rem",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            cursor: "pointer",
          }}
        >
          <ArrowLeft size={18} />
          <span>{t("back")}</span>
        </button>
      )}

      {/* Fixed Warning Badge (top-right) */}
      <div
        style={{
          position: "fixed",
          top: "1.5rem",
          right: "1rem",
          background: "rgba(255, 120, 0, 0.06)",
          border: "1.5px solid rgba(255, 120, 0, 0.3)",
          backdropFilter: "blur(12px)",
          zIndex: 2000,
          height: "40px",
          borderRadius: "0.85rem",
          padding: "0 1.25rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.5rem",
          color: "#ff7800",
          boxShadow: "0 4px 14px rgba(255, 120, 0, 0.08)",
          fontSize: "0.7rem",
          fontWeight: 850,
          textShadow: "0 0 8px rgba(255, 120, 0, 0.15)",
        }}
      >
        <span>⚠️</span>
        <span>{t("not_enabled_yet")}</span>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: isMobile ? "1.5rem" : "2rem",
          width: "100%",
          position: "relative",
        }}
      >
        {isMobile ? (
          <>
            {/* Mobile Header Layout */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "center",
                width: "100%",
                gap: "0.75rem",
                marginBottom: "1rem",
              }}
            >
              <button
                onClick={onBack}
                className="btn-hover-dark"
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  color: "white",
                  height: "36px",
                  borderRadius: "0.75rem",
                  padding: "0 0.85rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  fontSize: "0.8rem",
                  fontWeight: 800,
                  cursor: "pointer",
                  boxShadow: "3px 3px 0px #000",
                }}
              >
                <ArrowLeft size={14} />
                {t("back")}
              </button>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                justifyContent: "center",
                marginTop: "0.5rem",
              }}
            >
              <Trophy
                size={24}
                style={{
                  color: "#ffffff",
                  filter: "drop-shadow(0 0 6px rgba(255, 255, 255, 0.25))",
                }}
              />
              <h1
                className="text-display"
                style={{
                  fontSize: "1.4rem",
                  margin: 0,
                  letterSpacing: "0.05em",
                  color: "#ffffff",
                  textShadow: "0 0 8px rgba(255, 255, 255, 0.1)",
                }}
              >
                {tournament.name}
              </h1>
            </div>

            <p
              style={{
                fontSize: "0.75rem",
                opacity: 0.6,
                margin: "4px 0 0 0",
                textAlign: "center",
                lineHeight: 1.4,
              }}
            >
              {tournament.description}
            </p>
          </>
        ) : (
          <>
            {/* Desktop Centered Header Layout */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.5rem",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                }}
              >
                <Trophy
                  size={36}
                  style={{
                    color: "#ffffff",
                    filter: "drop-shadow(0 0 10px rgba(255, 255, 255, 0.3))",
                  }}
                />
                <h1
                  className="text-display"
                  style={{
                    fontSize: "2.2rem",
                    margin: 0,
                    letterSpacing: "0.05em",
                    color: "#ffffff",
                    textShadow: "0 0 15px rgba(255, 255, 255, 0.2)",
                  }}
                >
                  {tournament?.name}
                </h1>
              </div>
              <p
                style={{
                  fontSize: "0.95rem",
                  opacity: 0.65,
                  margin: "4px 0 0 0",
                  fontWeight: 600,
                  maxWidth: "800px",
                  lineHeight: 1.5,
                }}
              >
                {tournament.description}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Prizes Section (Separate card above the two columns) */}
      <div
        style={{
          background: "rgba(255, 120, 0, 0.05)",
          border: "1.5px solid rgba(255, 120, 0, 0.2)",
          borderRadius: "1.5rem",
          padding: "1rem 2rem",
          marginBottom: "2.5rem",
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1.5rem",
          boxShadow: "0 8px 32px rgba(255, 120, 0, 0.05)",
          backdropFilter: "blur(8px)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            alignSelf: isMobile ? "center" : "center",
          }}
        >
          <Trophy size={28} style={{ color: "#ff7800" }} />
          <div>
            <div
              style={{
                fontSize: "0.75rem",
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "#ff7800",
                textAlign: isMobile ? "center" : "left",
              }}
            >
              {t("tournament_prizes")}
            </div>
            <div style={{ fontSize: "0.85rem", opacity: 0.7, marginTop: "0.1rem", textAlign: isMobile ? "center" : "left" }}>
              {t("official_prize_distribution")}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "1.5rem",
            justifyContent: "center",
            width: isMobile ? "100%" : "auto",
          }}
        >
          {tournament.prize.map((prize, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "0.75rem",
                padding: "0.5rem 1rem",
              }}
            >
              <span
                style={{
                  fontWeight: 900,
                  fontSize: "1.1rem",
                  color: index === 0 ? "#ffd700" : index === 1 ? "#c0c0c0" : "#cd7f32",
                }}
              >
                {index + 1}°
              </span>
              <span style={{ fontWeight: 800, fontSize: "0.95rem" }}>{prize}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid: Details on Left, Brackets on Right (or full-width on mobile) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "350px 1fr",
          gap: "2.5rem",
          width: "100%",
        }}
      >
        {/* Left Column: Tournament Info & Enrolled Players */}
        <div
          style={{
            background: "rgba(30, 15, 50, 0.35)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: isMobile ? "1.5rem" : "2.25rem",
            padding: isMobile ? "1.25rem" : "2rem",
            backdropFilter: "blur(8px)",
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
            alignSelf: "start",
            width: "100%",
            boxSizing: "border-box"
          }}
        >
          <TournamentDetails
            tournament={tournament}
            registrations={registrations}
            nameMap={nameMap}
            user={user}
            showPrize={false}
            onUnenrollClick={() => setShowUnenrollModal(true)}
          />

          {/* Minimum players requirement banner */}
          <div
            style={{
              background: "rgba(255, 120, 0, 0.05)",
              border: "1px solid rgba(255, 120, 0, 0.2)",
              borderRadius: "1rem",
              padding: "0.85rem 1rem",
              fontSize: "0.8rem",
              color: "#ff7800",
              lineHeight: 1.45,
            }}
          >
            ⚠️ <strong>{t("start_requirement")}</strong> {t("once_minimum_reached")} <strong>{tournament.min_participants || 4}</strong> {t("organizer_can_start")}
          </div>

          {/* Enroll / Inscripto Button */}
          {!isRegistered && (
            <div style={{ marginTop: "0.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <div style={{ display: "flex", gap: "0.5rem", flexDirection: "column" }}>
                {tournament.code_type && tournament.code_type !== "none" && (
                  <input
                    type="text"
                    placeholder={t("enter_code_placeholder")}
                    value={enrollCode}
                    onChange={(e) => setEnrollCode(e.target.value)}
                    disabled={enrolling}
                    maxLength={4}
                    style={{
                      flex: 1,
                      background: "rgba(0,0,0,0.3)",
                      border: enrollError
                        ? "1px solid rgba(239, 68, 68, 0.5)"
                        : "1px solid rgba(255,255,255,0.2)",
                      color: "#fff",
                      padding: "0.8rem 1.2rem",
                      borderRadius: 12,
                      fontSize: "0.95rem",
                      fontWeight: 800,
                      outline: "none",
                      boxSizing: "border-box",
                      textTransform: "uppercase",
                      fontFamily: "var(--font-display)",
                      letterSpacing: "0.05em",
                      textAlign: "center",
                      width: isMobile ? "100%" : "auto"
                    }}
                  />
                )}
                <button
                  onClick={() => {
                    if (!user) {
                      handleAuth();
                      return;
                    }
                    submitEnrollment();
                  }}
                  disabled={Boolean(enrolling || (tournament.code_type && tournament.code_type !== "none" && !enrollCode))}
                  className="btn-hover-dark"
                  style={{
                    flex: tournament.code_type && tournament.code_type !== "none" ? "auto" : 1,
                    padding: "0.8rem 1.5rem",
                    background: "linear-gradient(to right, #a855f7, #7c3aed)",
                    border: "none",
                    color: "#fff",
                    borderRadius: 12,
                    fontWeight: 900,
                    cursor: Boolean(enrolling || (tournament.code_type && tournament.code_type !== "none" && !enrollCode)) ? "not-allowed" : "pointer",
                    opacity: Boolean(enrolling || (tournament.code_type && tournament.code_type !== "none" && !enrollCode)) ? 0.7 : 1,
                    boxShadow: "4px 4px 0px #000",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    textTransform: "uppercase",
                    fontFamily: "var(--font-display)",
                    letterSpacing: "0.05em",
                    width: isMobile ? "100%" : "auto"
                  }}
                >
                  <CheckCircle2 size={18} />
                  {enrolling ? "..." : t("accept_enrollment")}
                </button>
              </div>
              {enrollError && (
                <div style={{ color: "#ef4444", fontSize: "0.85rem", fontWeight: 800, marginTop: "0.25rem" }}>
                  {enrollError}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Brackets / Matches */}
        <div
          style={{
            background: "rgba(30, 15, 50, 0.35)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: isMobile ? "1.5rem" : "2.25rem",
            padding: isMobile ? "1.25rem" : "2rem",
            backdropFilter: "blur(8px)",
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
            minHeight: "400px",
            width: "100%",
            boxSizing: "border-box",
            overflow: "hidden"
          }}
        >
          <h3
            className="text-display"
            style={{
              fontSize: "1.4rem",
              margin: 0,
              color: "#a855f7",
              letterSpacing: "0.05em",
            }}
          >
            {t("brackets_matches_tab")}
          </h3>

          {/* Organizer */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "1rem" }}>🎙️</span>
            <div>
              <div style={{ fontSize: "0.62rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.06em", color: "#a855f7", marginBottom: "0.02rem" }}>
                {t("organizer_label_emoji")}
              </div>
              <div style={{ fontSize: "0.88rem", fontWeight: 800, color: "#fff" }}>
                {tournament.organizer || "Truco Mundial"}
              </div>
            </div>
          </div>

          {matches.length === 0 ? (
            isCreatorOrAdmin ? (
              <InlineBracketManager
                tournament={tournament}
                registrations={registrations}
                nameMap={nameMap}
                onSuccess={() => window.location.reload()}
              />
            ) : (
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "1.2rem",
                  fontSize: "0.95rem",
                  textAlign: "center",
                  padding: isMobile ? "2rem 1rem" : "3rem 2rem",
                  border: "1px dashed rgba(255,255,255,0.15)",
                  borderRadius: "1.5rem",
                  lineHeight: 1.6,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div style={{
                  position: "absolute",
                  top: 0, left: 0, right: 0, bottom: 0,
                  backgroundImage: `url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiB2aWV3Qm94PSIwIDAgNDAwIDMwMCI+PHBhdGggZD0iTSA5MCA1MCBIIDEyNSBWIDE1MCBIIDE2MCBNIDkwIDI1MCBIIDEyNSBWIDE1MCBIIDE2MCBNIDI0MCAxNTAgSCAzMTAiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iNCIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxyZWN0IHg9IjEwIiB5PSIzMCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjQwIiByeD0iNiIgZmlsbD0id2hpdGUiIG9wYWNpdHk9IjAuOCIvPjxyZWN0IHg9IjEwIiB5PSIyMzAiIHdpZHRoPSI4MCIgaGVpZ2h0PSI0MCIgcng9IjYiIGZpbGw9IndoaXRlIiBvcGFjaXR5PSIwLjgiLz48cmVjdCB4PSIxNjAiIHk9IjEzMCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjQwIiByeD0iNiIgZmlsbD0id2hpdGUiIG9wYWNpdHk9IjAuOCIvPjxyZWN0IHg9IjMxMCIgeT0iMTMwIiB3aWR0aD0iODAiIGhlaWdodD0iNDAiIHJ4PSI2IiBmaWxsPSJ3aGl0ZSIgb3BhY2l0eT0iMC44Ii8+PC9zdmc+")`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  filter: "blur(6px)",
                  opacity: 0.1,
                  zIndex: 0,
                  pointerEvents: "none"
                }} />
                
                <motion.div
                  animate={{ rotate: 180 }}
                  transition={{
                    repeat: Infinity,
                    duration: 2.2,
                    ease: "easeInOut",
                    repeatDelay: 0.6
                  }}
                  style={{ display: "inline-block", color: "#a855f7", position: "relative", zIndex: 1 }}
                >
                  <Hourglass size={44} strokeWidth={1.8} />
                </motion.div>
                <div style={{ opacity: 0.65, position: "relative", zIndex: 1 }}>
                  {t("waiting_tournament_start")}<br />{t("organizer_will_generate_brackets")}
                </div>
                {tournament.status !== "finished" && countdown && (
                  <div
                    style={{
                      position: "relative",
                      zIndex: 1,
                      background: "rgba(168, 85, 247, 0.08)",
                      border: "1px solid rgba(168, 85, 247, 0.18)",
                      borderRadius: "0.85rem",
                      padding: "0.5rem 1rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.45rem",
                      fontSize: "0.85rem",
                      fontWeight: 800,
                      color: "#a855f7",
                      marginTop: "0.4rem",
                      boxShadow: "0 0 12px rgba(168, 85, 247, 0.05)",
                    }}
                  >
                    <Clock size={15} style={{ color: "#a855f7" }} />
                    <span style={{ color: "#d8b4fe" }}>{t("starts_in_countdown")} {countdown}</span>
                  </div>
                )}
              </div>
            )
          ) : (
            <div
              style={{
                display: "flex",
                gap: "1.5rem",
                overflowX: "auto",
                paddingBottom: "1rem",
                alignItems: "stretch",
              }}
            >
              {!isCreatorOrAdmin && tournament.status === "active" ? (
                <div style={{ width: "100%" }}>
                  <ActivePlayerMatch
                    myCurrentMatch={matches.find(m => !m.ended_at && (m.player_a_id === user?.id || m.player_b_id === user?.id))}
                    user={user}
                    nameMap={nameMap}
                    onPlayMatch={onPlayMatch}
                  />
                </div>
              ) : roundsArray.map((roundNum) => {
                const roundMatches = matches
                  .filter((m) => m.round === roundNum)
                  .sort((a, b) => a.match_position - b.match_position);

                return (
                  <div
                    key={roundNum}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "1rem",
                      minWidth: "220px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.85rem",
                        fontWeight: 900,
                        color: "#ff7800",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        textAlign: "center",
                        borderBottom: "1px solid rgba(255,255,255,0.1)",
                        paddingBottom: "0.5rem",
                      }}
                    >
                      {getRoundLabel(roundNum, maxRound)}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "1.25rem",
                        justifyContent: "center",
                        flex: 1,
                      }}
                    >
                      {roundMatches.map((m) => (
                        <div
                          key={m.id}
                          style={{
                            background: "rgba(15, 10, 25, 0.6)",
                            border: "1px solid rgba(168, 85, 247, 0.2)",
                            borderRadius: "1.25rem",
                            padding: "1rem",
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.5rem",
                            width: "220px",
                            boxSizing: "border-box",
                          }}
                        >
                          {/* Player A */}
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              fontSize: "0.85rem",
                              fontWeight: m.winner_id === m.player_a_id ? 900 : 500,
                              color: m.winner_id === m.player_a_id ? "#10b981" : "#fff",
                            }}
                          >
                            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "160px" }}>
                              {formatPlayerName(m.player_a_id)}
                            </span>
                            {m.winner_id === m.player_a_id && (
                              <span style={{ color: "#ffd700", fontSize: "0.75rem" }}>🏆</span>
                            )}
                          </div>

                          {/* Divider */}
                          <div
                            style={{
                              fontSize: "0.7rem",
                              opacity: 0.3,
                              textTransform: "uppercase",
                              textAlign: "center",
                              borderTop: "1px solid rgba(255,255,255,0.06)",
                              paddingTop: "0.25rem",
                            }}
                          >
                            vs
                          </div>

                          {/* Player B */}
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              fontSize: "0.85rem",
                              fontWeight: m.winner_id === m.player_b_id ? 900 : 500,
                              color: m.winner_id === m.player_b_id ? "#10b981" : "#fff",
                            }}
                          >
                            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "160px" }}>
                              {formatPlayerName(m.player_b_id)}
                            </span>
                            {m.winner_id === m.player_b_id && (
                              <span style={{ color: "#ffd700", fontSize: "0.75rem" }}>🏆</span>
                            )}
                          </div>

                          {renderMatchStatus(m)}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>

      <TournamentChat
        tournamentId={tournament.id}
        user={user}
        nameMap={nameMap}
      />

      <TournamentMatchHistory
        finishedMatches={matches.filter(m => m.ended_at)}
        nameMap={nameMap}
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

      {showUnenrollModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "1rem",
          }}
          onClick={() => setShowUnenrollModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "rgba(31, 41, 55, 0.4)",
              backdropFilter: "blur(12px)",
              padding: "2rem",
              borderRadius: "1rem",
              maxWidth: "400px",
              width: "100%",
              boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <h3 style={{ color: "#fff", fontSize: "1.25rem", fontWeight: 800, marginBottom: "1rem" }}>
              {t("unenroll_tournament")}
            </h3>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.95rem", marginBottom: "1.5rem" }}>
              {t("about_to_unenroll")} <strong>{tournament?.name}</strong>. {t("action_will_free_slot")}
            </p>

            {unenrollError && (
              <div style={{ color: "#ef4444", marginBottom: "1rem", fontSize: "0.85rem", background: "rgba(239, 68, 68, 0.1)", padding: "0.5rem", borderRadius: "0.5rem", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
                {unenrollError}
              </div>
            )}

            <div style={{ display: "flex", gap: "1rem", justifyContent: "space-between" }}>
              <button
                onClick={() => setShowUnenrollModal(false)}
                disabled={unenrolling}
                style={{
                  background: "transparent",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.2)",
                  padding: "0.6rem 1.2rem",
                  borderRadius: "0.5rem",
                  fontWeight: 600,
                  cursor: unenrolling ? "not-allowed" : "pointer",
                  opacity: unenrolling ? 0.5 : 1,
                }}
              >
                {t("cancel_enrollment")}
              </button>
              <button
                onClick={handleUnenroll}
                disabled={unenrolling}
                style={{
                  background: "#ef4444",
                  color: "#fff",
                  border: "none",
                  padding: "0.6rem 1.2rem",
                  borderRadius: "0.5rem",
                  fontWeight: 700,
                  cursor: unenrolling ? "not-allowed" : "pointer",
                  opacity: unenrolling ? 0.7 : 1,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <LogOut size={16} strokeWidth={2.5} style={{ transform: "scaleX(-1)" }} />
                {unenrolling ? "..." : t("unenroll_confirm_button")}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <TwitchButton />
    </div>
  );
};

export default TournamentEventPage;
