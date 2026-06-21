import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../../lib/supabase';
import { fixtureMatches } from '../../../lib/fixtureData';
import { Search, Save, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const FixtureTab: React.FC = () => {
  const [results, setResults] = useState<Record<string, { scoreA?: number; scoreB?: number; status: string }>>({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedMap, setSavedMap] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  const { t } = useTranslation();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchResults = async () => {
    try {
      const { data, error } = await supabase.from('fixture_results').select('*');
      if (error) throw error;
      
      const resultsMap: Record<string, { scoreA?: number; scoreB?: number; status: string }> = {};
      const initialSaved: Record<string, boolean> = {};
      data?.forEach(row => {
        resultsMap[row.match_id] = {
          scoreA: row.score_a,
          scoreB: row.score_b,
          status: row.status
        };
        initialSaved[row.match_id] = true;
      });
      setResults(resultsMap);
      setSavedMap(initialSaved);
    } catch (err) {
      console.error("Error fetching fixture results:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  const handleScoreChange = (matchId: string, team: 'A' | 'B', val: string) => {
    const cleaned = val.replace(/[^0-9]/g, '').slice(0, 1);
    const num = cleaned === '' ? undefined : parseInt(cleaned);
    
    setResults(prev => ({
      ...prev,
      [matchId]: {
        scoreA: team === 'A' ? num : prev[matchId]?.scoreA,
        scoreB: team === 'B' ? num : prev[matchId]?.scoreB,
        status: 'finished'
      }
    }));
  };

  const handleSave = async (matchId: string) => {
    const res = results[matchId];
    if (!res) return;
    
    setSavingId(matchId);
    try {
      const { error } = await supabase.from('fixture_results').upsert({
        match_id: matchId,
        score_a: res.scoreA,
        score_b: res.scoreB,
        status: 'finished',
        updated_at: new Date().toISOString()
      }, { onConflict: 'match_id' });
      
      if (error) throw error;
      
      setSavedMap(prev => ({ ...prev, [matchId]: true }));
    } catch (err: any) {
      alert("Error guardando el resultado: " + err.message);
    } finally {
      setSavingId(null);
    }
  };

  const filteredMatches = useMemo(() => {
    if (!searchQuery) return fixtureMatches;
    const q = searchQuery.toLowerCase();
    const groupSearch = q.replace('grupo', 'group');
    
    return fixtureMatches.filter(m => 
      m.teamA.toLowerCase().includes(q) || 
      m.teamB.toLowerCase().includes(q) || 
      m.group.toLowerCase().includes(q) ||
      m.group.toLowerCase().includes(groupSearch) ||
      m.date.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem', opacity: 0.5 }}>Cargando fixture...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 className="text-display" style={{ fontSize: '1.5rem', margin: 0, color: '#fff' }}>{t('admin_world_cup_results')}</h3>
      </div>
      
      {/* Search Bar */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '1rem',
        padding: '0.5rem 1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
      }}>
        <Search size={18} style={{ opacity: 0.5 }} />
        <input 
          type="text" 
          placeholder={t('admin_search_placeholder')} 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'white',
            width: '100%',
            fontSize: '1rem',
            fontFamily: 'inherit'
          }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredMatches.map(match => (
          <div key={match.id} style={{
            background: 'rgba(20, 20, 25, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '1rem',
            padding: '1rem',
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? '1rem' : '2rem',
            alignItems: 'center',
          }}>
            <div style={{ flex: isMobile ? 'none' : '0 0 180px', display: 'flex', flexDirection: 'column', textAlign: isMobile ? 'center' : 'left' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 800 }}>{match.date}</span>
              <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>{match.group.replace('Group', 'Grupo')} - {match.time}</span>
            </div>

            {/* Editor */}
            <div style={{ 
              flex: 1, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: '1rem',
              width: isMobile ? '100%' : 'auto'
            }}>
              {/* Team A */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, justifyContent: 'flex-end' }}>
                <span style={{ fontWeight: 800 }}>{match.teamA}</span>
                <span style={{ fontSize: '1.5rem' }}>{match.flagA}</span>
              </div>
              
              {/* Score Inputs */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,0,0,0.5)', padding: '0.5rem', borderRadius: '0.5rem' }}>
                <input 
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={results[match.id]?.scoreA ?? ''}
                  onChange={(e) => handleScoreChange(match.id, 'A', e.target.value)}
                  disabled={savedMap[match.id]}
                  style={{
                    width: '40px',
                    height: '40px',
                    textAlign: 'center',
                    background: savedMap[match.id] ? 'transparent' : 'rgba(255,255,255,0.1)',
                    border: savedMap[match.id] ? 'none' : '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '0.5rem',
                    color: 'white',
                    fontSize: '1.25rem',
                    fontWeight: 'bold',
                    padding: 0,
                    opacity: savedMap[match.id] ? 0.8 : 1
                  }}
                />
                <span style={{ opacity: 0.5, fontWeight: 'bold' }}>-</span>
                <input 
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={results[match.id]?.scoreB ?? ''}
                  onChange={(e) => handleScoreChange(match.id, 'B', e.target.value)}
                  disabled={savedMap[match.id]}
                  style={{
                    width: '40px',
                    height: '40px',
                    textAlign: 'center',
                    background: savedMap[match.id] ? 'transparent' : 'rgba(255,255,255,0.1)',
                    border: savedMap[match.id] ? 'none' : '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '0.5rem',
                    color: 'white',
                    fontSize: '1.25rem',
                    fontWeight: 'bold',
                    padding: 0,
                    opacity: savedMap[match.id] ? 0.8 : 1
                  }}
                />
              </div>

              {/* Team B */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, justifyContent: 'flex-start' }}>
                <span style={{ fontSize: '1.5rem' }}>{match.flagB}</span>
                <span style={{ fontWeight: 800 }}>{match.teamB}</span>
              </div>
            </div>

            {/* Actions */}
            <div style={{ flex: isMobile ? 'none' : '0 0 100px', display: 'flex', justifyContent: 'center', width: isMobile ? '100%' : 'auto' }}>
              <button
                id={`btn-save-${match.id}`}
                disabled={results[match.id]?.scoreA === undefined || results[match.id]?.scoreB === undefined || savingId === match.id || savedMap[match.id]}
                onClick={() => handleSave(match.id)}
                className="btn-hover-dark"
                style={{
                  background: savedMap[match.id] ? 'rgba(0, 230, 118, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                  border: savedMap[match.id] ? '1px solid rgba(0, 230, 118, 0.5)' : '1px solid rgba(34, 197, 94, 0.5)',
                  color: savedMap[match.id] ? '#00e676' : '#4ade80',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontWeight: 'bold',
                  cursor: (results[match.id]?.scoreA === undefined || results[match.id]?.scoreB === undefined || savingId === match.id || savedMap[match.id]) ? 'not-allowed' : 'pointer',
                  opacity: (results[match.id]?.scoreA === undefined || results[match.id]?.scoreB === undefined || savedMap[match.id]) ? 0.6 : 1,
                  width: isMobile ? '100%' : 'auto',
                  justifyContent: 'center'
                }}
              >
                {savingId === match.id ? (
                  <div key="spinner" style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                ) : savedMap[match.id] ? (
                  <Check key="check" size={16} />
                ) : (
                  <Save key="icon" size={16} />
                )}
                <span>{savedMap[match.id] ? t('admin_saved') : t('admin_save')}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
