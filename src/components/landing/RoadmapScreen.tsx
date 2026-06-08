import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Home, Milestone, Calendar, Flame, Users, Sparkles, Award } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { TwitchButton } from '../shared/TwitchButton';
import { UtilityButtons } from '../shared/UtilityButtons';


interface RoadmapScreenProps {
  onBack: () => void;
}

interface RoadmapItem {
  phase: string;
  title: string;
  date: string;
  status: 'completed' | 'in-progress' | 'upcoming';
  statusText: string;
  statusColor: string;
  icon: React.ReactNode;
  description: string;
  features: string[];
}

export const RoadmapScreen: React.FC<RoadmapScreenProps> = ({ onBack }) => {
  const { t } = useTranslation();
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const roadmapItems: RoadmapItem[] = [
    {
      phase: 'FASE 1',
      title: t('phase1_title'),
      date: 'Q2 2026',
      status: 'completed',
      statusText: t('phase1_status'),
      statusColor: '#10b981',
      icon: <Flame size={20} style={{ color: '#10b981' }} />,
      description: t('phase1_desc'),
      features: [t('phase1_f1'), t('phase1_f2'), t('phase1_f3')]
    },
    {
      phase: 'FASE 2',
      title: t('phase2_title'),
      date: 'Q3 2026',
      status: 'in-progress',
      statusText: t('phase2_status'),
      statusColor: '#ffd700',
      icon: <Award size={20} style={{ color: '#ffd700' }} />,
      description: t('phase2_desc'),
      features: [t('phase2_f1'), t('phase2_f2'), t('phase2_f3')]
    },
    {
      phase: 'FASE 3',
      title: t('phase3_title'),
      date: 'Q3 2026',
      status: 'upcoming',
      statusText: t('phase3_status'),
      statusColor: '#00f2ff',
      icon: <Users size={20} style={{ color: '#00f2ff' }} />,
      description: t('phase3_desc'),
      features: [t('phase3_f1'), t('phase3_f2'), t('phase3_f3')]
    },
    {
      phase: 'FASE 4',
      title: t('phase4_title'),
      date: 'Q4 2026',
      status: 'upcoming',
      statusText: t('phase4_status'),
      statusColor: '#a855f7',
      icon: <Sparkles size={20} style={{ color: '#a855f7' }} />,
      description: t('phase4_desc'),
      features: [t('phase4_f1'), t('phase4_f2'), t('phase4_f4')]
    }
  ];

  return (
    <div style={{
      width: '100%',
      maxWidth: '900px',
      margin: '0 auto',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      padding: isMobile ? '1rem 0.75rem 4rem 0.75rem' : '1.1rem 1rem 4rem 1rem',
      color: '#fff',
      boxSizing: 'border-box'
    }}>
      {/* HEADER SECTION (Centered column layout on desktop, responsive /ruta style on mobile) */}
      {!isMobile && (
        <>
          {/* Fixed Back Button (Desktop Left Corner) */}
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

          {/* Top Right Controls */}
          <UtilityButtons />

          {/* Fixed Warning Badge (Desktop Right Corner) */}
          <div
            style={{
              position: "fixed",
              top: "1.5rem",
              right: "5.5rem",
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
              textAlign: "center",
              textShadow: "0 0 8px rgba(255, 120, 0, 0.15)"
            }}
          >
            <span>{t('testing_warning_generic')}</span>
          </div>
        </>
      )}

      {/* HEADER SECTION (Responsive container) */}
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
              gap: '0.75rem'
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
                <span>{t('testing_warning_generic')}</span>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              justifyContent: 'center',
              marginTop: '1rem'
            }}>
              <Milestone size={24} style={{ color: '#ffffff', filter: 'drop-shadow(0 0 6px rgba(255, 255, 255, 0.25))' }} />
              <h2 className="text-display" style={{
                fontSize: '1.4rem',
                margin: 0,
                letterSpacing: '0.05em',
                color: '#ffffff',
                textShadow: '0 0 8px rgba(255, 255, 255, 0.1)'
              }}>
                {t('roadmap').toUpperCase()}
              </h2>
            </div>
            
            <p style={{ fontSize: '0.75rem', opacity: 0.6, margin: '4px 0 0 0', textAlign: 'center' }}>
              {t('roadmap_subtitle')}
            </p>
          </>
        ) : (
          <>
            {/* Desktop Centered Header Layout */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Milestone size={36} style={{ color: '#ffffff', filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.3))' }} />
                <h2 className="text-display" style={{
                  fontSize: '2.2rem',
                  margin: 0,
                  letterSpacing: '0.05em',
                  color: '#ffffff',
                  textShadow: '0 0 15px rgba(255, 255, 255, 0.2)'
                }}>
                  {t('roadmap').toUpperCase()}
                </h2>
              </div>
              <p style={{ fontSize: '0.95rem', opacity: 0.65, margin: '4px 0 0 0', fontWeight: 600 }}>
                {t('roadmap_subtitle')}
              </p>
            </div>
          </>
        )}
      </div>

      {/* TIMELINE AND THE VERTICAL LINE */}
      <div style={{
        position: 'relative',
        paddingLeft: isMobile ? '1.25rem' : '2rem',
        borderLeft: '2px dashed rgba(255,255,255,0.12)',
        marginLeft: isMobile ? '0.25rem' : '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '3rem'
      }}>
        {roadmapItems.map((item, index) => (
          <motion.div
            key={index}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: index * 0.15 }}
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '2rem',
              padding: isMobile ? '1.25rem' : '2rem',
              boxShadow: '0 12px 35px rgba(0,0,0,0.2)',
              backdropFilter: 'blur(8px)',
              transition: 'all 0.3s ease'
            }}
          >
            {/* Timeline node circle dot */}
            <div style={{
              position: 'absolute',
              left: isMobile ? '-1.9rem' : '-2.85rem',
              top: '2.25rem',
              width: isMobile ? '1.2rem' : '1.5rem',
              height: isMobile ? '1.2rem' : '1.5rem',
              borderRadius: '50%',
              background: '#000',
              border: `3px solid ${item.statusColor}`,
              boxShadow: `0 0 10px ${item.statusColor}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10
            }} />

            {/* Header info */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 900,
                  color: item.statusColor,
                  background: `rgba(${item.statusColor === '#10b981' ? '16,185,129' : item.statusColor === '#ffd700' ? '255,215,0' : item.statusColor === '#00f2ff' ? '0,242,255' : '168,85,247'}, 0.12)`,
                  padding: '3px 9px',
                  borderRadius: '1rem',
                  letterSpacing: '0.05em'
                }}>
                  {item.phase}
                </span>
                <span style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  opacity: 0.7
                }}>
                  <Calendar size={13} />
                  {item.date}
                </span>
              </div>

              {/* Status Badge */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.75rem',
                fontWeight: 900,
                color: item.statusColor
              }}>
                {item.icon}
                <span>{item.statusText}</span>
              </div>
            </div>

            {/* Content info */}
            <h3 style={{
              fontSize: isMobile ? '1.2rem' : '1.4rem',
              margin: '0 0 0.75rem 0',
              fontWeight: 900,
              letterSpacing: '0.02em',
              color: '#fff'
            }}>
              {item.title}
            </h3>

            <p style={{
              margin: '0 0 1.25rem 0',
              fontSize: isMobile ? '0.85rem' : '0.95rem',
              lineHeight: '1.6',
              color: 'rgba(255,255,255,0.7)',
              fontWeight: 500
            }}>
              {item.description}
            </p>

            {/* Feature List */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.6rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid rgba(255,255,255,0.06)'
            }}>
              {item.features.map((feat, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: isMobile ? '0.8rem' : '0.85rem' }}>
                  <span style={{ color: item.statusColor }}>✓</span>
                  <span style={{ fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>{feat}</span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Twitch Button - Centered at the bottom of the page */}
      <TwitchButton />
    </div>
  );
};
