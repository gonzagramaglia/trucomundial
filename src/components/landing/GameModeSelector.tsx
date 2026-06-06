import React from 'react';
import { Button } from '../ui/Button';
import { User, Globe, Star, Lock, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { GameMode } from '../../lib/truco/types';

interface GameModeSelectorProps {
  selectedMode: GameMode;
  onSelect: (mode: GameMode) => void;
  user: any;
}

export const GameModeSelector: React.FC<GameModeSelectorProps> = ({ selectedMode, onSelect, user: _user }) => {
  const { t } = useTranslation();
  const showRoadmapAsLocked = false;
  const commonStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#000",
    minHeight: "55px",
    padding: "0.5rem 1rem",
    fontFamily: "'Oswald', sans-serif",
    fontSize: "1.2rem",
    fontWeight: 700,
    fontStyle: "normal" as const,
    textTransform: "uppercase" as const,
    letterSpacing: "0.02em",
    lineHeight: "1.2",
    border: "none",
    boxShadow: "4px 4px 0px #000",
    transition: "transform 0.1s ease",
    cursor: "pointer",
    opacity: 1
  };

  const getButtonStyle = (mode: GameMode, baseColor: string) => ({
    ...commonStyle,
    backgroundColor: baseColor,
    transform: "none",
    zIndex: selectedMode === mode ? 10 : 1
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2rem", width: "100%", maxWidth: "550px" }}>
      <Button
        onClick={() => onSelect("multiplayer")}
        className="btn-hover-dark"
        style={{
          ...getButtonStyle("multiplayer", "#00f2ff"),
          color: "#000",
          width: "100%",
          gap: "0.75rem",
        }}
      >
        <Globe size={22} />
        {t("play_online")}
      </Button>

      {/* Secondary buttons: VS CPU + Mejorar Cartas stacked */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%" }}>
        <Button
          onClick={() => onSelect("1v1")}
          className="btn-hover-dark"
          style={{
            ...getButtonStyle("1v1", "#ffffff"),
            color: "#000",
            width: "100%",
            gap: "0.5rem",
          }}
        >
          <User size={20} />
          {t("vs_cpu")}
        </Button>
        <Button
          onClick={() => onSelect("ranking" as any)}
          className="btn-hover-dark"
          style={{
            ...getButtonStyle("2v2", "#ffdf00"),
            color: "#000",
            width: "100%",
            gap: "0.5rem",
          }}
        >
          <Star size={20} fill="currentColor" />
          {t("vote")}
        </Button>
      </div>

      {/* Tournaments — below the secondary row, above Fixture 
      <Button
        onClick={() => onSelect("tournament" as any)}
        className="btn-hover-dark"
        style={{
          ...getButtonStyle("multiplayer", "rgba(255, 255, 255, 0.08)"),
          color: "#fff",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          width: "100%",
          gap: "0.75rem",
          boxShadow: "4px 4px 0px #000",
        }}
      >
        <Trophy size={22} />
        {t("tournaments")} <span style={{ opacity: 0.45 }}>({t("coming_soon")})</span>
      </Button>
      */}

      {/* Roadmap Option */}
      <Button
        onClick={() => {
          if (!showRoadmapAsLocked) {
            onSelect("fixture" as any);
          }
        }}
        className={showRoadmapAsLocked ? "" : "btn-hover-dark"}
        style={{
          ...getButtonStyle("multiplayer", showRoadmapAsLocked ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.08)"),
          color: showRoadmapAsLocked ? "rgba(255, 255, 255, 0.4)" : "#fff",
          border: showRoadmapAsLocked ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid rgba(255, 255, 255, 0.15)",
          width: "100%",
          gap: "0.75rem",
          cursor: showRoadmapAsLocked ? "not-allowed" : "pointer",
          boxShadow: showRoadmapAsLocked ? "none" : "4px 4px 0px #000"
        }}
      >
        {showRoadmapAsLocked ? <Lock size={20} style={{ opacity: 0.5 }} /> : <Calendar size={20} />}
        {t("world_cup_fixture")}
      </Button>
    </div>
  );
};
