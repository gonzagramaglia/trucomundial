import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameActions } from './GameActions';
import { Sticker } from '../../shared/Sticker';
import { Button } from '../../ui/Button';
import { useTranslation } from 'react-i18next';
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
  onHandleMazo: () => void;
  onHandleResponse: (accept: boolean) => void;
  onHandleCall: (type: any, level: number, caller: PlayerRole) => void;
}

export const GameBottomBar: React.FC<GameBottomBarProps> = ({
  pendingAction, envidoState, trucoState, playedCards, gameMode,
  whoseTurn, isRoundEnding, isBusy, playerHand,
  onPlayCard, onHandleMazo, onHandleResponse, onHandleCall
}) => {
  const { t } = useTranslation();
  const isHeroTeamTurn = whoseTurn === "player" || whoseTurn === "partner";
  const isDraggingRef = React.useRef(false);
  const [isMobile, setIsMobile] = React.useState(typeof window !== 'undefined' && window.innerWidth < 768);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: isMobile ? "1.5rem" : "0.75rem",
      width: "100%",
      padding: isMobile ? "1rem 0" : "0.25rem 0",
      zIndex: 1000
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
        handleMazo={onHandleMazo}
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

      {/* Mazo Button at the very bottom */}
      <div style={{ marginBottom: isMobile ? "3rem" : "0.5rem" }}>
        <Button
          variant="white"
          disabled={!isHeroTeamTurn || isBusy || pendingAction !== null}
          onClick={() => onHandleMazo()}
          style={{ 
            minWidth: '130px', 
            fontSize: '0.9rem', 
            padding: '0.6rem 1.5rem',
            background: '#ffffff',
            color: '#000000',
            border: '3px solid #000',
            boxShadow: '4px 4px 0px #000',
            fontWeight: 900
          }}
        >
          {t("me_voy_al_mazo")}
        </Button>
      </div>
    </div>
  );
};
