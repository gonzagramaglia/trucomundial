import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Layers, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getAppRoute } from '../../lib/assets';

interface RewardCode {
  code: string;
  used: boolean;
}

interface ProdeRewardModalProps {
  codes: RewardCode[];
  matchDesc: string;
  packs: number;
  isMobile: boolean;
  onClose: () => void;
}

export const ProdeRewardModal: React.FC<ProdeRewardModalProps> = ({
  codes, matchDesc, packs, isMobile, onClose
}) => {
  const { t } = useTranslation();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="reward-modal-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', padding: '1rem' }}
    >
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ background: 'rgba(26, 26, 46, 0.85)', backdropFilter: 'blur(16px)', padding: '2.5rem', borderRadius: '1.5rem', maxWidth: '600px', width: '100%', textAlign: 'center', border: '1px solid rgba(255, 140, 0, 0.3)', boxShadow: '0 0 30px rgba(255, 140, 0, 0.15)' }}>
        <h2 id="reward-modal-title" style={{ color: '#ff8c00', marginTop: 0, marginBottom: '0.5rem', fontSize: '2rem', textTransform: 'uppercase', textShadow: '0 0 10px rgba(255, 140, 0, 0.5)' }}>{t('prode_congratulations')}</h2>
        <p style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '0.75rem' }}>
          {t('prode_prediction_success')} <strong>{matchDesc}</strong> {t('prode_prediction_packs_won')} <strong>{packs} {packs === 1 ? t('prode_prediction_pack_single') : t('prode_prediction_packs_plural')}</strong> {t('prode_prediction_for_deck')}
        </p>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', marginBottom: '1rem' }}>
          {packs === 1 ? (
            <>{t('prode_reward_code_single')} <a href={getAppRoute("/mazo")} target="_blank" rel="noopener noreferrer" style={{ color: '#ff8c00', textDecoration: 'none', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '0.2rem', verticalAlign: 'middle' }} className="hover-underline"><ExternalLink size={14} />{t('prode_deck_screen')}</a>!</>
          ) : (
            <>{t('prode_reward_code_plural')} <a href={getAppRoute("/mazo")} target="_blank" rel="noopener noreferrer" style={{ color: '#ff8c00', textDecoration: 'none', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '0.2rem', verticalAlign: 'middle' }} className="hover-underline"><ExternalLink size={14} />{t('prode_deck_screen')}</a>!</>
          )}
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: codes.length === 1 ? 'minmax(180px, 250px)' : 'repeat(3, 1fr)', justifyContent: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
          {codes.map((item, idx) => (
            <div key={idx} style={{ background: 'rgba(0,0,0,0.5)', padding: isMobile ? '0.75rem 0.25rem' : '1rem 0.5rem', borderRadius: '0.75rem', border: '1px dashed rgba(255, 140, 0, 0.4)', fontSize: isMobile ? '1.1rem' : '1.35rem', fontWeight: 900, letterSpacing: isMobile ? '0.05em' : '0.1em', color: item.used ? 'rgba(255,255,255,0.3)' : '#fff', textDecoration: item.used ? 'line-through' : 'none', position: 'relative' }}>
              {item.code}
              {item.used && <div style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#ff4444', color: '#fff', fontSize: '0.6rem', padding: '0.2rem 0.4rem', borderRadius: '0.5rem', fontWeight: 'bold' }}>{t('prode_used')}</div>}
            </div>
          ))}
        </div>
        <button
          ref={closeRef}
          onClick={onClose}
          className="btn-hover-dark"
          style={{ width: '100%', background: '#ff8c00', color: '#000', border: 'none', padding: '1rem', borderRadius: '1rem', fontSize: '1.1rem', fontWeight: 900, cursor: 'pointer', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
        >
          <Layers size={20} />
          {t('prode_understood')}
        </button>
      </motion.div>
    </div>
  );
};
