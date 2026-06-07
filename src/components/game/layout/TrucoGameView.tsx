import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Scoreboard } from "./Scoreboard";
import { StarsSidebar } from "./StarsSidebar";
import { InstructionsPanel } from "./InstructionsPanel";
import { GameField } from "../core/GameField";
import { CPUHands } from "../core/CPUHands";
import { GameModals } from "../modals/GameModals";
import { GameTopBar } from "../controls/GameTopBar";
import { GameBottomBar, getEnvHighlightIds } from "../controls/GameBottomBar";
import { Zap, BookOpen, X, Star } from "lucide-react";
import { useTranslation, Trans } from "react-i18next";
import { VolumeControl } from "../../shared/VolumeControl";
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
  isGameStarting?: boolean;
  isCooldown: boolean;
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
  playerFolded: boolean;
  activeCountries?: string[];
  roundResult?: "win" | "loss" | null;
  setIsPaused?: (paused: boolean) => void;
  hideRulesButton?: boolean;
  onRulesClick?: () => void;
}

export const TrucoGameView: React.FC<TrucoGameViewProps> = ({
  user, gameMode, gameState, playerHand, playedCards, cpuHandCount, cpuPartnerHandCount,
  score, activeCall, trucoState, envidoState, pendingAction, handWinners, handWinningCardIds,
  scorePopups, winnerModal, rivalName, isBusy, isRoundEnding, whoseTurn, maxPoints,
  showCountdown, isGameStarting, isCooldown, roundWinningCardId, cpuPartnerHandRef, showExitModal,
  onExitRequest, onRestartGame, onPlayCard, onHandleCall, onHandleResponse, onHandleMazo,
  onCloseExit, onConfirmExit, playerFolded, setIsPaused, roomCode, isRivalConnected = true, isSelfConnected = true,
  activeCountries, roundResult, hideRulesButton = false
}) => {
  const { t } = useTranslation();
  const [showMobileHelp, setShowMobileHelp] = useState(false);
  const [helpTab, setHelpTab] = useState<'rules' | 'ranking'>('rules');
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 768);
  const [isTablet, setIsTablet] = useState(typeof window !== 'undefined' && window.innerWidth >= 768 && window.innerWidth <= 1024);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth <= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const playerPlayed = playedCards ? playedCards.filter((c: any) => c.owner === "player") : [];
  const initialHand = [...playerHand, ...playerPlayed];
  const cardsPerHand = gameMode === '2v2' ? 4 : 2;
  const isFirstRound = (playedCards ? playedCards.length : 0) < cardsPerHand;
  const showEnvHint = isFirstRound && (envidoState.status === 'none' || envidoState.status === 'pending' || envidoState.status === 'accepted');
  const envHighlightIds = showEnvHint ? getEnvHighlightIds(initialHand) : new Set<string>();

  React.useEffect(() => {
    if (setIsPaused) {
      setIsPaused(showMobileHelp);
    }
  }, [showMobileHelp, setIsPaused]);

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
          <span>
            <Trans
              i18nKey="rival_disconnected"
              values={{ name: rivalName.toUpperCase(), code: roomCode }}
              components={{ 1: <span style={{ color: "#00f2ff", fontSize: "1.1rem" }} /> }}
            />
          </span>
        </motion.div>
      )}

      {/* Bottom Left: Points Indicator */}
      <div
        className={`points-indicator points-indicator-fixed${showMobileHelp && isMobile ? ' points-indicator-modal-open' : ''}`}
        style={{
          background: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(12px)",
          height: "40px",
          borderRadius: "1rem",
          padding: "0 1.25rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.4rem",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          color: "white",
          pointerEvents: "none"
        }}
      >
        <Zap size={16} fill="currentColor" />
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "0.75rem", letterSpacing: "0.05em", fontStyle: "normal", textTransform: "uppercase" }}>{t("to_points", { points: maxPoints })}</span>
      </div>

      {/* Responsive Scoreboard: Rival on Top (A), Player on Bottom (B) */}
      <div className="game-scoreboard-wrapper" style={{ position: "fixed", zIndex: 4000, pointerEvents: "none" }}>
        <Scoreboard
          scoreA={score.cpu}
          scoreB={score.player}
          labelA={(rivalName || (gameMode === "multiplayer" ? t("rival") : "CPU")).toUpperCase()}
          labelB={user ? (user.user_metadata.full_name?.split(' ')[0] || user.user_metadata.name?.split(' ')[0] || user.email.split('@')[0]).toUpperCase() : t("you")}
          popups={scorePopups}
        />
      </div>



      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        gap: "0.25rem",
        width: "100%",
        maxWidth: gameMode === "2v2" ? "1200px" : "860px",
        marginTop: isMobile ? "4.5rem" : "2rem"
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
            {(() => {
              let turnStatus = "neutral";
              if (!isRivalConnected && gameMode === "multiplayer") turnStatus = "disconnected";
              else if (showCountdown || isCooldown) turnStatus = "neutral";
              else if (pendingAction) {
                if (pendingAction.caller === "player" || pendingAction.caller === "partner") turnStatus = "waiting";
                else turnStatus = "active";
              } else if (whoseTurn === "player") {
                turnStatus = "active";
              } else {
                turnStatus = "waiting";
              }

              return (
                <motion.div
                  animate={{ scale: turnStatus === "active" ? [1, 1.05, 1] : 1 }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{
                    padding: "0.3rem 1rem",
                    background: turnStatus === "disconnected" ? "rgba(255, 60, 0, 0.2)" : turnStatus === "active" ? "rgba(255, 255, 255, 0.15)" : turnStatus === "waiting" ? "rgba(255, 140, 0, 0.2)" : "rgba(255, 255, 255, 0.05)",
                    border: `1px solid ${turnStatus === "disconnected" ? "#ff3c00" : turnStatus === "active" ? "#ffffff" : turnStatus === "waiting" ? "#ff8c00" : "rgba(255,255,255,0.2)"}`,
                    borderRadius: "2rem",
                    color: turnStatus === "disconnected" ? "#ff3c00" : turnStatus === "active" ? "#ffffff" : turnStatus === "waiting" ? "#ff8c00" : "white",
                    fontSize: "0.6rem",
                    fontWeight: 900,
                    textTransform: "uppercase",
                    letterSpacing: "0.2em",
                  }}
                >
                  {turnStatus === "disconnected"
                    ? t("waiting_reconnect", { name: rivalName.toUpperCase() })
                    : (showCountdown || isCooldown)
                      ? "• • •"
                      : pendingAction && (pendingAction.caller === "player" || pendingAction.caller === "partner")
                        ? t("waiting_for", { name: rivalName.toUpperCase() })
                        : pendingAction
                          ? t("waiting_response")
                          : whoseTurn === "player"
                            ? t("your_turn")
                            : t("waiting_for", { name: rivalName.toUpperCase() })}
                </motion.div>
              );
            })()}
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
          isGameStarting={isGameStarting || false}
          whoseTurn={whoseTurn}
          onHandleMazo={onHandleMazo}
          isMazoDisabled={!(whoseTurn === "player" || whoseTurn === "partner") || isBusy || pendingAction !== null}
          envHighlightIds={envHighlightIds}
          isCooldown={isCooldown}
          roundResult={roundResult}
          onRulesClick={() => setShowMobileHelp(true)}
          hideRulesButton={hideRulesButton}
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
          onHandleResponse={onHandleResponse}
          onHandleCall={onHandleCall}
          playerFolded={playerFolded}
          envHighlightIds={envHighlightIds}
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

      {/* Top Right Controls: Rules and Sound */}
      <div 
        className="game-top-right-controls"
        style={{
          position: "fixed",
          top: "1.5rem",
          right: "1.5rem",
          zIndex: 2000,
          display: "flex",
          alignItems: "center",
          gap: "0.5rem"
        }}
      >

        <VolumeControl expandDirection="down" />
      </div>

      {/* Mobile/Tablet Rules & Ranking Overlay Modal */}
      <AnimatePresence>
        {showMobileHelp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowMobileHelp(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0, 0, 0, 0.65)",
              backdropFilter: "blur(12px)",
              zIndex: 3000,
              display: "flex",
              alignItems: (isMobile || isTablet) ? "flex-start" : "center",
              justifyContent: "center",
              padding: isMobile ? "8rem 1.5rem 1.5rem" : isTablet ? "8rem 1.5rem 1.5rem" : "1.5rem"
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "2rem",
                padding: "2rem",
                width: "100%",
                maxWidth: isMobile ? "500px" : isTablet ? "660px" : "500px",
                maxHeight: "60vh",
                display: "flex",
                flexDirection: "column",
                position: "relative"
              }}
            >
              {/* Tabs + Close Button Row */}
              <div style={{ 
                display: "flex", 
                gap: "0.5rem", 
                marginBottom: "1.25rem",
                alignItems: "center",
              }}>
                <div style={{
                  flex: 1,
                  display: "flex",
                  gap: "0.5rem",
                  background: "rgba(255,255,255,0.05)",
                  padding: "0.25rem",
                  borderRadius: "12px",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}>
                <button
                  onClick={() => setHelpTab('rules')}
                  style={{
                    flex: 1,
                    padding: "0.5rem",
                    borderRadius: "10px",
                    border: "none",
                    background: helpTab === 'rules' ? "rgba(255, 255, 255, 0.1)" : "transparent",
                    color: helpTab === 'rules' ? "#ffffff" : "rgba(255, 255, 255, 0.5)",
                    fontSize: "0.85rem",
                    fontWeight: 800,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.4rem"
                  }}
                >
                  <BookOpen size={16} color="currentColor" />
                  {t("rules")}
                </button>
                <button
                  onClick={() => setHelpTab('ranking')}
                  style={{
                    flex: 1,
                    padding: "0.5rem",
                    borderRadius: "10px",
                    border: "none",
                    background: helpTab === 'ranking' ? "rgba(255, 255, 255, 0.1)" : "transparent",
                    color: helpTab === 'ranking' ? "#ffffff" : "rgba(255, 255, 255, 0.5)",
                    fontSize: "0.85rem",
                    fontWeight: 800,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.4rem"
                  }}
                >
                  <Star size={16} color="currentColor" />
                  {t("ranking")}
                </button>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setShowMobileHelp(false)}
                  style={{
                    background: "rgba(255, 255, 255, 0.08)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    color: "rgba(255, 255, 255, 0.7)",
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    flexShrink: 0,
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.18)";
                    (e.currentTarget as HTMLButtonElement).style.color = "white";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.08)";
                    (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.7)";
                  }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Content */}
              <div className="custom-scrollbar" style={{ flex: 1, overflowY: helpTab === 'rules' ? "auto" : "hidden", minHeight: 0, display: "flex", flexDirection: "column" }}>
                <style>{`
                  .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                  }
                  .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                  }
                  .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 10px;
                  }
                  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.4);
                  }
                `}</style>
                {helpTab === 'rules' ? <InstructionsPanel maxPoints={maxPoints} /> : <StarsSidebar allowedTeams={activeCountries} />}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
