import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star } from 'lucide-react';
import { CARDS } from '../../data/cards';

interface UserStarsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  userEmail: string;
  votes: Record<string, number>;
}

const flagMap: Record<string, string> = {
  'Argentina': '🇦🇷',
  'Francia': '🇫🇷',
  'España': '🇪🇸',
  'Nueva Zelanda': '🇳🇿',
  'Brasil': '🇧🇷',
  'Argelia': '🇩🇿'
};

export const UserStarsModal: React.FC<UserStarsModalProps> = ({
  isOpen,
  onClose,
  userName,
  userEmail,
  votes
}) => {
  if (!isOpen) return null;

  const votedItems = Object.entries(votes)
    .filter(([_, count]) => count > 0)
    .map(([cardId, count]) => {
      const card = CARDS.find(c => c.id === cardId);
      return {
        id: cardId,
        count,
        name: card?.name || cardId.toUpperCase(),
        country: card?.country || '',
        flag: card ? (flagMap[card.country] || '🏳️') : '🏳️',
        image: card?.image || '',
        stickerNumber: card?.stickerNumber || ''
      };
    })
    .sort((a, b) => b.count - a.count);

  const totalStars = votedItems.reduce((sum, item) => sum + item.count, 0);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 4100,
          padding: '1rem'
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          onClick={e => e.stopPropagation()}
          style={{
            background: 'rgba(18, 12, 28, 0.98)',
            border: '1px solid rgba(168, 85, 247, 0.3)',
            borderRadius: '2rem',
            padding: '2rem',
            width: '100%',
            maxWidth: '540px',
            maxHeight: '80vh',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)'
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 className="text-display" style={{ margin: 0, fontSize: '1.3rem', color: '#a855f7', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Star size={20} fill="#a855f7" /> Estrellas Distribuidas
              </h3>
              <div style={{ opacity: 0.7, fontSize: '0.85rem', marginTop: '0.3rem', fontWeight: 600 }}>
                {userName} <span style={{ opacity: 0.5, fontWeight: 400 }}>({userEmail || 'Sin Email'})</span>
              </div>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', opacity: 0.8, transition: 'opacity 0.2s' }} className="btn-hover-dark">
              <X size={22} />
            </button>
          </div>

          {/* Subheader info: count */}
          <div style={{
            background: 'rgba(168, 85, 247, 0.1)',
            border: '1px solid rgba(168, 85, 247, 0.2)',
            borderRadius: '1rem',
            padding: '0.75rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.9rem',
            fontWeight: 800,
            color: '#c084fc'
          }}>
            <span>Total Distribuido:</span>
            <span style={{ fontSize: '1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Star size={16} fill="var(--color-accent)" color="var(--color-accent)" /> {totalStars} / 100
            </span>
          </div>

          {/* Stars List */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.6rem',
            overflowY: 'auto',
            flex: 1,
            paddingRight: '0.5rem'
          }} className="team-selection-list">
            {votedItems.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '3rem 1rem',
                opacity: 0.4,
                fontSize: '0.9rem',
                fontStyle: 'italic'
              }}>
                Este usuario no ha asignado estrellas en el ranking todavía.
              </div>
            ) : (
              votedItems.map((item) => (
                <div key={item.id} style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '1rem',
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {/* Thumbnail */}
                    {item.image ? (
                      <div style={{
                        width: '42px',
                        height: '56px',
                        backgroundImage: `url(${item.image})`,
                        backgroundSize: '100% 100%',
                        borderRadius: '0.35rem',
                        border: '1.5px solid rgba(255, 255, 255, 0.2)',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                        flexShrink: 0
                      }} />
                    ) : (
                      <div style={{
                        width: '42px',
                        height: '56px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '0.35rem',
                        border: '1.5px dashed rgba(255, 255, 255, 0.2)',
                        flexShrink: 0
                      }} />
                    )}
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#fff' }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: '0.7rem', opacity: 0.6, marginTop: '0.15rem' }}>
                        {item.flag} {item.country} {item.stickerNumber && `· ${item.stickerNumber}`}
                      </div>
                    </div>
                  </div>

                  <div style={{
                    background: 'rgba(254, 240, 138, 0.1)',
                    border: '1px solid rgba(254, 240, 138, 0.2)',
                    borderRadius: '0.75rem',
                    padding: '0.4rem 0.75rem',
                    fontWeight: 900,
                    fontSize: '0.9rem',
                    color: 'var(--color-accent)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}>
                    <Star size={14} fill="var(--color-accent)" /> {item.count}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Action */}
          <div style={{ display: 'flex', justifyContent: 'center', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.25rem' }}>
            <button
              onClick={onClose}
              className="btn-urban secondary"
              style={{
                width: '100%',
                height: '42px',
                borderRadius: '0.85rem',
                fontSize: '0.95rem',
                fontWeight: 900,
                border: 'none',
                boxShadow: '4px 4px 0px #000'
              }}
            >
              Cerrar
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
