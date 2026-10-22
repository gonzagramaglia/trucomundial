import React from 'react';
import { ArrowLeft, User, BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { UtilityButtons } from '../../../shared/UtilityButtons';

interface ProfileHeaderProps {
  onBack: () => void;
  isMobile: boolean;
  onOpenRules?: () => void;
}

/**
 * Header section for the User Profile screen.
 * Displays navigation buttons, utility controls, and the profile title.
 *
 * @param onBack Callback to navigate back to the previous screen.
 * @param isMobile Whether the viewport is in mobile display mode.
 * @param onOpenRules Optional callback to open the game rules panel.
 */
export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ onBack, isMobile, onOpenRules }) => {
  const { t } = useTranslation();
  const handleRulesClick = onOpenRules || (() => window.dispatchEvent(new CustomEvent('open_rules')));

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
            left: '1.5rem',
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
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.5rem',
          textAlign: 'center',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <User size={36} style={{ color: '#00f2ff', filter: 'drop-shadow(0 0 10px rgba(0, 242, 255, 0.3))' }} />
            <h2 className="text-display" style={{
              fontSize: '2.2rem',
              margin: 0,
              letterSpacing: '0.05em',
              color: '#00f2ff',
              textShadow: '0 0 15px rgba(0, 242, 255, 0.2)'
            }}>
              {t('guest_profile')}
            </h2>
          </div>
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
        marginBottom: '1rem',
        boxSizing: 'border-box'
      }}>
        {/* Left: Volver + Reglas */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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

          {/* Rules Button to the right of Volver on Mobile */}
          <button
            type="button"
            onClick={handleRulesClick}
            className="btn-hover-dark"
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: 'white',
              height: '36px',
              width: '36px',
              borderRadius: '0.75rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '3px 3px 0px #000'
            }}
            title={t("rules")}
          >
            <BookOpen size={16} />
          </button>
        </div>

        {/* Utility Buttons */}
        <UtilityButtons isMobile={true} />
      </div>

      {/* Mobile Title with matching height/spacing */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        gap: '0.25rem', 
        textAlign: 'center', 
        marginBottom: '1.5rem' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <User size={24} style={{ color: '#00f2ff', filter: 'drop-shadow(0 0 6px rgba(0, 242, 255, 0.25))' }} />
          <h2 className="text-display" style={{
            fontSize: '1.4rem',
            margin: 0,
            letterSpacing: '0.05em',
            color: '#00f2ff',
            textShadow: '0 0 8px rgba(0, 242, 255, 0.2)'
          }}>
            {window.location.pathname.startsWith('/en') ? 'GUEST PROFILE' : 'PERFIL DE INVITADO'}
          </h2>
        </div>
      </div>
    </>
  );
};
