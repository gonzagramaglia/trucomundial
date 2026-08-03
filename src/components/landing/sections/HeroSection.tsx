import type { User } from '@supabase/supabase-js';
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { LogIn } from "lucide-react";

import { LandingHeader } from "../LandingHeader";
import { GameModeSelector } from "../GameModeSelector";
import { PointSelector } from "../PointSelector";
import { TwitchButton } from "../../shared/TwitchButton";

interface HeroSectionProps {
  user: User | null;
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
}) => {
  const { t } = useTranslation();

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
            setIsSelectingPoints(true);
            setIsJoining(false);
          }}
        />
      </div>

      <AnimatePresence mode="wait">
        {isJoining ? (
          <motion.div
            key="join-input"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            style={{ width: "100%", maxWidth: "400px", marginTop: "1rem" }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                background: "rgba(0, 0, 0, 0.4)",
                padding: "1.5rem",
                borderRadius: "1rem",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <h3
                style={{
                  color: "white",
                  margin: 0,
                  fontSize: "1.1rem",
                  textAlign: "center",
                }}
              >
                {t("join_room")}
              </h3>
              {joinError && (
                <div style={{ color: "#ff4444", fontSize: "0.9rem", textAlign: "center" }}>
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
                    padding: "0.75rem",
                    borderRadius: "0.5rem",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    background: "rgba(0, 0, 0, 0.5)",
                    color: "white",
                    fontSize: "1.2rem",
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
                    padding: "0 1.5rem",
                    borderRadius: "0.5rem",
                    border: "none",
                    background: inputCode.length === 4 ? "#00f2ff" : "#333",
                    color: inputCode.length === 4 ? "#000" : "#888",
                    fontWeight: "bold",
                    cursor: inputCode.length === 4 ? "pointer" : "not-allowed",
                  }}
                >
                  <LogIn size={20} />
                </button>
              </div>
              <button
                onClick={() => setIsJoining(false)}
                type="button"
                style={{
                  background: "transparent",
                  border: "none",
                  color: "rgba(255, 255, 255, 0.6)",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                }}
              >
                {t("cancel")}
              </button>
            </div>
          </motion.div>
        ) : isSelectingPoints ? (
          <motion.div
            key="points"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            style={{ width: "100%", maxWidth: "400px", marginTop: "1rem" }}
          >
            <PointSelector
              onSelect={(points: number) => {
                setSelectedPoints(points);
                setIsSelectingPoints(false);
                if (selectedMode === "multiplayer") {
                  initiateGame("multiplayer", points as 15 | 30);
                } else if (selectedMode) {
                  initiateGame(selectedMode, points as 15 | 30);
                }
              }}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div style={{ marginTop: "2rem" }}>
        <TwitchButton />
      </div>
    </motion.div>
  );
};
