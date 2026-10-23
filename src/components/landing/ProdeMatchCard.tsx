import React from 'react';
import { Save, Layers } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { FixtureMatch } from '../../lib/fixtureData';
import { isMatchStarted, isMatchFinishedAuto, formatMatchTime } from '../../lib/matchTime';
import { calculateRewardPacks } from '../../lib/prodeRewards';

interface ProdeUser {
  id: string;
  user_metadata?: { nationality?: string };
}

interface ProdeMatchCardProps {
  match: FixtureMatch;
  isMobile: boolean;
  user: ProdeUser | null;
  prediction?: { scoreA: number; scoreB: number; rewarded?: boolean };
  inputScoreA: string;
  inputScoreB: string;
  isSaving: boolean;
  codeStatus?: { total: number; used: number };
  onInputChange: (matchId: string, field: 'scoreA' | 'scoreB', value: string) => void;
  onSave: (matchId: string) => void;
  onClaim: (matchId: string, packs: number, teamA: string, teamB: string) => void;
  onViewRewards: (matchId: string, packs: number, teamA: string, teamB: string) => void;
}

export const ProdeMatchCard: React.FC<ProdeMatchCardProps> = ({
  match, isMobile, user, prediction, inputScoreA, inputScoreB,
  isSaving, codeStatus, onInputChange, onSave, onClaim, onViewRewards
}) => {
  const { t, i18n } = useTranslation();

  const userNationality = user?.user_metadata?.nationality || 'Argentina';
  const isMyTeam = userNationality && (match.teamA === userNationality || match.teamB === userNationality);
  const started = isMatchStarted(match.date, match.time, match.status);
  const finishedAuto = isMatchFinishedAuto(match.date, match.time);
  const hasPrediction = !!prediction;
  const locked = started || hasPrediction || match.group === '16vos de final';
  const pScoreA = prediction?.scoreA;
  const pScoreB = prediction?.scoreB;
  const isRewarded = prediction?.rewarded;
  const inScoreA = inputScoreA;
  const inScoreB = inputScoreB;

  let packsWon = 0;
  let wonExact = false;
  if (match.status?.startsWith('finished') && hasPrediction) {
    const result = calculateRewardPacks(pScoreA!, pScoreB!, match.scoreA!, match.scoreB!);
    packsWon = result.packs;
    wonExact = result.wonExact;
  }

  const allCodesUsed = codeStatus && codeStatus.total > 0 && codeStatus.total === codeStatus.used;

  const renderActionButton = () => {
    if (!locked && !match.status?.startsWith('finished')) {
      return (
        <button
          disabled={!user || isSaving || inScoreA === '' || inScoreB === ''}
          onClick={() => onSave(match.id)}
          style={{ background: '#00f2ff', color: '#000', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontWeight: 800, cursor: (!user || isSaving || inScoreA === '' || inScoreB === '') ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: (!user || isSaving || inScoreA === '' || inScoreB === '') ? 0.5 : 1, ...(isMobile ? { width: '100%', justifyContent: 'center', marginTop: '1rem' } : {}) }}
        >
          <Save size={16} /> <span>{isMobile ? t("save_prediction") : t("save")}</span>
        </button>
      );
    }

    if (match.status?.startsWith('finished')) {
      if (packsWon > 0 && !isRewarded) {
        return (
          <button
            onClick={() => onClaim(match.id, packsWon, match.teamA, match.teamB)}
            className="btn-hover-dark"
            style={{ background: '#ff8c00', color: '#000', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', ...(isMobile ? { justifyContent: 'center', width: '100%', marginTop: '1rem' } : {}) }}
          >
            <Layers size={16} /> <span>{isMobile ? t('claim_reward', 'Reclamar Recompensa') : t('claim', 'Reclamar')}</span>
          </button>
        );
      }
      if (packsWon > 0 && isRewarded) {
        return (
          <button
            onClick={() => { if (!allCodesUsed) onViewRewards(match.id, packsWon, match.teamA, match.teamB); }}
            className={allCodesUsed ? "" : "btn-hover-dark"}
            disabled={!!allCodesUsed}
            style={{
              background: allCodesUsed ? 'rgba(255, 140, 0, 0.05)' : 'rgba(255, 140, 0, 0.2)',
              color: allCodesUsed ? 'rgba(255, 140, 0, 0.5)' : '#ff8c00',
              border: allCodesUsed ? '1px solid rgba(255, 140, 0, 0.2)' : '1px solid rgba(255, 140, 0, 0.5)',
              padding: '0.5rem 1rem', borderRadius: '0.5rem', fontWeight: 800,
              cursor: allCodesUsed ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
              ...(isMobile ? { justifyContent: 'center', width: '100%', marginTop: '1rem' } : {})
            }}
          >
            <Layers size={16} /> <span>{t('claimed', 'Reclamado')}</span>
          </button>
        );
      }
      // No packs won — show final result
      if (isMobile) {
        return (
          <div style={{ marginTop: '1rem', color: '#00f2ff', fontSize: '1rem', fontWeight: 900, textTransform: 'uppercase', textAlign: 'center', width: '100%' }}>
            {t("final_result").toUpperCase()}: {match.scoreA} - {match.scoreB}
          </div>
        );
      }
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', opacity: 0.5, fontWeight: 700 }}>{t("final_result")}</span>
          <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#00f2ff' }}>{match.scoreA} - {match.scoreB}</span>
        </div>
      );
    }

    // Locked but not finished
    if (hasPrediction) {
      return (
        <button
          disabled
          style={{ background: 'rgba(0, 230, 118, 0.2)', color: '#00e676', border: '1px solid rgba(0, 230, 118, 0.5)', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontWeight: 800, cursor: 'not-allowed', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.8, ...(isMobile ? { width: '100%', justifyContent: 'center', marginTop: '1rem' } : {}) }}
        >
          <Save size={16} /> <span>{t('saved', 'Guardado')}</span>
        </button>
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: isMobile ? '100%' : 'auto', marginTop: isMobile ? '0.5rem' : '-0.25rem' }}>
        <span style={{ fontSize: isMobile ? '0.85rem' : '1rem', fontWeight: 900, color: '#ffffff', textAlign: 'center', textTransform: 'uppercase', lineHeight: 1.1, marginBottom: '0.25rem' }}>{finishedAuto ? t("match_finished") : t("match_started")}</span>
        <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', opacity: 0.5, fontWeight: 700, textAlign: 'center' }}>{t("waiting_result")}</span>
      </div>
    );
  };

  return (
    <div style={{
      background: 'rgba(20, 20, 25, 0.8)', border: isMyTeam ? '2px solid #00f2ff' : '1px solid rgba(255, 255, 255, 0.05)', boxShadow: isMyTeam ? '0 0 15px rgba(0, 242, 255, 0.2)' : 'none', borderRadius: '1rem', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '1rem' : '2rem', alignItems: isMobile ? 'flex-start' : 'center', transition: 'all 0.2s ease', cursor: 'default'
    }}>
      {/* Time & Group */}
      <div style={{ flex: isMobile ? 'none' : '0 0 120px', display: 'flex', flexDirection: isMobile ? 'row' : 'column', gap: isMobile ? '0.75rem' : '0.25rem', alignItems: isMobile ? 'center' : 'flex-start', justifyContent: isMobile ? 'space-between' : 'flex-start', width: isMobile ? '100%' : 'auto', opacity: 0.8 }}>
        <span style={{ fontSize: '1rem', fontWeight: 800 }}>{formatMatchTime(match.date, match.time, i18n.language).localTime}</span>
        <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>{match.group.replace('Group', t('group'))}</span>
      </div>

      {/* Teams & Score Inputs */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: isMobile ? '100%' : 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, justifyContent: 'flex-end' }}>
          <span style={{ fontWeight: 700, fontSize: isMobile ? '0.9rem' : '1.1rem', textAlign: 'right' }}>{t("country_" + match.teamA.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(), match.teamA)}</span>
          <span style={{ fontSize: '1.5rem', width: '32px', textAlign: 'center' }}>{match.flagA}</span>
        </div>

        <div style={{ padding: '0 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: '80px', gap: '0.25rem' }}>
          {match.status?.startsWith('finished') && packsWon > 0 && (
            <div style={{ color: '#00e676', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', textAlign: 'center', whiteSpace: 'nowrap' }}>
              {wonExact ? t("exact_result_won") : t("winner_result_won")}
            </div>
          )}
          {!match.status?.startsWith('finished') && started && hasPrediction && (
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', textAlign: 'center', whiteSpace: 'nowrap' }}>
              {t("waiting_result")}
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {!hasPrediction && (locked || match.status?.startsWith('finished') || finishedAuto || !user) ? (
              <>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: 'rgba(255, 255, 255, 0.45)',
                    borderRadius: '0.5rem',
                    fontWeight: 800,
                    fontSize: '1.1rem',
                    userSelect: 'none',
                  }}
                  title={t("no_prediction", "No participó")}
                >
                  N
                </div>
                <span style={{ fontWeight: 800, color: 'rgba(255,255,255,0.3)' }}>-</span>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: 'rgba(255, 255, 255, 0.45)',
                    borderRadius: '0.5rem',
                    fontWeight: 800,
                    fontSize: '1.1rem',
                    userSelect: 'none',
                  }}
                  title={t("no_prediction", "No participó")}
                >
                  N
                </div>
              </>
            ) : (
              <>
                <input
                  type="text" inputMode="numeric" maxLength={1} disabled={locked || !user}
                  aria-label={`${match.teamA} score`}
                  value={hasPrediction ? pScoreA : inScoreA}
                  onChange={(e) => onInputChange(match.id, 'scoreA', e.target.value.replace(/[^0-9]/g, '').slice(0, 1))}
                  style={{ width: '40px', height: '40px', textAlign: 'center', padding: 0, background: (locked || !user) ? 'transparent' : 'rgba(0,0,0,0.5)', border: (locked || !user) ? 'none' : '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '0.5rem', fontWeight: 800, fontSize: '1.2rem' }}
                />
                <span style={{ fontWeight: 800, color: 'rgba(255,255,255,0.4)' }}>-</span>
                <input
                  type="text" inputMode="numeric" maxLength={1} disabled={locked || !user}
                  aria-label={`${match.teamB} score`}
                  value={hasPrediction ? pScoreB : inScoreB}
                  onChange={(e) => onInputChange(match.id, 'scoreB', e.target.value.replace(/[^0-9]/g, '').slice(0, 1))}
                  style={{ width: '40px', height: '40px', textAlign: 'center', padding: 0, background: (locked || !user) ? 'transparent' : 'rgba(0,0,0,0.5)', border: (locked || !user) ? 'none' : '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '0.5rem', fontWeight: 800, fontSize: '1.2rem' }}
                />
              </>
            )}
          </div>
          {match.status?.startsWith('finished') && packsWon > 0 && (
            <div style={{ color: '#ff8c00', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', textAlign: 'center', whiteSpace: 'nowrap' }}>
              {packsWon === 1 ? t("you_won_packs_one") : t("you_won_packs_other", { count: packsWon })}
            </div>
          )}
          {!match.status?.startsWith('finished') && started && hasPrediction && (
            <div style={{ color: '#ffffff', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', textAlign: 'center', whiteSpace: 'nowrap', marginTop: '0.25rem' }}>
              {finishedAuto ? t("match_finished") : t("match_started")}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, justifyContent: 'flex-start' }}>
          <span style={{ fontSize: '1.5rem', width: '32px', textAlign: 'center' }}>{match.flagB}</span>
          <span style={{ fontWeight: 700, fontSize: isMobile ? '0.9rem' : '1.1rem', textAlign: 'left' }}>{t("country_" + match.teamB.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(), match.teamB)}</span>
        </div>
      </div>

      {/* Action Button */}
      {!isMobile && (
        <div style={{ flex: '0 0 150px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          {renderActionButton()}
        </div>
      )}
      {isMobile && renderActionButton()}
    </div>
  );
};
