import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ScoreboardProps {
  scoreA: number;
  scoreB: number;
  labelA: string;
  labelB: string;
  popups?: { id: number; points: number; side: "player" | "cpu"; reason?: string }[];
}

export const Scoreboard: React.FC<ScoreboardProps> = ({ scoreA, scoreB, labelA, labelB, popups = [] }) => {
  const isDesktop = typeof window !== "undefined" && window.innerWidth > 1024;

  // removed latestReason

  return (
    <div className="scoreboard">
      {/* Item A (Rival / Top / Left) */}
      <div className="scoreboard-item" style={{ position: "relative" }}>
        <div className="scoreboard-label">{labelA}</div>
        <div className="scoreboard-value text-digital" style={{ color: '#fff' }}>{scoreA.toString().padStart(2, '0')}</div>
        
        <AnimatePresence>
          {popups.filter(p => p.side === "cpu").map((popup) => (
            <motion.div
              key={popup.id}
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: 1, y: -50 }}
              exit={{ opacity: 0, y: -80 }}
              className="score-popup"
              style={{
                position: "absolute",
                top: "0",
                left: "0",
                right: "0",
                color: "#F77502",
                fontSize: "2.5rem",
                fontWeight: "900",
                textShadow: "0 0 15px rgba(0,0,0,0.8), 4px 4px 0px #000",
                WebkitTextStroke: "1px rgba(0,0,0,0.5)",
                zIndex: 2100,
                textAlign: "center",
                pointerEvents: "none"
              }}
            >
              +{popup.points}
            </motion.div>
          ))}
          {isDesktop && popups.filter(p => p.side === "cpu" && p.reason).map((popup, idx) => (
            <motion.div
              layout
              key={`reason-${popup.id}`}
              initial={{ opacity: 0, y: 8, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: 8, x: "-50%" }}
              style={{
                position: "absolute",
                bottom: `calc(-2.5rem - ${idx * 1.8}rem)`,
                left: "50%",
                width: "max-content",
                whiteSpace: "nowrap",
                background: "rgba(255,255,255,0.08)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "0.75rem",
                padding: "0.3rem 0.9rem",
                color: "#F77502",
                fontSize: "0.72rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                pointerEvents: "none",
                zIndex: 2100,
              }}
            >
              {popup.reason}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      <div className="text-digital" style={{ fontSize: '2.5rem', color: '#fff', opacity: 0.5 }}>:</div>
      
      {/* Item B (Player / Bottom / Right) */}
      <div className="scoreboard-item" style={{ position: "relative" }}>
        <div className="scoreboard-label">{labelB}</div>
        <div className="scoreboard-value text-digital" style={{ color: '#fff' }}>{scoreB.toString().padStart(2, '0')}</div>

        <AnimatePresence>
          {popups.filter(p => p.side === "player").map((popup) => (
            <motion.div
              key={popup.id}
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: 1, y: -50 }}
              exit={{ opacity: 0, y: -80 }}
              className="score-popup"
              style={{
                position: "absolute",
                top: "0",
                left: "0",
                right: "0",
                color: (popup.reason?.toLowerCase().includes("envido") ? "#00f2ff" : "#ffdf00"),
                fontSize: "2.5rem",
                fontWeight: "900",
                textShadow: "0 0 15px rgba(0,0,0,0.8), 4px 4px 0px #000",
                WebkitTextStroke: "1px rgba(0,0,0,0.5)",
                zIndex: 2100,
                textAlign: "center",
                pointerEvents: "none"
              }}
            >
              +{popup.points}
            </motion.div>
          ))}
          {isDesktop && popups.filter(p => p.side === "player" && p.reason).map((popup, idx) => (
            <motion.div
              layout
              key={`reason-${popup.id}`}
              initial={{ opacity: 0, y: 8, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: 8, x: "-50%" }}
              style={{
                position: "absolute",
                bottom: `calc(-2.5rem - ${idx * 1.8}rem)`,
                left: "50%",
                width: "max-content",
                whiteSpace: "nowrap",
                background: "rgba(255,255,255,0.08)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "0.75rem",
                padding: "0.3rem 0.9rem",
                color: (popup.reason?.toLowerCase().includes("envido") ? "#00f2ff" : "#ffdf00"),
                fontSize: "0.72rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                pointerEvents: "none",
                zIndex: 2100,
              }}
            >
              {popup.reason}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
