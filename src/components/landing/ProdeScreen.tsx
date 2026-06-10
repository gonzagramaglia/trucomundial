import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Globe, Search, Home, Trophy, Save, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { TwitchButton } from '../shared/TwitchButton';
import { fixtureMatches } from '../../lib/fixtureData';
import type { FixtureMatch } from '../../lib/fixtureData';
import { supabase } from '../../lib/supabase';
import { audioManager } from '../../lib/audio';
import { UtilityButtons } from '../shared/UtilityButtons';

type TabType = 'groups' | 'round_16' | 'quarterfinals' | 'semifinals' | 'final';

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

export const formatMatchTime = (dateStr: string, timeStr: string) => {
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
  
  let localDateStr = matchDate.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
  localDateStr = localDateStr.charAt(0).toUpperCase() + localDateStr.slice(1).replace('.', ',');
  const localTimeStr = matchDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) + ' hs';
  
  return { localDate: localDateStr, localTime: localTimeStr };
};

export const ProdeScreen: React.FC<ProdeScreenProps> = ({ user, handleAuth, onBack }) => {
  const { t } = useTranslation();
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  const [activeTab, setActiveTab] = useState<TabType>('groups');
  const [searchQuery, setSearchQuery] = useState('');
  const [liveResults, setLiveResults] = useState<Record<string, { scoreA: number, scoreB: number, status: string }>>({});

  // Prode states
  const [predictions, setPredictions] = useState<Record<string, { scoreA: number, scoreB: number, rewarded?: boolean }>>({});
  const [inputs, setInputs] = useState<Record<string, { scoreA: string, scoreB: string }>>({});
  const [isSaving, setIsSaving] = useState<Record<string, boolean>>({});
  const [rewardCodesModal, setRewardCodesModal] = useState<{ codes: string[], matchDesc: string, packs: number } | null>(null);

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
    const checkRewards = async () => {
      if (!user || Object.keys(liveResults).length === 0 || Object.keys(predictions).length === 0) return;
      
      const toReward: { matchId: string, packs: number, teamA: string, teamB: string }[] = [];

      for (const matchId in predictions) {
        const pred = predictions[matchId];
        const res = liveResults[matchId];
        if (res && res.status === 'finished' && !pred.rewarded) {
          const exactMatch = pred.scoreA === res.scoreA && pred.scoreB === res.scoreB;
          const predWinner = pred.scoreA > pred.scoreB ? 'A' : (pred.scoreA < pred.scoreB ? 'B' : 'Draw');
          const resWinner = res.scoreA > res.scoreB ? 'A' : (res.scoreA < res.scoreB ? 'B' : 'Draw');
          const normalMatch = predWinner === resWinner;
          
          let packs = 0;
          if (exactMatch) packs = 3;
          else if (normalMatch) packs = 1;

          if (packs > 0) {
            const matchDetails = fixtureMatches.find(m => m.id === matchId);
            toReward.push({ matchId, packs, teamA: matchDetails?.teamA || '', teamB: matchDetails?.teamB || '' });
          } else {
            await supabase.from('prode_predictions').update({ rewarded: true }).eq('user_id', user.id).eq('match_id', matchId);
            setPredictions(prev => ({ ...prev, [matchId]: { ...prev[matchId], rewarded: true } }));
          }
        }
      }

      for (const reward of toReward) {
        const generatedCodes = [];
        for (let i = 0; i < reward.packs; i++) {
          const code = Math.random().toString(36).substring(2, 6).toUpperCase();
          generatedCodes.push(code);
        }

        const codeInserts = generatedCodes.map(code => ({
          code,
          user_id: user.id,
          used: false,
          source: `prode_match_${reward.matchId}`
        }));
        
        const { error } = await supabase.from('reward_codes').insert(codeInserts);
        if (!error) {
          await supabase.from('prode_predictions').update({ rewarded: true }).eq('user_id', user.id).eq('match_id', reward.matchId);
          setPredictions(prev => ({ ...prev, [reward.matchId]: { ...prev[reward.matchId], rewarded: true } }));

          setRewardCodesModal({
            codes: generatedCodes,
            matchDesc: `${reward.teamA} vs ${reward.teamB}`,
            packs: reward.packs
          });
          break; // Show one at a time
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
      alert("Debes iniciar sesión para guardar tus predicciones.");
      return;
    }
    const matchInput = inputs[matchId];
    if (!matchInput || matchInput.scoreA === '' || matchInput.scoreB === '') {
      alert("Completá ambos resultados.");
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
        alert("Error al guardar la predicción. Asegúrate de haber creado la tabla prode_predictions.");
      }
    } catch (err) {
      alert("Error de conexión.");
    }
    setIsSaving(prev => ({ ...prev, [matchId]: false }));
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

    filtered.sort((a, b) => {
      const aFinished = a.status === 'finished' ? 1 : 0;
      const bFinished = b.status === 'finished' ? 1 : 0;
      return aFinished - bFinished;
    });

    const groups: { [date: string]: FixtureMatch[] } = {};
    filtered.forEach(match => {
      const { localDate } = formatMatchTime(match.date, match.time);
      if (!groups[localDate]) {
        groups[localDate] = [];
      }
      groups[localDate].push(match);
    });

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
              GANÁ SOBRES CON EL PRODE
            </h2>
          </div>
          <p style={{ fontSize: '0.95rem', opacity: 0.65, margin: '4px 0 0 0', fontWeight: 600 }}>
            Adiviná los resultados exactos o quién ganará.
          </p>
        </div>
      </div>

      {/* Rewards Banner */}
      <div style={{
        background: 'rgba(255, 140, 0, 0.1)', border: '1px solid rgba(255, 140, 0, 0.3)', borderRadius: '1rem', padding: '1rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem',
      }}>
        <AlertCircle size={24} color="#ff8c00" style={{ flexShrink: 0 }} />
        <div>
          <h4 style={{ margin: '0 0 0.25rem 0', color: '#ff8c00' }}>¡Premios del Prode!</h4>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>
            Resultado exacto: <strong>3 sobres</strong>. Acertar ganador/empate: <strong>1 sobre</strong>.<br />
            ¡No cuelgues! <em>(Una vez guardado o iniciado el partido no se puede cambiar)</em>.<br />
            Los códigos ganados se canjean en <a href="/mazo" target="_blank" rel="noopener noreferrer" style={{ color: '#ff8c00', fontWeight: 900, textDecoration: 'none' }}>Armá/Personalizá tu Mazo</a>.
          </p>
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
            borderRadius: '2rem', padding: '1.5rem 2rem', marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem', backdropFilter: 'blur(16px)'
          }}
        >
          <div style={{ flex: '1 1 300px' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#00f2ff', fontSize: '1.1rem', fontWeight: 900 }}>
              ¡Empezá a jugar al Prode!
            </h3>
            <p style={{ margin: 0, opacity: 0.8, fontSize: '0.9rem', lineHeight: 1.5, maxWidth: isMobile ? '400px' : 'none' }}>
              Iniciá sesión para guardar tus predicciones y ganar sobres de recompensa.
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

      <div style={{ display: 'flex', justifyContent: isMobile ? 'flex-start' : 'center', gap: '0.75rem', marginBottom: '2rem', overflowX: 'auto', paddingBottom: '0.5rem', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <div style={{ display: 'flex', gap: '0.5rem', width: 'max-content' }}>
          {renderTab('groups', t('group_stage'), Globe)}
          {renderTab('round_16', t('round_of_16'), Trophy)}
          {renderTab('quarterfinals', t('quarterfinals'), Trophy)}
          {renderTab('semifinals', t('semifinals'), Trophy)}
          {renderTab('final', t('final'), Trophy)}
        </div>
      </div>

      {activeTab === 'groups' && (
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
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        {activeTab === 'groups' && groupedMatches.length > 0 && groupedMatches.map((dayGroup, dIndex) => (
          <motion.div key={dIndex} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: dIndex * 0.05 }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff', fontSize: '1rem', fontWeight: 700, paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <Calendar size={18} />
              <span style={{ textTransform: 'capitalize' }}>{dayGroup.date}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {dayGroup.matches.map((match) => {
                const userNationality = user?.user_metadata?.nationality;
                const isMyTeam = userNationality && (match.teamA === userNationality || match.teamB === userNationality);
                const started = isMatchStarted(match.date, match.time, match.status);
                const hasPrediction = !!predictions[match.id];
                const locked = started || hasPrediction;
                const pScoreA = predictions[match.id]?.scoreA;
                const pScoreB = predictions[match.id]?.scoreB;
                const inScoreA = inputs[match.id]?.scoreA ?? '';
                const inScoreB = inputs[match.id]?.scoreB ?? '';

                return (
                  <div key={match.id} style={{
                    background: 'rgba(20, 20, 25, 0.8)', border: isMyTeam ? '2px solid #00f2ff' : '1px solid rgba(255, 255, 255, 0.05)', boxShadow: isMyTeam ? '0 0 15px rgba(0, 242, 255, 0.2)' : 'none', borderRadius: '1rem', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '1rem' : '2rem', alignItems: isMobile ? 'flex-start' : 'center', transition: 'all 0.2s ease', cursor: 'default'
                  }}>
                    <div style={{ flex: isMobile ? 'none' : '0 0 120px', display: 'flex', flexDirection: isMobile ? 'row' : 'column', gap: isMobile ? '0.75rem' : '0.25rem', alignItems: isMobile ? 'center' : 'flex-start', justifyContent: isMobile ? 'space-between' : 'flex-start', width: isMobile ? '100%' : 'auto', opacity: 0.8 }}>
                      <span style={{ fontSize: '1rem', fontWeight: 800 }}>{formatMatchTime(match.date, match.time).localTime}</span>
                      <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>{match.group.replace('Group', t('group'))}</span>
                    </div>

                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: isMobile ? '100%' : 'auto' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, justifyContent: 'flex-end' }}>
                        <span style={{ fontWeight: 700, fontSize: isMobile ? '0.9rem' : '1.1rem', textAlign: 'right' }}>{match.teamA}</span>
                        <span style={{ fontSize: '1.5rem', width: '32px', textAlign: 'center' }}>{match.flagA}</span>
                      </div>

                      <div style={{ padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '80px' }}>
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
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, justifyContent: 'flex-start' }}>
                        <span style={{ fontSize: '1.5rem', width: '32px', textAlign: 'center' }}>{match.flagB}</span>
                        <span style={{ fontWeight: 700, fontSize: isMobile ? '0.9rem' : '1.1rem', textAlign: 'left' }}>{match.teamB}</span>
                      </div>
                    </div>

                    {!isMobile && (
                      <div style={{ flex: '0 0 150px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                        {match.status === 'finished' ? (
                          <>
                            <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', opacity: 0.5, fontWeight: 700 }}>Resultado Final</span>
                            <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#00f2ff' }}>{match.scoreA} - {match.scoreB}</span>
                          </>
                        ) : locked || hasPrediction ? (
                          <div style={{ color: started ? '#ff4444' : '#00f2ff', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', textAlign: 'center' }}>
                            {started ? 'Partido Iniciado' : 'Predicción Guardada'}
                          </div>
                        ) : (
                          <button
                            disabled={!user || isSaving[match.id] || inScoreA === '' || inScoreB === ''}
                            onClick={() => handleSavePrediction(match.id)}
                            style={{ background: '#00f2ff', color: '#000', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontWeight: 800, cursor: (!user || isSaving[match.id] || inScoreA === '' || inScoreB === '') ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: (!user || isSaving[match.id] || inScoreA === '' || inScoreB === '') ? 0.5 : 1 }}
                          >
                            <Save size={16} /> Guardar
                          </button>
                        )}
                      </div>
                    )}

                    {isMobile && !locked && match.status !== 'finished' && (
                      <button
                        disabled={!user || isSaving[match.id] || inScoreA === '' || inScoreB === ''}
                        onClick={() => handleSavePrediction(match.id)}
                        style={{ background: '#00f2ff', color: '#000', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontWeight: 800, cursor: (!user || isSaving[match.id] || inScoreA === '' || inScoreB === '') ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: (!user || isSaving[match.id] || inScoreA === '' || inScoreB === '') ? 0.5 : 1, width: '100%', justifyContent: 'center', marginTop: '1rem' }}
                      >
                        <Save size={16} /> Guardar Predicción
                      </button>
                    )}
                    {isMobile && match.status === 'finished' && (
                      <div style={{ marginTop: '1rem', color: '#00f2ff', fontSize: '1rem', fontWeight: 900, textTransform: 'uppercase', textAlign: 'center', width: '100%' }}>
                        RESULTADO FINAL: {match.scoreA} - {match.scoreB}
                      </div>
                    )}
                    {isMobile && locked && match.status !== 'finished' && (
                      <div style={{ marginTop: '1rem', color: started ? '#ff4444' : '#00f2ff', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', textAlign: 'center', width: '100%' }}>
                        {started ? 'Partido Iniciado' : 'Predicción Guardada'}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        ))}

        {activeTab === 'groups' && groupedMatches.length === 0 && (
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

        {activeTab !== 'groups' && (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '1.5rem', border: '1px dashed rgba(255,255,255,0.1)' }}>
            <Trophy size={48} style={{ color: 'rgba(255,255,255,0.2)', marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: 'rgba(255,255,255,0.6)' }}>
              Etapa por Definir
            </h3>
            <p style={{ opacity: 0.5, fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto' }}>
              Los partidos de esta etapa se definirán al concluir la etapa anterior.
            </p>
          </div>
        )}
      </div>

      <TwitchButton />

      {rewardCodesModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', padding: '1rem' }}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ background: 'linear-gradient(135deg, #1a1a2e, #101018)', padding: '2.5rem', borderRadius: '1.5rem', maxWidth: '450px', width: '100%', textAlign: 'center', border: '1px solid rgba(0,242,255,0.3)', boxShadow: '0 0 30px rgba(0,242,255,0.1)' }}>
            <h2 style={{ color: '#00f2ff', marginTop: 0, marginBottom: '1rem', fontSize: '2rem', textTransform: 'uppercase', textShadow: '0 0 10px rgba(0,242,255,0.5)' }}>¡Felicidades!</h2>
            <p style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '1.5rem' }}>
              Acertaste tu predicción del partido <strong>{rewardCodesModal.matchDesc}</strong> y ganaste <strong>{rewardCodesModal.packs} sobres</strong> para el mazo.
            </p>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', marginBottom: '1rem' }}>
              Estos son tus códigos de recompensa. ¡Anotalos y canjealos en la pantalla de Mazo!
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
              {rewardCodesModal.codes.map((code, idx) => (
                <div key={idx} style={{ background: 'rgba(0,0,0,0.5)', padding: '1rem', borderRadius: '0.75rem', border: '1px dashed rgba(0,242,255,0.4)', fontSize: '1.5rem', fontWeight: 900, letterSpacing: '0.2em', color: '#fff' }}>
                  {code}
                </div>
              ))}
            </div>
            <button
              onClick={() => setRewardCodesModal(null)}
              className="btn-hover-dark"
              style={{ width: '100%', background: '#00f2ff', color: '#000', border: 'none', padding: '1rem', borderRadius: '1rem', fontSize: '1.1rem', fontWeight: 900, cursor: 'pointer', textTransform: 'uppercase' }}
            >
              ¡Entendido!
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};
