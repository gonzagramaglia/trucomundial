import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Plus,
  ArrowLeft,
  CheckCircle2,
  MessageSquare,
  Save,
  Trash2,
  Edit2,
  Send,
  User,
  ShieldAlert,
  LogOut,
  Link,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { supabase } from "../../lib/supabase";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  creatorApplicationSchema,
  type CreatorApplicationFormData,
  ticketSchema,
  type TicketFormData,
} from "../../lib/schemas";
import {
  formatTournamentDate,
  formatTournamentPrizes,
  normalizeTournamentPrizes,
} from "../../lib/formatters";
import { TournamentFormModal } from "./TournamentFormModal";
import { TournamentPlayersModal } from "./TournamentPlayersModal";
import { TournamentBracketModal } from "./TournamentBracketModal";
import { TwitchButton } from '../shared/TwitchButton';


const ADMIN_EMAILS = ["gonzagramaglia@gmail.com", "ciberportero@gmail.com"];

interface CreatorScreenProps {
  user: any;
  handleAuth: () => void;
  onBack: () => void;
}

export interface Tournament {
  id: string;
  name: string;
  status: "open" | "closed" | "active" | "finished";
  participants: number;
  min_participants: number;
  max_participants: number;
  start_time: string;
  prize: string[];
  bg_gradient: string;
  winner: string | null;
  organizer: string;
  visibility: "public" | "unlisted" | "private";
  code_type: "single" | "unique";
  codes: string[];
  allowed_teams?: string[];
  ranking_snapshot?: Record<string, number> | null;
}

export const CreatorScreen: React.FC<CreatorScreenProps> = ({
  user,
  onBack,
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [usedCodes, setUsedCodes] = useState<
    Record<string, { code: string; userId: string }[]>
  >({});
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [creatorName, setCreatorName] = useState("Organizador Oficial");

  const [creatorProfile, setCreatorProfile] = useState<any>(null);
  const [profileUpdating, setProfileUpdating] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false,
  );

  const isSuperAdmin = user && user.email && ADMIN_EMAILS.includes(user.email);

  // Modal / Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formTournament, setFormTournament] = useState<any>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [playersModalTournament, setPlayersModalTournament] =
    useState<any>(null);
  const [playersModalRegs, setPlayersModalRegs] = useState<
    { user_id: string; code_used: string }[]
  >([]);
  const [bracketModalTournament, setBracketModalTournament] =
    useState<any>(null);
  const [bracketModalRegs, setBracketModalRegs] = useState<
    { user_id: string; code_used?: string }[]
  >([]);

  // Support ticket states
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);
  const [ticketSuccess, setTicketSuccess] = useState(false);
  const [ticketError, setTicketError] = useState("");

  const {
    register: registerTicket,
    handleSubmit: handleTicketSubmit,
    reset: resetTicket,
    formState: { errors: ticketErrors },
  } = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
  });

  const onTicketSubmit = async (data: TicketFormData) => {
    setIsSubmittingTicket(true);
    setTicketError("");
    setTicketSuccess(false);

    try {
      const { error } = await supabase.from("tickets").insert({
        user_id: user.id,
        type: "support",
        subject: data.subject,
        message: data.message,
      });

      if (error) throw error;
      setTicketSuccess(true);
      resetTicket();
      setTimeout(() => setTicketSuccess(false), 5000);
    } catch (err: any) {
      setTicketError("Error al enviar el ticket: " + err.message);
    } finally {
      setIsSubmittingTicket(false);
    }
  };

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm<CreatorApplicationFormData>({
    resolver: zodResolver(creatorApplicationSchema),
  });

  const onProfileSubmit = async (data: CreatorApplicationFormData) => {
    if (!creatorProfile) return;
    setProfileUpdating(true);
    setProfileSuccess("");
    try {
      const { error } = await supabase
        .from("creator_applications")
        .update({
          channel_name: data.channel_name,
          social_link: data.social_link,
          streaming_link: data.streaming_link || null,
          motivation: data.motivation || null,
        })
        .eq("id", creatorProfile.id);

      if (error) throw error;
      setProfileSuccess("Perfil actualizado correctamente.");
      setCreatorName(data.channel_name);
      setCreatorProfile({
        ...creatorProfile,
        channel_name: data.channel_name,
        social_link: data.social_link,
        streaming_link: data.streaming_link,
      });
    } catch (err: any) {
      console.error(err);
      setProfileSuccess("Error al actualizar el perfil.");
    } finally {
      setProfileUpdating(false);
    }
  };

  useEffect(() => {
    document.title = "Creador de Truco Mundial";
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const checkAuthorization = async () => {
      if (!user) {
        setIsAuthorized(false);
        setLoading(false);
        return;
      }

      if (isSuperAdmin) {
        setIsAuthorized(true);
        fetchTournaments();
        return;
      }

      try {
        const { data } = await supabase
          .from("creator_applications")
          .select("*")
          .eq("user_id", user.id)
          .eq("status", "approved")
          .single();

        if (data) {
          setIsAuthorized(true);
          setCreatorProfile(data);
          if (data.channel_name) setCreatorName(data.channel_name);
          resetProfile({
            channel_name: data.channel_name || "",
            social_link: data.social_link || "",
            streaming_link: data.streaming_link || "",
            motivation: data.motivation || "",
          });
          fetchTournaments();
        } else {
          setIsAuthorized(false);
          setLoading(false);
        }
      } catch (err) {
        setIsAuthorized(false);
        setLoading(false);
      }
    };

    checkAuthorization();
  }, [user, isSuperAdmin]);

  const fetchTournaments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("tournaments")
        .select("*")
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
        if (data.length > 0) {
          const tIds = data.map((t: any) => t.id);
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
    } catch (err) {
      console.error("Unexpected error fetching tournaments:", err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateForm = () => {
    setFormTournament(null);
    setIsFormOpen(true);
  };

  const openEditForm = (tournament: Tournament) => {
    setFormTournament(tournament);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("tournaments").delete().eq("id", id);
    if (!error) {
      setTournaments((prev) => prev.filter((t) => t.id !== id));
    } else {
      alert("Error al eliminar: " + error.message);
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

  // --- RENDERING ACCESO RESTRINGIDO ---
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
            background: "rgba(255, 120, 0, 0.05)",
            border: "2px dashed rgba(255, 120, 0, 0.45)",
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
              color: "#ff7800",
              marginBottom: "1.5rem",
              margin: "0 auto",
            }}
          />
          <h3
            className="text-display"
            style={{
              fontSize: "1.5rem",
              marginBottom: "0.75rem",
              color: "#ff7800",
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
            Debes haber iniciado sesión con una cuenta de organizador para
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

  if (!isAuthorized && !loading) {
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
            No tenés permisos para acceder al panel de creadores.
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

  if (loading) {
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
            textAlign: "center",
            color: "#ff7800",
            fontWeight: 800,
            fontSize: "1.2rem",
          }}
        >
          Verificando permisos y cargando datos...
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
        padding: isMobile ? "1.25rem 1rem 4rem 1rem" : "1rem 1rem 4rem 1rem",
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
          marginBottom: isMobile ? "1.5rem" : "2.5rem",
          width: "100%",
          position: "relative",
        }}
      >
        {isMobile ? (
          <>
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
                <ArrowLeft size={14} />
                Volver
              </button>
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
                <Trophy
                  size={24}
                  style={{
                    color: "#ff7800",
                    filter: "drop-shadow(0 0 6px rgba(255, 120, 0, 0.25))",
                  }}
                />
                <h2
                  className="text-display"
                  style={{
                    fontSize: "1.4rem",
                    margin: 0,
                    letterSpacing: "0.05em",
                    color: "#ff7800",
                    textShadow: "0 0 8px rgba(255, 120, 0, 0.1)",
                  }}
                >
                  {t("creator_panel")}
                </h2>
              </div>
              <div style={{ fontSize: "0.75rem", opacity: 0.6 }}>
                {t("tournament_management")}
              </div>
            </div>
          </>
        ) : (
          <>
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
                    color: "#ff7800",
                    filter: "drop-shadow(0 0 10px rgba(255, 120, 0, 0.3))",
                  }}
                />
                <h2
                  className="text-display"
                  style={{
                    fontSize: "2.2rem",
                    margin: 0,
                    letterSpacing: "0.05em",
                    color: "#ff7800",
                    textShadow: "0 0 15px rgba(255, 120, 0, 0.2)",
                  }}
                >
                  {t("creator_panel")}
                </h2>
              </div>
              <div style={{ fontSize: "0.9rem", opacity: 0.6 }}>
                {t("tournament_management")}
              </div>
            </div>
          </>
        )}
      </div>

      {/* SECTIONS */}

      {/* HEADER SECTION (Add Button) */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "2rem",
        }}
      >
        <button
          onClick={() => openCreateForm()}
          className="btn-hover-dark"
          style={{
            background: "transparent",
            border: "2px solid #fff",
            color: "#fff",
            height: "48px",
            borderRadius: "1rem",
            padding: "0 2rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontWeight: 900,
            fontSize: "1rem",
            cursor: "pointer",
            boxShadow: "none",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          <Plus size={20} />
          {t("create_tournament")}
        </button>
      </div>

      {/* TOURNAMENTS LIST */}
      <>
        {loading ? (
          <div
            style={{
              textAlign: "center",
              padding: "4rem 0",
              color: "#a855f7",
              fontWeight: 800,
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
            }}
          >
            No hay torneos creados aún.
          </div>
        ) : (
          <div style={{ display: "grid", gap: "1rem" }}>
            {tournaments.map((tournament) => (
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
                  <div
                    style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}
                  >
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
                      onClick={() => openEditForm(tournament)}
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
                    <strong>
                      {formatTournamentDate(tournament.start_time)}
                    </strong>
                  </span>
                  <span>
                    Organizador: <strong>{tournament.organizer}</strong>
                  </span>
                  <span>
                    Cupos:{" "}
                    <strong>
                      {usedCodes[tournament.id]?.length || 0} / {tournament.max_participants}
                    </strong>
                  </span>
                  <span>
                    Premio:{" "}
                    <strong>{formatTournamentPrizes(tournament.prize)}</strong>
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
                      {tournament.codes?.map((code, idx) => {
                        const usedEntry = usedCodes[tournament.id]?.find(
                          (e) => e.code === code,
                        );
                        const isUsed = !!usedEntry;
                        return (
                          <span
                            key={idx}
                            style={{
                              background: isUsed
                                ? "rgba(16, 185, 129, 0.1)"
                                : "rgba(255,255,255,0.1)",
                              border: isUsed
                                ? "1px solid rgba(16, 185, 129, 0.3)"
                                : "1px solid transparent",
                              color: isUsed ? "#10b981" : "#fff",
                              padding: "0.25rem 0.5rem",
                              borderRadius: "0.5rem",
                              fontSize: "0.85rem",
                              fontWeight: 800,
                              letterSpacing: "1px",
                              fontFamily: "monospace",
                              display: "flex",
                              alignItems: "center",
                              flexDirection: "column",
                              gap: "0.15rem",
                            }}
                          >
                            <span
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.25rem",
                              }}
                            >
                              {code}
                              {isUsed && <CheckCircle2 size={12} />}
                            </span>
                            {isUsed && usedEntry.userId && (
                              <span
                                style={{
                                  fontSize: "0.65rem",
                                  opacity: 0.7,
                                  letterSpacing: "0",
                                  fontFamily: "monospace",
                                  maxWidth: "120px",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {usedEntry.userId}
                              </span>
                            )}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </>

      <div
        style={{
          marginTop: "3rem",
          background: "rgba(255, 120, 0, 0.05)",
          border: "2px dashed rgba(255, 120, 0, 0.25)",
          borderRadius: "1.5rem",
          padding: "2rem",
        }}
      >
        <h3
          style={{
            margin: "0 0 1.5rem 0",
            fontSize: "1.4rem",
            color: "#ff7800",
          }}
        >
          {t("creator_profile_edit")}
        </h3>

        {profileSuccess && (
          <div
            style={{
              background: profileSuccess.includes("Error")
                ? "rgba(239, 68, 68, 0.1)"
                : "rgba(16, 185, 129, 0.1)",
              border: profileSuccess.includes("Error")
                ? "1px solid rgba(239, 68, 68, 0.3)"
                : "1px solid rgba(16, 185, 129, 0.3)",
              color: profileSuccess.includes("Error") ? "#ef4444" : "#10b981",
              padding: "1rem",
              borderRadius: "1rem",
              marginBottom: "1.5rem",
              fontWeight: 800,
              fontSize: "0.9rem",
              textAlign: "center",
            }}
          >
            {profileSuccess}
          </div>
        )}

        <form
          onSubmit={handleProfileSubmit(onProfileSubmit)}
          style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr auto",
              gap: "1.5rem",
              alignItems: "end",
            }}
          >
            <div>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "0.5rem",
                  fontSize: "0.85rem",
                  fontWeight: 800,
                }}
              >
                <User size={16} style={{ color: "#ff7800" }} />
                {t("channel_name")}
              </label>
              <input
                type="text"
                {...registerProfile("channel_name")}
                style={{
                  width: "100%",
                  background: "rgba(0,0,0,0.3)",
                  border: profileErrors.channel_name
                    ? "1px solid #ef4444"
                    : "1px solid rgba(255,255,255,0.2)",
                  color: "#fff",
                  padding: "1rem",
                  borderRadius: "1rem",
                  fontSize: "1rem",
                  fontWeight: 800,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
              {profileErrors.channel_name && (
                <span
                  style={{
                    color: "#ef4444",
                    fontSize: "0.8rem",
                    marginTop: "0.25rem",
                    display: "block",
                  }}
                >
                  {profileErrors.channel_name.message}
                </span>
              )}
            </div>

            <div>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "0.5rem",
                  fontSize: "0.85rem",
                  fontWeight: 800,
                }}
              >
                <Link size={16} style={{ color: "#ff7800" }} />
                {t("main_social_link")}
              </label>
              <input
                type="text"
                {...registerProfile("social_link")}
                style={{
                  width: "100%",
                  background: "rgba(0,0,0,0.3)",
                  border: profileErrors.social_link
                    ? "1px solid #ef4444"
                    : "1px solid rgba(255,255,255,0.2)",
                  color: "#fff",
                  padding: "1rem",
                  borderRadius: "1rem",
                  fontSize: "1rem",
                  fontWeight: 800,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
              {profileErrors.social_link && (
                <span
                  style={{
                    color: "#ef4444",
                    fontSize: "0.8rem",
                    marginTop: "0.25rem",
                    display: "block",
                  }}
                >
                  {profileErrors.social_link.message}
                </span>
              )}
            </div>

            <div>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "0.5rem",
                  fontSize: "0.85rem",
                  fontWeight: 800,
                }}
              >
                <Link size={16} style={{ color: "#ff7800" }} />
                {t("main_streaming_link")}
              </label>
              <input
                type="text"
                {...registerProfile("streaming_link")}
                style={{
                  width: "100%",
                  background: "rgba(0,0,0,0.3)",
                  border: profileErrors.streaming_link
                    ? "1px solid #ef4444"
                    : "1px solid rgba(255,255,255,0.2)",
                  color: "#fff",
                  padding: "1rem",
                  borderRadius: "1rem",
                  fontSize: "1rem",
                  fontWeight: 800,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
              {profileErrors.streaming_link && (
                <span
                  style={{
                    color: "#ef4444",
                    fontSize: "0.8rem",
                    marginTop: "0.25rem",
                    display: "block",
                  }}
                >
                  {profileErrors.streaming_link.message}
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={profileUpdating}
              className="btn-hover-dark"
              style={{
                background: "#ff7800",
                border: "none",
                color: "#000",
                height: "50px",
                padding: "0 1.5rem",
                borderRadius: "1rem",
                fontWeight: 900,
                fontSize: "1rem",
                cursor: profileUpdating ? "not-allowed" : "pointer",
                opacity: profileUpdating ? 0.7 : 1,
                boxShadow: "4px 4px 0px #000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
              }}
            >
              <Save size={18} />
              {profileUpdating ? t("saving_changes") : t("save_changes")}
            </button>
          </div>
        </form>
      </div>

      <div
        style={{
          background: "rgba(168, 85, 247, 0.05)",
          border: "2px dashed rgba(168, 85, 247, 0.25)",
          borderRadius: "2rem",
          padding: "2.5rem",
          marginTop: "4rem",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "1rem",
            marginBottom: "1.5rem",
          }}
        >
          <div
            style={{
              background: "rgba(168, 85, 247, 0.15)",
              width: "48px",
              height: "48px",
              borderRadius: "1.25rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#a855f7",
              flexShrink: 0,
              marginTop: "0.25rem",
            }}
          >
            <MessageSquare size={24} />
          </div>
          <div>
            <h3
              className="text-display"
              style={{
                fontSize: "1.4rem",
                margin: 0,
                color: "#a855f7",
                lineHeight: 1.2,
              }}
            >
              {t("support_technical")}
            </h3>
            <p
              style={{
                margin: "0.25rem 0 0 0",
                opacity: 0.7,
                fontSize: "0.9rem",
              }}
            >
              {t("support_technical_desc")}
            </p>
          </div>
        </div>

        <form
          onSubmit={handleTicketSubmit(onTicketSubmit)}
          style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
        >
          <div>
            <input
              {...registerTicket("subject")}
              placeholder={t("subject")}
              disabled={isSubmittingTicket}
              style={{
                width: "100%",
                background: "rgba(0,0,0,0.3)",
                border: ticketErrors.subject
                  ? "1px solid rgba(239, 68, 68, 0.5)"
                  : "1px solid rgba(255,255,255,0.1)",
                color: "#fff",
                padding: "1rem",
                borderRadius: "1rem",
                fontSize: "0.9rem",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
            {ticketErrors.subject && (
              <span
                style={{
                  color: "#ef4444",
                  fontSize: "0.75rem",
                  marginTop: "0.25rem",
                  display: "block",
                }}
              >
                {ticketErrors.subject.message}
              </span>
            )}
          </div>

          <div>
            <textarea
              {...registerTicket("message")}
              placeholder={t("describe_issue")}
              disabled={isSubmittingTicket}
              style={{
                width: "100%",
                background: "rgba(0,0,0,0.3)",
                border: ticketErrors.message
                  ? "1px solid rgba(239, 68, 68, 0.5)"
                  : "1px solid rgba(255,255,255,0.1)",
                color: "#fff",
                padding: "1rem",
                borderRadius: "1rem",
                fontSize: "0.9rem",
                fontFamily: "inherit",
                minHeight: "120px",
                resize: "vertical",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
            {ticketErrors.message && (
              <span
                style={{
                  color: "#ef4444",
                  fontSize: "0.75rem",
                  marginTop: "0.25rem",
                  display: "block",
                }}
              >
                {ticketErrors.message.message}
              </span>
            )}
          </div>

          {ticketError && (
            <div style={{ color: "#ef4444", fontSize: "0.85rem" }}>
              {ticketError}
            </div>
          )}
          {ticketSuccess && (
            <div
              style={{ color: "#10b981", fontSize: "0.85rem", fontWeight: 800 }}
            >
              {t("ticket_sent")}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmittingTicket}
            className="btn-hover-dark"
            style={{
              background: "#a855f7",
              border: "none",
              color: "#fff",
              height: "48px",
              borderRadius: "1.25rem",
              fontSize: "0.9rem",
              fontWeight: 950,
              cursor: isSubmittingTicket ? "not-allowed" : "pointer",
              opacity: isSubmittingTicket ? 0.7 : 1,
              alignSelf: "flex-start",
              padding: "0 2rem",
              boxShadow: "4px 4px 0px #000",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <Send size={18} />
            {isSubmittingTicket ? t("sending") : t("create_ticket")}
          </button>
        </form>
      </div>

      {/* Twitch Button - Way Down Bottom & Centered */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          padding: "4rem 0 2rem 0",
        }}
      >
        <TwitchButton />
      </div>

      <TournamentFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        tournament={formTournament}
        creatorName={creatorName}
        onSuccess={fetchTournaments}
      />

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deleteConfirmId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0, 0, 0, 0.8)",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 3000,
              padding: "1rem",
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={{
                background: "#1a1625",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                borderRadius: "1.5rem",
                padding: "2rem",
                width: "100%",
                maxWidth: "400px",
                textAlign: "center",
                boxShadow: "0 0 40px rgba(239, 68, 68, 0.1)",
              }}
            >
              <Trash2
                size={48}
                style={{ color: "#ef4444", marginBottom: "1rem" }}
              />
              <h3
                style={{
                  margin: "0 0 0.5rem 0",
                  fontSize: "1.25rem",
                  color: "#fff",
                }}
              >
                {t("delete_tournament")}
              </h3>
              <p
                style={{
                  margin: "0 0 2rem 0",
                  color: "rgba(255,255,255,0.6)",
                  fontSize: "0.9rem",
                  lineHeight: 1.5,
                }}
              >
                {t("confirm_delete_tournament")}
              </p>
              <div style={{ display: "flex", gap: "1rem" }}>
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  style={{
                    flex: 1,
                    background: "transparent",
                    border: "1px solid rgba(255,255,255,0.2)",
                    color: "#fff",
                    height: "44px",
                    borderRadius: "1rem",
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    handleDelete(deleteConfirmId);
                    setDeleteConfirmId(null);
                  }}
                  className="btn-hover-dark"
                  style={{
                    flex: 1,
                    background: "#ef4444",
                    border: "none",
                    color: "#fff",
                    height: "44px",
                    borderRadius: "1rem",
                    fontWeight: 800,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                  }}
                >
                  <Trash2 size={18} />
                  Eliminar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <TournamentPlayersModal
        isOpen={!!playersModalTournament}
        onClose={() => setPlayersModalTournament(null)}
        tournament={playersModalTournament}
        registrations={playersModalRegs}
        onSuccess={fetchTournaments}
      />

      <TournamentBracketModal
        isOpen={!!bracketModalTournament}
        onClose={() => setBracketModalTournament(null)}
        tournament={bracketModalTournament}
        registrations={bracketModalRegs}
        onSuccess={() => {
          fetchTournaments();
          setBracketModalTournament(null);
        }}
      />
    </div>
  );
};
