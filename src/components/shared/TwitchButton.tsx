import React from 'react';

export const TwitchButton: React.FC = () => {
  return (
    <a
      href="https://twitch.tv/muchomovimiento/videos"
      target="_blank"
      rel="noopener noreferrer"
      className="btn-hover-dark"
      style={{
        position: "fixed",
        bottom: typeof window !== "undefined" && window.innerWidth < 768 ? "1rem" : "2rem",
        left: "50%",
        transform: "translateX(-50%)",
        background: "rgba(145, 70, 255, 0.2)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(145, 70, 255, 0.3)",
        color: "white",
        height: "40px",
        padding: "0 1.25rem",
        borderRadius: "1rem",
        textDecoration: "none",
        display: "flex",
        alignItems: "center",
        gap: "0.6rem",
        whiteSpace: "nowrap",
        fontSize: "0.95rem",
        fontWeight: 800,
        fontFamily: "var(--font-display)",
        letterSpacing: "0.05em",
        zIndex: 1000,
        textTransform: "uppercase",
        transition: "all 0.25s ease",
      }}
      title="Twitch"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 2H3v16h5v4l4-4h5l4-4V2zm-10 9V7m5 4V7" />
      </svg>
      MUCHO MOVIMIENTO
    </a>
  );
};
