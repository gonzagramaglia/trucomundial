import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { PlayedCard as PlayedCardType, GameMode, PlayerRole } from '../../../lib/truco/types';
import { FieldSlots } from './FieldSlots';
import { PlayedCard } from './PlayedCard';
import { CallOverlay } from '../controls/CallOverlay';
import { RoundCountdown } from '../modals/RoundCountdown';
import { useTranslation } from 'react-i18next';

interface GameFieldProps {
  gameMode: GameMode;
  playedCards: PlayedCardType[];
  handWinners: (PlayerRole | "draw")[];
  roundWinningCardId?: string | null;
  handWinningCardIds?: string[];
  activeCall: {
    id: number;
    text: string;
    color: string;
  } | null;
  gameState: string;
  isRoundEnding: boolean;
  isGameStarting: boolean;
  whoseTurn: PlayerRole | null;
  onHandleMazo?: () => void;
  isMazoDisabled?: boolean;
  envHighlightIds?: Set<string>;
  isCooldown?: boolean;
}

export const GameField: React.FC<GameFieldProps> = ({
  gameMode,
  playedCards,
  handWinners,
  roundWinningCardId,
  handWinningCardIds = [],
  activeCall,
  gameState,
  isRoundEnding,
  isGameStarting,
  whoseTurn,
  onHandleMazo,
  isMazoDisabled = false,
  envHighlightIds,
  isCooldown = false
}) => {
  const { t } = useTranslation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isCardDragging, setIsCardDragging] = useState(false);
  const [deckPosition, setDeckPosition] = useState<"left" | "right">("right");

  useEffect(() => {
    if (playedCards.length === 0 && whoseTurn) {
      setDeckPosition(whoseTurn === "player" ? "left" : "right");
    }
  }, [playedCards.length, whoseTurn]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);

    const handleDragStart = () => setIsCardDragging(true);
    const handleDragEnd = () => setIsCardDragging(false);

    window.addEventListener("card-drag-start", handleDragStart);
    window.addEventListener("card-drag-end", handleDragEnd);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener("card-drag-start", handleDragStart);
      window.removeEventListener("card-drag-end", handleDragEnd);
    };
  }, []);

  const is1v1 = gameMode === "1v1" || gameMode === "multiplayer";

  // Constantes de posicionamiento SINCRONIZADAS con FieldSlots y variables.css
  const widthVal = isMobile ? 92 : 110;
  const heightVal = isMobile ? 125 : 150;
  const gapXVal = isMobile ? 10 : 30;
  const gapYVal = isMobile ? 24 : 30;

  // slotWidth + gap
  const xStep = widthVal + gapXVal; 
  // (verticalGap + slotHeight) / 2
  const yOffset = (gapYVal + heightVal) / 2;

  return (
    <div className="game-field" style={{
      width: "100%",
      maxWidth: gameMode === "2v2" ? "1100px" : "800px",
      height: isMobile ? (gameMode === "2v2" ? "420px" : "310px") : (gameMode === "2v2" ? "600px" : "400px"),
      position: "relative",
      margin: "0 auto",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1,
      border: isCardDragging ? "2.5px dashed rgba(0, 242, 255, 0.7)" : "2.5px dashed rgba(255, 255, 255, 0.05)",
      background: isCardDragging ? "rgba(0, 242, 255, 0.04)" : "transparent",
      boxShadow: isCardDragging ? "0 0 35px rgba(0, 242, 255, 0.2) inset, 0 0 15px rgba(0, 242, 255, 0.1)" : "none",
      borderRadius: "2rem",
      transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
    }}>
      <FieldSlots gameMode={gameMode} />

      {/* Central Brand Logo */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        opacity: 0.1,
        pointerEvents: 'none',
        userSelect: 'none',
        zIndex: 0,
        width: '100%'
      }}>
        <h2 className="text-display" style={{ 
          fontSize: is1v1 ? 'clamp(1.2rem, 4vw, 2rem)' : 'clamp(1.5rem, 6vw, 3rem)', 
          lineHeight: 1,
          margin: 0,
          color: '#fff',
          letterSpacing: '0.05em',
          whiteSpace: 'nowrap'
        }}>
          TRUCO MUNDIAL
        </h2>
      </div>

      {/* Visual Deck of Cards (Mazo) Container - Animates left/right based on whose turn it is at start of round */}
      <motion.div
        animate={{
          left: deckPosition === "left" ? (isMobile ? "12px" : "24px") : (isMobile ? "calc(100% - 12px - 45px)" : "calc(100% - 24px - 65px)"),
          opacity: isGameStarting ? 0 : 0.8,
          scale: isGameStarting ? 0.5 : 1
        }}
        transition={{ type: "spring", stiffness: 120, damping: 14 }}
        style={{
          position: 'absolute',
          top: isMobile ? '43%' : '44%',
          transform: 'translateY(-50%)',
          width: isMobile ? '45px' : '65px',
          height: isMobile ? '60px' : '90px',
          zIndex: 1000,
          pointerEvents: 'auto',
          userSelect: 'none'
        }}
      >
        {/* The visual card stack */}
        <div style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none'
        }}>
          {[0, 1, 2].map((i) => (
            <div
              key={`deck-card-${i}`}
              style={{
                width: '100%',
                height: '100%',
                backgroundImage: "url('/card-back.png')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderRadius: isMobile ? '4px' : '8px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.5)',
                position: 'absolute',
                top: `${i * -3}px`,
                left: `${i * -2}px`,
                transform: `rotate(${i * 1.5}deg)`,
              }}
            />
          ))}
        </div>

        {/* "Me voy al mazo" Button - Rendered directly below the deck, moves in unison! */}
        {onHandleMazo && (
          <button
            disabled={isMazoDisabled}
            onClick={() => { if (onHandleMazo) onHandleMazo(); }}
            className="btn-hover-dark"
            style={{
              position: 'absolute',
              top: isMobile ? '68px' : '100px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: isMobile ? '70px' : '100px',
              fontSize: isMobile ? "0.5rem" : "0.7rem",
              padding: isMobile ? "4px 2px" : "8px 4px",
              background: '#ffffff',
              color: '#000000',
              border: '2.5px solid #000',
              boxShadow: '3px 3px 0px #000',
              fontWeight: 950,
              borderRadius: '8px',
              cursor: isMazoDisabled ? 'default' : 'pointer',
              opacity: isMazoDisabled ? 0.3 : 1.0,
              zIndex: 10,
              textTransform: 'uppercase',
              textAlign: 'center',
              lineHeight: 1.1,
              whiteSpace: 'normal',
              wordWrap: 'break-word',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease'
            }}
            title={t("me_voy_al_mazo")}
          >
            {t("deck")}
          </button>
        )}
      </motion.div>

      <CallOverlay activeCall={activeCall} gameState={gameState} />
      <RoundCountdown isActive={isRoundEnding || isGameStarting} isGameStarting={isGameStarting} />

      <AnimatePresence>
        {isCooldown && handWinners.length === 1 && handWinners[0] === "draw" && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0, x: "-50%", y: "-50%" }}
            animate={{ 
              scale: [1, 1.08, 1], 
              opacity: 1,
              x: "-50%",
              y: "-50%"
            }}
            exit={{ scale: 1.3, opacity: 0, x: "-50%", y: "-50%" }}
            transition={{ 
              scale: { duration: 1.2, repeat: Infinity, ease: "easeInOut" },
              opacity: { duration: 0.3 }
            }}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              zIndex: 3100, // Above cards but below other overlays
              pointerEvents: 'none',
              textAlign: 'center',
              whiteSpace: 'nowrap',
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2rem, 7vw, 4rem)",
              fontWeight: 900,
              color: "#22c55e",
              textShadow: "5px 5px 0px #000, 0 0 20px rgba(34, 197, 94, 0.5)",
              WebkitTextStroke: "2px #000",
              paintOrder: "stroke fill",
              textTransform: "uppercase",
              letterSpacing: "0.08em"
            }}
          >
            ¡Parda! La mejor
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {playedCards.map((card, idx) => {
          const isPlayer = card.owner === "player";
          const isPartner = card.owner === "partner";
          const isCpu = card.owner === "cpu";
          const isCpu2 = card.owner === "cpu2";

          const handIndex = Math.floor(idx / (gameMode === "2v2" ? 4 : 2));
          const isHandDecided = handWinners.length > handIndex;
          const handWinner = handWinners[handIndex];

          let isLoser = false;
          let isWinner = false;
          if (isHandDecided) {
            if (handWinner === "draw") {
              // On a draw, both cards glow as winners
              isWinner = true;
              isLoser = false;
            } else {
              isLoser = card.owner !== handWinner;
              isWinner = card.owner === handWinner;
            }
          }

          const isHero = card.id === roundWinningCardId;
          const isHandWinner = handWinningCardIds.includes(card.id);

          let xPos = 0;
          let yPos = 0;
          let rotate = 0;

          if (is1v1) {
            const handIdx = Math.floor(idx / 2);
            xPos = (handIdx - 1) * xStep; 
            yPos = isPlayer ? yOffset : -yOffset;
          } else {
            const handIdx = Math.floor(idx / 4);
            const centerCardSpacing = isMobile ? 80 : 140;
            const lateralCardSpacing = isMobile ? 24 : 35;
            
            if (isPlayer) { xPos = (handIdx - 1) * centerCardSpacing; yPos = isMobile ? 145 : 240; }
            else if (isPartner) { xPos = (handIdx - 1) * centerCardSpacing; yPos = isMobile ? -145 : -240; }
            else if (isCpu) { xPos = isMobile ? -145 : -280; yPos = (handIdx - 1) * lateralCardSpacing; rotate = 90; }
            else if (isCpu2) { xPos = isMobile ? 145 : 280; yPos = (handIdx - 1) * lateralCardSpacing; rotate = -90; }
          }

          // Strip instance suffix to get the original card id (e.g. "nico_williams_1234" → "nico_williams")
          const baseId = card.id.replace(/(_rem|_cpu)?_\d+$/, '');
          const isPlayerHighlighted = envHighlightIds?.has(baseId) && isPlayer;
          const envColor = isPlayerHighlighted ? "#00f2ff" : "#fff";

          return (
            <PlayedCard 
              key={card.id}
              card={card}
              idx={idx}
              isHero={isHero}
              isWinner={isWinner}
              isHandWinner={isHandWinner}
              isLoser={isLoser}
              xPos={xPos}
              yPos={yPos}
              rotate={rotate}
              isPlayer={isPlayer}
              envColor={envColor}
            />
          );
        })}
      </AnimatePresence>
    </div>
  );
};
