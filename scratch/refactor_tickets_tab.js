import fs from 'fs';

const filePath = 'src/components/admin/AdminScreen.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

const targetStr = `        ) : activeTab === "suggestions" || activeTab === "support" ? (
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
                .map((ticket) => (`;

const endTargetStr = `                  </div>
                ))
            )}
          </div>
        ) : null}
      </div>`;

const blockStart = content.indexOf(targetStr);
const blockEnd = content.indexOf(endTargetStr, blockStart);

const tournamentRenderBlock = `
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
                              Usuario: <strong>{profiles.find(p => p.id === ticket.user_id)?.username || ticket.user_id}</strong>
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
                              title="Reabrir Ticket"
                            >
                              <RefreshCw size={16} /> Reabrir
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteTicket(ticket.id)}
                            style={{
                              background: "rgba(239, 68, 68, 0.2)",
                              border: "none",
                              color: "#ef4444",
                              width: "40px",
                              height: "40px",
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
                          background: "rgba(0,0,0,0.2)",
                          padding: "1rem",
                          borderRadius: "1rem",
                          fontSize: "0.9rem",
                          lineHeight: 1.5,
                          color: "rgba(255,255,255,0.8)",
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {ticket.message}
                      </div>
                    </div>`;

const newContent = `        ) : activeTab === "suggestions" || activeTab === "support" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            {/* ABIERTOS */}
            <div style={{ background: "rgba(255, 255, 255, 0.03)", padding: "1.5rem", borderRadius: "1.5rem" }}>
              <h3 style={{ marginTop: 0, marginBottom: "1.5rem", color: "#ef4444", fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                SECCIÓN: ABIERTOS
              </h3>
              <div style={{ display: "grid", gap: "1rem" }}>
                {tickets.filter(t => t.type === (activeTab === "suggestions" ? "suggestion" : "support") && t.status === "open").length === 0 && (
                  <div style={{ textAlign: "center", padding: "1rem 0", opacity: 0.5 }}>
                    No hay registros abiertos.
                  </div>
                )}
                {tickets.filter(t => t.type === (activeTab === "suggestions" ? "suggestion" : "support") && t.status === "open").map((ticket) => (${tournamentRenderBlock}))}
              </div>
            </div>

            {/* CERRADOS */}
            <div style={{ background: "rgba(255, 255, 255, 0.03)", padding: "1.5rem", borderRadius: "1.5rem" }}>
              <h3 style={{ marginTop: 0, marginBottom: "1.5rem", color: "#10b981", fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                SECCIÓN: CERRADOS
              </h3>
              <div style={{ display: "grid", gap: "1rem" }}>
                {tickets.filter(t => t.type === (activeTab === "suggestions" ? "suggestion" : "support") && t.status === "closed").length === 0 && (
                  <div style={{ textAlign: "center", padding: "1rem 0", opacity: 0.5 }}>
                    No hay registros cerrados.
                  </div>
                )}
                {tickets.filter(t => t.type === (activeTab === "suggestions" ? "suggestion" : "support") && t.status === "closed").map((ticket) => (${tournamentRenderBlock}))}
              </div>
            </div>
          </div>
        ) : null}
      </div>`;

content = content.substring(0, blockStart) + newContent + content.substring(blockEnd + endTargetStr.length);
fs.writeFileSync(filePath, content, 'utf-8');
console.log('Successfully refactored tickets tab');
