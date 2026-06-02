import React from 'react';
import { Home } from 'lucide-react';
import { Button } from '../../ui/Button';
import { useTranslation } from 'react-i18next';
import { TwitchButton } from '../../shared/TwitchButton';


interface GameTopBarProps {
  onExit: () => void;
}

export const GameTopBar: React.FC<GameTopBarProps> = ({ onExit }) => {
  const { t } = useTranslation();
  return (
    <>
      {/* Top Left: Home Button */}
      <Button
        variant="white"
        onClick={onExit}
        className="home-btn-fixed"
        style={{
          background: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(12px)",
          height: "40px",
          borderRadius: "1rem",
          padding: "0 1rem",
          display: "flex",
          gap: "0.5rem",
          color: "white",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "none"
        }}
      >
        <Home size={16} />
        <span className="desktop-only" style={{ fontWeight: 900, fontSize: "0.75rem", letterSpacing: "0.05em", fontStyle: "normal", textTransform: "uppercase" }}>{t("home")}</span>
      </Button>

      {/* Top Right: Twitch Button */}
      <TwitchButton />
    </>
  );
};
