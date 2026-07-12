import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

interface MaxVotesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MaxVotesModal: React.FC<MaxVotesModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(5px)",
            zIndex: 2000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1.5rem",
          }}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            style={{
              background: "rgba(15, 10, 25, 0.95)",
              border: "1px solid rgba(255, 184, 0, 0.4)",
              borderRadius: "1.5rem",
              padding: "2rem",
              width: "100%",
              maxWidth: "400px",
              textAlign: "center",
              boxShadow:
                "0 20px 40px rgba(0,0,0,0.5), inset 0 0 20px rgba(255, 184, 0, 0.05)",
            }}
          >
            <h3
              style={{
                margin: "0 0 1rem 0",
                color: "#ffb800",
                fontSize: "1.25rem",
              }}
            >
              {t("vote_limit_title")}
            </h3>
            <p
              style={{
                margin: "0 0 1.5rem 0",
                opacity: 0.8,
                fontSize: "0.9rem",
                lineHeight: 1.5,
              }}
            >
              {t("vote_limit_desc")}
            </p>
            <button
              onClick={onClose}
              style={{
                background: "rgba(255, 255, 255, 0.1)",
                border: "none",
                color: "#fff",
                padding: "0.75rem 2rem",
                borderRadius: "1rem",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              {t("understood")}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
