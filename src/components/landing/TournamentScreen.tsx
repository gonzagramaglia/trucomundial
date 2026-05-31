import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Trophy, Lock, Award, Zap, Clock, ShieldCheck, User, Edit2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface TournamentScreenProps {
  user: any;
  handleAuth: () => void;
  onBack: () => void;
}

interface Tournament {
  id: string;
  name: string;
  status: 'open' | 'active' | 'finished';
  participants: number;
  maxParticipants: number;
  startTime: string;
  prize: string;
  bgGradient: string;
  winner?: string;
  organizer: string;
}

const MOCK_RANKING = [
  { id: 1, name: "GonzaGramaglia", score: 2500, position: 1 },
  { id: 2, name: "Messi10", score: 2350, position: 2 },
  { id: 3, name: "ElDibu", score: 2100, position: 3 },
  { id: 4, name: "Player123", score: 1900, position: 4 },
  { id: 5, name: "TrucoMaster", score: 1850, position: 5 },
  { id: 6, name: "User_99", score: 1700, position: 6 },
  { id: 7, name: "Pampa", score: 1650, position: 7 },
  { id: 8, name: "Bostero", score: 1500, position: 8 },
  { id: 9, name: "Gallo", score: 1450, position: 9 },
  { id: 10, name: "Carp", score: 1400, position: 10 },
  { id: 11, name: "Pepe", score: 1300, position: 11 },
  { id: 12, name: "Tomi", score: 1200, position: 12 },
  { id: 13, name: "Juan", score: 1150, position: 13 },
  { id: 14, name: "Fede", score: 1100, position: 14 },
  { id: 15, name: "Gaston", score: 1000, position: 15 },
];

export const TournamentScreen: React.FC<TournamentScreenProps> = ({ user, handleAuth, onBack }) => {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  
  const totalPages = Math.ceil(MOCK_RANKING.length / ITEMS_PER_PAGE);
  const currentRankingPage = MOCK_RANKING.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  
  const LOCAL_REGISTRATIONS_KEY = `trucomundial-registrations-${user?.id || 'anonymous'}`;

  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // State to track registered tournament IDs
  const [registeredIds, setRegisteredIds] = useState<string[]>([]);
  // Simulated participant counts to make it feel alive
  const participantCounts: Record<string, number> = {
    't1': 14,
    't2': 5,
    't3': 8,
    't4': 16
  };

  // Load registered tournaments on mount
  useEffect(() => {
    const cached = localStorage.getItem(LOCAL_REGISTRATIONS_KEY);
    if (cached) {
      try {
        setRegisteredIds(JSON.parse(cached));
      } catch (e) {
        console.error('Error parsing tournament cache:', e);
      }
    }
  }, [user]);

  // Seed initial list of Tournaments
  const tournaments: Tournament[] = [
    {
      id: 't1',
      name: t('t1_name'),
      status: 'open',
      participants: participantCounts['t1'],
      maxParticipants: 16,
      startTime: t('t1_start'),
      prize: t('t1_prize'),
      bgGradient: 'linear-gradient(135deg, rgba(168, 85, 247, 0.12) 0%, rgba(255, 0, 128, 0.04) 100%)',
      organizer: 'Mucho Movimiento'
    },
    {
      id: 't2',
      name: t('t2_name'),
      status: 'open',
      participants: participantCounts['t2'],
      maxParticipants: 8,
      startTime: t('t2_start'),
      prize: t('t2_prize'),
      bgGradient: 'linear-gradient(135deg, rgba(255, 120, 0, 0.12) 0%, rgba(255, 0, 0, 0.04) 100%)',
      organizer: 'Barbaroja'
    },
    {
      id: 't3',
      name: t('t3_name'),
      status: 'active',
      participants: 8,
      maxParticipants: 8,
      startTime: t('t3_start'),
      prize: t('t3_prize'),
      bgGradient: 'linear-gradient(135deg, rgba(0, 242, 255, 0.12) 0%, rgba(0, 80, 255, 0.04) 100%)',
      organizer: 'Dybbuk'
    },
    {
      id: 't4',
      name: t('t4_name'),
      status: 'finished',
      participants: 16,
      maxParticipants: 16,
      startTime: t('t4_start'),
      prize: t('t4_prize'),
      bgGradient: 'linear-gradient(135deg, rgba(255, 215, 0, 0.12) 0%, rgba(255, 140, 0, 0.04) 100%)',
      winner: 'RoberGalati 🏆',
      organizer: 'Luquita Rodriguez'
    }
  ];



  return (
    <div style={{
      width: '100%',
      maxWidth: '1200px',
      margin: '0 auto',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      padding: isMobile ? '1.5rem 1rem 4rem 1rem' : '1.1rem 1rem 4rem 1rem',
      color: '#fff',
      boxSizing: 'border-box'
    }}>
      {/* HEADER SECTION (Centered column layout on desktop, responsive style on mobile) */}
      {!isMobile && (
        <>
          {/* Fixed Back Button (Desktop Left Corner) */}
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

          {/* Fixed Warning Badge (Desktop Right Corner) */}
          <div
            style={{
              position: "fixed",
              top: "1.5rem",
              right: "1rem",
              background: "rgba(255, 120, 0, 0.06)",
              border: "1.5px solid rgba(255, 120, 0, 0.3)",
              backdropFilter: "blur(12px)",
              zIndex: 2000,
              height: "36px",
              borderRadius: "0.85rem",
              padding: "0 0.85rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.4rem",
              color: "#ff7800",
              boxShadow: "0 4px 14px rgba(255, 120, 0, 0.08)",
              fontSize: "0.7rem",
              fontWeight: 850,
              textShadow: "0 0 8px rgba(255, 120, 0, 0.15)"
            }}
          >
            <span>⚠️ Aún no habilitados</span>
          </div>
        </>
      )}

      {/* HEADER SECTION (Responsive Container) */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: isMobile ? '1.5rem' : '2rem',
        width: '100%',
        position: 'relative'
      }}>
        {isMobile ? (
          <>
            {/* Mobile Header Layout */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
              gap: '0.75rem',
              marginBottom: '1rem'
            }}>
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

              <div style={{
                background: 'rgba(255, 120, 0, 0.06)',
                border: '1.5px solid rgba(255, 120, 0, 0.3)',
                borderRadius: '0.75rem',
                padding: '0.35rem 0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.65rem',
                fontWeight: 850,
                color: '#ff7800',
                maxWidth: '180px',
                textAlign: 'center',
                boxShadow: '2px 2px 0px rgba(0,0,0,0.8)',
              }}>
                <span>⚠️ Aún no habilitados</span>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              justifyContent: 'center',
              marginTop: '1rem'
            }}>
              <Trophy size={24} style={{ color: '#ffffff', filter: 'drop-shadow(0 0 6px rgba(255, 255, 255, 0.25))' }} />
              <h2 className="text-display" style={{
                fontSize: '1.4rem',
                margin: 0,
                letterSpacing: '0.05em',
                color: '#ffffff',
                textShadow: '0 0 8px rgba(255, 255, 255, 0.1)'
              }}>
                {t('tournaments')} ({t('coming_soon').toLowerCase()})
              </h2>
            </div>
            
            <p style={{ fontSize: '0.75rem', opacity: 0.6, margin: '4px 0 0 0', textAlign: 'center' }}>
              {t('tournaments_subtitle')}
            </p>
            
          </>
        ) : (
          <>
            {/* Desktop Centered Header Layout */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Trophy size={36} style={{ color: '#ffffff', filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.3))' }} />
                <h2 className="text-display" style={{
                  fontSize: '2.2rem',
                  margin: 0,
                  letterSpacing: '0.05em',
                  color: '#ffffff',
                  textShadow: '0 0 15px rgba(255, 255, 255, 0.2)'
                }}>
                  {t('tournaments')} ({t('coming_soon').toLowerCase()})
                </h2>
              </div>
              <p style={{ fontSize: '0.95rem', opacity: 0.65, margin: '4px 0 0 0', fontWeight: 600 }}>
                {t('tournaments_subtitle')}
              </p>


            </div>
          </>
        )}
      </div>

      {/* LOGIN TO COMPETE OR USER STATS BANNER */}
      <AnimatePresence mode="wait">
        {!user ? (
          <motion.div
            key="login-banner"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1.5px dashed rgba(168, 85, 247, 0.3)',
              borderRadius: '1.75rem',
              padding: '1.5rem',
              marginBottom: '3.5rem',
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1.5rem',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
            }}
          >
            <div style={{ flex: 1, textAlign: isMobile ? 'center' : 'left' }}>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#a855f7', display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1.1rem', fontWeight: 900 }}>
                <Lock size={18} />
                {t('login_to_compete_title')}
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.7, lineHeight: 1.4 }}>
                {t('login_to_compete_desc')}
              </p>
            </div>

            <button
              onClick={handleAuth}
              className="btn-hover-dark"
              style={{
                background: '#9146ff',
                border: 'none',
                color: '#fff',
                height: '46px',
                borderRadius: '1.25rem',
                padding: '0 1.5rem',
                fontSize: '0.9rem',
                fontWeight: 950,
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                cursor: 'pointer',
                boxShadow: '4px 4px 0px #000',
                whiteSpace: 'nowrap'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" style={{ fill: 'currentColor' }}>
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              {t('login_with_google')}
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="user-stats"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1.5px solid rgba(0, 242, 255, 0.2)',
              borderRadius: '1.75rem',
              padding: '1.5rem',
              marginBottom: '3.5rem',
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1.5rem',
              boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, justifyContent: isMobile ? 'center' : 'flex-start' }}>
              <div style={{
                width: '52px', height: '52px', borderRadius: '50%', background: 'rgba(0, 242, 255, 0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(0, 242, 255, 0.3)'
              }}>
                <User size={26} color="#00f2ff" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                    {user.user_metadata?.custom_username || user.email?.split('@')[0]}
                  </div>
                  <button
                    onClick={() => {
                      window.location.href = window.location.pathname.startsWith('/en') ? '/en/perfil' : '/perfil';
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'rgba(255, 255, 255, 0.4)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 0,
                      transition: 'color 0.2s ease'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#00f2ff')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.4)')}
                    title="Editar perfil"
                  >
                    <Edit2 size={14} />
                  </button>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#00f2ff', fontWeight: 800, marginTop: '2px' }}>ESTADÍSTICAS GLOBALES</div>
              </div>
            </div>

            <div style={{ 
              display: 'flex', 
              gap: '1.5rem', 
              flexWrap: 'wrap',
              justifyContent: isMobile ? 'center' : 'flex-end',
              flex: 2
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#fff' }}>0</div>
                <div style={{ fontSize: '0.65rem', opacity: 0.6, textTransform: 'uppercase', fontWeight: 800 }}>Torneos<br/>Jugados</div>
              </div>
              <div style={{ width: '1px', background: 'rgba(255,255,255,0.15)' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#ffdf00', textShadow: '0 0 8px rgba(255,223,0,0.3)' }}>#---</div>
                <div style={{ fontSize: '0.65rem', opacity: 0.6, textTransform: 'uppercase', fontWeight: 800 }}>Posición<br/>Global</div>
              </div>
              <div style={{ width: '1px', background: 'rgba(255,255,255,0.15)' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#a855f7', marginTop: '0.3rem' }}>--:--:--</div>
                <div style={{ fontSize: '0.65rem', opacity: 0.6, textTransform: 'uppercase', fontWeight: 800, marginTop: '0.3rem' }}>Próximo<br/>Torneo</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LOGIN TO COMPETE BANNER */}

      {/* TOURNAMENTS LIST SECTION */}
      <h3 className="text-display" style={{ fontSize: '1.4rem', marginBottom: '2.5rem', marginTop: '0', color: '#fff', letterSpacing: '0.05em', textAlign: 'center' }}>
        LISTADO DE TORNEOS
      </h3>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
        gap: '2.5rem',
        width: '100%'
      }}>
        {tournaments.map((tournament) => {
          const isRegistered = registeredIds.includes(tournament.id);
          
          return (
            <motion.div
              key={tournament.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              style={{
                background: tournament.bgGradient,
                border: isRegistered ? '1.5px solid #10b981' : '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '2.25rem',
                padding: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                boxShadow: isRegistered 
                  ? '0 0 25px rgba(16, 185, 129, 0.15), 0 12px 30px rgba(0,0,0,0.2)' 
                  : '0 12px 30px rgba(0,0,0,0.15)',
                backdropFilter: 'blur(8px)',
                transition: 'all 0.3s ease'
              }}
            >
              {/* Status Indicator */}
              <div style={{
                position: 'absolute',
                top: '-15px',
                left: '24px',
                background: tournament.status === 'open' 
                  ? 'rgba(168, 85, 247, 0.15)' 
                  : tournament.status === 'active' 
                    ? 'rgba(255, 120, 0, 0.15)' 
                    : 'rgba(255,255,255,0.05)',
                border: `1.5px solid ${
                  tournament.status === 'open' 
                    ? '#a855f7' 
                    : tournament.status === 'active' 
                      ? '#ff7800' 
                      : 'rgba(255,255,255,0.2)'
                }`,
                color: tournament.status === 'open' 
                  ? '#a855f7' 
                  : tournament.status === 'active' 
                    ? '#ff7800' 
                    : 'rgba(255,255,255,0.5)',
                borderRadius: '1rem',
                padding: '4px 14px',
                fontSize: '0.7rem',
                fontWeight: 900,
                textTransform: 'uppercase',
                zIndex: 10
              }}>
                {tournament.status === 'open'
                  ? t('status_open')
                  : tournament.status === 'active'
                    ? t('status_active')
                    : t('status_finished')}
              </div>

              {/* Main Content */}
              <div style={{ marginTop: '0.5rem', marginBottom: '1.5rem' }}>
                <h3 className="text-display" style={{
                  fontSize: '1.4rem',
                  margin: '0.5rem 0 0.75rem 0',
                  color: isRegistered ? '#10b981' : '#fff',
                  letterSpacing: '0.05em'
                }}>
                  {tournament.name}
                </h3>

                {/* Info Rows */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {/* Start time / Winner info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', opacity: 0.85 }}>
                    {tournament.status === 'finished' ? (
                      <>
                        <Award size={15} style={{ color: '#ffd700' }} />
                        <span>{t('champion')}: <strong style={{ color: '#ffd700' }}>{tournament.winner}</strong></span>
                      </>
                    ) : (
                      <>
                        <Clock size={15} style={{ color: '#00f2ff' }} />
                        <span>{t('starts')}: <strong style={{ color: '#00f2ff' }}>{tournament.startTime}</strong></span>
                      </>
                    )}
                  </div>

                  {/* Prize Info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', opacity: 0.85 }}>
                    <Zap size={15} style={{ color: '#ff7800' }} />
                    <span>{t('prize')}: <strong style={{ color: '#ff7800' }}>{tournament.prize}</strong></span>
                  </div>

                  {/* Organizer Info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', opacity: 0.85 }}>
                    <ShieldCheck size={15} style={{ color: '#ffd700' }} />
                    <span>{t('organized_by')}: <strong style={{ color: '#ffd700' }}>{tournament.organizer}</strong></span>
                  </div>

                  {/* Slots Info / Progress */}
                  {tournament.status !== 'finished' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '0.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', opacity: 0.7 }}>
                        <span>{t('slots_filled')}</span>
                        <strong>{tournament.participants} / {tournament.maxParticipants}</strong>
                      </div>
                      {/* Slots Bar */}
                      <div style={{
                        width: '100%',
                        height: '6px',
                        background: 'rgba(255,255,255,0.06)',
                        borderRadius: '3px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${(tournament.participants / tournament.maxParticipants) * 100}%`,
                          height: '100%',
                          background: isRegistered ? '#10b981' : '#00f2ff',
                          borderRadius: '3px',
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div>
                {tournament.status === 'open' ? (
                  <button
                    disabled={true}
                    style={{
                      width: '100%',
                      height: '46px',
                      borderRadius: '1.25rem',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: 'rgba(255,255,255,0.4)',
                      fontSize: '0.9rem',
                      fontWeight: 950,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      cursor: 'not-allowed',
                      boxShadow: '4px 4px 0px #000',
                      opacity: 0.6
                    }}
                  >
                    <Lock size={16} />
                    <span>{t('sign_up_now')}</span>
                  </button>
                ) : tournament.status === 'active' ? (
                  <button
                    disabled
                    style={{
                      width: '100%',
                      height: '46px',
                      borderRadius: '1.25rem',
                      border: '1px solid rgba(255, 120, 0, 0.25)',
                      background: 'rgba(255, 120, 0, 0.05)',
                      color: '#ff7800',
                      fontSize: '0.85rem',
                      fontWeight: 900,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      boxShadow: '4px 4px 0px #000',
                      opacity: 0.8
                    }}
                  >
                    <Trophy size={14} />
                    {t('tournament_in_progress')}
                  </button>
                ) : (
                  <button
                    disabled
                    style={{
                      width: '100%',
                      height: '46px',
                      borderRadius: '1.25rem',
                      border: '1px solid rgba(255,255,255,0.1)',
                      background: 'rgba(255,255,255,0.02)',
                      color: 'rgba(255,255,255,0.4)',
                      fontSize: '0.85rem',
                      fontWeight: 900,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      boxShadow: '4px 4px 0px #000',
                      opacity: 0.6
                    }}
                  >
                    <ShieldCheck size={14} />
                    {t('tournament_finished')}
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* GLOBAL RANKING SECTION */}
      <div style={{ marginTop: '4rem', marginBottom: '2rem' }}>
        <h3 className="text-display" style={{ fontSize: '1.4rem', marginBottom: '1.5rem', color: '#fff', letterSpacing: '0.05em', textAlign: 'center' }}>
          RANKING GLOBAL DE TORNEOS
        </h3>
        
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '1.5rem',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '60px 1fr 100px',
            padding: '1rem 1.5rem',
            background: 'rgba(255,255,255,0.02)',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            fontSize: '0.75rem',
            fontWeight: 800,
            color: 'rgba(255,255,255,0.5)',
            textTransform: 'uppercase'
          }}>
            <div style={{ textAlign: 'center' }}>POS</div>
            <div>JUGADOR</div>
            <div style={{ textAlign: 'right' }}>PTS</div>
          </div>
          
          {/* List */}
          <div>
            {currentRankingPage.map((player, idx) => {
              const isTop3 = player.position <= 3;
              return (
                <div key={player.id} style={{
                  display: 'grid',
                  gridTemplateColumns: '60px 1fr 100px',
                  padding: '1rem 1.5rem',
                  borderBottom: idx === currentRankingPage.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.03)',
                  alignItems: 'center',
                  background: isTop3 ? 'rgba(255,223,0,0.03)' : 'transparent',
                  transition: 'background 0.2s ease'
                }}>
                  <div style={{ 
                    textAlign: 'center', 
                    fontSize: '1.1rem', 
                    fontWeight: 900,
                    color: player.position === 1 ? '#ffdf00' : player.position === 2 ? '#c0c0c0' : player.position === 3 ? '#cd7f32' : 'rgba(255,255,255,0.5)'
                  }}>
                    #{player.position}
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: isTop3 ? '#fff' : 'rgba(255,255,255,0.8)' }}>
                    {player.name}
                  </div>
                  <div style={{ textAlign: 'right', fontWeight: 900, fontSize: '0.9rem', color: '#00f2ff' }}>
                    {player.score}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pagination */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          marginTop: '1.5rem'
        }}>
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: currentPage === 1 ? 'rgba(255,255,255,0.2)' : '#fff',
              width: '36px',
              height: '36px',
              borderRadius: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
            }}
          >
            <ChevronLeft size={18} />
          </button>
          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'rgba(255,255,255,0.5)' }}>
            PÁGINA {currentPage} DE {totalPages}
          </div>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: currentPage === totalPages ? 'rgba(255,255,255,0.2)' : '#fff',
              width: '36px',
              height: '36px',
              borderRadius: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
            }}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Twitch Button - Centered at the bottom of the page */}
      <a
        href="https://twitch.tv/muchomovimiento/videos"
        target="_blank"
        rel="noopener noreferrer"
        className="btn-hover-dark"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '3rem auto 0 auto',
          background: 'rgba(145, 70, 255, 0.2)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(145, 70, 255, 0.3)',
          color: 'white',
          height: '40px',
          padding: '0 1.25rem',
          borderRadius: '1rem',
          textDecoration: 'none',
          gap: '0.6rem',
          fontSize: '0.75rem',
          fontWeight: 800,
          letterSpacing: '0.05em',
          width: 'fit-content',
          textTransform: 'uppercase',
          transition: 'all 0.25s ease'
        }}
        title="Twitch"
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
          <path d="M21 2H3v16h5v4l4-4h5l4-4V2zm-10 9V7m5 4V7" />
        </svg>
        MUCHOMOVIMIENTO
      </a>
    </div>
  );
};
