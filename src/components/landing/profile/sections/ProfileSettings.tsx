import React from 'react';
import { Clock, Check, X, Edit2, ChevronDown, Search, Globe, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { getFlag } from '../../../../data/flags';
import { CARDS } from '../../../../data/cards';
import { supabase } from '../../../../lib/supabase';

interface ProfileSettingsProps {
  user: any;
  onBack: () => void;
  // name edit
  canChangeName: boolean;
  updateError: string;
  setUpdateError: (msg: string) => void;
  editingName: boolean;
  setEditingName: (b: boolean) => void;
  newName: string;
  setNewName: (name: string) => void;
  isUpdatingName: boolean;
  handleUpdateName: () => void;
  // nationality
  nationality: string;
  isUpdatingNationality: boolean;
  isNatDropdownOpen: boolean;
  setIsNatDropdownOpen: (b: boolean) => void;
  natSearch: string;
  setNatSearch: (search: string) => void;
  handleUpdateNationality: (nat: string) => void;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({
  user,
  onBack,
  canChangeName,
  updateError,
  setUpdateError,
  editingName,
  setEditingName,
  newName,
  setNewName,
  isUpdatingName,
  handleUpdateName,
  nationality,
  isUpdatingNationality,
  isNatDropdownOpen,
  setIsNatDropdownOpen,
  natSearch,
  setNatSearch,
  handleUpdateNationality
}) => {
  const { t } = useTranslation();

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
        {/* Username Config */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff' }}>{t('config_username')}</div>
            <div style={{ fontSize: '0.8rem', opacity: 0.6, marginTop: '0.2rem' }}>
              {!canChangeName ? (
                <span style={{ color: '#ff7800', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Clock size={12} /> {t('config_username_cooldown')}
                </span>
              ) : (
                t('config_username_desc')
              )}
            </div>
            {updateError && (
              <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem', fontWeight: 600 }}>
                {updateError}
              </div>
            )}
          </div>

          {editingName ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                disabled={isUpdatingName}
                maxLength={20}
                style={{
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: '#fff',
                  height: '38px',
                  borderRadius: '0.75rem',
                  padding: '0 0.85rem',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  outline: 'none',
                  width: '160px'
                }}
              />
              <button
                onClick={handleUpdateName}
                disabled={isUpdatingName || !newName.trim()}
                style={{
                  background: '#10b981',
                  border: 'none',
                  color: '#000',
                  height: '38px',
                  width: '38px',
                  borderRadius: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: isUpdatingName ? 'not-allowed' : 'pointer',
                  opacity: isUpdatingName ? 0.5 : 1
                }}
              >
                <Check size={18} />
              </button>
              <button
                onClick={() => {
                  setEditingName(false);
                  setNewName(user.user_metadata?.custom_username || user.email?.split('@')[0]);
                  setUpdateError('');
                }}
                disabled={isUpdatingName}
                style={{
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#ef4444',
                  height: '38px',
                  width: '38px',
                  borderRadius: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontWeight: 800, fontSize: '1rem', color: '#00f2ff' }}>
                {user.user_metadata?.custom_username || user.email?.split('@')[0]}
              </span>
              <button
                onClick={() => setEditingName(true)}
                disabled={!canChangeName}
                className="btn-hover-dark"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: canChangeName ? 'white' : 'rgba(255,255,255,0.3)',
                  height: '38px',
                  borderRadius: '0.75rem',
                  padding: '0 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  cursor: canChangeName ? 'pointer' : 'not-allowed',
                  boxShadow: canChangeName ? '2px 2px 0px #000' : 'none'
                }}
              >
                <Edit2 size={14} />
                {t('config_edit')}
              </button>
            </div>
          )}
        </div>

        {/* Nationality Config */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Nacionalidad
            </div>
            <div style={{ fontSize: '0.8rem', opacity: 0.6, marginTop: '0.2rem' }}>
              Selecciona tu país para resaltarlo en el fixture
            </div>
          </div>
          
          <div style={{ position: 'relative', width: '160px', marginLeft: 'auto' }}>
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
                justifyContent: 'flex-end',
                gap: '0.5rem',
                cursor: isUpdatingNationality ? 'not-allowed' : 'pointer',
                opacity: isUpdatingNationality ? 0.5 : 1,
                fontWeight: 800,
                fontSize: '0.9rem',
                boxShadow: '2px 2px 0px #000'
              }}
            >
              <span style={{ color: nationality ? '#fff' : 'rgba(255,255,255,0.5)', textAlign: 'right', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                {nationality ? <span style={{ fontSize: '1.2rem' }}>{getFlag(nationality)}</span> : null}
                {nationality || 'Seleccionar...'}
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
                      right: 0,
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
                        placeholder="Buscar país..."
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
                            textAlign: 'right',
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
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
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
                        textAlign: 'right',
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
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        {nationality === 'Otra' && <Check size={14} />}
                        <span style={{ fontSize: '1.2rem' }}>{getFlag('Otra')}</span>
                        <span>Otra</span>
                      </div>
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Language Config */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff' }}>{t('config_language')}</div>
            <div style={{ fontSize: '0.8rem', opacity: 0.6, marginTop: '0.2rem' }}>{t('config_language_desc')}</div>
          </div>
          
          <button
            onClick={() => {
              const isEn = window.location.pathname.startsWith('/en');
              const newLang = isEn ? "es" : "en";
              localStorage.setItem('lang', newLang);
              window.location.href = newLang === "en" ? "/en/perfil" : "/perfil";
            }}
            className="btn-hover-dark"
            style={{
              marginLeft: 'auto',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: 'white',
              height: '42px',
              borderRadius: '1rem',
              padding: '0 1.5rem',
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
            {window.location.pathname.startsWith('/en') ? 'ENGLISH (EN)' : 'ESPAÑOL (ES)'}
          </button>
        </div>

        {/* Logout Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', paddingTop: '0.5rem' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#ef4444' }}>Cerrar sesión</div>
            <div style={{ fontSize: '0.8rem', opacity: 0.6, marginTop: '0.2rem' }}>Desconectate de tu cuenta actual</div>
          </div>
          
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              onBack();
            }}
            className="btn-hover-dark"
            style={{
              marginLeft: 'auto',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              color: '#ef4444',
              height: '42px',
              borderRadius: '1rem',
              padding: '0 1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.85rem',
              fontWeight: 900,
              cursor: 'pointer',
              boxShadow: '3px 3px 0px #000',
              transition: 'all 0.15s ease'
            }}
          >
            <LogOut size={16} style={{ transform: 'scaleX(-1)' }} />
            {t("logout")}
          </button>
        </div>
      </div>
    </>
  );
};
