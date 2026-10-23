import React from 'react';
import { motion } from 'framer-motion';
import { Sticker } from '../shared/Sticker';
import { CARDS } from '../../data/cards';
import { useTranslation } from 'react-i18next';
import { useTopCard } from '../../hooks/useTopCard';

interface LandingHeaderProps {
  user: any;
}

export const LandingHeader: React.FC<LandingHeaderProps> = ({ user }) => {
  const { t } = useTranslation();
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);
  const userNationality = user?.user_metadata?.nationality;
  const topCard = useTopCard(userNationality);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const displayCard = topCard || CARDS.find(c => c.id === 'messi') || CARDS[0];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: isMobile ? '0.6rem' : '2rem',
      marginBottom: '1rem',
      width: '100%',
      transform: 'translateX(-12px)'
    }}>
      {/* Hero Card (Left) */}
      <motion.div
        animate={{ y: [0, -10, 0], rotate: [-5, -8, -5] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{ flexShrink: 0, transform: 'scale(0.8)', originX: 0.5, originY: 0.5 }}
      >
        <Sticker card={displayCard} disabled />
      </motion.div>

      {/* Title + Pill (Right Column) */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
          <h1 className="text-display" style={{ fontSize: 'clamp(2.5rem, 8vw, 4rem)', lineHeight: 1.0, color: '#fff', margin: 0 }}>
            {t("title").split(' ')[0]}<br />
            {t("title").split(' ')[1]}
          </h1>
          <span style={{
            background: '#f97316',
            color: '#fff',
            fontSize: '0.8rem',
            fontWeight: 900,
            padding: '0.2rem 0.5rem',
            borderRadius: '0.5rem',
            letterSpacing: '0.1em',
            marginTop: '0.75rem',
            marginLeft: '-2.5rem'
          }}>DEMO</span>
        </div>

        {user && (
          <div style={{
            color: '#00f2ff',
            fontSize: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: 'rgba(0,242,255,0.1)',
            padding: '0.4rem 0.8rem',
            borderRadius: '1rem',
            border: '1px solid rgba(0,242,255,0.2)',
            fontFamily: 'var(--font-main)',
            letterSpacing: '0.05em',
            fontWeight: 700,
            lineHeight: 1.35
          }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00f2ff', flexShrink: 0 }} />
            <span>
              {t('greeting_prefix')}
              <strong>
                {user.user_metadata?.custom_username && user.user_metadata.custom_username.toLowerCase() !== 'guacho'
                  ? user.user_metadata.custom_username
                  : t('greeting')}
              </strong>
              !{isMobile ? <br /> : ' '}
              {t('greeting_suffix')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
