import React from 'react';
import { Calendar, Scroll, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '../../../shared/EmptyState';
import { ProfileMatchLogModal } from './ProfileMatchLogModal';
import type { MatchSummary } from '../hooks/useProfileData';

interface ProfileHistoryProps {
  loading: boolean;
  history: MatchSummary[];
  totalPlayed: number;
  selectedMatch: MatchSummary | null;
  setSelectedMatch: (match: MatchSummary | null) => void;
  formatDate: (dateStr: string) => string;
  onDeleteMatch?: (id: string) => void;
  onClearAbandoned?: () => void;
}

export const ProfileHistory: React.FC<ProfileHistoryProps> = ({
  loading,
  history,
  totalPlayed,
  selectedMatch,
  setSelectedMatch,
  formatDate,
  onDeleteMatch,
  onClearAbandoned
}) => {
  const { t } = useTranslation();

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <h3 className="text-display" style={{ fontSize: '1.2rem', margin: 0, color: '#fff', letterSpacing: '0.05em' }}>
          {t("match_history")} ({totalPlayed})
        </h3>
        {history.some(m => m.winner === 'abandoned') && onClearAbandoned && (
          <button
            onClick={onClearAbandoned}
            className="btn-hover-dark"
            style={{
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              color: '#fbbf24',
              padding: '0.35rem 0.8rem',
              borderRadius: '0.75rem',
              fontSize: '0.75rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: '2px 2px 0px #000'
            }}
          >
            <Trash2 size={13} />
            {t("clear_abandoned_matches")}
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: '#00f2ff', fontWeight: 'bold' }}>
          {t("loading_history")}
        </div>
      ) : history.length === 0 ? (
        <div style={{ marginBottom: '3rem', marginTop: '-1rem' }}>
          <EmptyState
            icon="🎮"
            title={t("no_matches_yet")}
            description={""}
            color="#00f2ff"
            iconSize="3rem"
            titleSize="1.2rem"
            padding="2.5rem 1.5rem"
          />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '3rem' }}>
          {history.map((match) => {
            const isAbandoned = match.winner === 'abandoned';
            const won = match.winner === 'player';
            
            const badgeBg = isAbandoned ? '#f59e0b' : (won ? '#10b981' : '#ef4848');
            const cardBg = isAbandoned 
              ? 'linear-gradient(to right, rgba(245, 158, 11, 0.08), rgba(255,255,255,0.02))'
              : (won ? 'linear-gradient(to right, rgba(16, 185, 129, 0.08), rgba(255,255,255,0.02))' : 'linear-gradient(to right, rgba(239, 68, 68, 0.08), rgba(255,255,255,0.02))');
            const cardBorder = isAbandoned
              ? '1px solid rgba(245, 158, 11, 0.25)'
              : (won ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(239, 68, 68, 0.25)');
            const shadow = isAbandoned
              ? '0 4px 20px rgba(245, 158, 11, 0.05)'
              : (won ? '0 4px 20px rgba(16, 185, 129, 0.05)' : '0 4px 20px rgba(239, 68, 68, 0.05)');

            return (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: cardBg,
                  border: cardBorder,
                  borderRadius: '2rem',
                  padding: '1.5rem',
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1.25rem',
                  boxShadow: shadow
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                    <span style={{
                      background: badgeBg,
                      color: '#000',
                      fontWeight: 950,
                      fontSize: '0.7rem',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '0.5rem',
                      textTransform: 'uppercase'
                    }}>
                      {isAbandoned ? t("abandoned") : (won ? t("won") : t("lost"))}
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

                {/* Scores & Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ fontSize: '1.75rem', fontWeight: 900 }}>
                    <span style={{ color: won ? '#10b981' : (isAbandoned ? '#fbbf24' : '#fff') }}>{match.myScore}</span>
                    <span style={{ opacity: 0.3, margin: '0 0.5rem' }}>-</span>
                    <span style={{ color: !won && !isAbandoned ? '#ef4848' : (isAbandoned ? '#fbbf24' : '#fff') }}>{match.rivalScore}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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

                    {onDeleteMatch && (
                      <button
                        onClick={() => onDeleteMatch(match.id)}
                        className="btn-hover-dark"
                        style={{
                          background: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.25)',
                          color: '#ef4444',
                          width: '38px',
                          height: '38px',
                          borderRadius: '0.85rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          boxShadow: '3px 3px 0px #000'
                        }}
                        title={t("delete_match")}
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* DETAILED LOG MODAL */}
      <ProfileMatchLogModal
        selectedMatch={selectedMatch}
        setSelectedMatch={setSelectedMatch}
        formatDate={formatDate}
      />
    </>
  );
};
