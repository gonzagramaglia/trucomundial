import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Trophy, Lock, Award, Zap, Clock, ShieldCheck } from 'lucide-react';
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

export const TournamentScreen: React.FC<TournamentScreenProps> = ({ user, handleAuth, onBack }) => {
  const { t } = useTranslation();
  const LOCAL_REGISTRATIONS_KEY = `trucomundial-registrations-${user?.id || 'anonymous'}`;

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
      padding: '1.5rem 1rem 4rem 1rem',
      color: '#fff',
      boxSizing: 'border-box'
    }}>
      {/* HEADER SECTION */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        marginBottom: '2.5rem',
        width: '100%'
      }}>
        {/* Back Button */}
        <button
          onClick={onBack}
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
            gap: '0.6rem',
            fontSize: '0.9rem',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '4px 4px 0px #000',
            transition: 'transform 0.1s ease'
          }}
        >
          <ArrowLeft size={16} />
          {t("back")}
        </button>

        {/* Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Trophy size={32} style={{ color: '#ffffff', filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.25))' }} />
          <h2 className="text-display" style={{
            fontSize: '1.8rem',
            margin: 0,
            letterSpacing: '0.05em',
            color: '#ffffff',
            textShadow: '0 0 10px rgba(255, 255, 255, 0.1)'
          }}>
            {t("tournaments")} ({t("coming_soon")})
          </h2>
        </div>

        {/* User stats indicator if logged in */}
        {user ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '2rem',
            padding: '0.4rem 1.25rem',
            fontSize: '0.85rem',
            fontWeight: 800
          }}>
            <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontWeight: 600 }}>
              {t('session_desktop')}
            </span>
            <span style={{ color: '#00f2ff', marginLeft: '0.25rem' }}>
              {user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0] || "Gonzalo"}
            </span>
          </div>
        ) : (
          <button
            onClick={handleAuth}
            className="btn-hover-dark"
            style={{
              background: 'linear-gradient(to right, #a855f7, #7c3aed)',
              border: 'none',
              color: 'white',
              height: '42px',
              borderRadius: '1rem',
              padding: '0 1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              fontSize: '0.85rem',
              fontWeight: 900,
              cursor: 'pointer',
              boxShadow: '4px 4px 0px #000',
              textTransform: 'uppercase'
            }}
          >
            <Lock size={14} />
            {t("login")} {t("login_to_compete")}
          </button>
        )}
      </div>

      {/* DESCRIPCIÓN CON PRESENCIA */}
      <motion.div
        initial={{ y: -15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1.5px dashed rgba(255, 215, 0, 0.35)',
          borderRadius: '1.75rem',
          padding: '1.5rem 2rem',
          marginBottom: '3rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          backdropFilter: 'blur(8px)'
        }}
      >
        <p style={{
          margin: 0,
          fontSize: '1rem',
          fontWeight: 700,
          lineHeight: '1.6',
          color: '#fff',
          maxWidth: '850px'
        }}>
          {t('tournament_desc_plain').split('Mucho Movimiento 2vs2').map((part, i, arr) =>
            i < arr.length - 1
              ? <React.Fragment key={i}>{part}<strong style={{ color: '#ffd700', textShadow: '0 0 8px rgba(255,215,0,0.3)' }}>Mucho Movimiento 2vs2</strong></React.Fragment>
              : part
          )}
        </p>
        <div style={{
          marginTop: '1rem',
          padding: '0.5rem 1.25rem',
          borderRadius: '1rem',
          background: 'rgba(255, 120, 0, 0.12)',
          border: '1px solid rgba(255, 120, 0, 0.35)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: '#ff7800',
          fontSize: '0.85rem',
          fontWeight: 800,
          textShadow: '0 0 8px rgba(255, 120, 0, 0.25)'
        }}>
          <span>{t('testing_warning_tournaments')}</span>
        </div>
      </motion.div>

      {/* TOURNAMENTS LIST SECTION */}
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
                  ? 'rgba(16, 185, 129, 0.15)' 
                  : tournament.status === 'active' 
                    ? 'rgba(255, 120, 0, 0.15)' 
                    : 'rgba(255,255,255,0.05)',
                border: `1.5px solid ${
                  tournament.status === 'open' 
                    ? '#10b981' 
                    : tournament.status === 'active' 
                      ? '#ff7800' 
                      : 'rgba(255,255,255,0.2)'
                }`,
                color: tournament.status === 'open' 
                  ? '#10b981' 
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
