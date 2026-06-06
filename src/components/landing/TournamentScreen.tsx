import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Trophy,
  Lock,
  Award,
  Zap,
  Clock,
  ShieldCheck,
  User,
  Edit2,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Info,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { supabase } from "../../lib/supabase";
import { TwitchButton } from '../shared/TwitchButton';
import {

  formatTournamentDate,
  normalizeTournamentPrizes,
} from "../../lib/formatters";

interface TournamentScreenProps {
  user: any;
  handleAuth: () => void;
  onBack: () => void;
}

interface Tournament {
  id: string;
  name: string;
  status: "open" | "active" | "finished";
  participants: number;
  max_participants: number;
  start_time: string;
  prize: string[];
  bg_gradient: string;
  winner?: string;
  organizer: string;
  code_type?: string;
  codes?: string[];
  description?: string;
  allowed_teams?: string[];
  ranking_snapshot?: Record<string, number> | null;
}

const MOCK_RANKING = [
  { id: 1, name: "TimPayne", score: 1300, position: 1 },
];

export const TournamentScreen: React.FC<TournamentScreenProps> = ({
  user,
  handleAuth,
  onBack,
}) => {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPlayerForHistory, setSelectedPlayerForHistory] = useState<any | null>(null);
  const [hoveredPlayerId, setHoveredPlayerId] = useState<string | number | null>(null);
  const ITEMS_PER_PAGE = 10;

  const totalPages = Math.ceil(MOCK_RANKING.length / ITEMS_PER_PAGE);
  const currentRankingPage = MOCK_RANKING.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

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

  // State to track registered tournament IDs
  const [registeredIds, setRegisteredIds] = useState<string[]>([]);
  // Enrollment modal state
  const [enrollModalTournament, setEnrollModalTournament] =
    useState<Tournament | null>(null);
  const [enrollCode, setEnrollCode] = useState("");
  const [enrollError, setEnrollError] = useState("");
  const [enrolling, setEnrolling] = useState(false);


  // Fetch tournaments from DB
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalStats, setGlobalStats] = useState({ played: 0, position: 0 });

  useEffect(() => {
    const fetchRegistrations = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("tournament_registrations")
        .select("tournament_id")
        .eq("user_id", user.id);

      if (data) {
        setRegisteredIds(data.map((r) => r.tournament_id));
      }
      const { data: globalData, error: globalErr } = await supabase
        .from("global_leaderboard")
        .select("tournaments_played, points")
        .eq("user_id", user.id)
        .single();
      
      if (!globalErr && globalData) {
        // Find position based on points
        const { count, error: countErr } = await supabase
          .from("global_leaderboard")
          .select("*", { count: 'exact', head: true })
          .gt("points", globalData.points);
          
        setGlobalStats({
          played: globalData.tournaments_played || 0,
          position: countErr ? 0 : (count || 0) + 1
        });
      }

      setLoading(false);
    };

    fetchRegistrations();
  }, [user]);

  const upcomingTournament = tournaments
    .filter(t => registeredIds.includes(t.id) && new Date(t.start_time) > new Date())
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())[0];

  const [nextTournamentCountdown, setNextTournamentCountdown] = useState("--:--:--");

  useEffect(() => {
    if (!upcomingTournament?.start_time) {
      setNextTournamentCountdown("--:--:--");
      return;
    }

    const updateCountdown = () => {
      const now = new Date().getTime();
      const target = new Date(upcomingTournament.start_time).getTime();
      const diff = target - now;

      if (diff <= 0) {
        setNextTournamentCountdown("00:00:00");
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const parts = [];
      if (days > 0) parts.push(`${days}d`);
      parts.push(`${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`);
      setNextTournamentCountdown(parts.join(" "));
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [upcomingTournament?.start_time]);

  useEffect(() => {
    const fetchTournaments = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("tournaments")
          .select("*")
          .eq("is_approved", true)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching tournaments:", error);
        } else if (data) {
          setTournaments(
            data.map((tournament: any) => ({
              ...tournament,
              prize: normalizeTournamentPrizes(tournament.prize),
            })),
          );
        }
      } catch (err) {
        console.error("Unexpected error fetching tournaments:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTournaments();
  }, []);


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
    const t = enrollModalTournament;

    try {
      if (t.code_type === "single") {
        if (!t.codes || t.codes[0] !== enrollCode) {
          setEnrollError("Código incorrecto");
          setEnrolling(false);
          return;
        }
      } else if (t.code_type === "unique") {
        if (!t.codes || !t.codes.includes(enrollCode)) {
          setEnrollError("Código inválido o no existe");
          setEnrolling(false);
          return;
        }
        // Check if used
        const { data: usedData } = await supabase
          .from("tournament_registrations")
          .select("id")
          .eq("tournament_id", t.id)
          .eq("code_used", enrollCode);
        if (usedData && usedData.length > 0) {
          setEnrollError("Ese código ya fue utilizado");
          setEnrolling(false);
          return;
        }
      }

      if (t.participants >= t.max_participants) {
        setEnrollError("El torneo está lleno");
        setEnrolling(false);
        return;
      }

      const { error } = await supabase.from("tournament_registrations").insert({
        tournament_id: t.id,
        user_id: user.id,
        code_used: enrollCode,
      });

      if (error) {
        if (error.code === "23505") {
          setEnrollError("Ya estás inscripto en este torneo");
        } else {
          setEnrollError("Error al inscribirse: " + error.message);
        }
        setEnrolling(false);
        return;
      }

      const newCount = t.participants + 1;
      await supabase
        .from("tournaments")
        .update({ participants: newCount })
        .eq("id", t.id);

      setRegisteredIds((prev) => [...prev, t.id]);
      setTournaments((prev) =>
        prev.map((x) => (x.id === t.id ? { ...x, participants: newCount } : x)),
      );
      setEnrollModalTournament(null);
      // navigate to tournament event page after successful enrollment
      try {
        const path = window.location.pathname.startsWith("/en")
          ? `/en/torneos/${t.id}`
          : `/torneos/${t.id}`;
        window.history.pushState({}, "", path);
        window.dispatchEvent(new PopStateEvent("popstate"));
      } catch (e) {
        // ignore navigation errors
      }
    } catch (err: any) {
      setEnrollError("Error: " + err.message);
    } finally {
      setEnrolling(false);
    }
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
        <>
          {/* Fixed Back Button (Desktop Left Corner) */}
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
            <Home size={18} />
            <span>{t("home")}</span>
          </button>

          {/* Fixed Warning Badge (Desktop Right Corner) */}
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
        </>
      )}

      {/* HEADER SECTION (Responsive Container) */}
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
                justifyContent: "space-between",
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
                <Home size={14} />
                {t("home")}
              </button>

              <div
                style={{
                  background: "rgba(255, 120, 0, 0.06)",
                  border: "1.5px solid rgba(255, 120, 0, 0.3)",
                  borderRadius: "0.75rem",
                  padding: "0.44rem 1.1rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontSize: "0.65rem",
                  fontWeight: 850,
                  color: "#ff7800",
                  maxWidth: "200px",
                  textAlign: "center",
                  boxShadow: "2px 2px 0px rgba(0,0,0,0.8)",
                }}
              >
                <span>⚠️</span>
                <span>{t("not_enabled_yet")}</span>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                justifyContent: "center",
                marginTop: "1rem",
              }}
            >
              <Trophy
                size={24}
                style={{
                  color: "#ffffff",
                  filter: "drop-shadow(0 0 6px rgba(255, 255, 255, 0.25))",
                }}
              />
              <h2
                className="text-display"
                style={{
                  fontSize: "1.4rem",
                  margin: 0,
                  letterSpacing: "0.05em",
                  color: "#ffffff",
                  textShadow: "0 0 8px rgba(255, 255, 255, 0.1)",
                }}
              >
                {t("tournaments")} ({t("coming_soon").toLowerCase()})
              </h2>
            </div>

            <p
              style={{
                fontSize: "0.75rem",
                opacity: 0.6,
                margin: "4px 0 0 0",
                textAlign: "center",
              }}
            >
              {t("tournaments_subtitle")}
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
                <h2
                  className="text-display"
                  style={{
                    fontSize: "2.2rem",
                    margin: 0,
                    letterSpacing: "0.05em",
                    color: "#ffffff",
                    textShadow: "0 0 15px rgba(255, 255, 255, 0.2)",
                  }}
                >
                  {t("tournaments")} ({t("coming_soon").toLowerCase()})
                </h2>
              </div>
              <p
                style={{
                  fontSize: "0.95rem",
                  opacity: 0.65,
                  margin: "4px 0 0 0",
                  fontWeight: 600,
                }}
              >
                {t("tournaments_subtitle")}
              </p>
            </div>
          </>
        )}
      </div>

      {/* LOGIN TO COMPETE OR USER STATS BANNER */}
      <AnimatePresence mode="wait">
        {!user ? (
          <motion.div
            key="login-banner"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{
              background: 'rgba(145, 70, 255, 0.05)',
              border: '2px dashed rgba(145, 70, 255, 0.45)',
              borderRadius: '2rem',
              padding: '1.5rem 2rem',
              marginBottom: '3.5rem',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1.5rem',
              backdropFilter: 'blur(16px)'
            }}
          >
            <div style={{ flex: '1 1 300px' }}>
              <h3
                style={{
                  margin: "0 0 0.5rem 0",
                  color: "#a855f7",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  fontSize: "1.1rem",
                  fontWeight: 900,
                }}
              >
                <Lock size={18} />
                {t("login_to_compete_title")}
              </h3>
              <p
                style={{
                  margin: 0,
                  fontSize: "0.8rem",
                  opacity: 0.7,
                  lineHeight: 1.4,
                }}
              >
                {t("login_to_compete_desc")}
              </p>
            </div>

            <button
              onClick={handleAuth}
              className="btn-hover-dark"
              style={{
                background: "#9146ff",
                border: "none",
                color: "#fff",
                height: "46px",
                borderRadius: "1.25rem",
                padding: "0 1.5rem",
                fontSize: "0.9rem",
                fontWeight: 950,
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                cursor: "pointer",
                boxShadow: "4px 4px 0px #000",
                whiteSpace: "nowrap",
                marginTop: isMobile ? "-0.5rem" : 0,
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                style={{ fill: "currentColor" }}
              >
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              {t("login_with_google")}
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="user-stats"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1.5px solid rgba(0, 242, 255, 0.2)",
              borderRadius: "1.75rem",
              padding: "1.5rem",
              marginBottom: "3.5rem",
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "1.5rem",
              boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                flex: 1,
                justifyContent: isMobile ? "center" : "flex-start",
              }}
            >
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "50%",
                  background: "rgba(0, 242, 255, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px solid rgba(0, 242, 255, 0.3)",
                }}
              >
                <User size={26} color="#00f2ff" />
              </div>
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <div
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: 900,
                      color: "#fff",
                      textTransform: "uppercase",
                      letterSpacing: "0.02em",
                    }}
                  >
                    {user.user_metadata?.custom_username ||
                      user.email?.split("@")[0]}
                  </div>
                  <button
                    onClick={() => {
                      window.location.href =
                        window.location.pathname.startsWith("/en")
                          ? "/en/perfil"
                          : "/perfil";
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: "rgba(255, 255, 255, 0.4)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 0,
                      transition: "color 0.2s ease",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "#00f2ff")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "rgba(255, 255, 255, 0.4)")
                    }
                    title="Editar perfil"
                  >
                    <Edit2 size={14} />
                  </button>
                </div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "#00f2ff",
                    fontWeight: 800,
                    marginTop: "2px",
                  }}
                >
                  ESTADÍSTICAS GLOBALES
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: "1.5rem",
                flexWrap: "wrap",
                justifyContent: isMobile ? "center" : "flex-end",
                flex: 2,
              }}
            >
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "1.35rem",
                    fontWeight: 900,
                    color: "#fff",
                  }}
                >
                  {globalStats.played}
                </div>
                <div
                  style={{
                    fontSize: "0.65rem",
                    opacity: 0.6,
                    textTransform: "uppercase",
                    fontWeight: 800,
                  }}
                >
                  {t("tournaments_played").split("\n")[0]}
                  <br />
                  {t("tournaments_played").split("\n")[1]}
                </div>
              </div>
              <div
                style={{ width: "1px", background: "rgba(255,255,255,0.15)" }}
              />
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "1.35rem",
                    fontWeight: 900,
                    color: "#ffdf00",
                    textShadow: "0 0 8px rgba(255,223,0,0.3)",
                  }}
                >
                  {globalStats.position > 0 ? `#${globalStats.position}` : "#---"}
                </div>
                <div
                  style={{
                    fontSize: "0.65rem",
                    opacity: 0.6,
                    textTransform: "uppercase",
                    fontWeight: 800,
                  }}
                >
                  {t("global_position").split("\n")[0]}
                  <br />
                  {t("global_position").split("\n")[1]}
                </div>
              </div>
              <div
                style={{ width: "1px", background: "rgba(255,255,255,0.15)" }}
              />
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "1.05rem",
                    fontWeight: 900,
                    color: "#a855f7",
                    marginTop: "0.3rem",
                  }}
                >
                  {nextTournamentCountdown}
                </div>
                <div
                  style={{
                    fontSize: "0.65rem",
                    opacity: 0.6,
                    textTransform: "uppercase",
                    fontWeight: 800,
                    marginTop: "0.3rem",
                  }}
                >
                  {t("next_tournament").split("\n")[0]}
                  <br />
                  {t("next_tournament").split("\n")[1]}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LOGIN TO COMPETE BANNER */}

      {/* TOURNAMENTS LIST SECTION */}
      <h3
        className="text-display"
        style={{
          fontSize: "1.4rem",
          marginBottom: "2.5rem",
          marginTop: "0",
          color: "#fff",
          letterSpacing: "0.05em",
          textAlign: "center",
        }}
      >
        {t("tournaments_list")}
      </h3>

      {loading ? (
        <div
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px dashed rgba(255,255,255,0.1)",
            borderRadius: "2rem",
            padding: "4rem",
            textAlign: "center",
            color: "#a855f7",
            fontWeight: 800,
            fontSize: "1.2rem",
            width: "100%",
          }}
        >
          {t("loading_tournaments")}
        </div>
      ) : tournaments.length === 0 ? (
        <div
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px dashed rgba(255,255,255,0.1)",
            borderRadius: "2rem",
            padding: "4rem",
            textAlign: "center",
            color: "rgba(255,255,255,0.5)",
            fontSize: "1.1rem",
            width: "100%",
          }}
        >
          {t("no_tournaments_available")}
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
            gap: "2.5rem",
            width: "100%",
          }}
        >
          {tournaments.map((tournament) => {
            const isRegistered = registeredIds.includes(tournament.id);

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
                {/* Status Indicator */}
                <div style={{ marginBottom: '0.75rem' }}>
                  <span
                    style={{
                      display: "inline-block",
                      background:
                        isRegistered
                          ? "rgba(16, 185, 129, 0.15)"
                          : tournament.status === "open"
                            ? "rgba(145, 70, 255, 0.2)"
                            : tournament.status === "active"
                              ? "rgba(255, 120, 0, 0.2)"
                              : "rgba(255,255,255,0.1)",
                      border: `1.5px solid ${
                        isRegistered
                          ? "#10b981"
                          : tournament.status === "open"
                            ? "#a855f7"
                            : tournament.status === "active"
                              ? "#ff7800"
                              : "rgba(255,255,255,0.2)"
                      }`,
                      color:
                        isRegistered
                          ? "#10b981"
                          : tournament.status === "open"
                            ? "#a855f7"
                            : tournament.status === "active"
                              ? "#ff7800"
                              : "rgba(255,255,255,0.5)",
                      borderRadius: "0.6rem",
                      padding: "3px 12px",
                      fontSize: "0.65rem",
                      fontWeight: 900,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {tournament.status === "open"
                      ? tournament.code_type === "single"
                        ? t("status_open_single")
                        : t("status_open_unique")
                      : tournament.status === "active"
                        ? t("status_active")
                        : t("status_finished")}
                  </span>
                </div>

                {/* Main Content */}
                <div style={{ marginBottom: "1.5rem" }}>
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

                  {/* Info Rows */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.6rem",
                    }}
                  >
                    {/* Start time / Winner info */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        fontSize: "0.8rem",
                        opacity: 0.85,
                      }}
                    >
                      {tournament.status === "finished" ? (
                        <>
                          <Award size={15} style={{ color: "#a855f7" }} />
                          <span>
                            {t("champion")}:{" "}
                            <strong style={{ color: "#c084fc" }}>
                              {tournament.winner}
                            </strong>
                          </span>
                        </>
                      ) : (
                        <>
                          <Clock size={15} style={{ color: "#a855f7" }} />
                          <span>
                            {t("starts")}:{" "}
                            <strong style={{ color: "#c084fc" }}>
                              {formatTournamentDate(tournament.start_time)}
                            </strong>
                          </span>
                        </>
                      )}
                    </div>

                    {/* Prize Info */}
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
                        <span>{tournament.prize.length > 1 ? t("prizes") : `${t("prize")}:`}</span>
                        {tournament.prize.map((p: string, i: number) => (
                          <strong key={i} style={{ color: "#ff7800" }}>
                            {i + 1}º {p}
                          </strong>
                        ))}
                      </div>
                    </div>

                    {/* Organizer Info */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        fontSize: "0.8rem",
                        opacity: 0.85,
                      }}
                    >
                      <ShieldCheck size={15} style={{ color: "#a855f7" }} />
                      <span>
                        {t("organized_by")}:{" "}
                        <strong style={{ color: "#c084fc" }}>
                          {tournament.organizer}
                        </strong>
                      </span>
                    </div>

                    {/* Slots Info / Progress */}
                    {tournament.status !== "finished" && (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "4px",
                          marginTop: "0.25rem",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: "0.75rem",
                            opacity: 0.7,
                          }}
                        >
                          <span>{t("slots_filled")}</span>
                          <strong>
                            {tournament.participants} /{" "}
                            {tournament.max_participants}
                          </strong>
                        </div>
                        {/* Slots Bar */}
                        <div
                          style={{
                            width: "100%",
                            height: "6px",
                            background: "rgba(255,255,255,0.06)",
                            borderRadius: "3px",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${(tournament.participants / tournament.max_participants) * 100}%`,
                              height: "100%",
                              background: isRegistered ? "#10b981" : "#a855f7",
                              borderRadius: "3px",
                              transition: "width 0.3s ease",
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: "flex", gap: "0.75rem" }}>
                   {/* Info Button */}
                  <button
                    onClick={() => {
                      try {
                        const path = window.location.pathname.startsWith("/en")
                          ? `/en/torneos/${tournament.id}`
                          : `/torneos/${tournament.id}`;
                        window.history.pushState({}, "", path);
                        window.dispatchEvent(new PopStateEvent("popstate"));
                      } catch (e) {
                        // ignore navigation errors
                      }
                    }}
                    className="btn-hover-dark"
                    style={{
                      flex: 1,
                      height: "46px",
                      padding: "0 0.25rem",
                      borderRadius: "1.25rem",
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.6rem",
                      cursor: "pointer",
                      fontSize: "0.9rem",
                      fontWeight: 950,
                      letterSpacing: "0.06em",
                    }}
                    title="Ver info del torneo"
                  >
                    <Info size={15} />
                    {t("info_button")}
                  </button>

                  {/* Enroll Button */}
                  <button
                    onClick={() => handleEnrollClick(tournament as any)}
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
                      background: isRegistered
                        ? "rgba(16, 185, 129, 0.1)"
                        : tournament.status !== "open" ||
                            tournament.participants >=
                              tournament.max_participants
                          ? "rgba(255,255,255,0.06)"
                          : "#a855f7",
                      border: isRegistered
                        ? "1px solid rgba(16, 185, 129, 0.3)"
                        : tournament.status !== "open" ||
                            tournament.participants >=
                              tournament.max_participants
                          ? "1px solid rgba(255,255,255,0.1)"
                          : "none",
                      color: isRegistered
                        ? "#10b981"
                        : tournament.status !== "open" ||
                            tournament.participants >=
                              tournament.max_participants
                          ? "rgba(255,255,255,0.4)"
                          : "#fff",
                      fontSize: "0.9rem",
                      fontWeight: 950,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem",
                      cursor:
                        isRegistered ||
                        tournament.status !== "open" ||
                        tournament.participants >= tournament.max_participants
                          ? "not-allowed"
                          : "pointer",
                      boxShadow:
                        isRegistered ||
                        tournament.status !== "open" ||
                        tournament.participants >= tournament.max_participants
                          ? "none"
                          : "4px 4px 0px #000",
                      opacity:
                        isRegistered ||
                        tournament.status !== "open" ||
                        tournament.participants >= tournament.max_participants
                          ? 0.7
                          : 1,
                    }}
                  >
                    {isRegistered ? (
                      <>
                        <CheckCircle2 size={16} />
                        {t("enrolled_button_label")}
                      </>
                    ) : tournament.participants >=
                      tournament.max_participants ? (
                      <>
                        <Lock size={16} />
                        {t("tournament_full")}
                      </>
                    ) : tournament.status === "open" ? (
                      <>
                        <Lock size={16} />
                        {t("sign_up_button")}
                      </>
                    ) : (
                      <>
                        <Lock size={16} />
                        {t("enrollments_closed")}
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* RANKING SECTION */}
      <div style={{ marginTop: "4rem", marginBottom: "2rem" }}>
        <h3
          className="text-display"
          style={{
            fontSize: "1.4rem",
            marginBottom: "1.5rem",
            color: "#fff",
            letterSpacing: "0.05em",
            textAlign: "center",
          }}
        >
          {t("global_ranking")}
        </h3>

        <div
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "1.5rem",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "60px 1fr 100px",
              padding: "1rem 1.5rem",
              background: "rgba(255,255,255,0.02)",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
              fontSize: "0.75rem",
              fontWeight: 800,
              color: "rgba(255,255,255,0.5)",
              textTransform: "uppercase",
            }}
          >
            <div style={{ textAlign: "center" }}>{t("pos")}</div>
            <div>{t("player")}</div>
            <div style={{ textAlign: "right" }}>{t("pts_ranking")}</div>
          </div>

          {/* List */}
          <div>
            {currentRankingPage.map((player, idx) => {
              const isTop3 = player.position <= 3;
              return (
                <div
                  key={player.id}
                  onClick={() => {
                    if (player.name === "TimPayne") {
                      setSelectedPlayerForHistory(player);
                    }
                  }}
                  onMouseEnter={() => {
                    if (player.name === "TimPayne") {
                      setHoveredPlayerId(player.id);
                    }
                  }}
                  onMouseLeave={() => setHoveredPlayerId(null)}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "60px 1fr 100px",
                    padding: "1rem 1.5rem",
                    borderBottom:
                      idx === currentRankingPage.length - 1
                        ? "none"
                        : "1px solid rgba(255,255,255,0.03)",
                    alignItems: "center",
                    background: hoveredPlayerId === player.id
                      ? "rgba(0, 242, 255, 0.08)"
                      : isTop3
                        ? "rgba(255,223,0,0.03)"
                        : "transparent",
                    transition: "background 0.2s ease",
                    cursor: player.name === "TimPayne" ? "pointer" : "default",
                  }}
                >
                  <div
                    style={{
                      textAlign: "center",
                      fontSize: "1.1rem",
                      fontWeight: 900,
                      color:
                        player.position === 1
                          ? "#ffdf00"
                          : player.position === 2
                            ? "#c0c0c0"
                            : player.position === 3
                              ? "#cd7f32"
                              : "rgba(255,255,255,0.5)",
                    }}
                  >
                    #{player.position}
                  </div>
                   <div
                    style={{
                      fontWeight: 800,
                      fontSize: "1rem",
                      color: isTop3 ? "#fff" : "rgba(255,255,255,0.8)",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <span>{player.name}</span>
                    {player.name === "TimPayne" && (
                      <span
                        style={{
                          fontSize: "0.65rem",
                          fontWeight: 900,
                          background: "rgba(0, 242, 255, 0.15)",
                          border: "1px solid #00f2ff",
                          color: "#00f2ff",
                          padding: "0.15rem 0.45rem",
                          borderRadius: "0.5rem",
                          letterSpacing: "0.05em",
                          textTransform: "uppercase",
                        }}
                      >
                        DEMO
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      textAlign: "right",
                      fontWeight: 900,
                      fontSize: "0.9rem",
                      color: "#00f2ff",
                    }}
                  >
                    {player.score}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pagination */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "1rem",
            marginTop: "1.5rem",
          }}
        >
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: currentPage === 1 ? "rgba(255,255,255,0.2)" : "#fff",
              width: "36px",
              height: "36px",
              borderRadius: "0.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: currentPage === 1 ? "not-allowed" : "pointer",
            }}
          >
            <ChevronLeft size={18} />
          </button>
          <div
            style={{
              fontSize: "0.8rem",
              fontWeight: 800,
              color: "rgba(255,255,255,0.5)",
            }}
          >
            {t("page_x_of_y", { current: currentPage, total: totalPages })}
          </div>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              color:
                currentPage === totalPages ? "rgba(255,255,255,0.2)" : "#fff",
              width: "36px",
              height: "36px",
              borderRadius: "0.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: currentPage === totalPages ? "not-allowed" : "pointer",
            }}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Twitch Button - Centered at the bottom of the page */}
      <TwitchButton />

      {/* ENROLLMENT MODAL */}
      <AnimatePresence>


        {enrollModalTournament && (
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
                background: "rgba(20, 15, 30, 0.95)",
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
                  {enrollModalTournament.name}
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
                {t("about_to_enroll")}{" "}
                <strong>{enrollModalTournament.name}</strong> {t("organized_by").toLowerCase()}{" "}
                <strong>{enrollModalTournament.organizer}</strong>.
                <br />
                <br />
                {enrollModalTournament.code_type === "unique"
                  ? t("enter_unique_code")
                  : t("enter_general_code")}
              </div>

              <input
                type="text"
                placeholder={t("enter_code_placeholder")}
                value={enrollCode}
                onChange={(e) => setEnrollCode(e.target.value)}
                disabled={enrolling}
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
                  {t("cancel_enrollment")}
                </button>
                <button
                  onClick={submitEnrollment}
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
                    cursor:
                      enrolling || !enrollCode ? "not-allowed" : "pointer",
                    opacity: enrolling || !enrollCode ? 0.5 : 1,
                  }}
                >
                  <CheckCircle2 size={18} />
                  {enrolling ? "..." : t("accept_enrollment")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedPlayerForHistory && (
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
              zIndex: 3100,
              padding: "1.5rem",
            }}
            onClick={() => setSelectedPlayerForHistory(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              style={{
                background: "rgba(20, 15, 30, 0.98)",
                border: "1.5px solid rgba(0, 242, 255, 0.4)",
                borderRadius: "2.5rem",
                padding: "2.5rem",
                width: "100%",
                maxWidth: "480px",
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 0 40px rgba(0, 242, 255, 0.15)",
                color: "#fff",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1.5rem",
                }}
              >
                <div>
                  <h3
                    className="text-display"
                    style={{
                      fontSize: "1.6rem",
                      color: "#00f2ff",
                      margin: 0,
                      letterSpacing: "0.05em",
                    }}
                  >
                    {t("tournament_history")}
                  </h3>
                  <div style={{ fontSize: "0.85rem", opacity: 0.6, marginTop: "0.2rem" }}>
                    {t("player")}: <span style={{ color: "#fff", fontWeight: 800 }}>{selectedPlayerForHistory.name}</span> · {t("total_points")}: <span style={{ color: "#ffdf00", fontWeight: 800 }}>{selectedPlayerForHistory.score} PTS</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPlayerForHistory(null)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "rgba(255,255,255,0.5)",
                    cursor: "pointer",
                    padding: "0.5rem",
                    fontSize: "1.2rem",
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Participaciones list */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                  maxHeight: "350px",
                  overflowY: "auto",
                  paddingRight: "0.25rem",
                }}
              >
                {[
                  { torneo: t("tournament_champions"), puesto: t("champion_1"), puntos: "+500 PTS", fecha: "15/05/2026" },
                  { torneo: t("creators_world_cup"), puesto: t("runner_up_2"), puntos: "+400 PTS", fecha: "02/05/2026" },
                  { torneo: t("apertura_tournament"), puesto: t("semifinal_3_4"), puntos: "+300 PTS", fecha: "18/04/2026" },
                  { torneo: t("stars_challenge"), puesto: t("round_of_16"), puntos: "+100 PTS", fecha: "05/04/2026" }
                ].map((p, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.05)",
                      borderRadius: "1rem",
                      padding: "1rem",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.35rem",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: 800, color: "#fff", fontSize: "0.95rem" }}>{p.torneo}</span>
                      <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }}>{p.fecha}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem" }}>
                      <span style={{ color: p.puesto.includes("1º") ? "#ffdf00" : p.puesto.includes("2º") ? "#c0c0c0" : "#a855f7", fontWeight: 700 }}>
                        {p.puesto}
                      </span>
                      <span style={{ color: "#00f2ff", fontWeight: 800 }}>{p.puntos}</span>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setSelectedPlayerForHistory(null)}
                style={{
                  marginTop: "2rem",
                  background: "#00f2ff",
                  border: "none",
                  color: "#000",
                  height: "48px",
                  borderRadius: "1rem",
                  fontWeight: 950,
                  fontSize: "0.95rem",
                  cursor: "pointer",
                  boxShadow: "4px 4px 0px #000",
                }}
              >
                {t("close_history")}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
