import React from 'react';
import { Check, ChevronDown, Search, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { getFlag } from '../../../../data/flags';
import { CARDS } from '../../../../data/cards';

interface ProfileSettingsProps {
  nationality: string;
  isUpdatingNationality: boolean;
  isNatDropdownOpen: boolean;
  setIsNatDropdownOpen: (b: boolean) => void;
  natSearch: string;
  setNatSearch: (search: string) => void;
  handleUpdateNationality: (nat: string) => void;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({
  nationality,
  isUpdatingNationality,
  isNatDropdownOpen,
  setIsNatDropdownOpen,
  natSearch,
  setNatSearch,
  handleUpdateNationality
}) => {
  const { t, i18n } = useTranslation();
  const isEn = Boolean(i18n.language?.startsWith('en'));

  return (
    <>
      <h3 className="text-display" style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#fff', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
        {t('config_title')}
      </h3>
      
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        padding: '1.25rem 1.5rem',
        borderRadius: '1.5rem',
        marginBottom: '2.5rem'
      }}>
        {/* Language Config */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '0.75rem',
          paddingBottom: '1.25rem',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff' }}>{t('config_language')}</div>
            <div style={{ fontSize: '0.8rem', opacity: 0.6, marginTop: '0.2rem' }}>{t('config_language_desc')}</div>
          </div>
          
          <button
            onClick={() => {
              const newLang = isEn ? "es" : "en";
              i18n.changeLanguage(newLang);
              localStorage.setItem('lang', newLang);
              if (typeof window !== 'undefined') {
                const currentPath = window.location.pathname;
                if (newLang === 'en' && !currentPath.startsWith('/en')) {
                  window.history.pushState({}, '', '/en' + (currentPath === '/' ? '' : currentPath));
                } else if (newLang === 'es' && currentPath.startsWith('/en')) {
                  window.history.pushState({}, '', currentPath.replace(/^\/en/, '') || '/');
                }
              }
            }}
            className="btn-hover-dark"
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: 'white',
              height: '42px',
              borderRadius: '1rem',
              padding: '0 1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.85rem',
              fontWeight: 900,
              cursor: 'pointer',
              boxShadow: '3px 3px 0px #000',
              transition: 'all 0.15s ease'
            }}
            title={t('config_change_language')}
          >
            <Globe size={16} />
            {isEn ? t('language_label_en') : t('language_label_es')}
          </button>
        </div>

        {/* Nationality Config */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '0.75rem'
        }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {t('config_nationality')}
            </div>
            <div style={{ fontSize: '0.8rem', opacity: 0.6, marginTop: '0.2rem' }}>
              {t('config_nationality_desc')}
            </div>
          </div>
          
          <div style={{ position: 'relative', width: '200px' }}>
            <button
              onClick={() => setIsNatDropdownOpen(!isNatDropdownOpen)}
              disabled={isUpdatingNationality}
              className="btn-hover-dark"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: 'white',
                height: '42px',
                width: '100%',
                borderRadius: '1rem',
                padding: '0 1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.5rem',
                cursor: isUpdatingNationality ? 'not-allowed' : 'pointer',
                opacity: isUpdatingNationality ? 0.5 : 1,
                fontWeight: 800,
                fontSize: '0.9rem',
                boxShadow: '2px 2px 0px #000'
              }}
            >
              <span style={{ color: nationality ? '#fff' : 'rgba(255,255,255,0.5)', textAlign: 'left', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '0.5rem' }}>
                {nationality ? <span style={{ fontSize: '1.2rem' }}>{getFlag(nationality)}</span> : null}
                <span>{nationality || (window.location.pathname.startsWith('/en') ? 'Select...' : 'Seleccionar...')}</span>
              </span>
              <ChevronDown size={16} style={{ 
                transform: isNatDropdownOpen ? 'rotate(180deg)' : 'none', 
                transition: 'transform 0.2s ease',
                opacity: 0.5 
              }} />
            </button>

            <AnimatePresence>
              {isNatDropdownOpen && (
                <>
                  <div 
                    style={{ position: 'fixed', inset: 0, zIndex: 99 }} 
                    onClick={() => setIsNatDropdownOpen(false)} 
                  />
                  <motion.div
                    className="white-scrollbar"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 0.5rem)',
                      left: 0,
                      minWidth: '220px',
                      background: 'rgba(20, 20, 25, 0.95)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '1rem',
                      padding: '0.5rem',
                      zIndex: 100,
                      boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.2rem'
                    }}
                  >
                    <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
                      <Search size={14} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5, color: '#fff' }} />
                      <input 
                        type="text"
                        value={natSearch}
                        onChange={(e) => setNatSearch(e.target.value)}
                        placeholder={window.location.pathname.startsWith('/en') ? 'Search country...' : 'Buscar país...'}
                        style={{
                          width: '100%',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '0.5rem',
                          padding: '0.5rem 1rem 0.5rem 2.2rem',
                          color: '#fff',
                          fontSize: '0.85rem',
                          outline: 'none'
                        }}
                      />
                    </div>

                    <div className="white-scrollbar" style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                      {Array.from(new Set(CARDS.map((c: any) => c.country)))
                        .sort()
                        .filter((c: any) => typeof c === 'string' && c.toLowerCase().includes(natSearch.toLowerCase()))
                        .map((c: any) => (
                        <button
                          key={c}
                          onClick={() => {
                            handleUpdateNationality(c);
                            setIsNatDropdownOpen(false);
                          }}
                          style={{
                            width: '100%',
                            textAlign: 'left',
                            padding: '0.5rem 1rem',
                            background: nationality === c ? 'rgba(255,255,255,0.1)' : 'transparent',
                            border: 'none',
                            color: nationality === c ? '#00f2ff' : 'white',
                            borderRadius: '0.5rem',
                            cursor: 'pointer',
                            fontWeight: nationality === c ? 800 : 500,
                            fontSize: '0.85rem'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                          onMouseOut={(e) => e.currentTarget.style.background = nationality === c ? 'rgba(0, 242, 255, 0.1)' : 'transparent'}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '0.5rem' }}>
                            {nationality === c && <Check size={14} />}
                            <span style={{ fontSize: '1.2rem' }}>{getFlag(c)}</span>
                            <span>{c}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                    
                    <button
                      onClick={() => {
                        handleUpdateNationality('Otra');
                        setIsNatDropdownOpen(false);
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '0.5rem 1rem',
                        background: nationality === 'Otra' ? 'rgba(250, 204, 21, 0.1)' : 'rgba(255,255,255,0.05)',
                        border: 'none',
                        color: nationality === 'Otra' ? '#facc15' : 'white',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        fontWeight: nationality === 'Otra' ? 800 : 500,
                        fontSize: '0.85rem',
                        marginTop: '0.2rem'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                      onMouseOut={(e) => e.currentTarget.style.background = nationality === 'Otra' ? 'rgba(250, 204, 21, 0.1)' : 'rgba(255,255,255,0.05)'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '0.5rem' }}>
                        {nationality === 'Otra' && <Check size={14} />}
                        <span style={{ fontSize: '1.2rem' }}>{getFlag('Otra')}</span>
                        <span>{window.location.pathname.startsWith('/en') ? 'Other' : 'Otra'}</span>
                      </div>
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
};
