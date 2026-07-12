import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

interface UnsavedChangesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const UnsavedChangesModal: React.FC<UnsavedChangesModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
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
              background: "rgba(255, 255, 255, 0.05)",
              border: "1.5px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "2rem",
              padding: "2.5rem 2rem",
              width: "100%",
              maxWidth: "480px",
              textAlign: "center",
              boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1.5rem",
            }}
          >
            {/* Warning Icon inside a red glowing circle */}
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: "rgba(239, 68, 68, 0.15)",
                border: "2.5px solid #ef4444",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 20px rgba(239, 68, 68, 0.45)",
                color: "#ef4444",
                fontSize: "2rem",
              }}
            >
              ⚠️
            </div>

            <h3
              className="text-display"
              style={{
                fontSize: "1.5rem",
                margin: 0,
                color: "#ef4444",
                letterSpacing: "0.05em",
              }}
            >
              {t("exit_without_saving")}
            </h3>

            <p
              style={{
                margin: 0,
                fontSize: "0.95rem",
                opacity: 0.8,
                lineHeight: "1.5",
                color: "#fff",
              }}
            >
              {t("unsaved_votes_warning")}
            </p>

            {/* Action Buttons */}
            <div
              style={{
                display: "flex",
                gap: "1rem",
                width: "100%",
                marginTop: "0.5rem",
              }}
            >
              <button
                onClick={onConfirm}
                className="btn-hover-dark"
                style={{
                  flex: 1,
                  height: "46px",
                  borderRadius: "1.25rem",
                  background: "rgba(239, 68, 68, 0.2)",
                  border: "1px solid #ef4444",
                  color: "#ef4444",
                  fontWeight: 900,
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  boxShadow: "4px 4px 0px #000",
                  transition: "all 0.2s",
                }}
              >
                {t("yes_exit")}
              </button>

              <button
                onClick={onClose}
                className="btn-hover-dark"
                style={{
                  flex: 1,
                  height: "46px",
                  borderRadius: "1.25rem",
                  background: "linear-gradient(to right, #a855f7, #7c3aed)",
                  border: "none",
                  color: "#fff",
                  fontWeight: 900,
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  boxShadow: "4px 4px 0px #000",
                  transition: "all 0.2s",
                }}
              >
                {t("no_stay")}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
