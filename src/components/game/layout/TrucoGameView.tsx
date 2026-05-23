import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Scoreboard } from "./Scoreboard";
import { GameSidebar } from "./GameSidebar";
import { RankingSidebar } from "./RankingSidebar";
import { InstructionsPanel } from "./InstructionsPanel";
import { GameField } from "../core/GameField";
import { CPUHands } from "../core/CPUHands";
import { GameModals } from "../modals/GameModals";
import { GameTopBar } from "../controls/GameTopBar";
import { GameBottomBar } from "../controls/GameBottomBar";
import { Zap, BookOpen, X } from "lucide-react";
import type { GameMode, PlayerRole } from "../../../lib/truco/types";

interface TrucoGameViewProps {
  user: any;
  gameMode: GameMode;
  gameState: string;
  playerHand: any[];
  playedCards: any[];
  cpuHandCount: number;
  cpuPartnerHandCount: number;
  score: any;
  activeCall: any;
  trucoState: any;
  envidoState: any;
  pendingAction: any;
  handWinners: any[];
  handWinningCardIds: string[];
  scorePopups: any[];
  winnerModal: any;
  rivalName: string;
  isBusy: boolean;
  isRoundEnding: boolean;
  whoseTurn: PlayerRole | null;
  maxPoints: number;
  showCountdown: boolean;
  roundWinningCardId: string | null;
  cpuPartnerHandRef: any;
  showExitModal: boolean;
  roomCode?: string | null;
  isRivalConnected?: boolean;
  isSelfConnected?: boolean;
  onExitRequest: () => void;
  onRestartGame: () => void;
  onPlayCard: (card: any) => void;
  onHandleCall: (type: any, level: number, caller: PlayerRole) => void;
  onHandleResponse: (accept: boolean) => void;
  onHandleMazo: () => void;
  onCloseExit: () => void;
  onConfirmExit: () => void;
}

export const TrucoGameView: React.FC<TrucoGameViewProps> = ({
  user, gameMode, gameState, playerHand, playedCards, cpuHandCount, cpuPartnerHandCount,
  score, activeCall, trucoState, envidoState, pendingAction, handWinners, handWinningCardIds,
  scorePopups, winnerModal, rivalName, isBusy, isRoundEnding, whoseTurn, maxPoints,
  showCountdown, roundWinningCardId, cpuPartnerHandRef, showExitModal,
  roomCode, isRivalConnected = true, isSelfConnected = true,
  onExitRequest, onRestartGame, onPlayCard, onHandleCall, onHandleResponse, onHandleMazo,
  onCloseExit, onConfirmExit
}) => {
  const [showMobileHelp, setShowMobileHelp] = useState(false);
  const [helpTab, setHelpTab] = useState<'rules' | 'ranking'>('rules');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="game-container"
      style={{
        width: "100vw",
        height: "100dvh",
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url("/playground.png")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        overflowY: "auto",
        overflowX: "hidden",
        position: "relative",
        padding: "0.5rem"
      }}
    >
      <GameTopBar onExit={onExitRequest} />

      {gameMode === "multiplayer" && !isRivalConnected && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: "rgba(255, 60, 0, 0.2)",
            border: "1px solid #ff3c00",
            backdropFilter: "blur(12px)",
            padding: "0.75rem 1.5rem",
            borderRadius: "1rem",
            color: "white",
            fontWeight: 900,
            fontSize: "0.85rem",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            marginTop: "0.5rem",
            zIndex: 1000,
            boxShadow: "0 0 20px rgba(255, 60, 0, 0.4)",
            textTransform: "uppercase"
          }}
        >
          <span style={{ fontSize: "1.2rem" }}>⚠️</span>
          <span>{rivalName.toUpperCase()} SE HA DESCONECTADO. LA PARTIDA SIGUE ACTIVA (CÓDIGO: <span style={{ color: "#00f2ff", fontSize: "1.1rem" }}>{roomCode}</span>)</span>
        </motion.div>
      )}

      {/* Bottom Left: Points Indicator */}
      <div
        className="points-indicator points-indicator-fixed"
        style={{
          background: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(12px)",
          height: "40px",
          borderRadius: "1rem",
          padding: "0 1.25rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.6rem",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          color: "white",
          pointerEvents: "none"
        }}
      >
        <Zap size={16} fill="currentColor" />
        <span style={{ fontWeight: 900, fontSize: "0.75rem", letterSpacing: "0.05em", fontStyle: "normal", textTransform: "uppercase" }}>A {maxPoints} PUNTOS</span>
      </div>

      {/* Responsive Scoreboard: Rival on Top (A), Player on Bottom (B) */}
      <div className="game-scoreboard-wrapper">
        <Scoreboard
          scoreA={score.cpu}
          scoreB={score.player}
          labelA={(rivalName || (gameMode === "multiplayer" ? "RIVAL" : "CPU")).toUpperCase()}
          labelB={user ? (user.user_metadata.full_name?.split(' ')[0] || user.user_metadata.name?.split(' ')[0] || user.email.split('@')[0]).toUpperCase() : "VOS"}
          popups={scorePopups}
        />
      </div>

      {gameMode !== "2v2" && <GameSidebar maxPoints={maxPoints} />}

      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        gap: "0.25rem",
        width: "100%",
        maxWidth: gameMode === "2v2" ? "1200px" : "860px",
        marginTop: "2.5rem"
      }}>
        <CPUHands
          gameMode={gameMode}
          cpuHandCount={cpuHandCount}
          cpuPartnerHandRef={cpuPartnerHandRef}
          cpuPartnerHandCount={cpuPartnerHandCount}
        />

        {/* Turn Pill (Always centered) */}
        {(gameMode === "1v1" || gameMode === "multiplayer") && (
          <div className="turn-pill-sticky" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem", marginBottom: "5px", zIndex: 100, position: "relative" }}>
            <motion.div
              animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{
                padding: "0.3rem 1rem",
                background: (!isRivalConnected && gameMode === "multiplayer") ? "rgba(255, 60, 0, 0.2)" : ((whoseTurn === "player" && !showCountdown) ? "rgba(0, 242, 255, 0.2)" : "rgba(255, 255, 255, 0.05)"),
                border: `1px solid ${(!isRivalConnected && gameMode === "multiplayer") ? "#ff3c00" : ((whoseTurn === "player" && !showCountdown) ? "#00f2ff" : "rgba(255,255,255,0.2)")}`,
                borderRadius: "2rem",
                color: (!isRivalConnected && gameMode === "multiplayer") ? "#ff3c00" : ((whoseTurn === "player" && !showCountdown) ? "#00f2ff" : "white"),
                fontSize: "0.6rem",
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: "0.2em",
              }}
            >
              {(!isRivalConnected && gameMode === "multiplayer")
                ? `ESPERANDO RECONEXIÓN DE ${rivalName.toUpperCase()}...`
                : showCountdown
                  ? "• • •"
                  : pendingAction && (pendingAction.caller === "player" || pendingAction.caller === "partner")
                    ? `ESPERANDO A ${rivalName.toUpperCase()}...`
                    : pendingAction
                      ? "¡ESPERANDO TU RESPUESTA!"
                      : whoseTurn === "player"
                        ? "TU TURNO"
                        : `ESPERANDO A ${rivalName.toUpperCase()}...`}
            </motion.div>
          </div>
        )}

        <GameField
          gameMode={gameMode}
          playedCards={playedCards}
          handWinners={handWinners}
          roundWinningCardId={roundWinningCardId}
          handWinningCardIds={handWinningCardIds}
          activeCall={activeCall}
          gameState={gameState}
          isRoundEnding={isRoundEnding}
          isGameStarting={showCountdown}
          whoseTurn={whoseTurn}
        />

        <GameBottomBar
          pendingAction={pendingAction}
          envidoState={envidoState}
          trucoState={trucoState}
          playedCards={playedCards}
          gameMode={gameMode}
          whoseTurn={whoseTurn}
          isRoundEnding={isRoundEnding}
          isBusy={isBusy}
          playerHand={playerHand}
          onPlayCard={onPlayCard}
          onHandleMazo={onHandleMazo}
          onHandleResponse={onHandleResponse}
          onHandleCall={onHandleCall}
        />
      </div>

      <GameModals
        winnerModal={winnerModal}
        showExitModal={showExitModal}
        abandonmentModal={false}
        isMultiplayer={gameMode === "multiplayer"}
        isRivalConnected={isRivalConnected}
        isSelfConnected={isSelfConnected}
        rivalName={rivalName}
        roomCode={roomCode || null}
        showCountdown={showCountdown}
        onRestart={onRestartGame}
        onCloseExit={onCloseExit}
        onConfirmExit={onConfirmExit}
        onContinue={onCloseExit}
      />

      {/* Floating Rules/Ranking trigger button for mobile/tablet */}
      <button
        onClick={() => setShowMobileHelp(true)}
        className="mobile-help-btn"
        style={{
          background: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(12px)",
          height: "40px",
          borderRadius: "1rem",
          padding: "0 1rem",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "none",
          cursor: "pointer"
        }}
      >
        <BookOpen size={16} />
        <span className="rules-label" style={{ fontWeight: 900, fontSize: "0.75rem", letterSpacing: "0.05em", fontStyle: "normal", textTransform: "uppercase" }}>REGLAS</span>
      </button>

      {/* Mobile/Tablet Rules & Ranking Overlay Modal */}
      <AnimatePresence>
        {showMobileHelp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0, 0, 0, 0.85)",
              backdropFilter: "blur(12px)",
              zIndex: 3000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "1.5rem"
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "2rem",
                padding: "2rem 2rem 2rem 2rem",
                paddingTop: "4rem",
                width: "100%",
                maxWidth: "500px",
                maxHeight: "85vh",
                display: "flex",
                flexDirection: "column",
                position: "relative"
              }}
            >
              {/* Close Button X */}
              <button
                onClick={() => setShowMobileHelp(false)}
                style={{
                  position: "absolute",
                  top: "1.25rem",
                  right: "1.25rem",
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "none",
                  color: "white",
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  zIndex: 10
                }}
              >
                <X size={18} />
              </button>

              {/* Tabs */}
              <div style={{ 
                display: "flex", 
                gap: "0.5rem", 
                marginBottom: "1.25rem",
                background: "rgba(255,255,255,0.05)",
                padding: "0.25rem",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.1)",
                marginTop: "1rem"
              }}>
                <button
                  onClick={() => setHelpTab('rules')}
                  style={{
                    flex: 1,
                    padding: "0.5rem",
                    borderRadius: "10px",
                    border: "none",
                    background: helpTab === 'rules' ? "rgba(255, 255, 255, 0.1)" : "transparent",
                    color: helpTab === 'rules' ? "var(--color-accent)" : "rgba(255, 255, 255, 0.5)",
                    fontSize: "0.85rem",
                    fontWeight: 800,
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                >
                  REGLAS
                </button>
                <button
                  onClick={() => setHelpTab('ranking')}
                  style={{
                    flex: 1,
                    padding: "0.5rem",
                    borderRadius: "10px",
                    border: "none",
                    background: helpTab === 'ranking' ? "rgba(255, 255, 255, 0.1)" : "transparent",
                    color: helpTab === 'ranking' ? "var(--color-accent)" : "rgba(255, 255, 255, 0.5)",
                    fontSize: "0.85rem",
                    fontWeight: 800,
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                >
                  RANKING
                </button>
              </div>

              {/* Content */}
              <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
                {helpTab === 'rules' ? <InstructionsPanel maxPoints={maxPoints} /> : <RankingSidebar />}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
