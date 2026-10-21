import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Globe, Search, Home, Trophy, ExternalLink, AlertCircle, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { WorldCupBracket } from './WorldCupBracket';
import { GroupStandings } from './GroupStandings';
import { TwitchButton } from '../shared/TwitchButton';
import { fixtureMatches } from '../../lib/fixtureData';
import type { FixtureMatch } from '../../lib/fixtureData';
import { supabase } from '../../lib/supabase';
import { audioManager } from '../../lib/audio';
import { UtilityButtons } from '../shared/UtilityButtons';
import { ProdeMatchCard } from './ProdeMatchCard';
import { ProdeRewardModal } from './ProdeRewardModal';
import { formatMatchTime } from '../../lib/matchTime';
import { calculateRewardPacks } from '../../lib/prodeRewards';
import { MOCK_PRODE_RESULTS } from '../../data/mockProdeResults';

type TabType = 'groups' | 'round_32' | 'round_16' | 'quarterfinals' | 'semifinals' | 'final';

interface ProdeScreenProps {
  user?: any;
  handleAuth: () => void;
  onBack: () => void;
}

export const ProdeScreen: React.FC<ProdeScreenProps> = ({ user, handleAuth: _handleAuth, onBack }) => {
  const { t, i18n } = useTranslation();
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  const [activeTab, setActiveTab] = useState<TabType>('final');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFinishedOnly, setShowFinishedOnly] = useState(false);
  const [liveResults, setLiveResults] = useState<Record<string, { scoreA: number, scoreB: number, status: string }>>({});
  const tabsScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (tabsScrollRef.current) {
      tabsScrollRef.current.scrollLeft = tabsScrollRef.current.scrollWidth;
    }
  }, []);

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
      const map: Record<string, any> = { ...MOCK_PRODE_RESULTS };
      try {
        const { data, error } = await supabase.from('fixture_results').select('*');
        if (!error && data && data.length > 0) {
          data.forEach(r => {
            map[r.match_id] = { scoreA: r.score_a, scoreB: r.score_b, status: r.status };
          });
        }
      } catch (err) { }
      setLiveResults(map);
    };
    fetchResults();
  }, []);

  useEffect(() => {
    const fetchPredictions = async () => {
      if (!user) return;
      const localKey = `trucomundial_prode_predictions_${user.id}`;
      let map: Record<string, any> = {};
      let inputMap: Record<string, any> = {};

      try {
        const cached = localStorage.getItem(localKey);
        if (cached) {
          map = JSON.parse(cached);
          Object.entries(map).forEach(([matchId, p]: [string, any]) => {
            inputMap[matchId] = { scoreA: p.scoreA?.toString() ?? '', scoreB: p.scoreB?.toString() ?? '' };
          });
          setPredictions(map);
          setInputs(prev => ({ ...prev, ...inputMap }));
        }
      } catch (e) {}

      try {
        const { data, error } = await supabase.from('prode_predictions').select('*').eq('user_id', user.id);
        if (!error && data && data.length > 0) {
          data.forEach(p => {
            map[p.match_id] = { scoreA: p.score_a, scoreB: p.score_b, rewarded: p.rewarded };
            inputMap[p.match_id] = { scoreA: p.score_a.toString(), scoreB: p.score_b.toString() };
          });
          setPredictions(map);
          setInputs(prev => ({ ...prev, ...inputMap }));
          localStorage.setItem(localKey, JSON.stringify(map));
        }
      } catch (e) { }
    };
    fetchPredictions();
  }, [user]);

  useEffect(() => {
    const fetchCodes = async () => {
      if (!user) return;
      const localKey = `trucomundial_reward_codes_${user.id}`;
      const statusMap: Record<string, { total: number, used: number }> = {};

      try {
        const cached = localStorage.getItem(localKey);
        if (cached) {
          const codes: any[] = JSON.parse(cached);
          codes.forEach(c => {
            if (c.source?.startsWith('prode_match_')) {
              const matchId = c.source.replace('prode_match_', '');
              if (!statusMap[matchId]) statusMap[matchId] = { total: 0, used: 0 };
              statusMap[matchId].total += 1;
              if (c.used) statusMap[matchId].used += 1;
            }
          });
          setUsedCodesStatus(statusMap);
        }
      } catch (e) {}

      try {
        const { data, error } = await supabase.from('reward_codes').select('source, used').eq('user_id', user.id).like('source', 'prode_match_%');
        if (data && !error && data.length > 0) {
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

      const predKey = `trucomundial_prode_predictions_${user.id}`;
      let updatedAny = false;
      const updatedMap = { ...predictions };

      for (const matchId in predictions) {
        const pred = predictions[matchId];
        const res = liveResults[matchId];
        if (res && res.status?.startsWith('finished') && !pred.rewarded) {
          const { packs } = calculateRewardPacks(pred.scoreA, pred.scoreB, res.scoreA, res.scoreB);

          // If packs is 0, we can mark it as rewarded so we don't check again.
          if (packs === 0) {
            updatedMap[matchId] = { ...updatedMap[matchId], rewarded: true };
            updatedAny = true;
            try {
              await supabase.from('prode_predictions').update({ rewarded: true }).eq('user_id', user.id).eq('match_id', matchId);
            } catch (e) {}
          }
        }
      }

      if (updatedAny) {
        setPredictions(updatedMap);
        try {
          localStorage.setItem(predKey, JSON.stringify(updatedMap));
        } catch (e) {}
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
    const localKey = `trucomundial_prode_predictions_${user.id}`;
    const newPredictions = {
      ...predictions,
      [matchId]: { scoreA, scoreB, rewarded: predictions[matchId]?.rewarded || false }
    };
    setPredictions(newPredictions);
    try {
      localStorage.setItem(localKey, JSON.stringify(newPredictions));
    } catch (e) {}

    try {
      await supabase.from('prode_predictions').upsert({
        user_id: user.id,
        match_id: matchId,
        score_a: scoreA,
        score_b: scoreB,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,match_id' });
    } catch (err) {
      // In local mode, saving to localStorage is already done
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

    // Local storage persistence
    const codesKey = `trucomundial_reward_codes_${user.id}`;
    let existingCodes: any[] = [];
    try {
      const cached = localStorage.getItem(codesKey);
      if (cached) existingCodes = JSON.parse(cached);
    } catch (e) {}
    existingCodes.push(...codeInserts);
    try {
      localStorage.setItem(codesKey, JSON.stringify(existingCodes));
    } catch (e) {}

    const predKey = `trucomundial_prode_predictions_${user.id}`;
    const updatedPredictions = {
      ...predictions,
      [matchId]: { ...predictions[matchId], rewarded: true }
    };
    setPredictions(updatedPredictions);
    try {
      localStorage.setItem(predKey, JSON.stringify(updatedPredictions));
    } catch (e) {}

    setUsedCodesStatus(prev => ({ ...prev, [matchId]: { total: packs, used: 0 } }));

    setRewardCodesModal({
      codes: generatedCodes.map(c => ({ code: c, used: false })),
      matchDesc: `${teamA} vs ${teamB}`,
      packs: packs
    });

    try {
      await supabase.from('reward_codes').insert(codeInserts);
      await supabase.from('prode_predictions').update({ rewarded: true }).eq('user_id', user.id).eq('match_id', matchId);
    } catch (e) {}
  };

  const handleViewRewards = async (matchId: string, packs: number, teamA: string, teamB: string) => {
    if (!user) return;
    const codesKey = `trucomundial_reward_codes_${user.id}`;
    let foundCodes: any[] = [];
    try {
      const cached = localStorage.getItem(codesKey);
      if (cached) {
        const all: any[] = JSON.parse(cached);
        foundCodes = all.filter(c => c.source === `prode_match_${matchId}`);
      }
    } catch (e) {}

    if (foundCodes.length > 0) {
      setRewardCodesModal({
        codes: foundCodes.map(d => ({ code: d.code, used: d.used })),
        matchDesc: `${teamA} vs ${teamB}`,
        packs: packs
      });
      return;
    }

    try {
      const { data, error } = await supabase.from('reward_codes').select('code, used').eq('user_id', user.id).eq('source', `prode_match_${matchId}`);
      if (data && !error && data.length > 0) {
        setRewardCodesModal({
          codes: data.map(d => ({ code: d.code, used: d.used })),
          matchDesc: `${teamA} vs ${teamB}`,
          packs: packs
        });
      }
    } catch (e) {}
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
    } else if (activeTab === 'quarterfinals') {
      filtered = filtered.filter(m => m.group === 'Cuartos de final');
    } else if (activeTab === 'semifinals') {
      filtered = filtered.filter(m => m.group === 'Semifinales');
    } else if (activeTab === 'final') {
      filtered = filtered.filter(m => m.group === 'Final' || m.group === 'Tercer puesto');
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

      <div 
        ref={tabsScrollRef}
        style={{ display: 'flex', justifyContent: 'flex-start', gap: '0.75rem', marginBottom: '1rem', overflowX: 'auto', paddingBottom: '0.5rem', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div style={{ display: 'flex', gap: '0.5rem', width: 'max-content', margin: '0 auto', padding: '0 2px' }}>
          {renderTab('groups', t('group_stage'), Globe)}
          {renderTab('round_32', t('round_of_32'), Trophy)}
          {renderTab('round_16', t('round_of_16'), Trophy)}
          {renderTab('quarterfinals', t('quarterfinals'), Trophy)}
          {renderTab('semifinals', t('semifinals'), Trophy)}
          {renderTab('final', t('final'), Trophy)}
        </div>
      </div>

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


      {(activeTab === 'groups' || activeTab === 'round_32' || activeTab === 'round_16' || activeTab === 'quarterfinals' || activeTab === 'semifinals' || activeTab === 'final') && (
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
        {(activeTab === 'groups' || activeTab === 'round_32' || activeTab === 'round_16' || activeTab === 'quarterfinals' || activeTab === 'semifinals' || activeTab === 'final') && groupedMatches.length > 0 && groupedMatches.map((dayGroup, dIndex) => (
          <motion.div key={dIndex} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: dIndex * 0.05 }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff', fontSize: '1rem', fontWeight: 700, paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <Calendar size={18} />
              <span style={{ textTransform: 'capitalize' }}>{dayGroup.date}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {dayGroup.matches.map((match) => (
                <ProdeMatchCard
                  key={match.id}
                  match={match}
                  isMobile={isMobile}
                  user={user}
                  prediction={predictions[match.id]}
                  inputScoreA={inputs[match.id]?.scoreA ?? ''}
                  inputScoreB={inputs[match.id]?.scoreB ?? ''}
                  isSaving={!!isSaving[match.id]}
                  codeStatus={usedCodesStatus[match.id]}
                  onInputChange={(matchId, field, value) => {
                    setInputs(prev => ({ ...prev, [matchId]: { ...prev[matchId], [field]: value } }));
                  }}
                  onSave={handleSavePrediction}
                  onClaim={handleClaimReward}
                  onViewRewards={handleViewRewards}
                />
              ))}
            </div>
          </motion.div>
        ))}

        {groupedMatches.length === 0 && (
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
      </div>

      <TwitchButton />

      {rewardCodesModal && (
        <ProdeRewardModal
          codes={rewardCodesModal.codes}
          matchDesc={rewardCodesModal.matchDesc}
          packs={rewardCodesModal.packs}
          isMobile={isMobile}
          onClose={() => setRewardCodesModal(null)}
        />
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
