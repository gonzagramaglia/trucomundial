import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert,
  Users,
  Swords,
  ArrowLeft,
  LogOut,
  Scroll,
  Calendar,
  FileText,
  Check,
  X,
  Trophy,
  Trash2,
  Edit2,
  CheckCircle2,
  MessageSquare,
  Star,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { supabase } from "../../lib/supabase";
import { TournamentFormModal } from "./TournamentFormModal";
import { CreatorProfileModal } from "./CreatorProfileModal";
import { TournamentBracketModal } from "./TournamentBracketModal";
import { TournamentPlayersModal } from "./TournamentPlayersModal";
import { TwitchButton } from '../shared/TwitchButton';
import { UserStarsModal } from "./UserStarsModal";
import {

  formatTournamentPrizes,
  normalizeTournamentPrizes,
} from "../../lib/formatters";

const ADMIN_EMAILS = ["gonzagramaglia@gmail.com", "ciberportero@gmail.com"];

interface AdminScreenProps {
  user: any;
  handleAuth: () => void;
  onBack: () => void;
}

interface MatchSummary {
  id: string;
  match_id: string;
  userId: string;
  rivalName: string;
  myScore: number;
  rivalScore: number;
  winner: "player" | "cpu";
  date: string;
  log: string[];
  isTournament?: boolean;
  tournamentId?: string;
  tournamentName?: string;
}

interface PlayerStats {
  userId: string;
  userName: string;
  email: string;
  totalGames: number;
  wins: number;
  losses: number;
  lastPlayed: string;
  votes: Record<string, number>;
}

interface CreatorApplication {
  id: string;
  user_id: string;
  email: string;
  channel_name: string;
  social_link?: string;
  streaming_link?: string;
  motivation?: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

export const AdminScreen: React.FC<AdminScreenProps> = ({ user, onBack }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<MatchSummary[]>([]);
  const [applications, setApplications] = useState<CreatorApplication[]>([]);
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [usedCodes, setUsedCodes] = useState<
    Record<string, { code: string; userId: string }[]>
  >({});
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  console.log(deleteConfirmId); // keep typescript happy
  const [selectedMatch, setSelectedMatch] = useState<MatchSummary | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formTournament, setFormTournament] = useState<any>(null);
  const [isCreatorProfileModalOpen, setIsCreatorProfileModalOpen] =
    useState(false);
  const [editingCreator, setEditingCreator] = useState<any>(null);
  const [playersModalTournament, setPlayersModalTournament] = useState<any>(null);
  const [playersModalRegs, setPlayersModalRegs] = useState<any[]>([]);
  const [bracketModalTournament, setBracketModalTournament] = useState<any>(null);
  const [bracketModalRegs, setBracketModalRegs] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [globalVotesData, setGlobalVotesData] = useState<any[]>([]);
  const [selectedUserStars, setSelectedUserStars] = useState<any | null>(null);
  const [userRoles, setUserRoles] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<
    | "players"
    | "matches"
    | "applications"
    | "tournaments"
    | "suggestions"
    | "support"
  >("players");
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false,
  );

  const isAdmin = user && user.email && ADMIN_EMAILS.includes(user.email);

  useEffect(() => {
    document.title = "Admin de Truco Mundial";
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchGlobalData = async () => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }
    setLoading(true);

    try {
      // 1. Fetch Profiles (Everyone who logged in at least once)
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*");

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
      } else if (profilesData) {
        setProfiles(profilesData);
      }

      // 2. Fetch User Roles
      const { data: rolesData, error: rolesError } = await supabase
        .from("user_roles")
        .select("*");

      if (rolesError) {
        console.error("Error fetching user roles:", rolesError);
      } else if (rolesData) {
        setUserRoles(rolesData);
      }

      // 3. Fetch Matches and Votes
      const { data: syncData, error: syncError } = await supabase
        .from("game_sync")
        .select("id, match_id, last_move, updated_at")
        .or("match_id.like.user_history_%,match_id.like.user_votes_%");

      if (syncError) {
        console.error("Error fetching global sync data:", syncError);
      } else if (syncData) {
        const historyData = syncData.filter(item => item.match_id.startsWith("user_history_"));
        const votesData = syncData.filter(item => item.match_id.startsWith("user_votes_"));

        setGlobalVotesData(votesData);

        const formattedHistory: MatchSummary[] = historyData
          .map((item: any) => {
            const summary = item.last_move;
            return {
              id: item.id,
              match_id: item.match_id,
              userId: summary.userId || "Desconocido",
              rivalName: summary.rivalName || t("rival"),
              myScore: summary.myScore || 0,
              rivalScore: summary.rivalScore || 0,
              winner: summary.winner || "cpu",
              date: summary.date || item.updated_at,
              log: summary.log || [],
              isTournament: summary.isTournament,
              tournamentId: summary.tournamentId,
              tournamentName: summary.tournamentName,
            };
          })
          .sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
          );

        setHistory(formattedHistory);
      }

      // Fetch Applications
      const { data: appsData, error: appsError } = await supabase
        .from("creator_applications")
        .select("*")
        .order("created_at", { ascending: false });

      if (appsError) {
        console.error("Error fetching applications:", appsError);
      } else if (appsData) {
        setApplications(appsData);
      }

      // Fetch Tournaments
      const { data: tourneysData, error: tourneysError } = await supabase
        .from("tournaments")
        .select("*")
        .order("created_at", { ascending: false });

      if (tourneysError) {
        console.error("Error fetching tournaments:", tourneysError);
      } else if (tourneysData) {
        setTournaments(
          tourneysData.map((tournament: any) => ({
            ...tournament,
            prize: normalizeTournamentPrizes(tournament.prize),
          })),
        );
        if (tourneysData.length > 0) {
          const tIds = tourneysData.map((t: any) => t.id);
          const { data: regData } = await supabase
            .from("tournament_registrations")
            .select("tournament_id, code_used, user_id")
            .in("tournament_id", tIds);

          if (regData) {
            const codeMap: Record<string, { code: string; userId: string }[]> =
              {};
            regData.forEach((r: any) => {
              if (!codeMap[r.tournament_id]) codeMap[r.tournament_id] = [];
              if (r.code_used)
                codeMap[r.tournament_id].push({
                  code: r.code_used,
                  userId: r.user_id || "",
                });
            });
            setUsedCodes(codeMap);
          }
        }
      }

      // Fetch Tickets
      const { data: ticketsData, error: ticketsError } = await supabase
        .from("tickets")
        .select("*")
        .order("created_at", { ascending: false });

      if (ticketsError) {
        console.error("Error fetching tickets:", ticketsError);
      } else if (ticketsData) {
        setTickets(ticketsData);
      }
    } catch (err) {
      console.error("Unexpected error fetching global data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGlobalData();
  }, [isAdmin]);

  const handleApplicationStatus = async (
    appId: string,
    newStatus: "approved" | "rejected",
  ) => {
    try {
      const { error } = await supabase
        .from("creator_applications")
        .update({ status: newStatus })
        .eq("id", appId);

      if (error) throw error;

      setApplications((prev) =>
        prev.map((app) =>
          app.id === appId ? { ...app, status: newStatus } : app,
        ),
      );
    } catch (err: any) {
      alert("Error cambiando estado: " + err.message);
    }
  };

  const handleCloseRegistrations = async (tournamentId: string) => {
    const { error } = await supabase
      .from("tournaments")
      .update({ status: "closed" })
      .eq("id", tournamentId);
    if (!error)
      setTournaments((prev) =>
        prev.map((t) =>
          t.id === tournamentId ? { ...t, status: "closed" } : t,
        ),
      );
    else alert("Error al cerrar: " + error.message);
  };

  const openPlayersModal = async (tournament: any) => {
    const { data } = await supabase
      .from("tournament_registrations")
      .select("user_id, code_used")
      .eq("tournament_id", tournament.id);
    setPlayersModalRegs(data || []);
    setPlayersModalTournament(tournament);
  };

  const openBracketModal = async (tournament: any) => {
    const { data } = await supabase
      .from("tournament_registrations")
      .select("user_id, code_used")
      .eq("tournament_id", tournament.id);
    setBracketModalRegs(data || []);
    setBracketModalTournament(tournament);
  };

  /*
  const handleDeleteTournament = async (id: string) => {
    try {
      const { error } = await supabase.from('tournaments').delete().eq('id', id);
      if (error) throw error;
      setTournaments(prev => prev.filter(t => t.id !== id));
      setDeleteConfirmId(null);
    } catch (err: any) {
      alert('Error al eliminar torneo: ' + err.message);
    }
  };
  */

  const handleTicketStatus = async (
    ticketId: string,
    newStatus: "open" | "closed",
  ) => {
    try {
      const { error } = await supabase
        .from("tickets")
        .update({ status: newStatus })
        .eq("id", ticketId);

      if (error) throw error;

      setTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? { ...t, status: newStatus } : t)),
      );
    } catch (err: any) {
      alert("Error cambiando estado del ticket: " + err.message);
    }
  };

  const playerStats = useMemo(() => {
    const statsMap = new Map<string, PlayerStats>();

    // 1. Initialize with all profiles (users logged in at least once)
    profiles.forEach((profile) => {
      statsMap.set(profile.id, {
        userId: profile.id,
        userName: profile.username || "Usuario",
        email: profile.email || "Sin Email",
        totalGames: 0,
        wins: 0,
        losses: 0,
        lastPlayed: profile.last_sign_in_at || profile.created_at || new Date().toISOString(),
        votes: {}
      });
    });

    const getOrCreatePlayer = (pId: string, defaultName: string = "Usuario", lastActiveDate: string = ""): PlayerStats => {
      if (!statsMap.has(pId)) {
        statsMap.set(pId, {
          userId: pId,
          userName: defaultName,
          email: "Sin Email",
          totalGames: 0,
          wins: 0,
          losses: 0,
          lastPlayed: lastActiveDate || new Date().toISOString(),
          votes: {}
        });
      }
      return statsMap.get(pId)!;
    };

    // 2. Add Match History data
    history.forEach((match) => {
      const pId = match.userId;
      const pStats = getOrCreatePlayer(pId, "Usuario", match.date);
      pStats.totalGames += 1;
      if (match.winner === "player") {
        pStats.wins += 1;
      } else {
        pStats.losses += 1;
      }

      if (new Date(match.date) > new Date(pStats.lastPlayed)) {
        pStats.lastPlayed = match.date;
      }
    });

    // 3. Add Star distribution data (user_votes_*)
    globalVotesData.forEach((item) => {
      const userId = item.match_id.replace(/^user_votes_/, '');
      const votes = item.last_move?.votes || {};
      const userName = item.last_move?.userName || "Usuario";
      const updatedAt = item.last_move?.updatedAt || item.updated_at;

      const pStats = getOrCreatePlayer(userId, userName, updatedAt);
      pStats.votes = votes;

      if (updatedAt && new Date(updatedAt) > new Date(pStats.lastPlayed)) {
        pStats.lastPlayed = updatedAt;
      }
      if (item.last_move?.userName && pStats.userName === "Usuario") {
        pStats.userName = item.last_move.userName;
      }
    });

    return Array.from(statsMap.values()).sort(
      (a, b) => new Date(b.lastPlayed).getTime() - new Date(a.lastPlayed).getTime(),
    );
  }, [profiles, history, globalVotesData]);

  const getPlayerRole = (userId: string): "normal" | "mod" | "admin" | "creator" => {
    const roleRecord = userRoles.find(r => r.user_id === userId);
    if (roleRecord) return roleRecord.role;

    const isCreator = applications.some(app => app.user_id === userId && app.status === "approved");
    if (isCreator) return "creator";

    return "normal";
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setLoading(true);
    try {
      if (newRole === "normal") {
        // Delete from user_roles
        await supabase.from("user_roles").delete().eq("user_id", userId);
        // Delete from creator_applications
        await supabase.from("creator_applications").delete().eq("user_id", userId);
        alert("Rol de usuario restablecido a NORMAL.");
      } else if (newRole === "admin" || newRole === "mod") {
        // Delete from creator_applications
        await supabase.from("creator_applications").delete().eq("user_id", userId);
        // Upsert new role in user_roles
        const { error } = await supabase
          .from("user_roles")
          .upsert([{ user_id: userId, role: newRole }], { onConflict: 'user_id' });
        if (error) throw error;
        alert(`Rol ${newRole.toUpperCase()} asignado con éxito.`);
      } else if (newRole === "creator") {
        // Delete from user_roles
        await supabase.from("user_roles").delete().eq("user_id", userId);
        // Manage creator applications
        const existingApp = applications.find(app => app.user_id === userId);
        if (existingApp) {
          const { error } = await supabase
            .from("creator_applications")
            .update({ status: "approved" })
            .eq("id", existingApp.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from("creator_applications")
            .insert([{
              user_id: userId,
              email: "assigned-by-admin@trucomundial.com",
              channel_name: "Nuevo Creador",
              status: "approved",
            }]);
          if (error) throw error;
        }
        alert("Rol CREADOR asignado con éxito.");
      }

      await fetchGlobalData();
    } catch (err: any) {
      console.error("Error changing role:", err);
      alert("Error al cambiar el rol: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const datePart = d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      const timePart = d.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      return `${datePart}, ${timePart}`;
    } catch {
      return dateStr;
    }
  };

  if (!user) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          padding: "2rem",
        }}
      >
        <div
          style={{
            background: "rgba(145, 70, 255, 0.05)",
            border: "2px dashed rgba(145, 70, 255, 0.45)",
            borderRadius: "2rem",
            padding: "3rem 2rem",
            textAlign: "center",
            backdropFilter: "blur(16px)",
            maxWidth: "500px",
            width: "100%",
          }}
        >
          <ShieldAlert
            size={48}
            style={{
              color: "#a855f7",
              marginBottom: "1.5rem",
              margin: "0 auto",
            }}
          />
          <h3
            className="text-display"
            style={{
              fontSize: "1.5rem",
              marginBottom: "0.75rem",
              color: "#a855f7",
            }}
          >
            Acceso Restringido
          </h3>
          <p
            style={{
              margin: "0 auto 2rem auto",
              opacity: 0.7,
              lineHeight: 1.5,
            }}
          >
            Debes haber iniciado sesión con una cuenta de administrador para
            acceder a esta sección.
          </p>
          <div
            style={{ display: "flex", gap: "1rem", justifyContent: "center" }}
          >
            <button
              onClick={onBack}
              className="btn-hover-dark"
              style={{
                background: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                color: "#fff",
                height: "48px",
                borderRadius: "1.25rem",
                padding: "0 1.5rem",
                fontSize: "1rem",
                fontWeight: 950,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                boxShadow: "4px 4px 0px #000",
              }}
            >
              <ArrowLeft size={18} />
              Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          padding: "2rem",
        }}
      >
        <div
          style={{
            background: "rgba(239, 68, 68, 0.05)",
            border: "2px dashed rgba(239, 68, 68, 0.45)",
            borderRadius: "2rem",
            padding: "3rem 2rem",
            textAlign: "center",
            backdropFilter: "blur(16px)",
            maxWidth: "500px",
            width: "100%",
          }}
        >
          <ShieldAlert
            size={48}
            style={{
              color: "#ef4444",
              marginBottom: "1.5rem",
              margin: "0 auto",
            }}
          />
          <h3
            className="text-display"
            style={{
              fontSize: "1.5rem",
              marginBottom: "0.75rem",
              color: "#ef4444",
            }}
          >
            Acceso Denegado
          </h3>
          <p
            style={{
              margin: "0 auto 2rem auto",
              opacity: 0.7,
              lineHeight: 1.5,
            }}
          >
            Tu cuenta ({user.email}) no tiene permisos de administrador.
          </p>
          <button
            onClick={onBack}
            className="btn-hover-dark"
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              color: "#fff",
              height: "48px",
              borderRadius: "1.25rem",
              padding: "0 2rem",
              fontSize: "1rem",
              fontWeight: 950,
              cursor: "pointer",
              margin: "0 auto",
              boxShadow: "4px 4px 0px #000",
            }}
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "1200px",
        margin: "0 auto",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        padding: isMobile ? "1.5rem 1rem 4rem 1rem" : "2rem 1rem 4rem 1rem",
        color: "#fff",
        boxSizing: "border-box",
      }}
    >
      {/* HEADER SECTION (Centered column layout on desktop, /ruta style on mobile) */}
      {!isMobile && (
        <>
          {/* Fixed Home Button (Desktop Left Corner) */}
          <button
            onClick={onBack}
            className="home-btn-fixed btn-hover-dark profile-nav-btn"
            style={{
              position: "fixed",
              top: "1.5rem",
              left: "1rem",
              background: "rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(12px)",
              zIndex: 2000,
              height: "36px",
              borderRadius: "0.85rem",
              padding: "0 0.85rem",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              color: "white",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: "none",
              fontWeight: 900,
              fontSize: "0.7rem",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            <ArrowLeft size={14} />
            <span>Volver</span>
          </button>

          {/* Fixed Logout Button (Desktop Right Corner) */}
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              onBack();
            }}
            className="twitch-btn btn-hover-dark profile-nav-btn"
            style={{
              position: "fixed",
              top: "1.5rem",
              right: "1rem",
              background: "rgba(239, 68, 68, 0.15)",
              backdropFilter: "blur(12px)",
              zIndex: 2000,
              height: "36px",
              borderRadius: "0.85rem",
              padding: "0 0.85rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.4rem",
              color: "#ef4848",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              boxShadow: "0 4px 14px rgba(239, 68, 68, 0.08)",
              cursor: "pointer",
              fontWeight: 900,
              fontSize: "0.7rem",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
            title="Cerrar Sesión"
          >
            <LogOut size={14} style={{ transform: "scaleX(-1)" }} />
            <span>Cerrar Sesión</span>
          </button>
        </>
      )}

      {/* HEADER SECTION (Responsive layout) */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          marginTop: "-1rem",
          marginBottom: isMobile ? "1.5rem" : "2.5rem",
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
              {/* Back Button */}
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
                Volver
              </button>

              {/* Logout Button */}
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  onBack();
                }}
                className="btn-hover-dark"
                style={{
                  background: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.2)",
                  color: "#ef4848",
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
                <LogOut size={14} style={{ transform: "scaleX(-1)" }} />
                Cerrar
              </button>
            </div>

            {/* Mobile Title */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.25rem",
                textAlign: "center",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <ShieldAlert
                  size={24}
                  style={{
                    color: "#a855f7",
                    filter: "drop-shadow(0 0 6px rgba(168, 85, 247, 0.25))",
                  }}
                />
                <h2
                  className="text-display"
                  style={{
                    fontSize: "1.4rem",
                    margin: 0,
                    letterSpacing: "0.05em",
                    color: "#a855f7",
                    textShadow: "0 0 8px rgba(168, 85, 247, 0.1)",
                  }}
                >
                  PANEL DE ADMIN
                </h2>
              </div>
              <div style={{ fontSize: "0.75rem", opacity: 0.6 }}>
                Gestión de jugadores, torneos, creadores y soporte
              </div>
            </div>
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
                <ShieldAlert
                  size={36}
                  style={{
                    color: "#a855f7",
                    filter: "drop-shadow(0 0 10px rgba(168, 85, 247, 0.3))",
                  }}
                />
                <h2
                  className="text-display"
                  style={{
                    fontSize: "2.2rem",
                    margin: 0,
                    letterSpacing: "0.05em",
                    color: "#a855f7",
                    textShadow: "0 0 15px rgba(168, 85, 247, 0.2)",
                  }}
                >
                  PANEL DE ADMIN
                </h2>
              </div>
              <div style={{ fontSize: "0.9rem", opacity: 0.6 }}>
                Gestión de jugadores, torneos, creadores y soporte técnico
              </div>
            </div>
          </>
        )}
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "2rem",
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={() => setActiveTab("players")}
          style={{
            background:
              activeTab === "players" ? "#a855f7" : "rgba(255, 255, 255, 0.05)",
            border:
              activeTab === "players"
                ? "none"
                : "1px solid rgba(255, 255, 255, 0.1)",
            color:
              activeTab === "players" ? "#fff" : "rgba(255, 255, 255, 0.5)",
            padding: "0.75rem 1.5rem",
            borderRadius: "1rem",
            fontWeight: 800,
            fontSize: "0.9rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            boxShadow: activeTab === "players" ? "4px 4px 0px #000" : "none",
            transition: "all 0.2s",
          }}
        >
          <Users size={18} /> Jugadores ({playerStats.length})
        </button>
        <button
          onClick={() => setActiveTab("matches")}
          style={{
            background:
              activeTab === "matches" ? "#a855f7" : "rgba(255, 255, 255, 0.05)",
            border:
              activeTab === "matches"
                ? "none"
                : "1px solid rgba(255, 255, 255, 0.1)",
            color:
              activeTab === "matches" ? "#fff" : "rgba(255, 255, 255, 0.5)",
            padding: "0.75rem 1.5rem",
            borderRadius: "1rem",
            fontWeight: 800,
            fontSize: "0.9rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            boxShadow: activeTab === "matches" ? "4px 4px 0px #000" : "none",
            transition: "all 0.2s",
          }}
        >
          <Swords size={18} /> Partidas Globales ({history.length})
        </button>
        <button
          onClick={() => setActiveTab("applications")}
          style={{
            background:
              activeTab === "applications"
                ? "#a855f7"
                : "rgba(255, 255, 255, 0.05)",
            border:
              activeTab === "applications"
                ? "none"
                : "1px solid rgba(255, 255, 255, 0.1)",
            color:
              activeTab === "applications"
                ? "#fff"
                : "rgba(255, 255, 255, 0.5)",
            padding: "0.75rem 1.5rem",
            borderRadius: "1rem",
            fontWeight: 800,
            fontSize: "0.9rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            boxShadow:
              activeTab === "applications" ? "4px 4px 0px #000" : "none",
            transition: "all 0.2s",
          }}
        >
          <FileText size={18} /> Creadores ({applications.length})
        </button>
        <button
          onClick={() => setActiveTab("tournaments")}
          style={{
            background:
              activeTab === "tournaments"
                ? "#a855f7"
                : "rgba(255, 255, 255, 0.05)",
            border:
              activeTab === "tournaments"
                ? "none"
                : "1px solid rgba(255, 255, 255, 0.1)",
            color:
              activeTab === "tournaments" ? "#fff" : "rgba(255, 255, 255, 0.5)",
            padding: "0.75rem 1.5rem",
            borderRadius: "1rem",
            fontWeight: 800,
            fontSize: "0.9rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            boxShadow:
              activeTab === "tournaments" ? "4px 4px 0px #000" : "none",
            transition: "all 0.2s",
          }}
        >
          <Trophy size={18} /> Torneos ({tournaments.length})
        </button>
        <button
          onClick={() => setActiveTab("suggestions")}
          style={{
            background:
              activeTab === "suggestions"
                ? "#a855f7"
                : "rgba(255, 255, 255, 0.05)",
            border:
              activeTab === "suggestions"
                ? "none"
                : "1px solid rgba(255, 255, 255, 0.1)",
            color:
              activeTab === "suggestions" ? "#fff" : "rgba(255, 255, 255, 0.5)",
            padding: "0.75rem 1.5rem",
            borderRadius: "1rem",
            fontWeight: 800,
            fontSize: "0.9rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            boxShadow:
              activeTab === "suggestions" ? "4px 4px 0px #000" : "none",
            transition: "all 0.2s",
          }}
        >
          <MessageSquare size={18} /> Sugerencias (
          {
            tickets.filter(
              (t) => t.type === "suggestion" && t.status === "open",
            ).length
          }
          )
        </button>
        <button
          onClick={() => setActiveTab("support")}
          style={{
            background:
              activeTab === "support" ? "#a855f7" : "rgba(255, 255, 255, 0.05)",
            border:
              activeTab === "support"
                ? "none"
                : "1px solid rgba(255, 255, 255, 0.1)",
            color:
              activeTab === "support" ? "#fff" : "rgba(255, 255, 255, 0.5)",
            padding: "0.75rem 1.5rem",
            borderRadius: "1rem",
            fontWeight: 800,
            fontSize: "0.9rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            boxShadow: activeTab === "support" ? "4px 4px 0px #000" : "none",
            transition: "all 0.2s",
          }}
        >
          <ShieldAlert size={18} /> Soporte (
          {
            tickets.filter((t) => t.type === "support" && t.status === "open")
              .length
          }
          )
        </button>
      </div>

      {/* Content */}
      <div style={{ minHeight: "60vh" }}>
        {loading ? (
          <div
            style={{
              textAlign: "center",
              padding: "4rem 0",
              color: "#a855f7",
              fontWeight: 800,
              fontSize: "1.2rem",
            }}
          >
            Cargando datos de la plataforma...
          </div>
        ) : activeTab === "players" ? (
          <div
            style={{
              background: "rgba(255, 255, 255, 0.02)",
              border: "1px solid rgba(255, 255, 255, 0.05)",
              borderRadius: "1.5rem",
              overflow: "hidden",
              overflowX: "auto",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: "600px",
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    textAlign: "left",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                  }}
                >
                  <th
                    style={{
                      padding: "1.25rem 1.5rem",
                      fontWeight: 800,
                      color: "rgba(255, 255, 255, 0.7)",
                      fontSize: "0.8rem",
                      textTransform: "uppercase",
                    }}
                  >
                    Usuario
                  </th>
                  <th
                    style={{
                      padding: "1.25rem 1.5rem",
                      fontWeight: 800,
                      color: "rgba(255, 255, 255, 0.7)",
                      fontSize: "0.8rem",
                      textTransform: "uppercase",
                    }}
                  >
                    Partidas
                  </th>
                  <th
                    style={{
                      padding: "1.25rem 1.5rem",
                      fontWeight: 800,
                      color: "#10b981",
                      fontSize: "0.8rem",
                      textTransform: "uppercase",
                    }}
                  >
                    Victorias
                  </th>
                  <th
                    style={{
                      padding: "1.25rem 1.5rem",
                      fontWeight: 800,
                      color: "#ef4444",
                      fontSize: "0.8rem",
                      textTransform: "uppercase",
                    }}
                  >
                    Derrotas
                  </th>
                  <th
                    style={{
                      padding: "1.25rem 1.5rem",
                      fontWeight: 800,
                      color: "rgba(255, 255, 255, 0.7)",
                      fontSize: "0.8rem",
                      textTransform: "uppercase",
                    }}
                  >
                    Última Vez
                  </th>
                  <th
                    style={{
                      padding: "1.25rem 1.5rem",
                      fontWeight: 800,
                      color: "rgba(255, 255, 255, 0.7)",
                      fontSize: "0.8rem",
                      textTransform: "uppercase",
                      textAlign: "right",
                    }}
                  >
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {playerStats.map((stats, idx) => {
                  return (
                    <tr
                      key={stats.userId}
                      style={{
                        borderBottom:
                          idx === playerStats.length - 1
                            ? "none"
                            : "1px solid rgba(255, 255, 255, 0.05)",
                      }}
                    >
                      <td
                        style={{
                          padding: "1rem 1.5rem",
                          fontSize: "0.95rem",
                        }}
                      >
                        <div style={{ fontWeight: 800, color: '#fff' }}>
                          {stats.userName}
                        </div>
                        <div style={{ fontSize: "0.75rem", opacity: 0.5, marginTop: "0.15rem", fontFamily: "monospace" }}>
                          {stats.email}
                        </div>
                      </td>
                      <td
                        style={{
                          padding: "1rem 1.5rem",
                          fontWeight: 800,
                          fontSize: "1rem",
                        }}
                      >
                        {stats.totalGames}
                      </td>
                      <td
                        style={{
                          padding: "1rem 1.5rem",
                          fontWeight: 800,
                          color: "#10b981",
                        }}
                      >
                        {stats.wins}
                      </td>
                      <td
                        style={{
                          padding: "1rem 1.5rem",
                          fontWeight: 800,
                          color: "#ef4444",
                        }}
                      >
                        {stats.losses}
                      </td>
                      <td
                        style={{
                          padding: "1rem 1.5rem",
                          fontSize: "0.85rem",
                          opacity: 0.6,
                        }}
                      >
                        {formatDate(stats.lastPlayed)}
                      </td>
                      <td
                        style={{ padding: "1rem 1.5rem", textAlign: "right" }}
                      >
                        <div
                          style={{
                            display: "flex",
                            gap: "0.5rem",
                            justifyContent: "flex-end",
                          }}
                        >
                          <button
                            onClick={() =>
                              setSelectedUserStars({
                                userName: stats.userName,
                                userEmail: stats.email,
                                votes: stats.votes
                              })
                            }
                            style={{
                              background: "rgba(254, 240, 138, 0.15)",
                              border: "1px solid rgba(254, 240, 138, 0.3)",
                              color: "var(--color-accent)",
                              padding: "0.25rem 0.6rem",
                              borderRadius: "0.5rem",
                              fontSize: "0.75rem",
                              fontWeight: 800,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "0.25rem",
                              marginRight: "0.25rem"
                            }}
                            title="Ver Distribución de Estrellas"
                          >
                            <Star size={11} fill="var(--color-accent)" /> Estrellas
                          </button>
                          <select
                            value={getPlayerRole(stats.userId)}
                            onChange={(e) => handleRoleChange(stats.userId, e.target.value)}
                            style={{
                              background: "rgba(0, 0, 0, 0.4)",
                              border: "1px solid rgba(255, 255, 255, 0.2)",
                              color: "#fff",
                              padding: "0.35rem 1.6rem 0.35rem 0.65rem",
                              borderRadius: "0.5rem",
                              fontSize: "0.75rem",
                              fontWeight: 800,
                              cursor: "pointer",
                              outline: "none",
                              boxSizing: "border-box",
                              appearance: "none",
                              WebkitAppearance: "none",
                              backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                              backgroundRepeat: "no-repeat",
                              backgroundPosition: "right 0.55rem center",
                              backgroundSize: "0.7rem",
                            }}
                          >
                            <option value="normal" style={{ background: "#180c28", color: "#fff" }}>NORMAL</option>
                            <option value="mod" style={{ background: "#180c28", color: "#10b981" }}>MOD</option>
                            <option value="admin" style={{ background: "#180c28", color: "#ef4444" }}>ADMIN</option>
                            <option value="creator" style={{ background: "#180c28", color: "#ff7800" }}>CREADOR</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {playerStats.length === 0 && (
              <div
                style={{ textAlign: "center", padding: "2rem 0", opacity: 0.5 }}
              >
                No hay jugadores registrados con partidas.
              </div>
            )}
          </div>
        ) : activeTab === "matches" ? (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            {history.map((match) => {
              const playerWon = match.winner === "player";
              return (
                <div
                  key={match.id}
                  style={{
                    background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "1.5rem",
                    padding: "1.5rem",
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "1rem",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: "0.7rem",
                        fontFamily: "monospace",
                        opacity: 0.5,
                        marginBottom: "0.5rem",
                      }}
                    >
                      Match: {match.match_id}
                    </div>
                    {match.isTournament && (
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.3rem",
                          background: "rgba(255, 120, 0, 0.15)",
                          border: "1px solid rgba(255, 120, 0, 0.3)",
                          color: "#ff7800",
                          padding: "0.2rem 0.6rem",
                          borderRadius: "0.4rem",
                          fontSize: "0.65rem",
                          fontWeight: 800,
                          textTransform: "uppercase",
                          marginBottom: "0.5rem"
                        }}
                      >
                        <Trophy size={10} /> Torneo: {match.tournamentName}
                      </div>
                    )}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        fontWeight: 800,
                        fontSize: "1.1rem",
                      }}
                    >
                      <span style={{ color: playerWon ? "#10b981" : "#fff" }}>
                        Player
                      </span>
                      <span style={{ opacity: 0.3 }}>vs</span>
                      <span style={{ color: !playerWon ? "#ef4444" : "#fff" }}>
                        {match.rivalName}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.4rem",
                        opacity: 0.5,
                        fontSize: "0.75rem",
                        marginTop: "0.5rem",
                      }}
                    >
                      <Calendar size={12} />
                      {formatDate(match.date)}
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "2rem",
                    }}
                  >
                    <div style={{ fontSize: "1.75rem", fontWeight: 900 }}>
                      <span style={{ color: playerWon ? "#10b981" : "#fff" }}>
                        {match.myScore}
                      </span>
                      <span style={{ opacity: 0.3, margin: "0 0.5rem" }}>
                        -
                      </span>
                      <span style={{ color: !playerWon ? "#ef4444" : "#fff" }}>
                        {match.rivalScore}
                      </span>
                    </div>

                    <button
                      onClick={() => setSelectedMatch(match)}
                      className="btn-hover-dark"
                      style={{
                        background: "rgba(255,255,255,0.08)",
                        border: "1px solid rgba(255,255,255,0.15)",
                        color: "#fff",
                        height: "38px",
                        borderRadius: "0.85rem",
                        padding: "0 1rem",
                        fontSize: "0.8rem",
                        fontWeight: 800,
                        display: "flex",
                        alignItems: "center",
                        gap: "0.4rem",
                        cursor: "pointer",
                        boxShadow: "3px 3px 0px #000",
                      }}
                    >
                      <Scroll size={14} />
                      {isMobile ? "" : "Log"}
                    </button>
                  </div>
                </div>
              );
            })}
            {history.length === 0 && (
              <div
                style={{ textAlign: "center", padding: "2rem 0", opacity: 0.5 }}
              >
                No hay partidas globales registradas.
              </div>
            )}
          </div>
        ) : activeTab === "tournaments" ? (
          <div style={{ display: "grid", gap: "1rem" }}>
            {tournaments.length === 0 ? (
              <div
                style={{ textAlign: "center", padding: "2rem 0", opacity: 0.5 }}
              >
                No hay torneos creados.
              </div>
            ) : (
              tournaments.map((tournament) => (
                <div
                  key={tournament.id}
                  style={{
                    background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "1.5rem",
                    padding: "1.5rem",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "stretch",
                    justifyContent: "flex-start",
                    gap: "0.5rem",
                  }}
                >
                  {/* Top Row: Title & Actions */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "1rem",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                      }}
                    >
                      <span
                        style={{
                          background:
                            tournament.status === "open"
                              ? "rgba(168, 85, 247, 0.2)"
                              : tournament.status === "active"
                                ? "rgba(255, 120, 0, 0.2)"
                                : "rgba(255,255,255,0.1)",
                          color:
                            tournament.status === "open"
                              ? "#e9d5ff"
                              : tournament.status === "active"
                                ? "#ffedd5"
                                : "rgba(255,255,255,0.7)",
                          padding: "0.25rem 0.75rem",
                          borderRadius: "0.5rem",
                          fontSize: "0.7rem",
                          fontWeight: 900,
                          textTransform: "uppercase",
                        }}
                      >
                        {tournament.status}
                      </span>
                      <h3
                        style={{ margin: 0, fontSize: "1.2rem", color: "#fff" }}
                      >
                        {tournament.name}
                      </h3>
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                      {tournament.status === "open" && (
                        <button
                          onClick={() => handleCloseRegistrations(tournament.id)}
                          style={{
                            background: "rgba(255, 120, 0, 0.15)",
                            border: "1px solid rgba(255, 120, 0, 0.3)",
                            color: "#ff7800",
                            height: "36px",
                            padding: "0 0.85rem",
                            borderRadius: "0.75rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.4rem",
                            cursor: "pointer",
                            fontSize: "0.75rem",
                            fontWeight: 800,
                          }}
                        >
                          Cerrar Inscripciones
                        </button>
                      )}
                      {(tournament.status === "open" ||
                        tournament.status === "closed") && (
                        <button
                          onClick={() => openPlayersModal(tournament)}
                          style={{
                            background: "rgba(255,255,255,0.08)",
                            border: "1px solid rgba(255,255,255,0.15)",
                            color: "#fff",
                            height: "36px",
                            padding: "0 0.85rem",
                            borderRadius: "0.75rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.4rem",
                            cursor: "pointer",
                            fontSize: "0.75rem",
                            fontWeight: 800,
                          }}
                        >
                          Editar Jugadores
                        </button>
                      )}
                      {tournament.status === "closed" && (
                        <button
                          onClick={() => {
                            const enrolled = usedCodes[tournament.id]?.length || 0;
                            const min = tournament.min_participants || 4;
                            if (enrolled < min) {
                              alert(`No se puede iniciar el torneo. Faltan jugadores. (Inscritos: ${enrolled}, Mínimo requerido: ${min})`);
                              return;
                            }
                            openBracketModal(tournament);
                          }}
                          style={{
                            background: "rgba(168, 85, 247, 0.2)",
                            border: "1px solid rgba(168, 85, 247, 0.4)",
                            color: "#a855f7",
                            height: "36px",
                            padding: "0 0.85rem",
                            borderRadius: "0.75rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.4rem",
                            cursor: "pointer",
                            fontSize: "0.75rem",
                            fontWeight: 800,
                            boxShadow: "3px 3px 0 #000",
                          }}
                        >
                          ▶ Iniciar con Bracket
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setFormTournament(tournament);
                          setIsFormOpen(true);
                        }}
                        style={{
                          background: "rgba(255,255,255,0.1)",
                          border: "none",
                          color: "#fff",
                          width: "36px",
                          height: "36px",
                          borderRadius: "0.75rem",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                        }}
                        title="Editar"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(tournament.id)}
                        style={{
                          background: "rgba(239, 68, 68, 0.2)",
                          border: "none",
                          color: "#ef4444",
                          width: "36px",
                          height: "36px",
                          borderRadius: "0.75rem",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Stats */}
                  <div
                    style={{
                      fontSize: "0.85rem",
                      opacity: 0.7,
                      display: "flex",
                      gap: "1.5rem",
                      flexWrap: "wrap",
                      marginTop: "0.5rem",
                    }}
                  >
                    <span>
                      Inicio:{" "}
                      <strong>{formatDate(tournament.start_time)}</strong>
                    </span>
                    <span>
                      Organizador: <strong>{tournament.organizer}</strong>
                    </span>
                    <span>
                      Cupos:{" "}
                      <strong>
                        {usedCodes[tournament.id]?.length || 0} /{" "}
                        {tournament.max_participants}
                      </strong>
                    </span>
                    <span>
                      Premio:{" "}
                      <strong>
                        {formatTournamentPrizes(tournament.prize)}
                      </strong>
                    </span>
                    <span>
                      Visibilidad:{" "}
                      <strong>
                        {tournament.visibility === "public"
                          ? "Público"
                          : tournament.visibility === "unlisted"
                            ? "No Listado"
                            : "Privado"}
                      </strong>
                    </span>
                  </div>

                  {/* Codes */}
                  <div
                    style={{
                      marginTop: "0.5rem",
                      background: "rgba(0,0,0,0.2)",
                      padding: "1rem",
                      borderRadius: "1rem",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.85rem",
                        fontWeight: 800,
                        marginBottom: "0.5rem",
                        color: "#ff7800",
                      }}
                    >
                      Códigos de Acceso (
                      {tournament.code_type === "single"
                        ? "General"
                        : "Individuales"}
                      )
                    </div>
                    {tournament.code_type === "single" ? (
                      <div
                        style={{
                          display: "flex",
                          gap: "0.5rem",
                          alignItems: "center",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "1.25rem",
                            fontWeight: 900,
                            letterSpacing: "2px",
                            fontFamily: "monospace",
                          }}
                        >
                          {tournament.codes?.[0] || "N/A"}
                        </span>
                      </div>
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          gap: "0.5rem",
                          flexWrap: "wrap",
                        }}
                      >
                        {tournament.codes?.map((code: string, idx: number) => {
                          const usedEntry = usedCodes[tournament.id]?.find(
                            (e) => e.code === code,
                          );
                          const isUsed = !!usedEntry;
                          return (
                            <div
                              key={idx}
                              style={{
                                background: "rgba(255,255,255,0.05)",
                                padding: "0.4rem 0.8rem",
                                borderRadius: "0.5rem",
                                fontSize: "0.9rem",
                                fontFamily: "monospace",
                                border: isUsed
                                  ? "1px solid rgba(16, 185, 129, 0.5)"
                                  : "1px solid rgba(255,255,255,0.1)",
                                color: isUsed ? "#10b981" : "#fff",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "flex-start",
                                gap: "0.2rem",
                              }}
                            >
                              <span
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.4rem",
                                }}
                              >
                                {code}
                                {isUsed && (
                                  <CheckCircle2 size={14} color="#10b981" />
                                )}
                              </span>
                              {isUsed && usedEntry.userId && (
                                <span
                                  style={{
                                    fontSize: "0.65rem",
                                    opacity: 0.6,
                                    letterSpacing: "0",
                                    maxWidth: "130px",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {usedEntry.userId}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : activeTab === "applications" ? (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "2rem" }}
          >
            {/* SECTION: SOLICITUDES PENDIENTES */}
            <div
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                padding: "1.5rem",
                borderRadius: "1.5rem",
              }}
            >
              <h3
                style={{
                  fontSize: "1.2rem",
                  margin: "0 0 1rem 0",
                  color: "#ff7800",
                }}
              >
                Solicitudes Pendientes
              </h3>
              <div style={{ display: "grid", gap: "1rem" }}>
                {applications
                  .filter((app) => app.status === "pending")
                  .map((app) => (
                    <div
                      key={app.id}
                      style={{
                        background: "rgba(255, 255, 255, 0.03)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "1.5rem",
                        padding: "1.5rem",
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "1rem",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.75rem",
                            marginBottom: "0.5rem",
                          }}
                        >
                          <span
                            style={{
                              background: "rgba(245, 158, 11, 0.2)",
                              color: "#f59e0b",
                              padding: "0.25rem 0.75rem",
                              borderRadius: "0.5rem",
                              fontSize: "0.7rem",
                              fontWeight: 900,
                              textTransform: "uppercase",
                            }}
                          >
                            Pendiente
                          </span>
                          <h3
                            style={{
                              margin: 0,
                              fontSize: "1.2rem",
                              color: "#fff",
                            }}
                          >
                            {app.channel_name}
                          </h3>
                        </div>
                        <div
                          style={{
                            fontSize: "0.85rem",
                            opacity: 0.7,
                            display: "flex",
                            gap: "1.5rem",
                            flexWrap: "wrap",
                            flexDirection: "column",
                          }}
                        >
                          <span>
                            Email: <strong>{app.email}</strong>
                          </span>
                          {app.social_link && (
                            <span>
                              Red Social:{" "}
                              <a
                                href={
                                  app.social_link.startsWith("http")
                                    ? app.social_link
                                    : `https://${app.social_link}`
                                }
                                target="_blank"
                                rel="noreferrer"
                                style={{ color: "#00f2ff" }}
                              >
                                {app.social_link}
                              </a>
                            </span>
                          )}
                          {app.streaming_link && (
                            <span>
                              Streaming:{" "}
                              <a
                                href={
                                  app.streaming_link.startsWith("http")
                                    ? app.streaming_link
                                    : `https://${app.streaming_link}`
                                }
                                target="_blank"
                                rel="noreferrer"
                                style={{ color: "#a855f7" }}
                              >
                                {app.streaming_link}
                              </a>
                            </span>
                          )}
                          <span>
                            Fecha: <strong>{formatDate(app.created_at)}</strong>
                          </span>
                          {app.motivation && (
                            <span style={{ marginTop: "0.25rem", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "0.5rem" }}>
                              Motivación: <strong style={{ fontStyle: "italic", opacity: 0.9 }}>"{app.motivation}"</strong>
                            </span>
                          )}
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: "0.75rem" }}>
                        <button
                          onClick={() =>
                            handleApplicationStatus(app.id, "approved")
                          }
                          style={{
                            background: "rgba(16, 185, 129, 0.2)",
                            border: "1px solid rgba(16, 185, 129, 0.5)",
                            color: "#10b981",
                            width: "40px",
                            height: "40px",
                            borderRadius: "0.75rem",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                          }}
                          title="Aprobar"
                        >
                          <Check size={18} />
                        </button>
                        <button
                          onClick={() =>
                            handleApplicationStatus(app.id, "rejected")
                          }
                          style={{
                            background: "rgba(239, 68, 68, 0.2)",
                            border: "1px solid rgba(239, 68, 68, 0.5)",
                            color: "#ef4444",
                            width: "40px",
                            height: "40px",
                            borderRadius: "0.75rem",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                          }}
                          title="Rechazar"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                {applications.filter((app) => app.status === "pending")
                  .length === 0 && (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "1.5rem 0",
                      opacity: 0.5,
                    }}
                  >
                    No hay solicitudes pendientes.
                  </div>
                )}
              </div>
            </div>

            {/* SECTION: CREADORES ACTUALES */}
            <div
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                padding: "1.5rem",
                borderRadius: "1.5rem",
                marginTop: "2rem",
              }}
            >
              <h3
                style={{
                  fontSize: "1.2rem",
                  margin: "0 0 1rem 0",
                  color: "#ff7800",
                }}
              >
                Creadores Actuales
              </h3>
              <div style={{ display: "grid", gap: "1rem" }}>
                {applications
                  .filter((app) => app.status === "approved")
                  .map((app) => (
                    <div
                      key={app.id}
                      style={{
                        background: "rgba(255, 255, 255, 0.03)",
                        border: "1px solid rgba(16, 185, 129, 0.3)",
                        borderRadius: "1.5rem",
                        padding: "1.5rem",
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "1rem",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.75rem",
                            marginBottom: "0.5rem",
                          }}
                        >
                          <span
                            style={{
                              background: "rgba(16, 185, 129, 0.2)",
                              color: "#10b981",
                              padding: "0.25rem 0.75rem",
                              borderRadius: "0.5rem",
                              fontSize: "0.7rem",
                              fontWeight: 900,
                              textTransform: "uppercase",
                            }}
                          >
                            Aprobado
                          </span>
                          <h3
                            style={{
                              margin: 0,
                              fontSize: "1.2rem",
                              color: "#fff",
                            }}
                          >
                            {app.channel_name}
                          </h3>
                        </div>
                        <div
                          style={{
                            fontSize: "0.85rem",
                            opacity: 0.7,
                            display: "flex",
                            gap: "1.5rem",
                            flexWrap: "wrap",
                            flexDirection: "column",
                          }}
                        >
                          <span>
                            Email: <strong>{app.email}</strong>
                          </span>
                          {app.social_link && (
                            <span>
                              Red Social:{" "}
                              <a
                                href={
                                  app.social_link.startsWith("http")
                                    ? app.social_link
                                    : `https://${app.social_link}`
                                }
                                target="_blank"
                                rel="noreferrer"
                                style={{ color: "#00f2ff" }}
                              >
                                {app.social_link}
                              </a>
                            </span>
                          )}
                          {app.streaming_link && (
                            <span>
                              Streaming:{" "}
                              <a
                                href={
                                  app.streaming_link.startsWith("http")
                                    ? app.streaming_link
                                    : `https://${app.streaming_link}`
                                }
                                target="_blank"
                                rel="noreferrer"
                                style={{ color: "#a855f7" }}
                              >
                                {app.streaming_link}
                              </a>
                            </span>
                          )}
                          <span>
                            Fecha: <strong>{formatDate(app.created_at)}</strong>
                          </span>
                          {app.motivation && (
                            <span style={{ marginTop: "0.25rem", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "0.5rem" }}>
                              Motivación: <strong style={{ fontStyle: "italic", opacity: 0.9 }}>"{app.motivation}"</strong>
                            </span>
                          )}
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: "0.75rem" }}>
                        <button
                          onClick={() => {
                            setEditingCreator(app);
                            setIsCreatorProfileModalOpen(true);
                          }}
                          style={{
                            background: "rgba(168, 85, 247, 0.2)",
                            border: "1px solid rgba(168, 85, 247, 0.5)",
                            color: "#a855f7",
                            height: "40px",
                            padding: "0 1rem",
                            borderRadius: "0.75rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            cursor: "pointer",
                            fontWeight: 800,
                          }}
                          title="Editar Perfil"
                        >
                          <Edit2 size={16} /> Editar Perfil
                        </button>
                        <button
                          onClick={() =>
                            handleApplicationStatus(app.id, "rejected")
                          }
                          style={{
                            background: "rgba(239, 68, 68, 0.2)",
                            border: "1px solid rgba(239, 68, 68, 0.5)",
                            color: "#ef4444",
                            height: "40px",
                            padding: "0 1rem",
                            borderRadius: "0.75rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            cursor: "pointer",
                            fontWeight: 800,
                          }}
                          title="Revocar Acceso"
                        >
                          <X size={16} /> Revocar Acceso
                        </button>
                      </div>
                    </div>
                  ))}
                {applications.filter((app) => app.status === "approved")
                  .length === 0 && (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "1.5rem 0",
                      opacity: 0.5,
                    }}
                  >
                    No hay creadores aprobados.
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : activeTab === "suggestions" || activeTab === "support" ? (
          <div style={{ display: "grid", gap: "1rem" }}>
            {tickets.filter(
              (t) =>
                t.type ===
                (activeTab === "suggestions" ? "suggestion" : "support"),
            ).length === 0 ? (
              <div
                style={{ textAlign: "center", padding: "2rem 0", opacity: 0.5 }}
              >
                No hay{" "}
                {activeTab === "suggestions"
                  ? "sugerencias"
                  : "tickets de soporte"}
                .
              </div>
            ) : (
              tickets
                .filter(
                  (t) =>
                    t.type ===
                    (activeTab === "suggestions" ? "suggestion" : "support"),
                )
                .map((ticket) => (
                  <div
                    key={ticket.id}
                    style={{
                      background: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "1.5rem",
                      padding: "1.5rem",
                      display: "flex",
                      flexDirection: "column",
                      gap: "1rem",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        flexWrap: "wrap",
                        gap: "1rem",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.75rem",
                            marginBottom: "0.5rem",
                          }}
                        >
                          <span
                            style={{
                              background:
                                ticket.status === "open"
                                  ? "rgba(239, 68, 68, 0.2)"
                                  : "rgba(16, 185, 129, 0.2)",
                              color:
                                ticket.status === "open"
                                  ? "#ef4444"
                                  : "#10b981",
                              padding: "0.25rem 0.75rem",
                              borderRadius: "0.5rem",
                              fontSize: "0.7rem",
                              fontWeight: 900,
                              textTransform: "uppercase",
                            }}
                          >
                            {ticket.status === "open" ? "Abierto" : "Cerrado"}
                          </span>
                          <h3
                            style={{
                              margin: 0,
                              fontSize: "1.1rem",
                              color: "#fff",
                            }}
                          >
                            {ticket.subject}
                          </h3>
                        </div>
                        <div
                          style={{
                            fontSize: "0.8rem",
                            opacity: 0.6,
                            display: "flex",
                            gap: "1rem",
                          }}
                        >
                          <span>
                            Usuario ID: <strong>{ticket.user_id}</strong>
                          </span>
                          <span>
                            Fecha:{" "}
                            <strong>{formatDate(ticket.created_at)}</strong>
                          </span>
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: "0.75rem" }}>
                        <button
                          onClick={() =>
                            handleTicketStatus(ticket.id, "closed")
                          }
                          disabled={ticket.status === "closed"}
                          style={{
                            background:
                              ticket.status === "closed"
                                ? "rgba(16, 185, 129, 0.1)"
                                : "rgba(16, 185, 129, 0.2)",
                            border: "1px solid rgba(16, 185, 129, 0.5)",
                            color: "#10b981",
                            height: "40px",
                            padding: "0 1rem",
                            borderRadius: "0.75rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            cursor:
                              ticket.status === "closed"
                                ? "not-allowed"
                                : "pointer",
                            fontWeight: 800,
                            opacity: ticket.status === "closed" ? 0.5 : 1,
                          }}
                          title="Marcar como Resuelto/Cerrado"
                        >
                          <Check size={16} /> Cerrar
                        </button>
                        {ticket.status === "closed" && (
                          <button
                            onClick={() =>
                              handleTicketStatus(ticket.id, "open")
                            }
                            style={{
                              background: "rgba(239, 68, 68, 0.2)",
                              border: "1px solid rgba(239, 68, 68, 0.5)",
                              color: "#ef4444",
                              height: "40px",
                              padding: "0 1rem",
                              borderRadius: "0.75rem",
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                              cursor: "pointer",
                              fontWeight: 800,
                            }}
                            title="Reabrir"
                          >
                            Reabrir
                          </button>
                        )}
                      </div>
                    </div>

                    <div
                      style={{
                        background: "rgba(0,0,0,0.3)",
                        padding: "1rem",
                        borderRadius: "1rem",
                        fontSize: "0.9rem",
                        lineHeight: "1.5",
                        color: "rgba(255,255,255,0.9)",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {ticket.message}
                    </div>
                  </div>
                ))
            )}
          </div>
        ) : null}

        {/* DETAILED LOG MODAL */}
        <AnimatePresence>
          {selectedMatch && (
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
                  maxWidth: "600px",
                  maxHeight: "80vh",
                  display: "flex",
                  flexDirection: "column",
                  boxShadow: "0 0 40px rgba(168, 85, 247, 0.15)",
                }}
              >
                {/* Modal Header */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "1.5rem",
                  }}
                >
                  <div>
                    <h3
                      className="text-display"
                      style={{
                        fontSize: "1.5rem",
                        color: "#a855f7",
                        margin: 0,
                        letterSpacing: "0.05em",
                      }}
                    >
                      Match Log
                    </h3>
                    <div
                      style={{
                        opacity: 0.5,
                        fontSize: "0.75rem",
                        marginTop: "0.25rem",
                      }}
                    >
                      vs {selectedMatch.rivalName} ·{" "}
                      {formatDate(selectedMatch.date)}
                    </div>
                  </div>
                  <div style={{ fontSize: "1.5rem", fontWeight: 900 }}>
                    <span
                      style={{
                        color:
                          selectedMatch.winner === "player"
                            ? "#10b981"
                            : "#fff",
                      }}
                    >
                      {selectedMatch.myScore}
                    </span>
                    <span style={{ opacity: 0.3, margin: "0 0.4rem" }}>-</span>
                    <span
                      style={{
                        color:
                          selectedMatch.winner !== "player"
                            ? "#ef4444"
                            : "#fff",
                      }}
                    >
                      {selectedMatch.rivalScore}
                    </span>
                  </div>
                </div>

                {/* Log Timeline list */}
                <div
                  style={{
                    flex: 1,
                    overflowY: "auto",
                    paddingRight: "8px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                    scrollbarWidth: "thin",
                    scrollbarColor: "rgba(255, 255, 255, 0.1) transparent",
                  }}
                >
                  {selectedMatch.log.length === 0 ? (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "2rem 0",
                        opacity: 0.5,
                        fontSize: "0.85rem",
                      }}
                    >
                      No hay registro detallado de eventos para esta partida.
                    </div>
                  ) : (
                    selectedMatch.log.map((logItem, index) => {
                      const isSystem =
                        logItem.startsWith("★") ||
                        logItem.toLowerCase().includes("gana");
                      return (
                        <div
                          key={index}
                          style={{
                            background: isSystem
                              ? "rgba(168, 85, 247, 0.1)"
                              : "rgba(255, 255, 255, 0.02)",
                            borderLeft: isSystem
                              ? "3px solid #a855f7"
                              : "2px solid rgba(255, 255, 255, 0.1)",
                            padding: "0.6rem 1rem",
                            borderRadius: "0.5rem",
                            fontSize: "0.85rem",
                            lineHeight: "1.4",
                            color: isSystem
                              ? "#e9d5ff"
                              : "rgba(255, 255, 255, 0.85)",
                            display: "flex",
                            gap: "0.5rem",
                            alignItems: "flex-start",
                          }}
                        >
                          <span style={{ opacity: 0.3, fontWeight: "bold" }}>
                            #{index + 1}
                          </span>
                          <span>{logItem}</span>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setSelectedMatch(null)}
                  className="btn-hover-dark"
                  style={{
                    background: "#fff",
                    border: "none",
                    color: "#000",
                    height: "42px",
                    borderRadius: "1rem",
                    marginTop: "1.5rem",
                    fontSize: "0.9rem",
                    fontWeight: 900,
                    cursor: "pointer",
                    width: "100%",
                    boxShadow: "4px 4px 0px #000",
                  }}
                >
                  CERRAR
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Twitch Button - Way Down Bottom & Centered */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          padding: "0.5rem 0 2rem 0",
        }}
      >
        <TwitchButton />
      </div>

      <TournamentFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        tournament={formTournament}
        creatorName="Admin"
        onSuccess={fetchGlobalData}
      />

      <CreatorProfileModal
        isOpen={isCreatorProfileModalOpen}
        onClose={() => setIsCreatorProfileModalOpen(false)}
        creator={editingCreator}
        onSuccess={fetchGlobalData}
      />
      <TournamentPlayersModal
        isOpen={!!playersModalTournament}
        onClose={() => setPlayersModalTournament(null)}
        tournament={playersModalTournament}
        registrations={playersModalRegs}
        onSuccess={fetchGlobalData}
      />

      <TournamentBracketModal
        isOpen={!!bracketModalTournament}
        onClose={() => setBracketModalTournament(null)}
        tournament={bracketModalTournament}
        registrations={bracketModalRegs}
        onSuccess={fetchGlobalData}
      />
      <UserStarsModal
        isOpen={!!selectedUserStars}
        onClose={() => setSelectedUserStars(null)}
        userName={selectedUserStars?.userName || ""}
        userEmail={selectedUserStars?.userEmail || ""}
        votes={selectedUserStars?.votes || {}}
      />
    </div>
  );
};
