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
      if (timeParts.length >= 3) {
        const time = timeParts[0];
        const ampm = timeParts[1].toLowerCase() + " " + timeParts[2].toLowerCase();
        const [hourStr, minStr] = time.split(":");
        let hour = parseInt(hourStr);
        const min = parseInt(minStr);
        if (ampm.includes("p. m.") && hour < 12) hour += 12;
        if (ampm.includes("a. m.") && hour === 12) hour = 0;
        const matchDate = new Date(2026, month, day, hour, min, 0);
        return new Date() >= matchDate;
      }
    }
  }
  return false;
};

export const ProdeScreen: React.FC<ProdeScreenProps> = ({ user, onBack }) => {
  const { t } = useTranslation();
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  const [activeTab, setActiveTab] = useState<TabType>('groups');
  const [searchQuery, setSearchQuery] = useState('');
  const [liveResults, setLiveResults] = useState<Record<string, { scoreA: number, scoreB: number, status: string }>>({});

  // Prode states
  const [predictions, setPredictions] = useState<Record<string, { scoreA: number, scoreB: number }>>({});
  const [inputs, setInputs] = useState<Record<string, { scoreA: string, scoreB: string }>>({});
  const [isSaving, setIsSaving] = useState<Record<string, boolean>>({});

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
            map[p.match_id] = { scoreA: p.score_a, scoreB: p.score_b };
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
      if (!groups[match.date]) {
        groups[match.date] = [];
      }
      groups[match.date].push(match);
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
            ¡No cuelgues! <em>(Una vez guardado o iniciado el partido no se puede cambiar)</em>.
          </p>
        </div>
      </div>

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
                      <span style={{ fontSize: '1rem', fontWeight: 800 }}>{match.time}</span>
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
                            type="number" min="0" max="99" disabled={locked}
                            value={hasPrediction ? pScoreA : inScoreA}
                            onChange={(e) => setInputs(prev => ({ ...prev, [match.id]: { ...prev[match.id], scoreA: e.target.value } }))}
                            style={{ width: '40px', height: '40px', textAlign: 'center', background: locked ? 'transparent' : 'rgba(0,0,0,0.5)', border: locked ? 'none' : '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '0.5rem', fontWeight: 800, fontSize: '1.2rem', appearance: 'textfield' }}
                          />
                          <span style={{ fontWeight: 800, color: 'rgba(255,255,255,0.4)' }}>-</span>
                          <input
                            type="number" min="0" max="99" disabled={locked}
                            value={hasPrediction ? pScoreB : inScoreB}
                            onChange={(e) => setInputs(prev => ({ ...prev, [match.id]: { ...prev[match.id], scoreB: e.target.value } }))}
                            style={{ width: '40px', height: '40px', textAlign: 'center', background: locked ? 'transparent' : 'rgba(0,0,0,0.5)', border: locked ? 'none' : '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '0.5rem', fontWeight: 800, fontSize: '1.2rem', appearance: 'textfield' }}
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
                        ) : locked ? (
                          <div style={{ color: started ? '#ff4444' : '#00f2ff', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', textAlign: 'center' }}>
                            {started ? 'Partido Iniciado' : 'Predicción Guardada'}
                          </div>
                        ) : (
                          <button
                            disabled={isSaving[match.id]}
                            onClick={() => handleSavePrediction(match.id)}
                            style={{ background: '#00f2ff', color: '#000', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: isSaving[match.id] ? 0.5 : 1 }}
                          >
                            <Save size={16} /> Guardar
                          </button>
                        )}
                      </div>
                    )}

                    {isMobile && !locked && match.status !== 'finished' && (
                      <button
                        disabled={isSaving[match.id]}
                        onClick={() => handleSavePrediction(match.id)}
                        style={{ background: '#00f2ff', color: '#000', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: isSaving[match.id] ? 0.5 : 1, width: '100%', justifyContent: 'center', marginTop: '1rem' }}
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
    </div>
  );
};
