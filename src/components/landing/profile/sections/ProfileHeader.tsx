import React from 'react';
import { ArrowLeft, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { UtilityButtons } from '../../../shared/UtilityButtons';

interface ProfileHeaderProps {
  onBack: () => void;
  isMobile: boolean;
  user?: any;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ onBack, isMobile, user }) => {
  const { t } = useTranslation();

  if (!isMobile) {
    return (
      <>
        {/* Fixed Home Button (Desktop Left Corner) */}
        <button
          onClick={onBack}
          className="home-btn-fixed btn-hover-dark profile-nav-btn"
          style={{
            position: 'fixed',
            top: '1.5rem',
            left: '1rem',
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(12px)',
            zIndex: 2000,
            height: '36px',
            borderRadius: '0.85rem',
            padding: '0 0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: 'none',
            fontWeight: 900,
            fontSize: '0.7rem',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            cursor: 'pointer'
          }}
        >
          <ArrowLeft size={14} />
          <span>{t("back")}</span>
        </button>
        {/* Fixed Utility Buttons (Desktop Right Corner) */}
        <UtilityButtons />

        {/* Desktop Centered Header Layout */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0rem', textAlign: 'center', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <User size={36} style={{ color: '#ffffff', filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.3))' }} />
            <h2 className="text-display" style={{
              fontSize: '2.2rem',
              margin: 0,
              letterSpacing: '0.05em',
              color: '#ffffff',
              textShadow: '0 0 15px rgba(255, 255, 255, 0.2)'
            }}>
              {window.location.pathname.startsWith('/en') ? 'PROFILE OF' : 'PERFIL DE'}
            </h2>
          </div>
          {user ? (
            <h2 className="text-display" style={{
              fontSize: '2.2rem',
              margin: 0,
              letterSpacing: '0.05em',
              color: '#00f2ff',
              textShadow: '0 0 15px rgba(0, 242, 255, 0.2)',
              marginTop: '0.15rem'
            }}>
              {user.user_metadata?.custom_username || user.email?.split('@')[0]}
            </h2>
          ) : (
            <div style={{ fontSize: '0.9rem', opacity: 0.6, marginTop: '0.5rem' }}>
              {t("profile_desc")}
            </div>
          )}
        </div>
      </>
    );
  }

  // Mobile layout
  return (
    <>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        width: '100%',
        gap: '0.75rem',
        marginBottom: '1rem' 
      }}>
        {/* Back Button */}
        <button
          onClick={onBack}
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
            boxShadow: '3px 3px 0px #000'
          }}
        >
          <ArrowLeft size={14} />
          {t("back")}
        </button>

        {/* Utility Buttons */}
        <UtilityButtons isMobile={true} />
      </div>

      {/* Mobile Title */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', textAlign: 'center', marginBottom: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <User size={24} style={{ color: '#ffffff', filter: 'drop-shadow(0 0 6px rgba(255, 255, 255, 0.25))' }} />
          <h2 className="text-display" style={{
            fontSize: '1.4rem',
            margin: 0,
            letterSpacing: '0.05em',
            color: '#ffffff',
            textShadow: '0 0 8px rgba(255, 255, 255, 0.1)'
          }}>
            {window.location.pathname.startsWith('/en') ? 'PROFILE OF' : 'PERFIL DE'}
          </h2>
        </div>
        {user ? (
          <h2 className="text-display" style={{
            fontSize: '1.4rem',
            margin: 0,
            letterSpacing: '0.05em',
            color: '#00f2ff',
            textShadow: '0 0 8px rgba(0, 242, 255, 0.2)'
          }}>
            {user.user_metadata?.custom_username || user.email?.split('@')[0]}
          </h2>
        ) : (
          <div style={{ fontSize: '0.75rem', opacity: 0.6, marginTop: '0.25rem' }}>
            {t("profile_desc")}
          </div>
        )}
      </div>
    </>
  );
};
