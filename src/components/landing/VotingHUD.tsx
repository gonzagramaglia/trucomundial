import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Save, Check, Trophy, Lock } from "lucide-react";
import { useTranslation } from "react-i18next";

import type { RankingUser } from "../../hooks/useRankingVotes";

interface VotingHUDProps {
  user: RankingUser | null;
  unsaved: boolean;
  availableVotes: number;
  totalMyVotes: number;
  maxTotalVotes: number;
  saving: boolean;
  saveSuccess: boolean;
  handleSaveVotes: () => void;
  handleAuth: () => void;
  isMobile: boolean;
}

export const VotingHUD: React.FC<VotingHUDProps> = ({
  user,
  unsaved,
  availableVotes,
  totalMyVotes,
  maxTotalVotes,
  saving,
  saveSuccess,
  handleSaveVotes,
  handleAuth,
  isMobile,
}) => {
  const { t } = useTranslation();

  return (
    <AnimatePresence mode="wait">
      {user ? (
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          style={{
            position: "sticky",
            top: "1rem",
            zIndex: 100,
            background: "rgba(15, 10, 25, 0.9)",
            border: unsaved
              ? "2px solid rgba(255, 184, 0, 0.45)"
              : availableVotes === 0
                ? "2px solid rgba(16, 185, 129, 0.45)"
                : "2px solid rgba(168, 85, 247, 0.25)",
            borderRadius: "2rem",
            padding: "1.25rem 2rem",
            marginBottom: "2rem",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1.5rem",
            boxShadow: unsaved
              ? "0 10px 30px rgba(255, 184, 0, 0.05), inset 0 0 20px rgba(255, 184, 0, 0.05)"
              : availableVotes === 0
                ? "0 10px 30px rgba(16, 185, 129, 0.05), inset 0 0 20px rgba(16, 185, 129, 0.05)"
                : "0 10px 30px rgba(168, 85, 247, 0.05), inset 0 0 20px rgba(168, 85, 247, 0.05)",
            backdropFilter: "blur(16px)",
          }}
        >
          <div style={{ flex: "1 1 300px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "0.5rem",
                fontSize: "0.9rem",
                fontWeight: 800,
              }}
            >
              <span
                style={{
                  color: unsaved
                    ? "#ffb800"
                    : availableVotes === 0
                      ? "#10b981"
                      : "#a855f7",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <Trophy size={18} />
                {t("your_votes_distributed")}
              </span>
              <span
                style={{
                  color: unsaved
                    ? "#ffb800"
                    : availableVotes === 0
                      ? "#10b981"
                      : "#fff",
                }}
              >
                {totalMyVotes} / {maxTotalVotes} {t("votes_label")}
              </span>
            </div>

            {/* Progress bar */}
            <div
              style={{
                width: "100%",
                height: "8px",
                background: "rgba(255,255,255,0.1)",
                borderRadius: "4px",
                overflow: "hidden",
              }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${(totalMyVotes / maxTotalVotes) * 100}%`,
                }}
                style={{
                  height: "100%",
                  background: unsaved
                    ? "linear-gradient(to right, #ffb800, #f59e0b)"
                    : availableVotes === 0
                      ? "linear-gradient(to right, #10b981, #059669)"
                      : "linear-gradient(to right, #a855f7, #7c3aed)",
                  boxShadow: unsaved
                    ? "0 0 8px rgba(255, 184, 0, 0.8)"
                    : availableVotes === 0
                      ? "0 0 8px rgba(16, 185, 129, 0.8)"
                      : "0 0 8px rgba(168, 85, 247, 0.8)",
                }}
              />
            </div>

            <div
              style={{
                fontSize: "0.75rem",
                opacity: 0.5,
                marginTop: "0.4rem",
              }}
            >
              {availableVotes > 0
                ? t("votes_available_hint", { count: availableVotes })
                : t("votes_all_used")}
            </div>
          </div>

          {/* Save Button */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <button
              onClick={handleSaveVotes}
              disabled={saving || saveSuccess}
              className="btn-hover-dark"
              style={{
                background: saveSuccess
                  ? "#10b981"
                  : unsaved
                    ? "#ffb800"
                    : availableVotes === 0
                      ? "#10b981"
                      : "#a855f7",
                border: "none",
                color: "#fff",
                height: "48px",
                borderRadius: "1.25rem",
                padding: "0 2rem",
                fontSize: "1rem",
                fontWeight: 950,
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                cursor: saving || saveSuccess ? "default" : "pointer",
                boxShadow: "4px 4px 0px #000",
                transition: "all 0.2s ease",
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saveSuccess ? <Check size={18} /> : <Save size={18} />}
              {saveSuccess
                ? t("votes_saved")
                : saving
                  ? t("saving")
                  : t("save_to_cloud")}
            </button>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          style={{
            position: "sticky",
            top: "1rem",
            zIndex: 100,
            background: "rgba(145, 70, 255, 0.05)",
            border: "2px dashed rgba(145, 70, 255, 0.45)",
            borderRadius: "2rem",
            padding: "1.5rem 2rem",
            marginBottom: "2rem",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1.5rem",
            backdropFilter: "blur(16px)",
          }}
        >
          <div style={{ flex: "1 1 300px" }}>
            <h3
              style={{
                margin: "0 0 0.5rem 0",
                color: "#a855f7",
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                fontSize: "1.1rem",
                fontWeight: 900,
              }}
            >
              <Lock size={18} />
              {t("login_to_vote_title")}
            </h3>
            <p
              style={{
                margin: 0,
                fontSize: "0.8rem",
                opacity: 0.7,
                lineHeight: 1.4,
              }}
              dangerouslySetInnerHTML={{ __html: t("login_to_vote_desc") }}
            />
          </div>

          <button
            onClick={handleAuth}
            className="btn-hover-dark"
            style={{
              background: "#9146ff",
              border: "none",
              color: "#fff",
              height: "46px",
              borderRadius: "1.25rem",
              padding: "0 1.5rem",
              fontSize: "0.9rem",
              fontWeight: 950,
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              cursor: "pointer",
              boxShadow: "4px 4px 0px #000",
              marginTop: isMobile ? "-0.5rem" : 0,
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              style={{ fill: "currentColor" }}
            >
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {t("login_with_google")}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
