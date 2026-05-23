import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface RoundCountdownProps {
  isActive: boolean;
  isGameStarting?: boolean;
}

export const RoundCountdown: React.FC<RoundCountdownProps> = ({ isActive, isGameStarting }) => {
  const { t } = useTranslation();
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (isActive) {
      setCount(3);
      const timer = setInterval(() => {
        setCount((prev) => (prev > 0 ? prev - 1 : prev));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isActive]);

  const mainText = isGameStarting ? t("starting_in") : t("next_in");

  return (
    <AnimatePresence>
      {isActive && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 3000,
            pointerEvents: 'none',
            width: '100%',
            textAlign: 'center'
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={count}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1.5rem'
              }}
            >
              <div
                className="text-display"
                style={{
                  fontSize: "clamp(1.5rem, 6vw, 4rem)",
                  color: "#fff",
                  textShadow: "8px 8px 0px #000, 0 0 20px rgba(0,0,0,0.5)",
                  WebkitTextStroke: "3px #000",
                  paintOrder: "stroke fill",
                  whiteSpace: "nowrap"
                }}
              >
                {count > 0 ? `${mainText} ${count}...` : (isGameStarting ? t("lets_play") : "")}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </AnimatePresence>
  );
};
