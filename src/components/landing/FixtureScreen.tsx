import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Home, Calendar, Trophy, Globe, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { TwitchButton } from '../shared/TwitchButton';
import { fixtureMatches } from '../../lib/fixtureData';
import type { FixtureMatch } from '../../lib/fixtureData';

type TabType = 'groups' | 'round_16' | 'quarterfinals' | 'semifinals' | 'final';

interface FixtureScreenProps {
  onBack: () => void;
}

export const FixtureScreen: React.FC<FixtureScreenProps> = ({ onBack }) => {
  const { t } = useTranslation();
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  const [activeTab, setActiveTab] = useState<TabType>('groups');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Filter and group matches by date
  const groupedMatches = useMemo(() => {
    let filtered = fixtureMatches;
    
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
  }, [searchQuery]);

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
      {/* Fixed Back Button */}
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

      {/* Header */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: isMobile ? '1.5rem' : '2.5rem',
        width: '100%'
      }}>
        {isMobile && (
          <div style={{ width: '100%', marginBottom: '1rem' }}>
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
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Calendar size={isMobile ? 28 : 36} style={{ color: '#00f2ff', filter: 'drop-shadow(0 0 10px rgba(0, 242, 255, 0.4))' }} />
          <h2 className="text-display" style={{
            fontSize: isMobile ? '1.8rem' : '2.5rem',
            margin: 0,
            letterSpacing: '0.02em',
            color: '#ffffff',
            textShadow: '0 0 15px rgba(255, 255, 255, 0.2)'
          }}>
            {t('world_cup_fixture')}
          </h2>
        </div>
        <p style={{
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: isMobile ? '0.9rem' : '1.1rem',
          textAlign: 'center',
          maxWidth: '600px',
          marginTop: '0.75rem',
          marginBottom: 0
        }}>
          Calendario oficial de los partidos de la Copa del Mundo.
        </p>

        <div style={{
          background: 'rgba(255, 215, 0, 0.1)',
          border: '1px solid rgba(255, 215, 0, 0.3)',
          borderRadius: '1rem',
          padding: '1rem',
          marginTop: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <div style={{
            background: 'rgba(255, 215, 0, 0.2)',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Trophy size={20} color="#ffd700" />
          </div>
          <p style={{
            margin: 0,
            fontSize: '0.85rem',
            color: 'rgba(255,255,255,0.9)',
            lineHeight: 1.4,
            textAlign: 'left'
          }}>
            Al finalizar cada partido, sumarán <strong>+2 estrellas de base</strong> los jugadores de los equipos que ganen, y <strong>+1 estrella</strong> aquellos que empaten.
          </p>
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
        msOverflowStyle: 'none', // For IE/Edge
      }}>
        {renderTab('groups', 'Fase de Grupos', Globe)}
        {renderTab('round_16', 'Octavos', Trophy)}
        {renderTab('quarterfinals', 'Cuartos', Trophy)}
        {renderTab('semifinals', 'Semifinal', Trophy)}
        {renderTab('final', 'Final', Trophy)}
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
              placeholder="Buscar equipo, Grupo A o fecha (ej: Jueves 18 de Junio)..."
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
              {dayGroup.matches.map((match) => (
                <div key={match.id} style={{
                  background: 'rgba(20, 20, 25, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '1rem',
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  gap: isMobile ? '1rem' : '2rem',
                  alignItems: isMobile ? 'flex-start' : 'center',
                  transition: 'background 0.2s ease',
                  cursor: 'default'
                }}>
                  
                  {/* Info: Time & Group */}
                  <div style={{ 
                    flex: isMobile ? 'none' : '0 0 120px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '0.25rem',
                    opacity: 0.8 
                  }}>
                    <span style={{ fontSize: '1rem', fontWeight: 800 }}>{match.time}</span>
                    <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>{match.group}</span>
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
                      VS
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
                      <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', opacity: 0.5, fontWeight: 700 }}>Marcador</span>
                      <span style={{ fontSize: '1rem', fontWeight: 800 }}>-</span>
                      <span style={{ fontSize: '0.65rem', opacity: 0.4, fontWeight: 700 }}>Por Jugar</span>
                    </div>
                  )}

                </div>
              ))}
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
              No se encontraron partidos
            </h3>
            <p style={{ opacity: 0.5, fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto' }}>
              No hay partidos que coincidan con tu búsqueda. Intentá con otro equipo, grupo o fecha.
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
