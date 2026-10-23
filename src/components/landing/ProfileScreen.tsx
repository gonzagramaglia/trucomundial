import React, { useState, useEffect } from 'react';
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
  onBack: () => void;
  onOpenRules?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ user, onBack, onOpenRules }) => {
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
    deleteMatch,
    clearAbandoned
  } = useProfileData(user);

  const {
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
    setSuggestionSuccess,
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
      padding: isMobile ? '1.5rem 1rem 4rem 1rem' : '1.1rem 1rem 4rem 1rem',
      color: '#fff',
      boxSizing: 'border-box'
    }}>
      <ProfileHeader onBack={onBack} isMobile={isMobile} onOpenRules={onOpenRules} />

      {/* Main Container */}
      <div style={{
        background: 'rgba(20, 20, 25, 0.43)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '2rem',
        padding: isMobile ? '1.5rem' : '2.5rem',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        marginTop: isMobile ? '0.75rem' : '1rem'
      }}>
        {user ? (
          <>
            <ProfileSettings
              nationality={nationality}
              isUpdatingNationality={isUpdatingNationality}
              isNatDropdownOpen={isNatDropdownOpen}
              setIsNatDropdownOpen={setIsNatDropdownOpen}
              natSearch={natSearch}
              setNatSearch={setNatSearch}
              handleUpdateNationality={handleUpdateNationality}
              isMobile={isMobile}
            />

            <ProfileHistory
              loading={loading}
              history={history}
              totalPlayed={totalPlayed}
              selectedMatch={selectedMatch}
              setSelectedMatch={setSelectedMatch}
              formatDate={formatDate}
              onDeleteMatch={deleteMatch}
              onClearAbandoned={clearAbandoned}
            />

            <ProfileSuggestions
              isSubmittingSuggestion={isSubmittingSuggestion}
              suggestionSuccess={suggestionSuccess}
              setSuggestionSuccess={setSuggestionSuccess}
              suggestionError={suggestionError}
              registerSuggestion={registerSuggestion}
              handleSuggestionSubmit={handleSuggestionSubmit}
              suggestionErrors={suggestionErrors}
              onSuggestionSubmit={onSuggestionSubmit}
              getValidationMessage={getValidationMessage}
            />
          </>
        ) : null}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0 2rem 0' }}>
        <TwitchButton />
      </div>
    </div>
  );
};
