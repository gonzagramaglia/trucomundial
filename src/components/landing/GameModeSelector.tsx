import React from 'react';
import { Button } from '../ui/Button';
import { User, Globe, Trophy, BarChart3 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { GameMode } from '../../lib/truco/types';

interface GameModeSelectorProps {
  selectedMode: GameMode;
  onSelect: (mode: GameMode) => void;
}

export const GameModeSelector: React.FC<GameModeSelectorProps> = ({ selectedMode, onSelect }) => {
  const { t } = useTranslation();
  const commonStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#000",
    height: "55px",
    fontSize: "1.1rem",
    fontWeight: 900,
    border: "none",
    boxShadow: "4px 4px 0px #000",
    transition: "transform 0.1s ease", // Keep smooth scale if we want, but filter will be instant via CSS
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
      {/* Primary Option: Online */}
      <Button
        onClick={() => onSelect("multiplayer")}
        className="btn-hover-dark"
        style={{
          ...getButtonStyle("multiplayer", "#00f2ff"),
          width: "100%",
          gap: "0.75rem",
        }}
      >
        <Globe size={22} />
        {t("play_online")}
      </Button>

      {/* Tournaments Option (Coming Soon) */}
      <Button
        disabled={true}
        style={{
          ...getButtonStyle("multiplayer", "#00f2ff"),
          width: "100%",
          gap: "0.75rem",
          opacity: 0.5,
          filter: "grayscale(1)",
          cursor: "not-allowed",
        }}
      >
        <Trophy size={22} />
        {t("tournaments")} ({t("coming_soon").toLowerCase()})
      </Button>

      {/* Secondary Options: Local Modes */}
      <div className="game-mode-secondary-row" style={{ display: "flex", gap: "1rem", width: "100%" }}>
        <Button
          onClick={() => onSelect("1v1")}
          className="btn-hover-dark"
          style={{
            ...getButtonStyle("1v1", "#ffdf00"),
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
            ...getButtonStyle("2v2", "#a855f7"),
            width: "100%",
            gap: "0.5rem",
          }}
        >
          <BarChart3 size={20} />
          {t("vote")}
        </Button>
      </div>
    </div>
  );
};
