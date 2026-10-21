import React, { useState } from "react";
import { motion } from "framer-motion";
import type { Card } from "../../data/cards";
import { StickerBadge } from "./StickerBadge";
import { StickerInfo } from "./StickerInfo";
import { useCardVotes, useIsTopCard } from "../../lib/votesStore";
import { getAssetUrl } from "../../lib/assets";

interface StickerProps {
  card: Card;
  onClick?: () => void;
  disabled?: boolean;
  heroMode?: boolean;
  winnerMode?: boolean;
  isOrangeBorder?: boolean;
  hideEnv?: boolean;
  hideStars?: boolean;
  envColor?: string;
  showBack?: boolean;
}

export const Sticker: React.FC<StickerProps> = ({
  card,
  onClick,
  disabled,
  heroMode = false,
  winnerMode = false,
  isOrangeBorder = false,
  hideEnv = false,
  hideStars = false,
  envColor = "var(--color-primary)",
  showBack = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const storeVotes = useCardVotes(card.id);
  const votes = (card as any).stars !== undefined ? (card as any).stars : storeVotes;
  const isTop = useIsTopCard(card.id);

  const handleClick = () => {
    if (!disabled && onClick) onClick();
  };

  if (showBack) {
    return (
      <motion.div
        className="sticker"
        style={{
          cursor: "default",
          backgroundImage: "url('/card-back.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          border: '1.5px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.5)',
          opacity: 0.8
        }}
      >
        <div className="sticker-glitter" />
      </motion.div>
    );
  }

  const displayVotes = votes < 10 ? `0${votes}` : votes;

  return (
    <motion.div
      whileHover={!disabled ? { scale: 1.1, rotate: 2, zIndex: 1000 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      className={`sticker ${disabled ? "disabled" : ""} ${winnerMode || isOrangeBorder ? "winner" : ""}`}
      onClick={handleClick}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      style={{
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.6 : 1,
        borderColor: winnerMode ? "#ffdf00" : isOrangeBorder ? "#ff8c00" : (isTop ? "#a855f7" : "#fff"),
        boxShadow: winnerMode ? "0 0 20px rgba(255, 223, 0, 0.4)" : isOrangeBorder ? "0 0 20px rgba(255, 140, 0, 0.4)" : (isTop ? "0 0 25px rgba(168, 85, 247, 0.9)" : undefined),
      }}
    >
      <div className="sticker-glitter"></div>

      {/* Player Image */}
      <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", backgroundImage: `url(${getAssetUrl(card.image)})`, backgroundSize: "100% 100%", zIndex: 1 }} />

      {/* Overlays */}
      <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "35%", background: "linear-gradient(to bottom, rgba(0,0,0,0.75), transparent)", zIndex: 2 }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: "40%", background: "linear-gradient(to top, rgba(0,0,0,0.85), transparent)", zIndex: 2 }} />

      {/* Player Name */}
      <div style={{ position: "absolute", top: "8px", left: 0, width: "100%", textAlign: "center", zIndex: 3, padding: "0 6px" }}>
        <div className="text-display" style={{ fontSize: "0.85rem", color: "#fff", textShadow: "0 2px 6px rgba(0,0,0,0.9)", letterSpacing: "0.05em" }}>
          {card.name}
        </div>
      </div>

      {/* Stats Container */}
      <div style={{ position: "absolute", bottom: "18px", left: 0, width: "100%", padding: "8px", textAlign: "center", zIndex: 3, overflow: "hidden" }}>
        {!heroMode && (
          <div style={{ display: "flex", justifyContent: "center", gap: "20px", opacity: isHovered ? 0 : 1, transition: "opacity 0.15s ease", pointerEvents: "none", position: "absolute", bottom: "2px", left: 0, right: 0 }}>
            {!hideEnv && <StickerBadge label="ENV" value={`+${card.env}`} color={envColor} />}
            {!hideStars && <StickerBadge label="★" value={displayVotes} color="var(--color-accent)" />}
          </div>
        )}

        {heroMode && (
          <div style={{ position: "absolute", bottom: "2px", left: 0, right: 0, textAlign: "center", pointerEvents: "none" }}>
            {!hideStars && <StickerBadge label="★" value={displayVotes} color="var(--color-accent)" />}
          </div>
        )}

        {!heroMode && <StickerInfo country={card.country} club={card.club} isHovered={isHovered} color={envColor} />}
      </div>
    </motion.div>
  );
};
