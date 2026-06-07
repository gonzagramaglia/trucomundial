import React from 'react';
import { motion } from 'framer-motion';
import { Sticker } from '../../shared/Sticker';
import type { PlayedCard as PlayedCardType } from '../../../lib/truco/types';

interface PlayedCardProps {
  card: PlayedCardType;
  idx: number;
  isHero: boolean;
  isWinner: boolean;
  isHandWinner: boolean;
  isLoser: boolean;
  xPos: number;
  yPos: number;
  rotate: number;
  isPlayer: boolean;
  isYellowBorder?: boolean;
  isOrangeBorder?: boolean;
  envColor?: string;
}

export const PlayedCard: React.FC<PlayedCardProps> = ({
  card,
  idx,
  isHero,
  isWinner,
  isHandWinner,
  isLoser,
  xPos,
  yPos,
  rotate,
  isPlayer,
  isYellowBorder = false,
  isOrangeBorder = false,
  envColor = "#fff"
}) => {
  return (
    <motion.div
      layoutId={card.id}
      initial={{ scale: 1.2, opacity: 0, y: isPlayer ? 400 : -400 }}
      animate={{ 
        scale: isHandWinner ? 1.2 : isWinner ? 1.1 : 1.05, 
        opacity: isLoser ? 0.4 : 1, 
        filter: isLoser ? "grayscale(100%)" : "grayscale(0%)",
        x: xPos, 
        y: yPos, 
        rotate,
        boxShadow: isHandWinner
            ? [
                "0 0 10px rgba(255,255,255,0.2)", 
                "0 0 20px rgba(255,255,255,0.4)", 
                "0 0 10px rgba(255,255,255,0.2)"
              ]
            : (card.id.startsWith("messi") || card.id.startsWith("mbappe"))
              ? "0 0 25px rgba(168, 85, 247, 0.9)"
              : "0 10px 20px rgba(0,0,0,0.5)"
      }}
      transition={{
        boxShadow: isHandWinner ? {
          duration: 3, 
          repeat: Infinity,
          ease: "easeInOut"
        } : { duration: 0.3 }
      }}
      style={{ position: "absolute", zIndex: isHero ? 2000 : idx + 10 }}
    >
      <Sticker 
        card={card} 
        winnerMode={isYellowBorder}
        isOrangeBorder={isOrangeBorder}
        envColor={envColor}
      />
    </motion.div>
  );
};
