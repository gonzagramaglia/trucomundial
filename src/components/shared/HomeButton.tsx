import React from 'react';
import { Home } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * Props for the HomeButton component.
 */
export interface HomeButtonProps {
  onClick: () => void;
  isMobile?: boolean;
}

/**
 * Standard reusable Home button used across /perfil, /votar, /prode, /mazo, etc.
 * Supports desktop fixed positioning and mobile responsive in-header styling.
 */
export const HomeButton: React.FC<HomeButtonProps> = ({ onClick, isMobile = false }) => {
  const { t } = useTranslation();

  if (isMobile) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="btn-hover-dark"
        style={{
          background: 'rgba(255, 255, 255, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          color: 'white',
          height: '36px',
          borderRadius: '0.75rem',
          padding: '0 0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          fontSize: '0.8rem',
          fontWeight: 800,
          cursor: 'pointer',
          boxShadow: '3px 3px 0px #000',
        }}
      >
        <Home size={14} />
        <span>{t("home")}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="home-btn-fixed btn-hover-dark profile-nav-btn"
      style={{
        position: 'fixed',
        top: '1.5rem',
        left: '1.5rem',
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(12px)',
        zIndex: 2000,
        height: '40px',
        borderRadius: '1rem',
        padding: '0 1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        color: 'white',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: 'none',
        fontWeight: 900,
        fontSize: '0.75rem',
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        cursor: 'pointer',
      }}
    >
      <Home size={18} />
      <span>{t("home")}</span>
    </button>
  );
};
