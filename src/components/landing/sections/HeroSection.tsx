import type { AuthUser } from '../../../hooks/useCurrentUser';
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { LogIn, Search, ArrowLeft } from "lucide-react";

import { LandingHeader } from "../LandingHeader";
import { GameModeSelector } from "../GameModeSelector";
import { PointSelector } from "../PointSelector";
import { TwitchButton } from "../../shared/TwitchButton";

interface HeroSectionProps {
  user: AuthUser | null;
  hasUnlockedDeck: boolean;
  selectedMode: "1v1" | "2v2" | "multiplayer" | null;
  setSelectedMode: (mode: "1v1" | "2v2" | "multiplayer" | null) => void;
  isSelectingPoints: boolean;
  setIsSelectingPoints: (val: boolean) => void;
  setSelectedPoints: (points: number) => void;
  isJoining: boolean;
  setIsJoining: (val: boolean) => void;
  inputCode: string;
  setInputCode: (code: string) => void;
  joinError: string;
  handleJoinRoom: () => void;
  initiateGame: (mode: "1v1" | "2v2" | "multiplayer", points: 15 | 30) => void;
  handleAuth: () => void;
  navigateTo: (path: string, setScreen: (val: boolean) => void) => void;
  setShowRanking: (val: boolean) => void;
  setShowTournament: (val: boolean) => void;
  setShowDeck: (val: boolean) => void;
  setShowRoadmap: (val: boolean) => void;
  setShowProde: (val: boolean) => void;
  isWaiting: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  user,
  hasUnlockedDeck,
  selectedMode,
  setSelectedMode,
  isSelectingPoints,
  setIsSelectingPoints,
  setSelectedPoints,
  isJoining,
  setIsJoining,
  inputCode,
  setInputCode,
  joinError,
  handleJoinRoom,
  initiateGame,
  handleAuth,
  navigateTo,
  setShowRanking,
  setShowTournament,
  setShowDeck,
  setShowRoadmap,
  setShowProde,
  isWaiting,
}) => {
  const { t } = useTranslation();

  const [isSelectingTeams, setIsSelectingTeams] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const cleanString = (str: string) =>
    str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  const [selectedTeams, setSelectedTeams] = useState<string[]>(() => {
    const saved = localStorage.getItem("truco_selected_teams");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return [];
  });
  useEffect(() => {
    localStorage.setItem("truco_selected_teams", JSON.stringify(selectedTeams));
  }, [selectedTeams]);


  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8 }}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        maxWidth: "600px",
      }}
    >
      <LandingHeader user={user} />

      <p
        style={{
          fontFamily: "var(--font-main)",
          color: "#00f2ff",
          fontSize: "0.95rem",
          textTransform: "uppercase",
          maxWidth: "600px",
          margin: "0 0 1.5rem 0",
          fontWeight: 700,
          opacity: 1,
          textAlign: "center",
          letterSpacing: "0.05em",
          whiteSpace: "pre-line",
        }}
      >
        <span className="desktop-only">{t("subtitle")}</span>
        <span className="mobile-only">
          {t("subtitle").replace(" con ", "\ncon ")}
        </span>
      </p>

      <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
        <GameModeSelector
          selectedMode={selectedMode || "multiplayer"}
          user={user}
          hasUnlockedDeck={hasUnlockedDeck}
          onSelect={(mode) => {
            if ((mode as string) === "login") {
              handleAuth();
              return;
            }
            if ((mode as string) === "ranking") {
              navigateTo("/votar", setShowRanking);
              return;
            }
            if ((mode as string) === "tournament") {
              navigateTo("/torneos", setShowTournament);
              return;
            }
            if ((mode as string) === "deck") {
              navigateTo("/mazo", setShowDeck);
              return;
            }
            if ((mode as string) === "roadmap") {
              navigateTo("/ruta", setShowRoadmap);
              return;
            }
            if ((mode as string) === "prode") {
              navigateTo("/prode", setShowProde);
              return;
            }
            if ((mode as string) === "join") {
              setIsJoining(true);
              setIsSelectingPoints(false);
              return;
            }
            setSelectedMode(mode as any);
            if (mode === "multiplayer") {
              setIsSelectingPoints(false);
            } else {
              setIsSelectingPoints(true);
            }
            setIsJoining(false);
          }}
        />
      </div>

      <AnimatePresence>
        {((selectedMode === "multiplayer" && !isWaiting) || isJoining || isSelectingPoints) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0, 0, 0, 0.45)",
              backdropFilter: "blur(10px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 2000,
              padding: "2rem",
            }}
            onClick={() => {
              if (selectedMode === "multiplayer") setSelectedMode(null);
              setIsJoining(false);
              setIsSelectingPoints(false);
            }}
          >
            {selectedMode === "multiplayer" && !isJoining && !isSelectingPoints && !isWaiting ? (
              <motion.div
                key="create-join"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                transition={{ duration: 0.3 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  padding: "3rem",
                  borderRadius: "2.5rem",
                  width: "100%",
                  maxWidth: "500px",
                  textAlign: "center",
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
                }}
              >
                <h2
                  className="text-display"
                  style={{
                    fontSize: "3rem",
                    color: "#fff",
                    marginBottom: "1rem",
                    lineHeight: 1,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {t("private_match").split("\n")[0]}
                  <br />
                  <span style={{ color: "#00f2ff" }}>
                    {t("private_match").split("\n")[1]}
                  </span>
                </h2>

                <div
                  style={{
                    display: "flex",
                    flexDirection: window.innerWidth < 768 ? "column" : "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "1.25rem",
                    width: "100%",
                    padding: "0.5rem 0",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "0.75rem",
                    }}
                  >
                    <button
                      onClick={() => {
                        if (!user) {
                          handleAuth();
                          return;
                        }
                        setIsJoining(true);
                      }}
                      className="btn-hover-dark"
                      style={{
                        background: "#00f2ff",
                        border: "none",
                        color: "#000",
                        width: "160px",
                        height: "80px",
                        fontSize: "2rem",
                        fontWeight: 950,
                        cursor: "pointer",
                        boxShadow: "6px 6px 0px #000",
                        transition: "transform 0.1s ease",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      onMouseDown={(e) =>
                        (e.currentTarget.style.transform = "translate(2px, 2px)")
                      }
                      onMouseUp={(e) =>
                        (e.currentTarget.style.transform = "translate(0px, 0px)")
                      }
                    >
                      {t("join")}
                    </button>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "0.75rem",
                    }}
                  >
                    <button
                      onClick={() => {
                        if (!user) {
                          handleAuth();
                          return;
                        }
                        setIsSelectingPoints(true);
                      }}
                      className="btn-hover-dark"
                      style={{
                        background: "#00f2ff",
                        border: "none",
                        color: "#000",
                        width: "160px",
                        height: "80px",
                        fontSize: "2rem",
                        fontWeight: 950,
                        cursor: "pointer",
                        boxShadow: "6px 6px 0px #000",
                        transition: "transform 0.1s ease",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      onMouseDown={(e) =>
                        (e.currentTarget.style.transform = "translate(2px, 2px)")
                      }
                      onMouseUp={(e) =>
                        (e.currentTarget.style.transform = "translate(0px, 0px)")
                      }
                    >
                      {t("create")}
                    </button>
                  </div>
                </div>

                <motion.div
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    marginTop: "1rem",
                  }}
                >
                  <button
                    onClick={() => {
                      setSelectedMode(null);
                      setInputCode("");
                    }}
                    className="btn-hover-dark"
                    style={{
                      background: "rgba(255, 255, 255, 0.1)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      color: "white",
                      marginTop: "0.25rem",
                      height: "48px",
                      borderRadius: "1rem",
                      padding: "0 2rem",
                      fontSize: "1rem",
                      fontWeight: 800,
                      cursor: "pointer",
                      boxShadow: "4px 4px 0px #000",
                    }}
                  >
                    {t("cancel") || "Cancelar"}
                  </button>
                </motion.div>
              </motion.div>
            ) : isJoining ? (
              <motion.div
                key="join-input"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                transition={{ duration: 0.3 }}
                onClick={(e) => e.stopPropagation()}
                style={{ width: "100%", maxWidth: "500px" }}
              >
                <div
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    padding: "3rem",
                    borderRadius: "2.5rem",
                    width: "100%",
                    textAlign: "center",
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "1.5rem",
                  }}
                >
                  <h2
                    className="text-display"
                    style={{
                      fontSize: "2.5rem",
                      color: "#fff",
                      margin: 0,
                      lineHeight: 1,
                    }}
                  >
                    {t("join_room")}
                  </h2>
                  {joinError && (
                    <div style={{ color: "#ff4444", fontSize: "1rem", textAlign: "center" }}>
                      {joinError}
                    </div>
                  )}
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <input
                      type="text"
                      maxLength={4}
                      value={inputCode}
                      onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                      placeholder={t("enter_code")}
                      style={{
                        flex: 1,
                        padding: "1rem",
                        borderRadius: "1rem",
                        border: "2px solid rgba(255, 255, 255, 0.2)",
                        background: "rgba(0, 0, 0, 0.5)",
                        color: "white",
                        fontSize: "1.5rem",
                        textAlign: "center",
                        textTransform: "uppercase",
                        outline: "none",
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && inputCode.length === 4) {
                          handleJoinRoom();
                        }
                      }}
                      autoFocus
                    />
                    <button
                      onClick={() => handleJoinRoom()}
                      disabled={inputCode.length !== 4}
                      style={{
                        padding: "0 2rem",
                        borderRadius: "1rem",
                        border: "none",
                        background: inputCode.length === 4 ? "#00f2ff" : "#333",
                        color: inputCode.length === 4 ? "#000" : "#888",
                        fontWeight: "bold",
                        cursor: inputCode.length === 4 ? "pointer" : "not-allowed",
                      }}
                    >
                      <LogIn size={24} />
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      setIsJoining(false);
                      setInputCode("");
                    }}
                    className="btn-hover-dark"
                    style={{
                      background: "rgba(255, 255, 255, 0.1)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      color: "white",
                      marginTop: "0.25rem",
                      height: "48px",
                      borderRadius: "1rem",
                      padding: "0 2rem",
                      fontSize: "1rem",
                      fontWeight: 800,
                      cursor: "pointer",
                      boxShadow: "4px 4px 0px #000",
                    }}
                  >
                    {t("cancel") || "Cancelar"}
                  </button>
                </div>
              </motion.div>
            ) : isSelectingPoints ? (
              <motion.div
                key="points"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                transition={{ duration: 0.3 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  padding: "3rem",
                  borderRadius: "2.5rem",
                  width: "100%",
                  maxWidth: "500px",
                  textAlign: "center",
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
                }}
              >
                <h2
                  className="text-display"
                  style={{
                    fontSize: "3rem",
                    color: "#fff",
                    marginBottom: "1.5rem",
                    lineHeight: 1,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {t("how_many_points").split("\n")[0]}
                  <br />
                  <span style={{ color: "#00f2ff" }}>
                    {t("how_many_points").split("\n")[1] || ""}
                  </span>
                </h2>

                <PointSelector
                  onSelect={(points: number) => {
                    setSelectedPoints(points);
                    setIsSelectingPoints(false);
                    if (selectedMode === "multiplayer") {
                      initiateGame("multiplayer", points as 15 | 30);
                    } else {
                      setIsSelectingTeams(true);
                      window.localStorage.setItem("truco_selected_points", points.toString());
                    }
                  }}
                />

                <motion.div
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <button
                    onClick={() => {
                      setIsSelectingPoints(false);
                      if (selectedMode !== "multiplayer") {
                        setSelectedMode(null);
                      }
                    }}
                    className="btn-hover-dark"
                    style={{
                      background: "rgba(255, 255, 255, 0.1)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      color: "white",
                      marginTop: "0.25rem",
                      height: "48px",
                      borderRadius: "1rem",
                      padding: "0 2rem",
                      fontSize: "1rem",
                      fontWeight: 800,
                      cursor: "pointer",
                      boxShadow: "4px 4px 0px #000",
                    }}
                  >
                    {t("cancel") || "Cancelar"}
                  </button>
                </motion.div>
              </motion.div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSelectingTeams && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0, 0, 0, 0.45)",
              backdropFilter: "blur(10px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 2000,
              padding: "2rem",
            }}
            onClick={() => setIsSelectingTeams(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="team-selection-card"
            >
              <h2
                className="text-display team-selection-title"
                style={{ marginBottom: "0.5rem" }}
              >
                {t("deck_selection_title_line1")}
                <br />
                <span style={{ color: "#00f2ff" }}>
                  {t("deck_selection_title_line2")}
                </span>
              </h2>
              <p
                style={{
                  color: "rgba(255,255,255,0.6)",
                  fontSize: "1.05rem",
                  marginBottom: "1rem",
                  fontWeight: 500,
                }}
              >
                {t("deck_selection_subtitle")}
              </p>

              {(() => {
                const ALL_TEAMS_LIST = [
                  { id: "Argelia", flag: "🇩🇿", code: "ALG" },
                  { id: "Argentina", flag: "🇦🇷", code: "ARG" },
                  { id: "Australia", flag: "🇦🇺", code: "AUS" },
                  { id: "Austria", flag: "🇦🇹", code: "AUT" },
                  { id: "Bélgica", code: "BEL", flag: "🇧🇪" },
                  { id: "Bosnia y Herz", flag: "🇧🇦", code: "BIH" },
                  { id: "Brasil", flag: "🇧🇷", code: "BRA" },
                  { id: "Canadá", flag: "🇨🇦", code: "CAN" },
                  { id: "Costa de Marfil", code: "CIV", flag: "🇨🇮" },
                  { id: "DR Congo", flag: "🇨🇩", code: "COD" },
                  { id: "Colombia", flag: "🇨🇴", code: "COL" },
                  { id: "Cabo Verde", flag: "🇨🇻", code: "CPV" },
                  { id: "Croacia", flag: "🇭🇷", code: "CRO" },
                  { id: "Curaçao", flag: "🇨🇼", code: "CUW" },
                  { id: "República Checa", flag: "🇨🇿", code: "CZE" },
                  { id: "Ecuador", flag: "🇪🇨", code: "ECU" },
                  { id: "Egipto", flag: "🇪🇬", code: "EGY" },
                  { id: "Inglaterra", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", code: "ENG" },
                  { id: "España", flag: "🇪🇸", code: "ESP" },
                  { id: "Francia", flag: "🇫🇷", code: "FRA" },
                  { id: "Alemania", code: "GER", flag: "🇩🇪" },
                  { id: "Ghana", flag: "🇬🇭", code: "GHA" },
                  { id: "Haití", flag: "🇭🇹", code: "HAI" },
                  { id: "Irán", flag: "🇮🇷", code: "IRN" },
                  { id: "Iraq", flag: "🇮🇶", code: "IRQ" },
                  { id: "Jordania", flag: "🇯🇴", code: "JOR" },
                  { id: "Japón", flag: "🇯🇵", code: "JPN" },
                  { id: "Corea del Sur", flag: "🇰🇷", code: "KOR" },
                  { id: "Arabia Saudita", flag: "🇸🇦", code: "KSA" },
                  { id: "Marruecos", flag: "🇲🇦", code: "MAR" },
                  { id: "México", flag: "🇲🇽", code: "MEX" },
                  { id: "Países Bajos", flag: "🇳🇱", code: "NED" },
                  { id: "Noruega", flag: "🇳🇴", code: "NOR" },
                  { id: "Nueva Zelanda", flag: "🇳🇿", code: "NZL" },
                  { id: "Panamá", flag: "🇵🇦", code: "PAN" },
                  { id: "Paraguay", flag: "🇵🇾", code: "PAR" },
                  { id: "Portugal", flag: "🇵🇹", code: "POR" },
                  { id: "Qatar", flag: "🇶🇦", code: "QAT" },
                  { id: "Sudáfrica", flag: "🇿🇦", code: "RSA" },
                  { id: "Escocia", code: "SCO", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
                  { id: "Senegal", flag: "🇸🇳", code: "SEN" },
                  { id: "Suiza", flag: "🇨🇭", code: "SUI" },
                  { id: "Suecia", code: "SWE", flag: "🇸🇪" },
                  { id: "Túnez", flag: "🇹🇳", code: "TUN" },
                  { id: "Türkiye", flag: "🇹🇷", code: "TUR" },
                  { id: "Uruguay", flag: "🇺🇾", code: "URU" },
                  { id: "USA", flag: "🇺🇸", code: "USA" },
                  { id: "Uzbekistán", flag: "🇺🇿", code: "UZB" },
                ];

                const pinnedTeams = ALL_TEAMS_LIST.filter((t) =>
                  selectedTeams.includes(t.id),
                );
                const unpinnedTeams = ALL_TEAMS_LIST.filter(
                  (t) => !selectedTeams.includes(t.id),
                ).filter((c) => {
                  const q = cleanString(countrySearch);
                  return (
                    cleanString(c.id).includes(q) ||
                    cleanString(c.code).includes(q)
                  );
                });

                const renderTeamButton = (team: any) => {
                  const isChecked = selectedTeams.includes(team.id);
                  const isLimitReached = selectedTeams.length >= 4;
                  const isDisabled = !isChecked && isLimitReached;

                  return (
                    <button
                      key={team.id}
                      type="button"
                      onClick={() => {
                        if (isDisabled) return;
                        setSelectedTeams((prev) =>
                          prev.includes(team.id)
                            ? prev.filter((t) => t !== team.id)
                            : [...prev, team.id],
                        );
                      }}
                      style={{
                        background: isChecked
                          ? "#ffdf00"
                          : "rgba(255,255,255,0.1)",
                        border: "1px solid",
                        borderColor: isChecked
                          ? "#ffdf00"
                          : "rgba(255,255,255,0.2)",
                        borderRadius: "2rem",
                        padding: "0.5rem 1rem",
                        color: isChecked ? "#000" : "white",
                        cursor: isDisabled ? "not-allowed" : "pointer",
                        transition: "all 0.2s ease",
                        fontSize: "0.9rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        opacity: isDisabled ? 0.45 : 1,
                        fontWeight: 800,
                        boxShadow: isChecked
                          ? "0 0 15px rgba(255, 223, 0, 0.4)"
                          : "none",
                        flexShrink: 0,
                      }}
                    >
                      <span style={{ fontSize: "1.2rem" }}>{team.flag}</span>
                      <span>{team.code}</span>
                    </button>
                  );
                };

                return (
                  <>
                    {/* Pinned Teams (Always Visible) */}
                    {pinnedTeams.length > 0 && (
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "0.6rem",
                          justifyContent: "center",
                          marginBottom: "0.8rem",
                        }}
                      >
                        {pinnedTeams.map(renderTeamButton)}
                      </div>
                    )}

                    <div
                      style={{
                        position: "relative",
                        width: "85%",
                        margin: "0 auto 0.75rem auto",
                      }}
                    >
                      <Search
                        size={18}
                        style={{
                          position: "absolute",
                          left: "1rem",
                          top: "50%",
                          transform: "translateY(-50%)",
                          color: "#9ca3af",
                          pointerEvents: "none",
                        }}
                      />
                      <input
                        type="text"
                        placeholder="Buscar país..."
                        value={countrySearch}
                        onChange={(e) => setCountrySearch(e.target.value)}
                        style={{
                          display: "block",
                          height: "42px",
                          padding: "0 1.25rem 0 2.5rem",
                          borderRadius: "1.1rem",
                          background: "rgba(255, 255, 255, 0.05)",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          color: "#fff",
                          fontSize: "0.9rem",
                          outline: "none",
                          width: "100%",
                          boxSizing: "border-box",
                          margin: 0,
                        }}
                      />
                    </div>

                    {/* Unpinned Teams (Scrollable) */}
                    <div
                      className="white-scrollbar"
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "flex-start",
                        alignContent: "flex-start",
                        overflowY: "auto",
                        maxHeight: "22vh",
                        gap: "0.6rem",
                        justifyContent: "center",
                        marginBottom: "1rem",
                        padding: "0.5rem",
                        WebkitOverflowScrolling: "touch",
                        borderTop:
                          pinnedTeams.length > 0
                            ? "1px solid rgba(255,255,255,0.1)"
                            : "none",
                        paddingTop:
                          pinnedTeams.length > 0 ? "0.8rem" : "0.5rem",
                      }}
                    >
                      {unpinnedTeams.map(renderTeamButton)}
                    </div>
                  </>
                );
              })()}

              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  gap: "0.75rem",
                  width: "100%",
                }}
              >
                <button
                  onClick={() => {
                    setIsSelectingTeams(false);
                    setIsSelectingPoints(true);
                  }}
                  className="btn-hover-dark"
                  style={{
                    background: "rgba(255, 255, 255, 0.1)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    color: "white",
                    height: "50px",
                    borderRadius: "1rem",
                    padding: "0 1.5rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    fontSize: "0.8rem",
                    fontWeight: 900,
                    cursor: "pointer",
                    transition: "none",
                    flexShrink: 0,
                  }}
                >
                  <ArrowLeft size={18} />
                  {t("back")}
                </button>

                <button
                  disabled={selectedTeams.length !== 4}
                  onClick={() => {
                    setIsSelectingTeams(false);
                    initiateGame(selectedMode!, parseInt(window.localStorage.getItem("truco_selected_points") || "15") as 15 | 30);
                  }}
                  className="btn-hover-dark"
                  style={{
                    flex: 1,
                    height: "50px",
                    fontSize: "1.2rem",
                    fontWeight: 950,
                    backgroundColor:
                      selectedTeams.length !== 4
                        ? "rgba(255,255,255,0.1)"
                        : "#00f2ff",
                    color:
                      selectedTeams.length !== 4
                        ? "rgba(255,255,255,0.3)"
                        : "#000",
                    border: "none",
                    borderRadius: "1rem",
                    boxShadow:
                      selectedTeams.length !== 4 ? "none" : "4px 4px 0px #000",
                    fontStyle: "italic",
                    cursor: selectedTeams.length !== 4 ? "default" : "pointer",
                  }}
                >
                  {t("play_now")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>



      <div style={{ marginTop: "2rem" }}>
        <TwitchButton />
      </div>
    </motion.div>
  );
};
