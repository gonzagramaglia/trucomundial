import React from "react";
import { Clock, Check, LogOut } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Tournament, Registration } from "./types";

const FLAG_MAP: Record<string, string> = {
  "Arabia Saudita": "🇸🇦",
  "Argelia": "🇩🇿",
  "Argentina": "🇦🇷",
  "Austria": "🇦🇹",
  "Bélgica": "🇧🇪",
  "Bosnia y Herz": "🇧🇦",
  "Brasil": "🇧🇷",
  "Canadá": "🇨🇦",
  "Colombia": "🇨🇴",
  "Corea del Sur": "🇰🇷",
  "Croacia": "🇭🇷",
  "Ecuador": "🇪🇨",
  "Egipto": "🇪🇬",
  "Senegal": "🇸🇳",
  "España": "🇪🇸",
  "Francia": "🇫🇷",
  "Alemania": "🇩🇪",
  "Ghana": "🇬🇭",
  "Inglaterra": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  "Japón": "🇯🇵",
  "Jordania": "🇯🇴",
  "Marruecos": "🇲🇦",
  "México": "🇲🇽",
  "Noruega": "🇳🇴",
  "Nueva Zelanda": "🇳🇿",
  "Países Bajos": "🇳🇱",
  "Panamá": "🇵🇦",
  "Paraguay": "🇵🇾",
  "Portugal": "🇵🇹",
  "Qatar": "🇶🇦",
  "República Checa": "🇨🇿",
  "Sudáfrica": "🇿🇦",
  "Suiza": "🇨🇭",
  "Suecia": "🇸🇪",
  "Uruguay": "🇺🇾",
  "USA": "🇺🇸",
};

interface Props {
  tournament: Tournament;
  registrations: Registration[];
  nameMap?: Record<string, string>;
  user?: any;
  showPrize?: boolean;
  onUnenrollClick?: () => void;
}

const TournamentDetails: React.FC<Props> = ({
  tournament,
  registrations,
  nameMap = {},
  user,
  showPrize = true,
  onUnenrollClick,
}) => {
  const { t, i18n } = useTranslation();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", width: "100%" }}>
      {showPrize && (
        <div
          style={{
            background: "rgba(255, 120, 0, 0.08)",
            border: "1px solid rgba(255, 120, 0, 0.18)",
            borderRadius: "1rem",
            padding: "0.9rem 1rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.25rem",
          }}
        >
          <div
            style={{
              fontSize: "0.72rem",
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "#ff7800",
            }}
          >
            {t("prize_title")}
          </div>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}
          >
            {tournament.prize.map((prize, index) => (
              <div key={index} style={{ fontWeight: 800 }}>
                {index + 1}. {prize}
              </div>
            ))}
          </div>
        </div>
      )}

      <div
        style={{
          background: "rgba(255, 120, 0, 0.06)",
          border: "1px solid rgba(255, 120, 0, 0.22)",
          borderRadius: "1rem",
          padding: "1rem 1rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
        }}
      >
        {/* Start date */}
        {tournament.start_time && (
          <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
            <Clock size={15} style={{ color: "#ff7800", marginTop: "0.15rem", flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: "0.68rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.06em", color: "#ff7800", marginBottom: "0.1rem" }}>
                {t("start_label")}
              </div>
              <div style={{ fontSize: "0.88rem", fontWeight: 800, color: "#fed7aa" }}>
                {new Date(tournament.start_time).toLocaleString(
                  i18n.language === "en" ? "en-US" : "es-AR",
                  {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                )}
              </div>
            </div>
          </div>
        )}

        {/* Deck composition */}
        {tournament.allowed_teams && tournament.allowed_teams.length > 0 && (
          <div style={{ borderTop: "1px solid rgba(255, 120, 0, 0.15)", paddingTop: "0.65rem", display: "flex", flexDirection: "column", gap: "0.45rem" }}>
            <div style={{ fontSize: "0.68rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.06em", color: "#ff7800" }}>
              {t("deck_composition")}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
              {tournament.allowed_teams.map((team, index) => (
                <div
                  key={index}
                  style={{
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 120, 0, 0.2)",
                    borderRadius: "0.5rem",
                    padding: "0.3rem 0.55rem",
                    fontSize: "0.82rem",
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.3rem",
                    color: "#fed7aa",
                  }}
                >
                  <span>{FLAG_MAP[team] || "🏳️"}</span>
                  <span>{t(`country_${team.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()}`, team)}</span>
                </div>
              ))}
            </div>
            <div style={{ fontSize: "0.7rem", opacity: 0.75, color: "#fdba74", lineHeight: 1.4 }}>
              {t("frozen_ranking_info")}
            </div>
          </div>
        )}
      </div>

      <div>
        <div
          style={{
            fontSize: "0.8rem",
            fontWeight: 800,
            color: "#ff7800",
            marginBottom: "0.75rem",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          {t("enrolled_label")} ({registrations.length} / {tournament.max_participants})
        </div>
        {(() => {
          const list = [...registrations];
          const remaining = Math.max(0, tournament.max_participants - registrations.length);
          
          return (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
            >
              {list.map((r, idx) => {
                const isMe = user && r.user_id === user.id;
                return (
                  <div
                    key={`reg-${idx}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      background: isMe ? "rgba(16, 185, 129, 0.12)" : "rgba(255,255,255,0.02)",
                      border: isMe ? "1px solid #10b981" : "1px solid rgba(255,255,255,0.06)",
                      padding: "0.6rem",
                      borderRadius: "0.6rem",
                      color: isMe ? "#10b981" : "#fff",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.35rem",
                        fontWeight: 800,
                      }}
                    >
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "160px" }}>
                        {r.user_id === user?.id 
                          ? `${nameMap[r.user_id] || user.user_metadata?.custom_username || user.email?.split("@")[0] || "Usuario"}` 
                          : (nameMap[r.user_id] || `Jugador ${r.user_id.slice(0, 5)}`)}
                      </span>
                      {isMe && <Check size={18} strokeWidth={3} style={{ color: "#10b981", flexShrink: 0 }} />}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      {isMe && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onUnenrollClick) onUnenrollClick();
                          }}
                          style={{
                            background: "rgba(239, 68, 68, 0.15)",
                            border: "1px solid rgba(239, 68, 68, 0.4)",
                            color: "#ef4444",
                            padding: "0.25rem 0.6rem",
                            borderRadius: "0.4rem",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.25rem",
                            transition: "all 0.2s",
                          }}
                        >
                          <LogOut size={14} strokeWidth={3} style={{ transform: "scaleX(-1)" }} />
                          {t("unenroll_button")}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              
              {Array.from({ length: remaining }).map((_, idx) => (
                <div
                  key={`empty-${idx}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "rgba(255, 255, 255, 0.01)",
                    border: "1px dashed rgba(255, 255, 255, 0.06)",
                    padding: "0.6rem",
                    borderRadius: "0.6rem",
                    color: "rgba(255, 255, 255, 0.25)",
                    fontSize: "0.85rem",
                    height: "44.5px",
                    boxSizing: "border-box",
                  }}
                >
                  <div style={{ fontWeight: 700, fontStyle: "italic", opacity: 0.6 }}>
                    {t("waiting_player")}
                  </div>
                  <div style={{ opacity: 0.4, fontSize: "0.75rem", fontFamily: "monospace", fontWeight: 700 }}>
                    {tournament.code_type === "single" && tournament.codes?.[0]
                      ? tournament.codes[0]
                      : t("empty_slot")}
                  </div>
                </div>
              ))}
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default TournamentDetails;
