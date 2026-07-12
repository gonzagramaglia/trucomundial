import React from "react";
import { motion } from "framer-motion";
import { Plus, Minus, Lock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Sticker } from "../shared/Sticker";
import type { Card } from "../../data/cards";

interface RankingPlayer {
  id: string;
  name: string;
  country: string;
  club: string;
  totalVotes: number;
  myActiveVotes: number;
  env: number;
  image: string;
  stickerNumber: string;
}

interface RankingCardProps {
  player: RankingPlayer;
  index: number;
  rank: number;
  isUser: boolean;
  isOrderChanging: boolean;
  isLastVoted: boolean;
  lastVoteAction: "add" | "sub" | null;
  hasUnsavedChanges: boolean;
  isAddDisabled: boolean;
  onAdd: (cardId: string) => void;
  onSub: (cardId: string) => void;
  onAuth: () => void;
}

export const RankingCard: React.FC<RankingCardProps> = ({
  player, index, rank, isUser, isOrderChanging, isLastVoted, lastVoteAction,
  hasUnsavedChanges, isAddDisabled, onAdd, onSub, onAuth,
}) => {
  const { t } = useTranslation();

  const isHighlighted = isOrderChanging && isLastVoted;
  const highlightColor = isHighlighted
    ? lastVoteAction === "add" ? "rgba(168, 85, 247, " : "rgba(255, 255, 255, "
    : null;

  const accentColor = hasUnsavedChanges ? "#ffb800" : "#a855f7";

  return (
    <motion.div
      id={`ranking-card-${player.id}`}
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.5) }}
      style={{
        background: isHighlighted ? `${highlightColor}0.08)` : "rgba(255, 255, 255, 0.03)",
        border: isHighlighted ? `1.5px solid ${highlightColor}0.8)` : "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "2.25rem",
        padding: "1.5rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative",
        boxShadow: isHighlighted
          ? `0 0 30px ${highlightColor}0.6), 0 12px 30px rgba(0,0,0,0.2)`
          : "0 12px 30px rgba(0,0,0,0.15)",
        backdropFilter: "blur(8px)",
        filter: isHighlighted ? "brightness(1.3)" : "none",
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {/* Rank badge */}
      <div style={{
        position: "absolute", top: "-15px", left: "20px",
        background: "rgba(255, 255, 255, 0.15)",
        border: "1px solid rgba(168, 85, 247, 0.4)",
        color: "#a855f7", width: "36px", height: "36px", borderRadius: "50%",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontWeight: 900, fontSize: "1.1rem", zIndex: 10,
        boxShadow: "0 4px 10px rgba(0,0,0,0.3)", backdropFilter: "blur(10px)",
      }}>
        {rank}º
      </div>

      {/* Sticker */}
      <div style={{ width: "130px", height: "180px", margin: "1rem 0 1.25rem 0" }}>
        <Sticker card={{ ...player, stars: player.totalVotes } as Card} disabled={true} />
      </div>

      {/* Info */}
      <div style={{ width: "100%", textAlign: "center", marginBottom: "1.25rem" }}>
        <h4 style={{ margin: "0 0 0.25rem 0", fontSize: "1.15rem", fontWeight: 900, letterSpacing: "0.05em" }}>
          {player.name}
        </h4>
        <p style={{ margin: 0, fontSize: "0.75rem", opacity: 0.6, textTransform: "uppercase" }}>
          {t(`country_${player.country.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()}`)} · {player.club}
        </p>
      </div>

      {/* Vote controls */}
      {isUser ? (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(15, 10, 25, 0.6)", border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "1.25rem", padding: "4px", width: "100%", boxSizing: "border-box",
        }}>
          <button
            onClick={() => onSub(player.id)}
            disabled={player.myActiveVotes <= 0 || isOrderChanging}
            aria-label={t("decrement_votes")}
            className={player.myActiveVotes > 0 && !isOrderChanging ? "btn-hover-dark" : ""}
            style={{
              background: "transparent", border: "none",
              color: player.myActiveVotes > 0 && !isOrderChanging ? accentColor : "rgba(255,255,255,0.15)",
              width: "38px", height: "38px", display: "flex", alignItems: "center", justifyContent: "center",
              cursor: player.myActiveVotes > 0 && !isOrderChanging ? "pointer" : "default",
              borderRadius: "0.85rem",
            }}
          >
            <Minus size={18} />
          </button>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontWeight: 950, fontSize: "1.1rem", lineHeight: "1", color: player.myActiveVotes > 0 ? accentColor : "#ffffff", marginBottom: "2px" }}>
              {player.myActiveVotes}
            </span>
            <span style={{ fontSize: "0.55rem", opacity: 0.6, textTransform: "uppercase", color: "#fff", letterSpacing: "0.05em" }}>
              {t("personal_votes")}
            </span>
          </div>

          <button
            onClick={() => onAdd(player.id)}
            disabled={isAddDisabled}
            aria-label={t("increment_votes")}
            className={!isAddDisabled ? "btn-hover-dark" : ""}
            style={{
              background: "transparent", border: "none",
              color: !isAddDisabled ? accentColor : "rgba(255,255,255,0.15)",
              width: "38px", height: "38px", display: "flex", alignItems: "center", justifyContent: "center",
              cursor: !isAddDisabled ? "pointer" : "default",
              borderRadius: "0.85rem",
            }}
          >
            <Plus size={18} />
          </button>
        </div>
      ) : (
        <button
          onClick={onAuth}
          className="btn-hover-dark"
          style={{
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "1.25rem", padding: "10px 0", width: "100%",
            color: "rgba(255,255,255,0.6)", fontSize: "0.8rem", fontWeight: 800,
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
          }}
        >
          <Lock size={14} />
          {t("login_to_vote_btn")}
        </button>
      )}
    </motion.div>
  );
};
