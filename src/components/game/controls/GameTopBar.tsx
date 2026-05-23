import React from 'react';
import { Home } from 'lucide-react';
import { Button } from '../../ui/Button';

interface GameTopBarProps {
  onExit: () => void;
}

export const GameTopBar: React.FC<GameTopBarProps> = ({ onExit }) => {
  return (
    <>
      {/* Top Left: Home Button */}
      <Button
        variant="white"
        onClick={onExit}
        className="home-btn-fixed"
        style={{
          background: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(12px)",
          height: "40px",
          borderRadius: "1rem",
          padding: "0 1rem",
          display: "flex",
          gap: "0.5rem",
          color: "white",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "none"
        }}
      >
        <Home size={16} />
        <span className="desktop-only" style={{ fontWeight: 900, fontSize: "0.75rem", letterSpacing: "0.05em", fontStyle: "normal", textTransform: "uppercase" }}>INICIO</span>
      </Button>

      {/* Top Right: GitHub Button */}
      <a
        href="https://github.com/gonzagramaglia"
        target="_blank"
        rel="noopener noreferrer"
        className="twitch-btn"
        style={{
          position: "fixed",
          top: "1.5rem",
          right: "2.25rem",
          background: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(12px)",
          zIndex: 2000,
          height: "40px",
          borderRadius: "1rem",
          padding: "0 1rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.5rem",
          color: "white",
          textDecoration: "none",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          boxShadow: "0 4px 14px rgba(0, 0, 0, 0.1)"
        }}
      >
        <svg 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
        </svg>
        <span style={{ fontWeight: 900, fontSize: "0.75rem", letterSpacing: "0.05em", fontStyle: "normal", textTransform: "uppercase" }} className="desktop-only">GONZAGRAMAGLIA</span>
        <span style={{ fontWeight: 900, fontSize: "0.75rem", letterSpacing: "0.05em", fontStyle: "normal", textTransform: "uppercase" }} className="mobile-only">GITHUB</span>
      </a>
    </>
  );
};
