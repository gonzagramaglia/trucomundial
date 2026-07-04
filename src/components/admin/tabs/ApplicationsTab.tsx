import React from "react";
import { Check, X, Edit2 } from "lucide-react";
import type { CreatorApplication } from "./types";
import { EmptyState } from "../../shared/EmptyState";

interface ApplicationsTabProps {
  applications: CreatorApplication[];
  formatDate: (dateStr: string) => string;
  handleApplicationStatus: (appId: string, newStatus: "approved" | "rejected") => void;
  setEditingCreator: (app: CreatorApplication) => void;
  setIsCreatorProfileModalOpen: (isOpen: boolean) => void;
}

export const ApplicationsTab: React.FC<ApplicationsTabProps> = ({
  applications,
  formatDate,
  handleApplicationStatus,
  setEditingCreator,
  setIsCreatorProfileModalOpen,
}) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
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
                              : "https://" + app.social_link
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
                              : "https://" + app.streaming_link
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
          {applications.filter((a) => a.status === "pending").length === 0 && (
            <EmptyState
              icon="📄"
              title="Sin solicitudes"
              description="No hay solicitudes pendientes."
              color="#f59e0b"
            />
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
                              : "https://" + app.social_link
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
                              : "https://" + app.streaming_link
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
          {applications.filter((a) => a.status === "approved").length === 0 && (
            <EmptyState
              icon="🌟"
              title="Sin creadores"
              description="No hay creadores aprobados."
              color="#10b981"
            />
          )}
        </div>
      </div>
    </div>
  );
};
