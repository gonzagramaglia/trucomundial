/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */
import React, { useState, useEffect } from "react";
import { PlayersTab } from "./tabs/PlayersTab";
import { MatchesTab } from "./tabs/MatchesTab";
import { TournamentsTab } from "./tabs/TournamentsTab";
import { ApplicationsTab } from "./tabs/ApplicationsTab";
import { TicketsTab } from "./tabs/TicketsTab";
import { FixtureTab } from "./tabs/FixtureTab";
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
import { UserProdeModal } from "./UserProdeModal";
import { Loader } from "../shared/Loader";
import { MatchLogModal } from "./MatchLogModal";

// Custom Hooks
import { useAdminData } from "./hooks/useAdminData";
import type { MatchSummary } from "./hooks/useAdminData";
import { useAdminUsers } from "./hooks/useAdminUsers";
import { useAdminTournaments } from "./hooks/useAdminTournaments";
import { useAdminApplications } from "./hooks/useAdminApplications";
import { useAdminTickets } from "./hooks/useAdminTickets";

interface AdminScreenProps {
  user: any;
  handleAuth: () => void;
  onBack: () => void;
}

export const AdminScreen: React.FC<AdminScreenProps> = ({ user, onBack }) => {
  const { t } = useTranslation();
  
  const {
    loading,
    rpcError,
    history,
    applications,
    tournaments,
    tickets,
    usedCodes,
    profiles,
    globalVotesData,
    prodePredictions,
    userRoles,
    fetchGlobalData,
    setApplications,
    setTickets,
    setUserRoles,
  } = useAdminData(user);

  const { playerStats, getPlayerRole, handleRoleChange } = useAdminUsers(
    history,
    globalVotesData,
    applications,
    prodePredictions,
    userRoles,
    profiles,
    setUserRoles
  );

  const { handleApproveTournament } = useAdminTournaments(fetchGlobalData);
  
  const { handleApplicationStatus } = useAdminApplications(
    applications,
    setApplications,
    userRoles,
    setUserRoles
  );

  const { handleTicketStatus, handleDeleteTicket } = useAdminTickets(tickets, setTickets);

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  console.log(deleteConfirmId); // keep typescript happy
  const [selectedMatch, setSelectedMatch] = useState<MatchSummary | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formTournament, setFormTournament] = useState<any>(null);
  const [isCreatorProfileModalOpen, setIsCreatorProfileModalOpen] = useState(false);
  const [editingCreator, setEditingCreator] = useState<any>(null);
  const [selectedUserStars, setSelectedUserStars] = useState<any | null>(null);
  const [selectedUserProde, setSelectedUserProde] = useState<any | null>(null);
  
  const [activeTab, setActiveTab] = useState<
    "players" | "matches" | "tournaments" | "applications" | "suggestions" | "support" | "fixture" | "settings"
  >("fixture");
  const [playerSearchTerm, setPlayerSearchTerm] = useState("");
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false,
  );

  useEffect(() => {
    document.title = "Admin de Truco Mundial";
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    fetchGlobalData();
    return () => window.removeEventListener("resize", handleResize);
  }, [fetchGlobalData]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    try {
      const d = new Date(dateStr);
      const datePart = d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      const timePart = d.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
      return `${datePart}, ${timePart}`;
    } catch {
      return dateStr;
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
                  {t('admin_panel')}
                </h2>
              </div>
              <div style={{ fontSize: "0.75rem", opacity: 0.6 }}>
                {t('admin_panel_desc')}
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
                  {t('admin_panel')}
                </h2>
              </div>
              <div style={{ fontSize: "0.9rem", opacity: 0.6 }}>
                {t('admin_panel_desc')}
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
          <Users size={18} /> {t('admin_player_management')} ({playerStats.length})
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
        {(loading && activeTab !== "fixture" && activeTab !== "settings") ? (
          <Loader message="Cargando datos de la plataforma..." />
        ) : activeTab === "players" ? (
          <PlayersTab
            playerStats={playerStats}
            playerSearchTerm={playerSearchTerm}
            setPlayerSearchTerm={setPlayerSearchTerm}
            setSelectedUserStars={setSelectedUserStars}
            setSelectedUserProde={setSelectedUserProde}
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

        <MatchLogModal 
          selectedMatch={selectedMatch}
          setSelectedMatch={setSelectedMatch}
          formatDate={formatDate}
        />
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
      <UserProdeModal
        isOpen={!!selectedUserProde}
        onClose={() => setSelectedUserProde(null)}
        userName={selectedUserProde?.userName || ""}
        userEmail={selectedUserProde?.userEmail || ""}
        predictions={selectedUserProde?.predictions || []}
      />
    </div>
  );
};
