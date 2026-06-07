import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Calendar, Scroll, ShieldAlert, LogOut, Globe, ArrowLeft, Edit2, Check, X, Clock, Video } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { audioManager } from '../../lib/audio';
import { supabase } from '../../lib/supabase';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ticketSchema, type TicketFormData } from '../../lib/schemas';
import { MessageSquare, Send, ChevronDown } from 'lucide-react';
import { VolumeControl } from '../shared/VolumeControl';
import { TwitchButton } from '../shared/TwitchButton';
import { CARDS } from '../../data/cards';


interface ProfileScreenProps {
  user: any;
  handleAuth: () => void;
  onBack: () => void;
}

interface MatchSummary {
  id: string;
  match_id: string;
  rivalName: string;
  myScore: number;
  rivalScore: number;
  winner: 'player' | 'cpu';
  date: string;
  log: string[];
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ user, handleAuth, onBack }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<MatchSummary[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<MatchSummary | null>(null);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  
  // Name edit states
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(user?.user_metadata?.custom_username || user?.email?.split('@')[0] || '');
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [updateError, setUpdateError] = useState('');

  // Nationality state
  const [nationality, setNationality] = useState(user?.user_metadata?.nationality || '');
  const [isUpdatingNationality, setIsUpdatingNationality] = useState(false);
  const [isNatDropdownOpen, setIsNatDropdownOpen] = useState(false);

  const handleUpdateNationality = async (newNat: string) => {
    setNationality(newNat);
    setIsUpdatingNationality(true);
    try {
      await supabase.auth.updateUser({
        data: { nationality: newNat }
      });
      
      // Sync with profiles table
      if (user?.id) {
        await supabase
          .from("profiles")
          .update({ nationality: newNat })
          .eq("id", user.id);
      }
    } catch (e) {
      console.error('Error updating nationality', e);
    } finally {
      setIsUpdatingNationality(false);
      setIsNatDropdownOpen(false);
    }
  };

  // Suggestion box states
  const [isSubmittingSuggestion, setIsSubmittingSuggestion] = useState(false);
  const [suggestionSuccess, setSuggestionSuccess] = useState(false);
  const [suggestionError, setSuggestionError] = useState('');

  const {
    register: registerSuggestion,
    handleSubmit: handleSuggestionSubmit,
    reset: resetSuggestion,
    formState: { errors: suggestionErrors }
  } = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema)
  });

  const onSuggestionSubmit = async (data: TicketFormData) => {
    setIsSubmittingSuggestion(true);
    setSuggestionError('');
    setSuggestionSuccess(false);

    try {
      const { error } = await supabase.from('tickets').insert({
        user_id: user.id,
        type: 'suggestion',
        subject: data.subject,
        message: data.message
      });

      if (error) throw error;
      setSuggestionSuccess(true);
      resetSuggestion();
      setTimeout(() => setSuggestionSuccess(false), 5000);
    } catch (err: any) {
      setSuggestionError(t('error_sending_suggestion') + err.message);
    } finally {
      setIsSubmittingSuggestion(false);
    }
  };

  // 24h check
  const lastChangeStr = user?.user_metadata?.last_name_change;
  const lastChangeDate = lastChangeStr ? new Date(lastChangeStr) : null;
  const canChangeName = !lastChangeDate || (new Date().getTime() - lastChangeDate.getTime() > 72 * 60 * 60 * 1000);

  const handleUpdateName = async () => {
    if (!newName.trim() || newName.trim() === (user?.user_metadata?.custom_username || user?.email?.split('@')[0])) {
      setEditingName(false);
      return;
    }
    
    if (!canChangeName) {
      setUpdateError(t('config_username_error'));
      return;
    }
    
    setIsUpdatingName(true);
    setUpdateError('');
    
    try {
      const { error } = await supabase.auth.updateUser({
        data: { 
          custom_username: newName.trim(),
          last_name_change: new Date().toISOString()
        }
      });
      
      if (error) throw error;

      // Sync with profiles table so other users see the updated username
      if (user?.id) {
        await supabase
          .from("profiles")
          .update({ username: newName.trim() })
          .eq("id", user.id);
      }
      
      setEditingName(false);
    } catch (err: any) {
      setUpdateError(err.message || t('config_username_update_error'));
    } finally {
      setIsUpdatingName(false);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchMatchHistory = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('game_sync')
        .select('id, match_id, last_move, updated_at')
        .like('match_id', `user_history_${user.id}_%`);

      if (error) {
        console.error('Error fetching history:', error);
      } else if (data) {
        const formattedHistory: MatchSummary[] = data
          .map((item: any) => {
            const summary = item.last_move;
            return {
              id: item.id,
              match_id: item.match_id,
              rivalName: summary.rivalName || t('rival'),
              myScore: summary.myScore || 0,
              rivalScore: summary.rivalScore || 0,
              winner: summary.winner || 'cpu',
              date: summary.date || item.updated_at,
              log: summary.log || []
            };
          })
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        setHistory(formattedHistory);
      }
    } catch (err) {
      console.error('Unexpected error fetching history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatchHistory();
  }, [user]);

  // Calculate statistics
  const totalPlayed = history.length;

  const getValidationMessage = (msg: string | undefined) => {
    if (!msg) return "";
    if (msg === "El asunto debe tener al menos 3 caracteres") return t("err_subject_min");
    if (msg === "El asunto es muy largo") return t("err_subject_max");
    if (msg === "El mensaje debe ser más descriptivo") return t("err_message_min");
    if (msg === "El mensaje es muy largo") return t("err_message_max");
    return t(msg);
  };

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
      {/* HEADER SECTION (Centered column layout on desktop, /ruta style on mobile) */}
      {!isMobile && (
        <>
          {/* Fixed Home Button (Desktop Left Corner) */}
          <button
            onClick={onBack}
            className="home-btn-fixed btn-hover-dark profile-nav-btn"
            style={{
              position: "fixed",
              top: "1.5rem",
              left: "1rem",
              background: "rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(12px)",
              zIndex: 2000,
              height: "36px",
              borderRadius: "0.85rem",
              padding: "0 0.85rem",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              color: "white",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: "none",
              fontWeight: 900,
              fontSize: "0.7rem",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              cursor: "pointer"
            }}
          >
            <ArrowLeft size={14} />
            <span>{t("back")}</span>
          </button>

          {/* Fixed Mute Button (Desktop Right Corner) */}
          <div style={{ position: "fixed", top: "1.5rem", right: "1.5rem", zIndex: 2000, display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <a href="https://youtu.be/228FtMaq8uY" target="_blank" rel="noopener noreferrer" onClick={() => audioManager.setVolume(0)} className="btn-hover-dark mobile-hide" style={{ background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', color: 'white', height: '40px', width: '40px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(12px)', transition: 'none' }} title="Video">
              <Video size={20} />
            </a>
            <VolumeControl expandDirection="down" />
          </div>
        </>
      )}

      {/* HEADER SECTION (Responsive layout) */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: isMobile ? '0.5rem' : '0.75rem',
        width: '100%',
        position: 'relative'
      }}>
        {isMobile ? (
          <>
            {/* Mobile Header Layout - Replicating /ruta style */}
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
                  boxShadow: '3px 3px 0px #000',
                }}
              >
                <ArrowLeft size={14} />
                {t("back")}
              </button>

              {/* Mute Button */}
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <a href="https://youtu.be/228FtMaq8uY" target="_blank" rel="noopener noreferrer" onClick={() => audioManager.setVolume(0)} className="btn-hover-dark mobile-hide" style={{ background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', color: 'white', height: '36px', width: '36px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(12px)', transition: 'none', boxShadow: '3px 3px 0px #000' }} title="Video">
                  <Video size={16} />
                </a>
                <VolumeControl size={36} expandDirection="down" style={{ boxShadow: '3px 3px 0px #000' }} />
              </div>
            </div>

            {/* Mobile Title & Subtitle */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0rem',
              justifyContent: 'center',
              textAlign: 'center'
            }}>
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
              {user && (
                <h2 className="text-display" style={{
                  fontSize: '1.4rem',
                  margin: 0,
                  letterSpacing: '0.05em',
                  color: '#00f2ff',
                  textShadow: '0 0 8px rgba(0, 242, 255, 0.15)',
                  marginTop: '0.1rem'
                }}>
                  {user.user_metadata?.custom_username || user.email?.split('@')[0]}
                </h2>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Desktop Centered Header Layout (As before, but styled beautifully) */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0rem', textAlign: 'center' }}>
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
              {user && (
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
              )}
            </div>
          </>
        )}
      </div>

      {user ? (
        <>
          {/* CONFIGURATION SECTION */}
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
              
              <div style={{ position: 'relative', width: '180px' }}>
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
                    cursor: isUpdatingNationality ? 'not-allowed' : 'pointer',
                    opacity: isUpdatingNationality ? 0.5 : 1,
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    boxShadow: '2px 2px 0px #000'
                  }}
                >
                  <span style={{ color: nationality ? '#fff' : 'rgba(255,255,255,0.5)' }}>
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
                        maxHeight: '250px',
                        overflowY: 'auto',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                      }}
                    >
                      <button
                        onClick={() => {
                          handleUpdateNationality('');
                          setIsNatDropdownOpen(false);
                        }}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '0.75rem 1rem',
                          background: !nationality ? 'rgba(255,255,255,0.1)' : 'transparent',
                          border: 'none',
                          color: !nationality ? '#00f2ff' : 'white',
                          borderRadius: '0.5rem',
                          cursor: 'pointer',
                          fontWeight: 700,
                          fontSize: '0.85rem'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                        onMouseOut={(e) => e.currentTarget.style.background = !nationality ? 'rgba(255,255,255,0.1)' : 'transparent'}
                      >
                        Ninguna
                      </button>
                      
                      {Array.from(new Set(CARDS.map(c => c.country))).sort().map(c => (
                        <button
                          key={c}
                          onClick={() => {
                            handleUpdateNationality(c);
                            setIsNatDropdownOpen(false);
                          }}
                          style={{
                            width: '100%',
                            textAlign: 'left',
                            padding: '0.75rem 1rem',
                            background: nationality === c ? 'rgba(255,255,255,0.1)' : 'transparent',
                            border: 'none',
                            color: nationality === c ? '#00f2ff' : 'white',
                            borderRadius: '0.5rem',
                            cursor: 'pointer',
                            fontWeight: 700,
                            fontSize: '0.85rem'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                          onMouseOut={(e) => e.currentTarget.style.background = nationality === c ? 'rgba(255,255,255,0.1)' : 'transparent'}
                        >
                          {c}
                        </button>
                      ))}
                    </motion.div>
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

          {/* MATCH HISTORY LIST */}
          <h3 className="text-display" style={{ fontSize: '1.2rem', marginBottom: '1.25rem', color: '#fff', letterSpacing: '0.05em' }}>
            {t("match_history")} ({totalPlayed})
          </h3>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: '#00f2ff', fontWeight: 'bold' }}>
              {t("loading_history")}
            </div>
          ) : history.length === 0 ? (
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px dashed rgba(255,255,255,0.1)',
              borderRadius: '2rem',
              padding: '3rem',
              textAlign: 'center',
              color: 'rgba(255,255,255,0.5)',
              marginBottom: '3rem'
            }}>
              {t("no_matches_yet")}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '3rem' }}>
              {history.map((match) => {
                const won = match.winner === 'player';
                return (
                  <motion.div
                    key={match.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      background: won ? 'linear-gradient(to right, rgba(16, 185, 129, 0.08), rgba(255,255,255,0.02))' : 'linear-gradient(to right, rgba(239, 68, 68, 0.08), rgba(255,255,255,0.02))',
                      border: won ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(239, 68, 68, 0.25)',
                      borderRadius: '2rem',
                      padding: '1.5rem',
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1.25rem',
                      boxShadow: won ? '0 4px 20px rgba(16, 185, 129, 0.05)' : '0 4px 20px rgba(239, 68, 68, 0.05)'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                        <span style={{
                          background: won ? '#10b981' : '#ef4848',
                          color: '#000',
                          fontWeight: 950,
                          fontSize: '0.7rem',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '0.5rem',
                          textTransform: 'uppercase'
                        }}>
                          {won ? t("won") : t("lost")}
                        </span>
                        <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>
                          {t("vs_rival", { rival: match.rivalName })}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', opacity: 0.5, fontSize: '0.75rem' }}>
                        <Calendar size={12} />
                        {formatDate(match.date)}
                      </div>
                    </div>

                    {/* Scores & Log Trigger */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                      <div style={{ fontSize: '1.75rem', fontWeight: 900 }}>
                        <span style={{ color: won ? '#10b981' : '#fff' }}>{match.myScore}</span>
                        <span style={{ opacity: 0.3, margin: '0 0.5rem' }}>-</span>
                        <span style={{ color: !won ? '#ef4848' : '#fff' }}>{match.rivalScore}</span>
                      </div>

                      <button
                        onClick={() => setSelectedMatch(match)}
                        className="btn-hover-dark"
                        style={{
                          background: 'rgba(255,255,255,0.08)',
                          border: '1px solid rgba(255,255,255,0.15)',
                          color: '#fff',
                          height: '38px',
                          borderRadius: '0.85rem',
                          padding: '0 1rem',
                          fontSize: '0.8rem',
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          cursor: 'pointer',
                          boxShadow: '3px 3px 0px #000'
                        }}
                      >
                        <Scroll size={14} />
                        {t("view_log")}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* SUGGESTIONS BOX */}
          <div style={{
            background: 'rgba(168, 85, 247, 0.05)',
            border: '2px dashed rgba(168, 85, 247, 0.25)',
            borderRadius: '2rem',
            padding: '2.5rem',
            marginTop: '0'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{
                background: 'rgba(168, 85, 247, 0.15)',
                width: '48px', height: '48px',
                borderRadius: '1.25rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#a855f7',
                flexShrink: 0,
                marginTop: '0.25rem'
              }}>
                <MessageSquare size={24} />
              </div>
              <div>
                <h3 className="text-display" style={{ fontSize: '1.4rem', margin: 0, color: '#a855f7', lineHeight: 1.2 }}>
                  {t("suggestion_title")}
                </h3>
                <p style={{ margin: '0.25rem 0 0 0', opacity: 0.7, fontSize: '0.9rem' }}>
                  {t("suggestion_desc")}
                </p>
              </div>
            </div>

            <form onSubmit={handleSuggestionSubmit(onSuggestionSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <input
                  {...registerSuggestion('subject')}
                  placeholder={t("suggestion_subject_placeholder")}
                  disabled={isSubmittingSuggestion}
                  style={{
                    width: '100%', background: 'rgba(0,0,0,0.3)', border: suggestionErrors.subject ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(255,255,255,0.1)',
                    color: '#fff', padding: '1rem', borderRadius: '1rem', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box'
                  }}
                />
                {suggestionErrors.subject && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>{getValidationMessage(suggestionErrors.subject.message)}</span>}
              </div>
              
              <div>
                <textarea
                  {...registerSuggestion('message')}
                  placeholder={t("suggestion_message_placeholder")}
                  disabled={isSubmittingSuggestion}
                  style={{
                    width: '100%', background: 'rgba(0,0,0,0.3)', border: suggestionErrors.message ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(255,255,255,0.1)',
                    color: '#fff', padding: '1rem', borderRadius: '1rem', fontSize: '0.9rem', fontFamily: 'inherit', minHeight: '120px', resize: 'vertical', outline: 'none', boxSizing: 'border-box'
                  }}
                />
                {suggestionErrors.message && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>{getValidationMessage(suggestionErrors.message.message)}</span>}
              </div>

              {suggestionError && <div style={{ color: '#ef4444', fontSize: '0.85rem' }}>{suggestionError}</div>}
              {suggestionSuccess && <div style={{ color: '#10b981', fontSize: '0.85rem', fontWeight: 800 }}>{t("suggestion_success")}</div>}

              <button
                type="submit"
                disabled={isSubmittingSuggestion}
                className="btn-hover-dark"
                style={{
                  background: '#a855f7', border: 'none', color: '#fff', height: '48px', borderRadius: '1.25rem',
                  fontSize: '0.9rem', fontWeight: 950, cursor: isSubmittingSuggestion ? 'not-allowed' : 'pointer',
                  opacity: isSubmittingSuggestion ? 0.7 : 1, alignSelf: 'flex-start', padding: '0 2rem', boxShadow: '4px 4px 0px #000',
                  display: 'flex', alignItems: 'center', gap: '0.5rem'
                }}
              >
                <Send size={18} />
                {isSubmittingSuggestion ? t("sending_suggestion") : t("send_suggestion")}
              </button>
            </form>
          </div>

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

      {/* DETAILED LOG MODAL */}
      <AnimatePresence>
        {selectedMatch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(12px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 3000,
              padding: '1.5rem'
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              style={{
                background: 'rgba(20, 15, 30, 0.95)',
                border: '1.5px solid rgba(0, 242, 255, 0.25)',
                borderRadius: '2.5rem',
                padding: '2.5rem',
                width: '100%',
                maxWidth: '600px',
                maxHeight: '80vh',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 0 40px rgba(0, 242, 255, 0.15)'
              }}
            >
              {/* Modal Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div>
                  <h3 className="text-display" style={{ fontSize: '1.5rem', color: '#00f2ff', margin: 0, letterSpacing: '0.05em' }}>
                    {t("match_log")}
                  </h3>
                  <div style={{ opacity: 0.5, fontSize: '0.75rem', marginTop: '0.25rem' }}>
                    vs {selectedMatch.rivalName} · {formatDate(selectedMatch.date)}
                  </div>
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>
                  <span style={{ color: selectedMatch.winner === 'player' ? '#10b981' : '#fff' }}>{selectedMatch.myScore}</span>
                  <span style={{ opacity: 0.3, margin: '0 0.4rem' }}>-</span>
                  <span style={{ color: selectedMatch.winner !== 'player' ? '#ef4848' : '#fff' }}>{selectedMatch.rivalScore}</span>
                </div>
              </div>

              {/* Log Timeline list */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                paddingRight: '8px',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(255, 255, 255, 0.1) transparent'
              }}>
                {selectedMatch.log.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem 0', opacity: 0.5, fontSize: '0.85rem' }}>
                    No hay registro detallado de eventos para esta partida.
                  </div>
                ) : (
                  selectedMatch.log.map((logItem, index) => {
                    const isSystem = logItem.startsWith('★') || logItem.toLowerCase().includes('gana');
                    return (
                      <div
                        key={index}
                        style={{
                          background: isSystem ? 'rgba(0, 242, 255, 0.04)' : 'rgba(255, 255, 255, 0.02)',
                          borderLeft: isSystem ? '3px solid #00f2ff' : '2px solid rgba(255, 255, 255, 0.1)',
                          padding: '0.6rem 1rem',
                          borderRadius: '0.5rem',
                          fontSize: '0.85rem',
                          lineHeight: '1.4',
                          color: isSystem ? '#e0f8ff' : 'rgba(255, 255, 255, 0.85)',
                          display: 'flex',
                          gap: '0.5rem',
                          alignItems: 'flex-start'
                        }}
                      >
                        <span style={{ opacity: 0.3, fontWeight: 'bold' }}>#{index + 1}</span>
                        <span>{logItem}</span>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Close Button */}
              <button
                onClick={() => setSelectedMatch(null)}
                className="btn-hover-dark"
                style={{
                  background: '#fff',
                  border: 'none',
                  color: '#000',
                  height: '42px',
                  borderRadius: '1rem',
                  marginTop: '1.5rem',
                  fontSize: '0.9rem',
                  fontWeight: 900,
                  cursor: 'pointer',
                  width: '100%',
                  boxShadow: '4px 4px 0px #000'
                }}
              >
                CERRAR
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Twitch Button - Way Down Bottom & Centered */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0 2rem 0' }}>
        <TwitchButton />
      </div>
    </div>
  );
};
