import React from 'react';
import { Calendar, Scroll } from 'lucide-react';
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
}

export const ProfileHistory: React.FC<ProfileHistoryProps> = ({
  loading,
  history,
  totalPlayed,
  selectedMatch,
  setSelectedMatch,
  formatDate
}) => {
  const { t } = useTranslation();

  return (
    <>
      <h3 className="text-display" style={{ fontSize: '1.2rem', marginBottom: '1.25rem', color: '#fff', letterSpacing: '0.05em' }}>
        {t("match_history")} ({totalPlayed})
      </h3>

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
          />
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

      {/* DETAILED LOG MODAL */}
      <ProfileMatchLogModal
        selectedMatch={selectedMatch}
        setSelectedMatch={setSelectedMatch}
        formatDate={formatDate}
      />
    </>
  );
};
