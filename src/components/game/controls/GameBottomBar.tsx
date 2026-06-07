import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameActions } from './GameActions';
import { Sticker } from '../../shared/Sticker';
import type { GameMode, PlayerRole, EnvidoState, TrucoState, PlayedCard } from '../../../lib/truco/types';

interface GameBottomBarProps {
  pendingAction: any;
  envidoState: EnvidoState;
  trucoState: TrucoState;
  playedCards: PlayedCard[];
  gameMode: GameMode;
  whoseTurn: PlayerRole | null;
  isRoundEnding: boolean;
  isBusy: boolean;
  playerHand: any[];
  onPlayCard: (card: any) => void;
  onHandleResponse: (accept: boolean) => void;
  onHandleCall: (type: any, level: number, caller: PlayerRole) => void;
  playerFolded?: boolean;
  envHighlightIds?: Set<string>;
}

/**
 * Returns the set of card IDs whose ENV number should be highlighted in cyan.
 * - If any two cards share country or club → highlight the two with highest combined ENV.
 * - Otherwise → highlight only the single highest-ENV card.
 */
export function getEnvHighlightIds(hand: any[]): Set<string> {
  if (hand.length === 0) return new Set();

  // Find all pairs sharing country or club
  const pairs: [any, any][] = [];
  for (let i = 0; i < hand.length; i++) {
    for (let j = i + 1; j < hand.length; j++) {
      if (hand[i].country === hand[j].country || hand[i].club === hand[j].club) {
        pairs.push([hand[i], hand[j]]);
      }
    }
  }

  if (pairs.length > 0) {
    // Best pair = highest combined ENV
    const best = pairs.reduce((a, b) =>
      (a[0].env + a[1].env) >= (b[0].env + b[1].env) ? a : b
    );
    return new Set([best[0].id, best[1].id]);
  } else {
    // No links — just the highest single card
    const maxEnv = Math.max(...hand.map((c: any) => c.env));
    const top = hand.find((c: any) => c.env === maxEnv);
    return new Set(top ? [top.id] : []);
  }
}

export const GameBottomBar: React.FC<GameBottomBarProps> = ({
  pendingAction, envidoState, trucoState, playedCards, gameMode,
  whoseTurn, isRoundEnding, isBusy, playerHand,
  onPlayCard, onHandleResponse, onHandleCall,
  playerFolded = false,
  envHighlightIds
}) => {
  const isDraggingRef = React.useRef(false);
  const [isMobile, setIsMobile] = React.useState(typeof window !== 'undefined' && window.innerWidth < 768);
  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Use passed highlights or fallback to calculating it
  let computedHighlightIds = envHighlightIds;
  if (!computedHighlightIds) {
    const playerPlayed = playedCards ? playedCards.filter(c => c.owner === "player") : [];
    const initialHand = [...playerHand, ...playerPlayed];
    const cardsPerHand = gameMode === '2v2' ? 4 : 2;
    const isFirstRound = (playedCards ? playedCards.length : 0) < cardsPerHand;
    const showEnvHint = isFirstRound && (envidoState.status === 'none' || envidoState.status === 'pending' || envidoState.status === 'accepted');
    computedHighlightIds = showEnvHint ? getEnvHighlightIds(initialHand) : new Set<string>();
  }

  return (
    <div className="game-bottom-bar" style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: isMobile ? "1rem" : "1.75rem",
      width: "100%",
      padding: isMobile ? "0.25rem 0 1rem 0" : "0.75rem 0",
      zIndex: 1000,
      position: "relative"
    }}>
      {/* Truco/Envido Actions */}
      <GameActions
        pendingAction={pendingAction}
        envidoState={envidoState}
        trucoState={trucoState}
        playedCards={playedCards}
        gameMode={gameMode}
        whoseTurn={whoseTurn}
        isRoundEnding={isRoundEnding}
        isBusy={isBusy}
        hideMazo={true}
        handleResponse={onHandleResponse}
        handleCall={onHandleCall}
        handleMazo={() => {}}
        triggerCall={() => {}}
      />

      {/* Player Hand */}
      <div style={{
        display: "flex",
        gap: "0.5rem",
        padding: "0 0.5rem",
        justifyContent: "center",
        flexWrap: "nowrap"
      }}>
        <AnimatePresence mode="popLayout">
          {playerHand.length === 0 && playedCards.length === 0 ? (
            [0, 1, 2].map((i) => (
              <motion.div
                key={`loading-card-${i}`}
                initial={{ y: 80, opacity: 0, rotate: 10 }}
                animate={{ y: 0, opacity: 0.75, rotate: (i - 1) * 6 }}
                exit={{ y: -80, opacity: 0, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 180, damping: 15, delay: i * 0.1 }}
                className="sticker"
                style={{
                  backgroundImage: "url('/card-back.png')",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  cursor: "default",
                  pointerEvents: "none"
                }}
              >
                <div className="sticker-glitter" />
              </motion.div>
            ))
          ) : (
            playerHand.map((card, idx) => {
              const isCardDisabled = isBusy || whoseTurn !== "player" || isRoundEnding;
              const envColor = computedHighlightIds.has(card.id) ? "#00f2ff" : "#fff";
              return (
                <motion.div
                  key={card.id}
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 50, opacity: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  drag={!isCardDisabled}
                  dragSnapToOrigin={true}
                  whileDrag={{ scale: 1.15, rotate: -2, zIndex: 2000, boxShadow: "0px 15px 30px rgba(0,0,0,0.5)" }}
                  onDragStart={() => {
                    isDraggingRef.current = true;
                    window.dispatchEvent(new CustomEvent("card-drag-start"));
                  }}
                  onDragEnd={(_event, info) => {
                    setTimeout(() => {
                      isDraggingRef.current = false;
                    }, 100);
                    window.dispatchEvent(new CustomEvent("card-drag-end"));
                    const fieldEl = document.querySelector(".game-field");
                    if (fieldEl) {
                      const rect = fieldEl.getBoundingClientRect();
                      const x = info.point.x;
                      const y = info.point.y;
                      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
                        onPlayCard(card);
                      }
                    }
                  }}
                  style={{ touchAction: "none" }}
                >
                  <Sticker
                    card={card}
                    disabled={isCardDisabled}
                    showBack={playerFolded}
                    envColor={envColor}
                    onClick={() => {
                      if (!isDraggingRef.current) {
                        onPlayCard(card);
                      }
                    }}
                  />
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
