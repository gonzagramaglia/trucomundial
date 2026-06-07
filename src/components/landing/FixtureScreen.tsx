import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Globe, Star, Search, Home, Trophy, Video } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { TwitchButton } from '../shared/TwitchButton';
import { fixtureMatches } from '../../lib/fixtureData';
import type { FixtureMatch } from '../../lib/fixtureData';
import { supabase } from '../../lib/supabase';
import { audioManager } from '../../lib/audio';
import { VolumeControl } from '../shared/VolumeControl';

type TabType = 'groups' | 'round_16' | 'quarterfinals' | 'semifinals' | 'final';

interface FixtureScreenProps {
  user?: any;
  onBack: () => void;
}

export const FixtureScreen: React.FC<FixtureScreenProps> = ({ user, onBack }) => {
  const { t } = useTranslation();
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  const [activeTab, setActiveTab] = useState<TabType>('groups');
  const [searchQuery, setSearchQuery] = useState('');
  const [liveResults, setLiveResults] = useState<Record<string, {scoreA: number, scoreB: number, status: string}>>({});

  useEffect(() => {
    audioManager.playTheme();
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const { data, error } = await supabase.from('fixture_results').select('*');
        if (!error && data) {
          const map: Record<string, any> = {};
          data.forEach(r => {
            map[r.match_id] = { scoreA: r.score_a, scoreB: r.score_b, status: r.status };
          });
          setLiveResults(map);
        }
      } catch (err) {
        // ignore
      }
    };
    fetchResults();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Filter and group matches by date
  const groupedMatches = useMemo(() => {
    let filtered = fixtureMatches.map(m => {
      if (liveResults[m.id]) {
        return {
          ...m,
          scoreA: liveResults[m.id].scoreA,
          scoreB: liveResults[m.id].scoreB,
          status: liveResults[m.id].status as 'finished'
        };
      }
      return m;
    });
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const groupSearch = q.replace('grupo', 'group');
      
      filtered = filtered.filter(m => 
        m.teamA.toLowerCase().includes(q) || 
        m.teamB.toLowerCase().includes(q) || 
        m.group.toLowerCase().includes(q) ||
        m.group.toLowerCase().includes(groupSearch) ||
        m.date.toLowerCase().includes(q)
      );
    }
    
    // Sort so that matches with a result (finished) go to the bottom
    filtered.sort((a, b) => {
      const aFinished = a.status === 'finished' ? 1 : 0;
      const bFinished = b.status === 'finished' ? 1 : 0;
      return aFinished - bFinished;
    });

    const groups: { [date: string]: FixtureMatch[] } = {};
    filtered.forEach(match => {
      if (!groups[match.date]) {
        groups[match.date] = [];
      }
      groups[match.date].push(match);
    });
    
    // Convert to array of { date, matches } maintaining insertion order
    return Object.keys(groups).map(date => ({
      date,
      matches: groups[date]
    }));
  }, [searchQuery, liveResults]);

  const renderTab = (id: TabType, label: string, Icon: any) => (
    <button
      onClick={() => setActiveTab(id)}
      style={{
        background: activeTab === id ? 'rgba(0, 242, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
        border: activeTab === id ? '1px solid #00f2ff' : '1px solid rgba(255, 255, 255, 0.1)',
        color: activeTab === id ? '#00f2ff' : '#fff',
        padding: isMobile ? '0.5rem 1rem' : '0.75rem 1.5rem',
        borderRadius: '2rem',
        fontWeight: 800,
        fontSize: isMobile ? '0.8rem' : '0.9rem',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        whiteSpace: 'nowrap'
      }}
    >
      <Icon size={isMobile ? 14 : 18} />
      {label}
    </button>
  );

  return (
    <div style={{
      width: '100%',
      maxWidth: '1000px',
      margin: '0 auto',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      padding: isMobile ? '1rem 0.75rem 4rem 0.75rem' : '1.1rem 1rem 4rem 1rem',
      color: '#fff',
      boxSizing: 'border-box'
    }}>
      {/* Fixed Back Button (Desktop Left Corner) */}
      {!isMobile && (
        <button
          onClick={onBack}
          className="home-btn-fixed btn-hover-dark profile-nav-btn"
          style={{
            position: "fixed",
            top: "1.5rem",
            left: "1.5rem",
            background: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(12px)",
            zIndex: 2000,
            height: "40px",
            borderRadius: "1rem",
            padding: "0 1.25rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            color: "white",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            boxShadow: "none",
            fontWeight: 900,
            fontSize: "0.75rem",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            cursor: "pointer"
          }}
        >
          <Home size={18} />
          <span>{t("home")}</span>
        </button>
      )}

      {/* Mute Button (Desktop Right Corner) */}
      {!isMobile && (
        <div style={{ position: "fixed", top: "1.5rem", right: "1.5rem", zIndex: 2000, display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <a href="https://youtu.be/228FtMaq8uY" target="_blank" rel="noopener noreferrer" onClick={() => audioManager.setVolume(0)} className="btn-hover-dark mobile-hide" style={{ background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', color: 'white', height: '40px', width: '40px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(12px)', transition: 'none' }} title="Video">
            <Video size={20} />
          </a>
          <VolumeControl expandDirection="down" />
        </div>
      )}

      {/* Header */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: isMobile ? '1.5rem' : '2.5rem',
        width: '100%',
        position: 'relative'
      }}>
        {isMobile && (
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
              <Home size={14} />
              {t("home")}
            </button>

            {/* Mobile Mute Button */}
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <a href="https://youtu.be/228FtMaq8uY" target="_blank" rel="noopener noreferrer" onClick={() => audioManager.setVolume(0)} className="btn-hover-dark mobile-hide" style={{ background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', color: 'white', height: '36px', width: '36px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(12px)', transition: 'none', boxShadow: '3px 3px 0px #000' }} title="Video">
                <Video size={16} />
              </a>
              <VolumeControl size={36} expandDirection="down" style={{ boxShadow: '3px 3px 0px #000' }} />
            </div>
          </div>
        )}

        {isMobile ? (
          <>
            {/* Mobile Centered Header Layout */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.25rem',
              justifyContent: 'center',
              textAlign: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={24} style={{ color: '#ffffff', filter: 'drop-shadow(0 0 6px rgba(255, 255, 255, 0.25))' }} />
                <h2 className="text-display" style={{
                  fontSize: '1.4rem',
                  margin: 0,
                  letterSpacing: '0.05em',
                  color: '#ffffff',
                  textShadow: '0 0 8px rgba(255, 255, 255, 0.15)'
                }}>
                  {t('world_cup_fixture').toUpperCase()}
                </h2>
              </div>
              <p style={{ fontSize: '0.75rem', opacity: 0.6, margin: '4px 0 0 0' }}>
                {t('fixture_desc')}
              </p>
            </div>
          </>
        ) : (
          <>
            {/* Desktop Centered Header Layout */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Calendar size={36} style={{ color: '#ffffff', filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.3))' }} />
                <h2 className="text-display" style={{
                  fontSize: '2.2rem',
                  margin: 0,
                  letterSpacing: '0.05em',
                  color: '#ffffff',
                  textShadow: '0 0 15px rgba(255, 255, 255, 0.2)'
                }}>
                  {t('world_cup_fixture').toUpperCase()}
                </h2>
              </div>
              <p style={{ fontSize: '0.95rem', opacity: 0.65, margin: '4px 0 0 0', fontWeight: 600 }}>
                {t('fixture_desc')}
              </p>
            </div>
          </>
        )}

        <div style={{
          background: 'rgba(255, 223, 0, 0.1)',
          border: '1px solid rgba(255, 223, 0, 0.3)',
          borderRadius: '1rem',
          padding: '1rem',
          marginTop: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <div style={{
            background: 'rgba(255, 223, 0, 0.2)',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Star size={20} color="#ffdf00" />
          </div>
          <p 
            style={{
              margin: 0,
              fontSize: '0.85rem',
              color: 'rgba(255,255,255,0.9)',
              lineHeight: 1.4,
              textAlign: 'left'
            }}
            dangerouslySetInnerHTML={{ __html: t('fixture_info') }}
          />
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        justifyContent: isMobile ? 'flex-start' : 'center',
        gap: '0.75rem',
        marginBottom: '2rem',
        overflowX: 'auto',
        paddingBottom: '0.5rem',
        scrollbarWidth: 'none', // For Firefox
        msOverflowStyle: 'none' // For IE/Edge
      }}>
        <div style={{ display: 'flex', gap: '0.5rem', width: 'max-content' }}>
          {renderTab('groups', t('group_stage'), Globe)}
          {renderTab('round_16', t('round_of_16'), Trophy)}
          {renderTab('quarterfinals', t('quarterfinals'), Trophy)}
          {renderTab('semifinals', t('semifinals'), Trophy)}
          {renderTab('final', t('final'), Trophy)}
        </div>
      </div>

      {/* Search and Filters */}
      {activeTab === 'groups' && (
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: '1rem',
          marginBottom: '2rem',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          {/* Search Bar */}
          <div style={{
            flex: 1,
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
          }}>
            <Search size={18} style={{
              position: 'absolute',
              left: '1rem',
              color: 'rgba(255,255,255,0.4)'
            }} />
            <input
              type="text"
              placeholder={t('search_team')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(20, 20, 25, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '1rem',
                padding: '0.85rem 1rem 0.85rem 2.8rem',
                color: '#fff',
                fontSize: '0.9rem',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = '#00f2ff'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
            />
          </div>
        </div>
      )}

      {/* Matches Content by Date */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        {activeTab === 'groups' && groupedMatches.length > 0 && groupedMatches.map((dayGroup, dIndex) => (
          <motion.div
            key={dIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: dIndex * 0.05 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}
          >
            {/* Date Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#fff',
              fontSize: '1rem',
              fontWeight: 700,
              paddingBottom: '0.5rem',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <Calendar size={18} />
              <span style={{ textTransform: 'capitalize' }}>{dayGroup.date}</span>
            </div>
            
            {/* Match Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {dayGroup.matches.map((match) => {
                const userNationality = user?.user_metadata?.nationality;
                const isMyTeam = userNationality && (match.teamA === userNationality || match.teamB === userNationality);
                
                return (
                <div key={match.id} style={{
                  background: 'rgba(20, 20, 25, 0.8)',
                  border: isMyTeam ? '2px solid #00f2ff' : '1px solid rgba(255, 255, 255, 0.05)',
                  boxShadow: isMyTeam ? '0 0 15px rgba(0, 242, 255, 0.2)' : 'none',
                  borderRadius: '1rem',
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  gap: isMobile ? '1rem' : '2rem',
                  alignItems: isMobile ? 'flex-start' : 'center',
                  transition: 'all 0.2s ease',
                  cursor: 'default'
                }}>
                  
                  {/* Info: Time & Group */}
                  <div style={{ 
                    flex: isMobile ? 'none' : '0 0 120px', 
                    display: 'flex', 
                    flexDirection: isMobile ? 'row' : 'column', 
                    gap: isMobile ? '0.75rem' : '0.25rem',
                    alignItems: isMobile ? 'center' : 'flex-start',
                    justifyContent: isMobile ? 'space-between' : 'flex-start',
                    width: isMobile ? '100%' : 'auto',
                    opacity: 0.8 
                  }}>
                    <span style={{ fontSize: '1rem', fontWeight: 800 }}>{match.time}</span>
                    <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>{match.group.replace('Group', t('group'))}</span>
                  </div>

                  {/* Teams vs */}
                  <div style={{ 
                    flex: 1, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    width: isMobile ? '100%' : 'auto'
                  }}>
                    {/* Team A */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, justifyContent: 'flex-end' }}>
                      <span style={{ fontWeight: 700, fontSize: isMobile ? '0.9rem' : '1.1rem', textAlign: 'right' }}>{match.teamA}</span>
                      <span style={{ fontSize: '1.5rem', width: '32px', textAlign: 'center' }}>{match.flagA}</span>
                    </div>
                    
                    {/* VS / Score area */}
                    <div style={{ 
                      padding: '0 1.5rem', 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '1rem',
                      color: 'rgba(255,255,255,0.4)',
                      minWidth: '60px'
                    }}>
                        {match.status === 'finished' ? (
                          <span style={{ fontSize: '1.25rem', fontWeight: 900 }}>{match.scoreA} - {match.scoreB}</span>
                        ) : (
                          'VS'
                        )}
                    </div>

                    {/* Team B */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, justifyContent: 'flex-start' }}>
                      <span style={{ fontSize: '1.5rem', width: '32px', textAlign: 'center' }}>{match.flagB}</span>
                      <span style={{ fontWeight: 700, fontSize: isMobile ? '0.9rem' : '1.1rem', textAlign: 'left' }}>{match.teamB}</span>
                    </div>
                  </div>

                  {/* Right side box (Placeholder for Marcador / Predicción) */}
                  {!isMobile && (
                    <div style={{
                      flex: '0 0 150px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}>
                      <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', opacity: 0.5, fontWeight: 700 }}>{t('score', 'Marcador')}</span>
                      {match.status === 'finished' ? (
                        <>
                          <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#00f2ff' }}>{match.scoreA} - {match.scoreB}</span>
                          <span style={{ fontSize: '0.65rem', opacity: 0.8, fontWeight: 700, color: '#00f2ff' }}>{t('finished', 'Finalizado')}</span>
                        </>
                      ) : (
                        <>
                          <span style={{ fontSize: '1rem', fontWeight: 800 }}>-</span>
                          <span style={{ fontSize: '0.65rem', opacity: 0.4, fontWeight: 700 }}>{t('to_be_played')}</span>
                        </>
                      )}
                    </div>
                  )}
                    {/* Status */}
                    {(match.status === 'finished' && match.scoreA !== undefined) ? (
                      <div style={{
                        marginTop: isMobile ? '1rem' : 0,
                        padding: '0.4rem 0.75rem',
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '0.5rem',
                        fontSize: '0.8rem',
                        fontWeight: 800,
                        color: 'rgba(255,255,255,0.8)'
                      }}>
                        {t('final_score')}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </motion.div>
        ))}

        {activeTab === 'groups' && groupedMatches.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '4rem 1rem', 
            background: 'rgba(255,255,255,0.02)', 
            borderRadius: '1.5rem',
            border: '1px dashed rgba(255,255,255,0.1)'
          }}>
            <Search size={48} style={{ color: 'rgba(255,255,255,0.2)', marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: 'rgba(255,255,255,0.6)' }}>
              {t('no_matches_found', 'No se encontraron partidos')}
            </h3>
            <p style={{ opacity: 0.5, fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto' }}>
              {t('no_matches_desc', 'No hay partidos que coincidan con tu búsqueda. Intentá con otro equipo, grupo o fecha.')}
            </p>
          </div>
        )}

        {activeTab !== 'groups' && (
          <div style={{ 
            textAlign: 'center', 
            padding: '4rem 1rem', 
            background: 'rgba(255,255,255,0.02)', 
            borderRadius: '1.5rem',
            border: '1px dashed rgba(255,255,255,0.1)'
          }}>
            <Trophy size={48} style={{ color: 'rgba(255,255,255,0.2)', marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: 'rgba(255,255,255,0.6)' }}>
              {activeTab === 'round_16' && 'Octavos de Final por Definir'}
              {activeTab === 'quarterfinals' && 'Cuartos de Final por Definir'}
              {activeTab === 'semifinals' && 'Semifinales por Definir'}
              {activeTab === 'final' && 'Final por Definir'}
            </h3>
            <p style={{ opacity: 0.5, fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto' }}>
              {activeTab === 'round_16' && 'Los cruces de octavos de final se definirán al concluir la fase de grupos.'}
              {activeTab === 'quarterfinals' && 'Los cruces de cuartos de final se definirán al concluir los octavos.'}
              {activeTab === 'semifinals' && 'Los cruces de semifinales se definirán al concluir los cuartos de final.'}
              {activeTab === 'final' && 'Los equipos finalistas se definirán al concluir las semifinales.'}
            </p>
          </div>
        )}
      </div>

      <TwitchButton />
    </div>
  );
};
