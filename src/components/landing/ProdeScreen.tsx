import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Globe, Search, Home, Trophy, Save, AlertCircle, Layers, Star, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { WorldCupBracket } from './WorldCupBracket';
import { GroupStandings } from './GroupStandings';
import { TwitchButton } from '../shared/TwitchButton';
import { fixtureMatches } from '../../lib/fixtureData';
import type { FixtureMatch } from '../../lib/fixtureData';
import { supabase } from '../../lib/supabase';
import { audioManager } from '../../lib/audio';
import { UtilityButtons } from '../shared/UtilityButtons';

type TabType = 'groups' | 'round_32' | 'round_16' | 'quarterfinals' | 'semifinals' | 'final';

interface ProdeScreenProps {
  user?: any;
  handleAuth: () => void;
  onBack: () => void;
}

const months: Record<string, number> = {
  "enero": 0, "febrero": 1, "marzo": 2, "abril": 3, "mayo": 4, "junio": 5,
  "julio": 6, "agosto": 7, "septiembre": 8, "octubre": 9, "noviembre": 10, "diciembre": 11
};

export const isMatchStarted = (dateStr: string, timeStr: string, matchStatus: string): boolean => {
  if (matchStatus === 'live' || matchStatus === 'finished') return true;
  const dateParts = dateStr.split(" ");
  if (dateParts.length >= 4) {
    const day = parseInt(dateParts[1]);
    const monthStr = dateParts[3].toLowerCase();
    const month = months[monthStr];
    if (!isNaN(day) && month !== undefined) {
      const timeParts = timeStr.split(" ");
      let hour = 0;
      let min = 0;
      if (timeStr.includes("hs")) {
        const [h, m] = timeParts[0].split(":");
        hour = parseInt(h);
        min = parseInt(m || "0");
      } else {
        const [h, m] = timeParts[0].split(":");
        hour = parseInt(h);
        min = parseInt(m);
        const ampm = timeParts[1]?.toLowerCase() + " " + timeParts[2]?.toLowerCase();
        if (ampm.includes("p. m.") && hour < 12) hour += 12;
        if (ampm.includes("a. m.") && hour === 12) hour = 0;
      }
      // Parse as UTC-3 (Argentina time) by adding 3 hours to get UTC
      const matchDate = new Date(Date.UTC(2026, month, day, hour + 3, min, 0));
      return new Date() >= matchDate;
    }
  }
  return false;
};

export const isMatchFinishedAuto = (dateStr: string, timeStr: string): boolean => {
  const dateParts = dateStr.split(" ");
  if (dateParts.length >= 4) {
    const day = parseInt(dateParts[1]);
    const monthStr = dateParts[3].toLowerCase();
    const month = months[monthStr];
    if (!isNaN(day) && month !== undefined) {
      const timeParts = timeStr.split(" ");
      let hour = 0;
      let min = 0;
      if (timeStr.includes("hs")) {
        const [h, m] = timeParts[0].split(":");
        hour = parseInt(h);
        min = parseInt(m || "0");
      } else {
        const [h, m] = timeParts[0].split(":");
        hour = parseInt(h);
        min = parseInt(m);
        const ampm = timeParts[1]?.toLowerCase() + " " + timeParts[2]?.toLowerCase();
        if (ampm.includes("p. m.") && hour < 12) hour += 12;
        if (ampm.includes("a. m.") && hour === 12) hour = 0;
      }
      // Parse as UTC-3 (Argentina time) by adding 3 hours to get UTC
      const matchDate = new Date(Date.UTC(2026, month, day, hour + 3, min, 0));
      const finishedDate = new Date(matchDate.getTime() + 2 * 60 * 60 * 1000);
      return new Date() >= finishedDate;
    }
  }
  return false;
};

export const formatMatchTime = (dateStr: string, timeStr: string, language: string = 'es') => {
  const dateParts = dateStr.split(" ");
  if (dateParts.length < 4) return { localDate: dateStr, localTime: timeStr };

  const day = parseInt(dateParts[1]);
  const monthStr = dateParts[3].toLowerCase();
  const month = months[monthStr];

  if (isNaN(day) || month === undefined) return { localDate: dateStr, localTime: timeStr };

  const timeParts = timeStr.split(" ");
  let hour = 0;
  let min = 0;

  if (timeStr.includes("hs")) {
    const [h, m] = timeParts[0].split(":");
    hour = parseInt(h);
    min = parseInt(m || "0");
  } else {
    const [h, m] = timeParts[0].split(":");
    hour = parseInt(h);
    min = parseInt(m);
    const ampm = timeParts[1]?.toLowerCase() + " " + timeParts[2]?.toLowerCase();
    if (ampm.includes("p. m.") && hour < 12) hour += 12;
    if (ampm.includes("a. m.") && hour === 12) hour = 0;
  }

  // Create Date object assuming original time is UTC-3
  const matchDate = new Date(Date.UTC(2026, month, day, hour + 3, min, 0));

  const localeStr = language === 'en' ? 'en-US' : 'es-ES';
  let localDateStr = matchDate.toLocaleDateString(localeStr, { weekday: 'short', day: 'numeric', month: 'short' });
  localDateStr = localDateStr.charAt(0).toUpperCase() + localDateStr.slice(1).replace('.', ',');
  const localTimeSuffix = language === 'en' ? '' : ' hs';
  const localTimeStr = matchDate.toLocaleTimeString(localeStr, { hour: '2-digit', minute: '2-digit' }) + localTimeSuffix;

  return { localDate: localDateStr, localTime: localTimeStr };
};

export const ProdeScreen: React.FC<ProdeScreenProps> = ({ user, handleAuth, onBack }) => {
  const { t, i18n } = useTranslation();
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  const [activeTab, setActiveTab] = useState<TabType>('round_16');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFinishedOnly, setShowFinishedOnly] = useState(false);
  const [liveResults, setLiveResults] = useState<Record<string, { scoreA: number, scoreB: number, status: string }>>({});

  // Prode states
  const [predictions, setPredictions] = useState<Record<string, { scoreA: number, scoreB: number, rewarded?: boolean }>>({});
  const [inputs, setInputs] = useState<Record<string, { scoreA: string, scoreB: string }>>({});
  const [isSaving, setIsSaving] = useState<Record<string, boolean>>({});
  const [rewardCodesModal, setRewardCodesModal] = useState<{ codes: { code: string, used: boolean }[], matchDesc: string, packs: number } | null>(null);
  const [usedCodesStatus, setUsedCodesStatus] = useState<Record<string, { total: number, used: number }>>({});

  const hideSpinnersCSS = `
    input[type=number]::-webkit-inner-spin-button, 
    input[type=number]::-webkit-outer-spin-button { 
      -webkit-appearance: none; 
      margin: 0; 
    }
    input[type=number] {
      -moz-appearance: textfield;
    }
  `;

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
      } catch (err) { }
    };
    fetchResults();
  }, []);

  useEffect(() => {
    const fetchPredictions = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase.from('prode_predictions').select('*').eq('user_id', user.id);
        if (!error && data) {
          const map: Record<string, any> = {};
          const inputMap: Record<string, any> = {};
          data.forEach(p => {
            map[p.match_id] = { scoreA: p.score_a, scoreB: p.score_b, rewarded: p.rewarded };
            inputMap[p.match_id] = { scoreA: p.score_a.toString(), scoreB: p.score_b.toString() };
          });
          setPredictions(map);
          setInputs(prev => ({ ...prev, ...inputMap }));
        }
      } catch (e) { }
    };
    fetchPredictions();
  }, [user]);

  useEffect(() => {
    const fetchCodes = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase.from('reward_codes').select('source, used').eq('user_id', user.id).like('source', 'prode_match_%');
        if (data && !error) {
           const statusMap: Record<string, { total: number, used: number }> = {};
           data.forEach(c => {
              const matchId = c.source.replace('prode_match_', '');
              if (!statusMap[matchId]) statusMap[matchId] = { total: 0, used: 0 };
              statusMap[matchId].total += 1;
              if (c.used) statusMap[matchId].used += 1;
           });
           setUsedCodesStatus(statusMap);
        }
      } catch (e) {}
    }
    fetchCodes();
  }, [user]);

  useEffect(() => {
    const checkRewards = async () => {
      if (!user || Object.keys(liveResults).length === 0 || Object.keys(predictions).length === 0) return;

      for (const matchId in predictions) {
        const pred = predictions[matchId];
        const res = liveResults[matchId];
        if (res && res.status?.startsWith('finished') && !pred.rewarded) {
          const exactMatch = pred.scoreA === res.scoreA && pred.scoreB === res.scoreB;
          const predWinner = pred.scoreA > pred.scoreB ? 'A' : (pred.scoreA < pred.scoreB ? 'B' : 'Draw');
          const resWinner = res.scoreA > res.scoreB ? 'A' : (res.scoreA < res.scoreB ? 'B' : 'Draw');
          const normalMatch = predWinner === resWinner;

          let packs = 0;
          if (exactMatch) packs = 3;
          else if (normalMatch) packs = 1;

          // If packs is 0, we can mark it as rewarded so we don't check again.
          // If packs > 0, we wait for the user to manually claim it!
          if (packs === 0) {
            await supabase.from('prode_predictions').update({ rewarded: true }).eq('user_id', user.id).eq('match_id', matchId);
            setPredictions(prev => ({ ...prev, [matchId]: { ...prev[matchId], rewarded: true } }));
          }
        }
      }
    };

    checkRewards();
  }, [liveResults, predictions, user]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSavePrediction = async (matchId: string) => {
    if (!user) {
      alert(t("error_login_save_pred"));
      return;
    }
    const matchInput = inputs[matchId];
    if (!matchInput || matchInput.scoreA === '' || matchInput.scoreB === '') {
      alert(t("error_complete_both_results"));
      return;
    }
    const scoreA = parseInt(matchInput.scoreA);
    const scoreB = parseInt(matchInput.scoreB);
    if (isNaN(scoreA) || isNaN(scoreB)) return;

    setIsSaving(prev => ({ ...prev, [matchId]: true }));
    try {
      const { error } = await supabase.from('prode_predictions').upsert({
        user_id: user.id,
        match_id: matchId,
        score_a: scoreA,
        score_b: scoreB,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,match_id' });

      if (!error) {
        setPredictions(prev => ({ ...prev, [matchId]: { scoreA, scoreB } }));
      } else {
        console.error("Error completo de Supabase:", error);
        alert(`${t("error_save_prediction")} ${error.message}\n(Revisá la consola para más detalles)`);
      }
    } catch (err) {
      alert(t("error_connection"));
    }
    setIsSaving(prev => ({ ...prev, [matchId]: false }));
  };

  const handleClaimReward = async (matchId: string, packs: number, teamA: string, teamB: string) => {
    if (!user) return;
    const generatedCodes = [];
    for (let i = 0; i < packs; i++) {
      const code = Math.random().toString(36).substring(2, 6).toUpperCase();
      generatedCodes.push(code);
    }

    const codeInserts = generatedCodes.map(code => ({
      code,
      user_id: user.id,
      used: false,
      source: `prode_match_${matchId}`
    }));

    const { error } = await supabase.from('reward_codes').insert(codeInserts);
    if (!error) {
      await supabase.from('prode_predictions').update({ rewarded: true }).eq('user_id', user.id).eq('match_id', matchId);
      setPredictions(prev => ({ ...prev, [matchId]: { ...prev[matchId], rewarded: true } }));

      setUsedCodesStatus(prev => ({ ...prev, [matchId]: { total: packs, used: 0 } }));

      setRewardCodesModal({
        codes: generatedCodes.map(c => ({ code: c, used: false })),
        matchDesc: `${teamA} vs ${teamB}`,
        packs: packs
      });
    } else {
      alert(t("error_claim_reward"));
    }
  };

  const handleViewRewards = async (matchId: string, packs: number, teamA: string, teamB: string) => {
    if (!user) return;
    const { data, error } = await supabase.from('reward_codes').select('code, used').eq('user_id', user.id).eq('source', `prode_match_${matchId}`);

    if (data && !error) {
      setRewardCodesModal({
        codes: data.map(d => ({ code: d.code, used: d.used })),
        matchDesc: `${teamA} vs ${teamB}`,
        packs: packs
      });
    } else {
      alert(t("error_get_codes"));
    }
  };

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

    if (activeTab === 'groups') {
      filtered = filtered.filter(m => m.group.startsWith('Group'));
    } else if (activeTab === 'round_32') {
      filtered = filtered.filter(m => m.group === '16vos de final');
    } else if (activeTab === 'round_16') {
      filtered = filtered.filter(m => m.group === 'Octavos de final');
    } else {
      filtered = [];
    }

    if (searchQuery) {
      const removeAccents = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const q = removeAccents(searchQuery.toLowerCase());
      const groupSearch = q.replace('grupo', 'group');
      filtered = filtered.filter(m =>
        removeAccents(m.teamA.toLowerCase()).includes(q) ||
        removeAccents(m.teamB.toLowerCase()).includes(q) ||
        removeAccents(m.group.toLowerCase()).includes(q) ||
        removeAccents(m.group.toLowerCase()).includes(groupSearch) ||
        removeAccents(m.date.toLowerCase()).includes(q)
      );
    }

    if (showFinishedOnly) {
      filtered = filtered.filter(m => m.status?.startsWith('finished'));
    }

    filtered.sort((a, b) => {
      const aFinished = a.status?.startsWith('finished') ? 1 : 0;
      const bFinished = b.status?.startsWith('finished') ? 1 : 0;
      return aFinished - bFinished;
    });

    const groups: { [date: string]: FixtureMatch[] } = {};
    filtered.forEach(match => {
      const { localDate } = formatMatchTime(match.date, match.time, i18n.language);
      if (!groups[localDate]) {
        groups[localDate] = [];
      }
      groups[localDate].push(match);
    });

    return Object.keys(groups).map(date => ({
      date,
      matches: groups[date]
    }));
  }, [searchQuery, liveResults, showFinishedOnly, activeTab]);

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
      <style>{hideSpinnersCSS}</style>
      {!isMobile && (
        <button
          onClick={onBack}
          className="home-btn-fixed btn-hover-dark profile-nav-btn"
          style={{
            position: "fixed", top: "1.5rem", left: "1.5rem", background: "rgba(255, 255, 255, 0.1)", backdropFilter: "blur(12px)", zIndex: 2000, height: "40px", borderRadius: "1rem", padding: "0 1.25rem", display: "flex", alignItems: "center", gap: "0.5rem", color: "white", border: "1px solid rgba(255, 255, 255, 0.2)", boxShadow: "none", fontWeight: 900, fontSize: "0.75rem", letterSpacing: "0.05em", textTransform: "uppercase", cursor: "pointer"
          }}
        >
          <Home size={18} />
          <span>{t("home")}</span>
        </button>
      )}

      {!isMobile && <UtilityButtons />}

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: isMobile ? '1.5rem' : '2.5rem', width: '100%', position: 'relative' }}>
        {isMobile && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: '0.75rem', marginBottom: '1rem' }}>
            <button
              onClick={onBack}
              className="btn-hover-dark"
              style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)', color: 'white', height: '36px', borderRadius: '0.75rem', padding: '0 0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer', boxShadow: '3px 3px 0px #000' }}
            >
              <Home size={14} />
              {t("home")}
            </button>
            <UtilityButtons isMobile={true} />
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Calendar size={isMobile ? 28 : 36} style={{ color: '#ffffff', filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.3))' }} />
            <h2 className="text-display" style={{ fontSize: isMobile ? '1.6rem' : '2.2rem', margin: 0, letterSpacing: '0.05em', color: '#ffffff', textShadow: '0 0 15px rgba(255, 255, 255, 0.2)' }}>
              {t("prode_title")}
            </h2>
          </div>
          <p style={{ fontSize: '0.95rem', opacity: 0.65, margin: '4px 0 0 0', fontWeight: 600 }}>
            {t("prode_subtitle")}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '0.75rem', marginBottom: '1rem', overflowX: 'auto', paddingBottom: '0.5rem', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <div style={{ display: 'flex', gap: '0.5rem', width: 'max-content', margin: '0 auto', padding: '0 2px' }}>
          {renderTab('groups', t('group_stage'), Globe)}
          {renderTab('round_32', t('round_of_32'), Trophy)}
          {renderTab('round_16', t('round_of_16'), Trophy)}
          {renderTab('quarterfinals', t('quarterfinals'), Trophy)}
          {renderTab('semifinals', t('semifinals'), Trophy)}
          {renderTab('final', t('final'), Trophy)}
        </div>
      </div>

      {!user && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            position: 'sticky',
            top: '1rem',
            zIndex: 3000,
            background: 'linear-gradient(135deg, rgba(0, 242, 255, 0.15), rgba(0, 242, 255, 0.05))',
            border: '2px dashed rgba(0, 242, 255, 0.4)',
            borderRadius: '2rem', padding: '1.5rem 2rem', marginBottom: '1rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem', backdropFilter: 'blur(16px)'
          }}
        >
          <div style={{ flex: '1 1 300px' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#00f2ff', fontSize: '1.1rem', fontWeight: 900 }}>
              {t("prode_login_title")}
            </h3>
            <p style={{ margin: 0, opacity: 0.8, fontSize: '0.9rem', lineHeight: 1.5, maxWidth: isMobile ? '400px' : 'none' }}>
              {t("prode_login_desc")}
            </p>
          </div>
          <button
            onClick={handleAuth}
            className="btn-hover-dark"
            style={{
              background: '#00f2ff',
              border: 'none',
              color: '#000',
              height: '46px',
              borderRadius: '1.25rem',
              padding: '0 1.5rem',
              fontSize: '0.9rem',
              fontWeight: 950,
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              cursor: 'pointer',
              boxShadow: '4px 4px 0px #000',
              marginTop: isMobile ? '-0.5rem' : 0,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" style={{ fill: 'currentColor' }}>
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {t('login_with_google')}
          </button>
        </motion.div>
      )}

      {/* Rewards Banner */}
      <div style={{
        background: 'rgba(255, 140, 0, 0.1)', border: '1px solid rgba(255, 140, 0, 0.3)', borderRadius: '1rem', padding: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem',
      }}>
        <AlertCircle size={24} color="#ff8c00" style={{ flexShrink: 0 }} />
        <div>
          <h4 style={{ margin: '0 0 0.25rem 0', color: '#ff8c00' }}>{t("prode_rewards_title")}</h4>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>
            <span dangerouslySetInnerHTML={{ __html: t("prode_rewards_desc_1") }} />
            <span dangerouslySetInnerHTML={{ __html: t("prode_rewards_desc_2") }} />
            {t("prode_rewards_desc_3")}<a href="/mazo" style={{ color: '#ff8c00', fontWeight: 900, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.2rem', verticalAlign: 'middle' }}><ExternalLink size={14} />{t("prode_build_deck_link")}</a>.
          </p>
        </div>
      </div>

      {/* NEW FIXTURE STARS INFO BOX */}
      <div style={{
        background: 'rgba(255, 223, 0, 0.1)',
        border: '1px solid rgba(255, 223, 0, 0.3)',
        borderRadius: '12px',
        padding: '1rem',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '1rem',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <div style={{
          background: 'rgba(255, 223, 0, 0.2)',
          borderRadius: '50%',
          width: '36px',
          height: '36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <Star size={20} color="#ffdf00" />
        </div>
        <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.9)', lineHeight: 1.4, textAlign: 'left' }}>
          <span>{t("prode_fixture_stars_info_1")}</span>
          <a href="/votar" style={{ color: '#ffdf00', textDecoration: 'none', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
            <ExternalLink size={14} style={{ verticalAlign: 'middle', marginRight: '0.2rem', marginTop: '-0.1rem' }} />
            {t("prode_fixture_stars_info_link")}
          </a>
          <span dangerouslySetInnerHTML={{ __html: t("prode_fixture_stars_info_2") }} />
        </p>
      </div>


      {(activeTab === 'groups' || activeTab === 'round_32' || activeTab === 'round_16') && (
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '1rem', marginBottom: '2rem', width: '100%', boxSizing: 'border-box' }}>
          <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', color: 'rgba(255,255,255,0.4)' }} />
            <input
              type="text"
              placeholder={t('search_team')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', background: 'rgba(20, 20, 25, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '1rem', padding: '0.85rem 1rem 0.85rem 2.8rem', color: '#fff', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s ease' }}
              onFocus={(e) => e.target.style.borderColor = '#00f2ff'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
            />
          </div>
          <button
            onClick={() => setShowFinishedOnly(!showFinishedOnly)}
            style={{
              background: showFinishedOnly ? '#fff' : 'rgba(255, 255, 255, 0.05)',
              border: showFinishedOnly ? '1px solid #fff' : '1px solid rgba(255, 255, 255, 0.1)',
              color: showFinishedOnly ? '#000' : '#fff',
              padding: '0 1.25rem',
              borderRadius: '1rem',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              height: '46px',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            {t("filter_finished_matches")}
          </button>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        {(activeTab === 'groups' || activeTab === 'round_32' || activeTab === 'round_16') && groupedMatches.length > 0 && groupedMatches.map((dayGroup, dIndex) => (
          <motion.div key={dIndex} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: dIndex * 0.05 }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff', fontSize: '1rem', fontWeight: 700, paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <Calendar size={18} />
              <span style={{ textTransform: 'capitalize' }}>{dayGroup.date}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {dayGroup.matches.map((match) => {
                const userNationality = user?.user_metadata?.nationality || 'Argentina';
                const isMyTeam = userNationality && (match.teamA === userNationality || match.teamB === userNationality);
                const started = isMatchStarted(match.date, match.time, match.status);
                const finishedAuto = isMatchFinishedAuto(match.date, match.time);
                const hasPrediction = !!predictions[match.id];
                const locked = started || hasPrediction || match.group === '16vos de final';
                const pScoreA = predictions[match.id]?.scoreA;
                const pScoreB = predictions[match.id]?.scoreB;
                const isRewarded = predictions[match.id]?.rewarded;
                const inScoreA = inputs[match.id]?.scoreA ?? '';
                const inScoreB = inputs[match.id]?.scoreB ?? '';

                let packsWon = 0;
                let wonExact = false;
                if (match.status?.startsWith('finished') && hasPrediction) {
                  const exactMatch = pScoreA === match.scoreA! && pScoreB === match.scoreB!;
                  const predWinner = pScoreA > pScoreB ? 'A' : (pScoreA < pScoreB ? 'B' : 'Draw');
                  const resWinner = match.scoreA! > match.scoreB! ? 'A' : (match.scoreA! < match.scoreB! ? 'B' : 'Draw');
                  if (exactMatch) { packsWon = 3; wonExact = true; }
                  else if (predWinner === resWinner) packsWon = 1;
                }
                
                const codeStatus = usedCodesStatus[match.id];
                const allCodesUsed = codeStatus && codeStatus.total > 0 && codeStatus.total === codeStatus.used;

                return (
                  <div key={match.id} style={{
                    background: 'rgba(20, 20, 25, 0.8)', border: isMyTeam ? '2px solid #00f2ff' : '1px solid rgba(255, 255, 255, 0.05)', boxShadow: isMyTeam ? '0 0 15px rgba(0, 242, 255, 0.2)' : 'none', borderRadius: '1rem', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '1rem' : '2rem', alignItems: isMobile ? 'flex-start' : 'center', transition: 'all 0.2s ease', cursor: 'default'
                  }}>
                    <div style={{ flex: isMobile ? 'none' : '0 0 120px', display: 'flex', flexDirection: isMobile ? 'row' : 'column', gap: isMobile ? '0.75rem' : '0.25rem', alignItems: isMobile ? 'center' : 'flex-start', justifyContent: isMobile ? 'space-between' : 'flex-start', width: isMobile ? '100%' : 'auto', opacity: 0.8 }}>
                      <span style={{ fontSize: '1rem', fontWeight: 800 }}>{formatMatchTime(match.date, match.time, i18n.language).localTime}</span>
                      <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>{match.group.replace('Group', t('group'))}</span>
                    </div>

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
                          <input
                            type="text" inputMode="numeric" maxLength={1} disabled={locked || !user}
                            value={hasPrediction ? pScoreA : inScoreA}
                            onChange={(e) => {
                              const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 1);
                              setInputs(prev => ({ ...prev, [match.id]: { ...prev[match.id], scoreA: val } }))
                            }}
                            style={{ width: '40px', height: '40px', textAlign: 'center', padding: 0, background: (locked || !user) ? 'transparent' : 'rgba(0,0,0,0.5)', border: (locked || !user) ? 'none' : '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '0.5rem', fontWeight: 800, fontSize: '1.2rem' }}
                          />
                          <span style={{ fontWeight: 800, color: 'rgba(255,255,255,0.4)' }}>-</span>
                          <input
                            type="text" inputMode="numeric" maxLength={1} disabled={locked || !user}
                            value={hasPrediction ? pScoreB : inScoreB}
                            onChange={(e) => {
                              const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 1);
                              setInputs(prev => ({ ...prev, [match.id]: { ...prev[match.id], scoreB: val } }))
                            }}
                            style={{ width: '40px', height: '40px', textAlign: 'center', padding: 0, background: (locked || !user) ? 'transparent' : 'rgba(0,0,0,0.5)', border: (locked || !user) ? 'none' : '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '0.5rem', fontWeight: 800, fontSize: '1.2rem' }}
                          />
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

                    {!isMobile && (
                      <div style={{ flex: '0 0 150px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                        {!locked && !match.status?.startsWith('finished') && (
                          <button
                            key="btn-save"
                            disabled={!user || isSaving[match.id] || inScoreA === '' || inScoreB === ''}
                            onClick={() => handleSavePrediction(match.id)}
                            style={{ background: '#00f2ff', color: '#000', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontWeight: 800, cursor: (!user || isSaving[match.id] || inScoreA === '' || inScoreB === '') ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: (!user || isSaving[match.id] || inScoreA === '' || inScoreB === '') ? 0.5 : 1 }}
                          >
                            <Save size={16} /> <span>{t("save")}</span>
                          </button>
                        )}

                        {match.status?.startsWith('finished') && (
                          packsWon > 0 && !isRewarded ? (
                            <button
                              key="btn-claim"
                              onClick={() => handleClaimReward(match.id, packsWon, match.teamA, match.teamB)}
                              className="btn-hover-dark"
                              style={{ background: '#ff8c00', color: '#000', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                            >
                              <Layers size={16} /> <span>Reclamar</span>
                            </button>
                          ) : packsWon > 0 && isRewarded ? (
                            <button
                              key="btn-claimed"
                              onClick={() => { if (!allCodesUsed) handleViewRewards(match.id, packsWon, match.teamA, match.teamB); }}
                              className={allCodesUsed ? "" : "btn-hover-dark"}
                              disabled={allCodesUsed}
                              style={{ 
                                background: allCodesUsed ? 'rgba(255, 140, 0, 0.05)' : 'rgba(255, 140, 0, 0.2)', 
                                color: allCodesUsed ? 'rgba(255, 140, 0, 0.5)' : '#ff8c00', 
                                border: allCodesUsed ? '1px solid rgba(255, 140, 0, 0.2)' : '1px solid rgba(255, 140, 0, 0.5)', 
                                padding: '0.5rem 1rem', borderRadius: '0.5rem', fontWeight: 800, 
                                cursor: allCodesUsed ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' 
                              }}
                            >
                              <Layers size={16} /> <span>{t('claimed', 'Reclamado')}</span>
                            </button>
                          ) : (
                            <div key="div-final" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', opacity: 0.5, fontWeight: 700 }}>{t("final_result")}</span>
                              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#00f2ff' }}>{match.scoreA} - {match.scoreB}</span>
                            </div>
                          )
                        )}

                        {locked && !match.status?.startsWith('finished') && (
                          hasPrediction ? (
                            <button
                              key="btn-saved"
                              disabled
                              style={{ background: 'rgba(0, 230, 118, 0.2)', color: '#00e676', border: '1px solid rgba(0, 230, 118, 0.5)', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontWeight: 800, cursor: 'not-allowed', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.8 }}
                            >
                              <Save size={16} /> <span>Guardado</span>
                            </button>
                          ) : (
                            <div key="div-started" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', marginTop: '-0.25rem' }}>
                              <span style={{ fontSize: '1rem', fontWeight: 900, color: '#ffffff', textAlign: 'center', textTransform: 'uppercase', lineHeight: 1.1, marginBottom: '0.25rem' }}>{finishedAuto ? t("match_finished") : t("match_started")}</span>
                              <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', opacity: 0.5, fontWeight: 700, textAlign: 'center' }}>{t("waiting_result")}</span>
                            </div>
                          )
                        )}
                      </div>
                    )}

                    {isMobile && !locked && !match.status?.startsWith('finished') && (
                      <button
                        key="m-btn-save"
                        disabled={!user || isSaving[match.id] || inScoreA === '' || inScoreB === ''}
                        onClick={() => handleSavePrediction(match.id)}
                        style={{ background: '#00f2ff', color: '#000', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontWeight: 800, cursor: (!user || isSaving[match.id] || inScoreA === '' || inScoreB === '') ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: (!user || isSaving[match.id] || inScoreA === '' || inScoreB === '') ? 0.5 : 1, width: '100%', justifyContent: 'center', marginTop: '1rem' }}
                      >
                        <Save size={16} /> <span>{t("save_prediction")}</span>
                      </button>
                    )}
                    {isMobile && match.status?.startsWith('finished') && (
                      packsWon > 0 && !isRewarded ? (
                        <button
                          key="m-btn-claim"
                          onClick={() => handleClaimReward(match.id, packsWon, match.teamA, match.teamB)}
                          className="btn-hover-dark"
                          style={{ background: '#ff8c00', color: '#000', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', marginTop: '1rem' }}
                        >
                          <Layers size={16} /> <span>Reclamar Recompensa</span>
                        </button>
                      ) : packsWon > 0 && isRewarded ? (
                        <button
                          key="m-btn-claimed"
                          onClick={() => { if (!allCodesUsed) handleViewRewards(match.id, packsWon, match.teamA, match.teamB); }}
                          className={allCodesUsed ? "" : "btn-hover-dark"}
                          disabled={allCodesUsed}
                          style={{ 
                            background: allCodesUsed ? 'rgba(255, 140, 0, 0.05)' : 'rgba(255, 140, 0, 0.2)', 
                            color: allCodesUsed ? 'rgba(255, 140, 0, 0.5)' : '#ff8c00', 
                            border: allCodesUsed ? '1px solid rgba(255, 140, 0, 0.2)' : '1px solid rgba(255, 140, 0, 0.5)', 
                            padding: '0.5rem 1rem', borderRadius: '0.5rem', fontWeight: 800, 
                            cursor: allCodesUsed ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', marginTop: '1rem' 
                          }}
                        >
                          <Layers size={16} /> <span>{t('claimed', 'Reclamado')}</span>
                        </button>
                      ) : (
                        <div key="m-div-final" style={{ marginTop: '1rem', color: '#00f2ff', fontSize: '1rem', fontWeight: 900, textTransform: 'uppercase', textAlign: 'center', width: '100%' }}>
                          {t("final_result").toUpperCase()}: {match.scoreA} - {match.scoreB}
                        </div>
                      )
                    )}
                    {isMobile && locked && !match.status?.startsWith('finished') && (
                      hasPrediction ? (
                        <button
                          key="m-btn-saved"
                          disabled
                          style={{ background: 'rgba(0, 230, 118, 0.2)', color: '#00e676', border: '1px solid rgba(0, 230, 118, 0.5)', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontWeight: 800, cursor: 'not-allowed', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.8, width: '100%', justifyContent: 'center', marginTop: '1rem' }}
                        >
                          <Save size={16} /> <span>Guardado</span>
                        </button>
                      ) : (
                        <div key="m-div-started" style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                          <span style={{ color: '#ffffff', fontSize: '0.85rem', fontWeight: 900, textTransform: 'uppercase', textAlign: 'center', lineHeight: 1.1, marginBottom: '0.25rem' }}>{finishedAuto ? t("match_finished") : t("match_started")}</span>
                          <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', opacity: 0.5, fontWeight: 700, textAlign: 'center' }}>{t("waiting_result")}</span>
                        </div>
                      )
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        ))}

        {(activeTab === 'groups' || activeTab === 'round_32' || activeTab === 'round_16') && groupedMatches.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '1.5rem', border: '1px dashed rgba(255,255,255,0.1)' }}>
            <Search size={48} style={{ color: 'rgba(255,255,255,0.2)', marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: 'rgba(255,255,255,0.6)' }}>
              {t('no_matches_found', 'No se encontraron partidos')}
            </h3>
            <p style={{ opacity: 0.5, fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto' }}>
              {t('no_matches_desc', 'No hay partidos que coincidan con tu búsqueda.')}
            </p>
          </div>
        )}

        {activeTab !== 'groups' && activeTab !== 'round_32' && activeTab !== 'round_16' && (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '1.5rem', border: '1px dashed rgba(255,255,255,0.1)' }}>
            <Trophy size={48} style={{ color: 'rgba(255,255,255,0.2)', marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: 'rgba(255,255,255,0.6)' }}>
              {t('prode_stage_tbd')}
            </h3>
            <p style={{ opacity: 0.5, fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto 1.5rem auto' }}>
              {t('prode_stage_tbd_desc')}
            </p>
            <a 
              href="https://www.fifa.com/es/tournaments/mens/worldcup/canadamexicousa2026/standings" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#fff',
                padding: '0.6rem 1.25rem',
                borderRadius: '1rem',
                textDecoration: 'none',
                fontWeight: 800,
                fontSize: '0.9rem',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                transition: 'all 0.2s ease'
              }}
              className="btn-hover-dark"
            >
              <ExternalLink size={16} />
              {t('prode_view_standings')} FIFA.com
            </a>
          </div>
        )}
      </div>

      <TwitchButton />

      {rewardCodesModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', padding: '1rem' }}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ background: 'rgba(26, 26, 46, 0.85)', backdropFilter: 'blur(16px)', padding: '2.5rem', borderRadius: '1.5rem', maxWidth: '600px', width: '100%', textAlign: 'center', border: '1px solid rgba(255, 140, 0, 0.3)', boxShadow: '0 0 30px rgba(255, 140, 0, 0.15)' }}>
            <h2 style={{ color: '#ff8c00', marginTop: 0, marginBottom: '0.5rem', fontSize: '2rem', textTransform: 'uppercase', textShadow: '0 0 10px rgba(255, 140, 0, 0.5)' }}>{t('prode_congratulations')}</h2>
            <p style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '0.75rem' }}>
              {t('prode_prediction_success')} <strong>{rewardCodesModal.matchDesc}</strong> {t('prode_prediction_packs_won')} <strong>{rewardCodesModal.packs} {rewardCodesModal.packs === 1 ? t('prode_prediction_pack_single') : t('prode_prediction_packs_plural')}</strong> {t('prode_prediction_for_deck')}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', marginBottom: '1rem' }}>
              {rewardCodesModal.packs === 1 ? (
                <>{t('prode_reward_code_single')} <a href="/mazo" target="_blank" rel="noopener noreferrer" style={{ color: '#ff8c00', textDecoration: 'none', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '0.2rem', verticalAlign: 'middle' }} className="hover-underline"><ExternalLink size={14} />{t('prode_deck_screen')}</a>!</>
              ) : (
                <>{t('prode_reward_code_plural')} <a href="/mazo" target="_blank" rel="noopener noreferrer" style={{ color: '#ff8c00', textDecoration: 'none', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '0.2rem', verticalAlign: 'middle' }} className="hover-underline"><ExternalLink size={14} />{t('prode_deck_screen')}</a>!</>
              )}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: rewardCodesModal.codes.length === 1 ? 'minmax(180px, 250px)' : 'repeat(3, 1fr)', justifyContent: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
              {rewardCodesModal.codes.map((item, idx) => (
                <div key={idx} style={{ background: 'rgba(0,0,0,0.5)', padding: isMobile ? '0.75rem 0.25rem' : '1rem 0.5rem', borderRadius: '0.75rem', border: '1px dashed rgba(255, 140, 0, 0.4)', fontSize: isMobile ? '1.1rem' : '1.35rem', fontWeight: 900, letterSpacing: isMobile ? '0.05em' : '0.1em', color: item.used ? 'rgba(255,255,255,0.3)' : '#fff', textDecoration: item.used ? 'line-through' : 'none', position: 'relative' }}>
                  {item.code}
                  {item.used && <div style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#ff4444', color: '#fff', fontSize: '0.6rem', padding: '0.2rem 0.4rem', borderRadius: '0.5rem', fontWeight: 'bold' }}>{t('prode_used')}</div>}
                </div>
              ))}
            </div>
            <button
              onClick={() => setRewardCodesModal(null)}
              className="btn-hover-dark"
              style={{ width: '100%', background: '#ff8c00', color: '#000', border: 'none', padding: '1rem', borderRadius: '1rem', fontSize: '1.1rem', fontWeight: 900, cursor: 'pointer', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              <Layers size={20} />
              {t('prode_understood')}
            </button>
          </motion.div>
        </div>
      )}

      {/* World Cup Bracket or Standings visualization at the very bottom */}
      {activeTab === 'groups' ? (
        <GroupStandings searchQuery={searchQuery} />
      ) : (
        <WorldCupBracket fixtureMatches={fixtureMatches} liveResults={liveResults} />
      )}

    </div>
  );
};
