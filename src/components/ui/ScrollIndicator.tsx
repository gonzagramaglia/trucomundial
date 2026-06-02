import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const ScrollIndicator: React.FC = () => {
  const [isAtBottom, setIsAtBottom] = useState(false);
  const [showIndicator, setShowIndicator] = useState(false);

  const getScrollContainer = () => {
    return document.querySelector('.game-container') || document.documentElement;
  };

  useEffect(() => {
    const handleScroll = () => {
      const target = getScrollContainer();
      const scrollTop = target.scrollTop || window.scrollY;
      const scrollHeight = target.scrollHeight || document.documentElement.scrollHeight;
      const clientHeight = target.clientHeight || window.innerHeight;
      
      // Determine if there's actual content to scroll
      const canScroll = scrollHeight > clientHeight + 20;
      
      // Determine if we are near the bottom
      const bottomThreshold = Math.max(0, scrollHeight - clientHeight - 60);
      const nearBottom = scrollTop > bottomThreshold;

      setIsAtBottom(nearBottom);
      setShowIndicator(canScroll);
    };

    // Listen to both for safety
    const gameContainer = document.querySelector('.game-container');
    if (gameContainer) {
      gameContainer.addEventListener('scroll', handleScroll);
    }
    window.addEventListener('scroll', handleScroll);
    
    // Check periodically as content might load/render late
    const interval = setInterval(handleScroll, 1000);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (gameContainer) gameContainer.removeEventListener('scroll', handleScroll);
      clearInterval(interval);
    };
  }, []);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <AnimatePresence>
      {showIndicator && !isAtBottom && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          style={{
            position: 'fixed',
            bottom: isMobile ? '0.25rem' : '1.5rem',
            right: isMobile ? '0.75rem' : '1.5rem',
            zIndex: 9999,
            pointerEvents: 'none'
          }}
        >
          <motion.div
            animate={{ 
              y: [0, 8, 0],
            }}
            transition={{ 
              y: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
            }}
            style={{
              height: '40px',
              borderRadius: '1rem',
              padding: '0 0.75rem 0 1.25rem',
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.6rem',
              boxShadow: 'none',
              color: 'white'
            }}
          >
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '0.75rem', letterSpacing: '0.05em', fontStyle: 'normal', textTransform: 'uppercase' }}>
              DESLIZÁ
            </span>
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="white" 
              strokeWidth="3" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
            </svg>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
