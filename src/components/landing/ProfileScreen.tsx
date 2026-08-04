import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldAlert } from 'lucide-react';
import { audioManager } from '../../lib/audio';
import { TwitchButton } from '../shared/TwitchButton';

// Hooks
import { useProfileData } from './profile/hooks/useProfileData';
import { useProfileUpdates } from './profile/hooks/useProfileUpdates';
import { useProfileSuggestions } from './profile/hooks/useProfileSuggestions';

// Sections
import { ProfileHeader } from './profile/sections/ProfileHeader';
import { ProfileSettings } from './profile/sections/ProfileSettings';
import { ProfileHistory } from './profile/sections/ProfileHistory';
import { ProfileSuggestions } from './profile/sections/ProfileSuggestions';

interface ProfileScreenProps {
  user: any;
  handleAuth: () => void;
  onBack: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ user, handleAuth, onBack }) => {
  const { t } = useTranslation();
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);

  useEffect(() => {
    audioManager.playTheme();
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const {
    loading,
    history,
    totalPlayed,
    selectedMatch,
    setSelectedMatch,
  } = useProfileData(user);

  const {
    editingName,
    setEditingName,
    newName,
    setNewName,
    isUpdatingName,
    updateError,
    setUpdateError,
    handleUpdateName,
    canChangeName,
    nationality,
    isUpdatingNationality,
    isNatDropdownOpen,
    setIsNatDropdownOpen,
    natSearch,
    setNatSearch,
    handleUpdateNationality
  } = useProfileUpdates(user);

  const {
    isSubmittingSuggestion,
    suggestionSuccess,
    suggestionError,
    registerSuggestion,
    handleSuggestionSubmit,
    suggestionErrors,
    onSuggestionSubmit,
    getValidationMessage
  } = useProfileSuggestions(user);

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: '1000px',
      margin: '0 auto',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      padding: isMobile ? '1.5rem 1rem 4rem 1rem' : '2rem 1rem 4rem 1rem',
      color: '#fff',
      boxSizing: 'border-box'
    }}>
      <ProfileHeader onBack={onBack} isMobile={isMobile} user={user} />

      {/* Main Container */}
      <div style={{
        background: 'rgba(20, 20, 25, 0.43)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '2rem',
        padding: isMobile ? '1.5rem' : '2.5rem',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        marginTop: isMobile ? '0' : '1rem'
      }}>
        {user ? (
          <>
            <ProfileSettings
              user={user}
              onBack={onBack}
              canChangeName={canChangeName}
              updateError={updateError}
              setUpdateError={setUpdateError}
              editingName={editingName}
              setEditingName={setEditingName}
              newName={newName}
              setNewName={setNewName}
              isUpdatingName={isUpdatingName}
              handleUpdateName={handleUpdateName}
              nationality={nationality}
              isUpdatingNationality={isUpdatingNationality}
              isNatDropdownOpen={isNatDropdownOpen}
              setIsNatDropdownOpen={setIsNatDropdownOpen}
              natSearch={natSearch}
              setNatSearch={setNatSearch}
              handleUpdateNationality={handleUpdateNationality}
            />

            <ProfileHistory
              loading={loading}
              history={history}
              totalPlayed={totalPlayed}
              selectedMatch={selectedMatch}
              setSelectedMatch={setSelectedMatch}
              formatDate={formatDate}
            />

            <ProfileSuggestions
              isSubmittingSuggestion={isSubmittingSuggestion}
              suggestionSuccess={suggestionSuccess}
              suggestionError={suggestionError}
              registerSuggestion={registerSuggestion}
              handleSuggestionSubmit={handleSuggestionSubmit}
              suggestionErrors={suggestionErrors}
              onSuggestionSubmit={onSuggestionSubmit}
              getValidationMessage={getValidationMessage}
            />
          </>
        ) : (
          /* PROMPT SIGN IN */
          <div style={{
            background: 'rgba(145, 70, 255, 0.05)',
            border: '2px dashed rgba(145, 70, 255, 0.45)',
            borderRadius: '2rem',
            padding: '3rem 2rem',
            textAlign: 'center',
            backdropFilter: 'blur(16px)',
            marginTop: '2rem'
          }}>
            <ShieldAlert size={48} style={{ color: '#a855f7', marginBottom: '1.5rem' }} />
            <h3 className="text-display" style={{ fontSize: '1.5rem', marginBottom: '0.75rem', color: '#a855f7' }}>
              {t("login_to_vote_title")}
            </h3>
            <p style={{ maxWidth: '600px', margin: '0 auto 2rem auto', opacity: 0.7, lineHeight: 1.5 }}>
              Registrate con tu cuenta de Google para poder registrar tu historial de partidas, ver logs interactivos y acumular trofeos de campeón.
            </p>
            <button
              onClick={handleAuth}
              className="btn-hover-dark"
              style={{
                background: '#9146ff',
                border: 'none',
                color: '#fff',
                height: '48px',
                borderRadius: '1.25rem',
                padding: '0 2rem',
                fontSize: '1rem',
                fontWeight: 950,
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                cursor: 'pointer',
                margin: '0 auto',
                boxShadow: '4px 4px 0px #000'
              }}
            >
              {t("login_with_google")}
            </button>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0 2rem 0' }}>
        <TwitchButton />
      </div>
    </div>
  );
};
