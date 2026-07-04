import React from "react";
import { CheckCircle2, Edit2, Trash2, Trophy } from "lucide-react";
import { formatTournamentPrizes } from "../../../lib/formatters";
import { EmptyState } from "../../shared/EmptyState";

import type { Tournament, UsedCode } from "./types";

interface TournamentsTabProps {
  tournaments: Tournament[];
  usedCodes: Record<string, UsedCode[]>;
  formatDate: (dateStr: string) => string;
  setFormTournament: (tournament: Tournament) => void;
  setIsFormOpen: (isOpen: boolean) => void;
  setDeleteConfirmId: (id: string) => void;
  handleApproveTournament: (id: string) => void;
}

export const TournamentsTab: React.FC<TournamentsTabProps> = ({
  tournaments,
  usedCodes,
  formatDate,
  setFormTournament,
  setIsFormOpen,
  setDeleteConfirmId,
  handleApproveTournament,
}) => {
  const renderTournament = (tournament: Tournament) => (
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

        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {!tournament.is_approved && (
            <button
              onClick={() => handleApproveTournament(tournament.id)}
              style={{
                background: "rgba(16, 185, 129, 0.2)",
                border: "1px solid rgba(16, 185, 129, 0.5)",
                color: "#10b981",
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
              <CheckCircle2 size={16} /> Aprobar
            </button>
          )}
          <button
            onClick={() => {
              const isEn = window.location.pathname.startsWith("/en");
              window.history.pushState({}, "", isEn ? "/en/torneos/" + tournament.id : "/torneos/" + tournament.id);
              window.dispatchEvent(new PopStateEvent("popstate"));
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
            }}
          >
            <Trophy size={14} /> Ver Torneo
          </button>
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
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {formatTournamentPrizes(tournament.prize as any)}
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
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* PENDIENTES */}
      <div style={{ background: "rgba(255, 255, 255, 0.03)", padding: "1.5rem", borderRadius: "1.5rem" }}>
        <h3 style={{ marginTop: 0, marginBottom: "1.5rem", color: "#f59e0b", fontSize: "1.1rem" }}>
          SECCIÓN: TORNEOS PENDIENTES
        </h3>
        <div style={{ display: "grid", gap: "1rem" }}>
          {tournaments.filter((t) => !t.is_approved).length === 0 && (
            <EmptyState
              icon="⏳"
              title="Sin torneos"
              description="No hay torneos pendientes."
              color="#f59e0b"
            />
          )}
          {tournaments.filter((t) => !t.is_approved).map(renderTournament)}
        </div>
      </div>

      {/* APROBADOS */}
      <div style={{ background: "rgba(255, 255, 255, 0.03)", padding: "1.5rem", borderRadius: "1.5rem" }}>
        <h3 style={{ marginTop: 0, marginBottom: "1.5rem", color: "#10b981", fontSize: "1.1rem" }}>
          SECCIÓN: TORNEOS APROBADOS
        </h3>
        <div style={{ display: "grid", gap: "1rem" }}>
          {tournaments.filter((t) => t.is_approved).length === 0 && (
            <EmptyState
              icon="🏆"
              title="Sin torneos"
              description="No hay torneos aprobados."
              color="#10b981"
            />
          )}
          {tournaments.filter((t) => t.is_approved).map(renderTournament)}
        </div>
      </div>
    </div>
  );
};
