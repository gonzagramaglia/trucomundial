import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Save, Check, Trophy } from "lucide-react";
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
  handleAuth: _handleAuth,
  isMobile: _isMobile,
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
      ) : null}
    </AnimatePresence>
  );
};
