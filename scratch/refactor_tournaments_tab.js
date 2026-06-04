import fs from 'fs';

const filePath = 'src/components/admin/AdminScreen.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

const targetStr = `        ) : activeTab === "tournaments" ? (
          <div style={{ display: "grid", gap: "1rem" }}>
            {tournaments.length === 0 ? (
              <div
                style={{ textAlign: "center", padding: "2rem 0", opacity: 0.5 }}
              >
                No hay torneos creados.
              </div>
            ) : (
              tournaments.map((tournament) => (`;

const endTargetStr = `              ))
            )}
          </div>
        ) : activeTab === "applications" ? (`;

const blockStart = content.indexOf(targetStr);
const blockEnd = content.indexOf(endTargetStr, blockStart) + `              ))
            )}
          </div>`.length;

const tournamentRenderBlock = content.slice(blockStart + targetStr.length, blockEnd - `              ))
            )}
          </div>`.length);

const newContent = `        ) : activeTab === "tournaments" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            {/* PENDIENTES */}
            <div style={{ background: "rgba(255, 255, 255, 0.03)", padding: "1.5rem", borderRadius: "1.5rem" }}>
              <h3 style={{ marginTop: 0, marginBottom: "1.5rem", color: "#f59e0b", fontSize: "1.1rem" }}>
                SECCIÓN: TORNEOS PENDIENTES
              </h3>
              <div style={{ display: "grid", gap: "1rem" }}>
                {tournaments.filter(t => !t.is_approved).length === 0 && (
                  <div style={{ textAlign: "center", padding: "1rem 0", opacity: 0.5 }}>
                    No hay torneos pendientes.
                  </div>
                )}
                {tournaments.filter(t => !t.is_approved).map((tournament) => (${tournamentRenderBlock}))}
              </div>
            </div>

            {/* APROBADOS */}
            <div style={{ background: "rgba(255, 255, 255, 0.03)", padding: "1.5rem", borderRadius: "1.5rem" }}>
              <h3 style={{ marginTop: 0, marginBottom: "1.5rem", color: "#10b981", fontSize: "1.1rem" }}>
                SECCIÓN: TORNEOS APROBADOS
              </h3>
              <div style={{ display: "grid", gap: "1rem" }}>
                {tournaments.filter(t => t.is_approved).length === 0 && (
                  <div style={{ textAlign: "center", padding: "1rem 0", opacity: 0.5 }}>
                    No hay torneos aprobados.
                  </div>
                )}
                {tournaments.filter(t => t.is_approved).map((tournament) => (${tournamentRenderBlock}))}
              </div>
            </div>
          </div>`;

content = content.substring(0, blockStart) + newContent + content.substring(blockEnd);
fs.writeFileSync(filePath, content, 'utf-8');
console.log('Successfully refactored tournaments tab');
