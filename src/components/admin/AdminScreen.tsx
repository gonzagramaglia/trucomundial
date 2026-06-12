/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */
import React, { useState, useEffect, useMemo } from "react";
import { PlayersTab } from "./tabs/PlayersTab";
import { MatchesTab } from "./tabs/MatchesTab";
import { TournamentsTab } from "./tabs/TournamentsTab";
import { ApplicationsTab } from "./tabs/ApplicationsTab";
import { TicketsTab } from "./tabs/TicketsTab";
import { FixtureTab } from "./tabs/FixtureTab";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert,
  Users,
  Swords,
  ArrowLeft,
  LogOut,
  FileText,
  Trophy,
  MessageSquare,
  CalendarDays,
  Settings,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { supabase } from "../../lib/supabase";
import { TournamentFormModal } from "./TournamentFormModal";
import { CreatorProfileModal } from "./CreatorProfileModal";
import { TwitchButton } from '../shared/TwitchButton';
import { UtilityButtons } from '../shared/UtilityButtons';
import { UserStarsModal } from "./UserStarsModal";
import {
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
  createdAt?: string;
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
  const [profiles, setProfiles] = useState<any[]>([]);
  const [globalVotesData, setGlobalVotesData] = useState<any[]>([]);
  const [selectedUserStars, setSelectedUserStars] = useState<any | null>(null);
  const [userRoles, setUserRoles] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<
    "players" | "matches" | "tournaments" | "applications" | "suggestions" | "support" | "fixture" | "settings"
  >("fixture");
  const [playerSearchTerm, setPlayerSearchTerm] = useState("");
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false,
  );
  const [rpcError, setRpcError] = useState(false);

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
      // 1. Fetch Profiles via RPC (to get emails and auth data safely)
      let { data: profilesData, error: profilesError } = await supabase
        .rpc("get_admin_users_data");

      if (profilesError) {
        console.warn("RPC get_admin_users_data failed (did you run the SQL script?), falling back to profiles table:", profilesError);
        setRpcError(true);
        const fallback = await supabase.from("profiles").select("*");
        profilesData = fallback.data;
        profilesError = fallback.error;
      }

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

  
  const handleApproveTournament = async (id: string) => {
    try {
      const { error } = await supabase
        .from("tournaments")
        .update({ is_approved: true })
        .eq("id", id);
      if (error) throw error;
      setTournaments((prev) =>
        prev.map((t) => (t.id === id ? { ...t, is_approved: true } : t)),
      );
    } catch (err: any) {
      alert("Error al aprobar torneo: " + err.message);
    }
  };

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

  const handleDeleteTicket = async (ticketId: string) => {
    if (!confirm("¿Estás seguro de eliminar este ticket permanentemente?")) return;
    try {
      const { data, error } = await supabase
        .from("tickets")
        .delete()
        .eq("id", ticketId)
        .select();
        
      if (error) throw error;
      
      // Si RLS bloquea silenciosamente el borrado, data viene vacío
      if (!data || data.length === 0) {
        throw new Error("Permiso denegado: falta la política (policy) de DELETE en la tabla 'tickets' de Supabase.");
      }
      
      setTickets((prev) => prev.filter((t) => t.id !== ticketId));
    } catch (err: any) {
      alert("Error al eliminar ticket: " + err.message);
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
        votes: {},
        createdAt: profile.created_at || new Date().toISOString()
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
          votes: {},
          createdAt: new Date().toISOString()
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
      {rpcError && (
        <div style={{
          background: "rgba(239, 68, 68, 0.2)",
          border: "1px solid #ef4444",
          color: "#fff",
          padding: "1rem",
          borderRadius: "0.5rem",
          marginBottom: "1rem",
          textAlign: "center"
        }}>
          ⚠️ <b>Falta configuración:</b> Ejecuta el script SQL <code>scratch/create_admin_users_rpc.sql</code> en el editor SQL de Supabase para poder cargar los correos de los usuarios nuevos correctamente.
        </div>
      )}
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

          {/* Fixed Utility Buttons (Desktop Right Corner) */}
          <UtilityButtons />
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

              {/* Utility Buttons */}
              <UtilityButtons isMobile={true} />
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
          onClick={() => setActiveTab("fixture")}
          style={{
            background:
              activeTab === "fixture"
                ? "#a855f7"
                : "rgba(255, 255, 255, 0.05)",
            border:
              activeTab === "fixture"
                ? "none"
                : "1px solid rgba(255, 255, 255, 0.1)",
            color:
              activeTab === "fixture" ? "#fff" : "rgba(255, 255, 255, 0.5)",
            padding: "0.75rem 1.5rem",
            borderRadius: "1rem",
            fontWeight: 800,
            fontSize: "0.9rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            boxShadow: activeTab === "fixture" ? "4px 4px 0px #000" : "none",
            transition: "all 0.2s",
          }}
        >
          <CalendarDays size={18} /> Prode
        </button>
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
        <button
          onClick={() => setActiveTab("settings")}
          style={{
            background:
              activeTab === "settings"
                ? "#a855f7"
                : "rgba(255, 255, 255, 0.05)",
            border:
              activeTab === "settings"
                ? "none"
                : "1px solid rgba(255, 255, 255, 0.1)",
            color:
              activeTab === "settings"
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
              activeTab === "settings" ? "4px 4px 0px #000" : "none",
            transition: "all 0.2s",
          }}
        >
          <Settings size={18} /> Configuración
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
          <PlayersTab
            playerStats={playerStats}
            playerSearchTerm={playerSearchTerm}
            setPlayerSearchTerm={setPlayerSearchTerm}
            setSelectedUserStars={setSelectedUserStars}
            getPlayerRole={getPlayerRole}
            handleRoleChange={handleRoleChange}
            formatDate={formatDate}
          />
        ) : activeTab === "matches" ? (
          <MatchesTab
            history={history}
            formatDate={formatDate}
            setSelectedMatch={setSelectedMatch}
            isMobile={isMobile}
          />
        ) : activeTab === "tournaments" ? (
          <TournamentsTab
            tournaments={tournaments}
            usedCodes={usedCodes}
            formatDate={formatDate}
            setFormTournament={setFormTournament}
            setIsFormOpen={setIsFormOpen}
            setDeleteConfirmId={setDeleteConfirmId}
            handleApproveTournament={handleApproveTournament}
          />
        ) : activeTab === "applications" ? (
          <ApplicationsTab
            applications={applications}
            formatDate={formatDate}
            handleApplicationStatus={handleApplicationStatus}
            setEditingCreator={setEditingCreator}
            setIsCreatorProfileModalOpen={setIsCreatorProfileModalOpen}
          />
        ) : activeTab === "suggestions" || activeTab === "support" ? (
          <TicketsTab
            tickets={tickets}
            activeTab={activeTab}
            profiles={profiles}
            formatDate={formatDate}
            handleTicketStatus={handleTicketStatus}
            handleDeleteTicket={handleDeleteTicket}
          />
        ) : activeTab === "fixture" ? (
          <FixtureTab />
        ) : activeTab === "settings" ? (
          <div style={{ animation: "fadeIn 0.3s ease-out" }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="text-display" style={{ fontSize: '1.5rem', margin: 0, color: '#fff' }}>Configuración</h3>
              </div>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                padding: '1.25rem 1.5rem',
                borderRadius: '1.5rem',
                marginBottom: '2.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#ef4444' }}>Cerrar sesión</div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.6, marginTop: '0.2rem' }}>Desconectate de tu cuenta actual de administrador</div>
                  </div>
                  
                  <button
                    onClick={async () => {
                      await supabase.auth.signOut();
                      onBack();
                    }}
                    className="btn-hover-dark"
                    style={{
                      marginLeft: 'auto',
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      color: '#ef4444',
                      height: '42px',
                      borderRadius: '1rem',
                      padding: '0 1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.85rem',
                      fontWeight: 900,
                      cursor: 'pointer',
                      boxShadow: '3px 3px 0px #000',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <LogOut size={16} style={{ transform: 'scaleX(-1)' }} />
                    Cerrar sesión
                  </button>
                </div>
              </div>
            </div>
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
