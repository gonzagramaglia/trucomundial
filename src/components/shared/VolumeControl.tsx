import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { audioManager } from '../../lib/audio';
import { motion, AnimatePresence } from 'framer-motion';

interface VolumeControlProps {
  expandDirection?: 'left' | 'right' | 'down';
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const VolumeControl: React.FC<VolumeControlProps> = ({ 
  expandDirection = 'left', 
  size = 40,
  className = "btn-hover-dark",
  style = {}
}) => {
  const [volume, setVolume] = useState(audioManager.getVolume());
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetTimer = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 3000);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      resetTimer();
    } else {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleVolumeChangeExternal = (e: CustomEvent<number>) => {
      setVolume(e.detail);
    };
    window.addEventListener('truco-volume-change', handleVolumeChangeExternal as EventListener);
    return () => {
      window.removeEventListener('truco-volume-change', handleVolumeChangeExternal as EventListener);
    };
  }, []);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    audioManager.setVolume(newVol);
    if (isOpen) resetTimer();
  };

  const popoverStyle: React.CSSProperties = {
    position: 'absolute',
    background: 'rgba(20, 20, 25, 0.9)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '20px',
    padding: '0 15px',
    height: size + 'px',
    display: 'flex',
    alignItems: 'center',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
    zIndex: 1
  };

  let motionProps = {};
  if (expandDirection === 'left') {
    popoverStyle.right = '100%';
    popoverStyle.marginRight = '10px';
    motionProps = {
      initial: { opacity: 0, width: 0, x: 10 },
      animate: { opacity: 1, width: 100, x: 0 },
      exit: { opacity: 0, width: 0, x: 10 }
    };
  } else if (expandDirection === 'right') {
    popoverStyle.left = '100%';
    popoverStyle.marginLeft = '10px';
    motionProps = {
      initial: { opacity: 0, width: 0, x: -10 },
      animate: { opacity: 1, width: 100, x: 0 },
      exit: { opacity: 0, width: 0, x: -10 }
    };
  } else if (expandDirection === 'down') {
    popoverStyle.top = '100%';
    popoverStyle.marginTop = '10px';
    popoverStyle.flexDirection = 'column';
    popoverStyle.padding = '15px 0';
    popoverStyle.justifyContent = 'center';
    popoverStyle.height = '100px';
    popoverStyle.width = size + 'px';
    motionProps = {
      initial: { opacity: 0, height: 0, y: -10, x: "-50%" },
      animate: { opacity: 1, height: 120, y: 0, x: "-50%" },
      exit: { opacity: 0, height: 0, y: -10, x: "-50%" }
    };
  }

  return (
    <div 
      ref={containerRef}
      style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <button
        onClick={() => {
          if (volume === 0) {
            setVolume(0.6);
            audioManager.setVolume(0.6);
            setIsOpen(true);
            resetTimer();
          } else {
            if (isOpen) {
              // Mute if clicked while open
              setVolume(0);
              audioManager.setVolume(0);
              setIsOpen(false);
            } else {
              // Just open if clicked while closed
              setIsOpen(true);
              resetTimer();
            }
          }
        }}
        className={className}
        style={{
          background: "rgba(255, 255, 255, 0.1)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          color: "white",
          height: size + "px",
          width: size + "px",
          borderRadius: "50%",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backdropFilter: "blur(12px)",
          transition: "none",
          zIndex: 2,
          ...style
        }}
        title={volume === 0 ? "Activar sonido" : "Silenciar"}
      >
        {volume === 0 ? <VolumeX size={size === 40 ? 20 : 16} /> : <Volume2 size={size === 40 ? 20 : 16} />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            {...motionProps}
            transition={{ duration: 0.2 }}
            style={{
              ...popoverStyle,
              ...(expandDirection === 'down' ? { left: '50%' } : {})
            }}
          >
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.01" 
              value={volume}
              onChange={handleVolumeChange}
              style={{
                width: '80px',
                accentColor: 'white',
                cursor: 'pointer',
                ...(expandDirection === 'down' ? {
                  transform: 'rotate(-90deg)',
                  marginTop: '40px',
                  marginBottom: '40px'
                } : {})
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
