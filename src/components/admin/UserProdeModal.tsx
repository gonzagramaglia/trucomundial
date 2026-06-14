import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CalendarDays, CheckCircle, Circle } from 'lucide-react';
import { fixtureMatches } from '../../lib/fixtureData';
import { supabase } from '../../lib/supabase';


interface UserProdeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  userEmail: string;
  predictions: any[];
}

export const UserProdeModal: React.FC<UserProdeModalProps> = ({
  isOpen,
  onClose,
  userName,
  userEmail,
  predictions
}) => {
  const [results, setResults] = useState<Record<string, { scoreA: number, scoreB: number, status: string }>>({});

  useEffect(() => {
    if (!isOpen) return;
    const fetchResults = async () => {
      const { data, error } = await supabase.from('fixture_results').select('*');
      if (!error && data) {
        const map: Record<string, any> = {};
        data.forEach((r: any) => {
          map[r.match_id] = { scoreA: r.score_a, scoreB: r.score_b, status: r.status };
        });
        setResults(map);
      }
    };
    fetchResults();
  }, [isOpen]);

  if (!isOpen) return null;

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
            border: '1px solid rgba(0, 242, 255, 0.3)',
            borderRadius: '2rem',
            padding: '2rem',
            width: '100%',
            maxWidth: '600px',
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
              <h3 className="text-display" style={{ margin: 0, fontSize: '1.3rem', color: '#00f2ff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CalendarDays size={20} color="#00f2ff" /> Predicciones de Prode
              </h3>
              <div style={{ opacity: 0.7, fontSize: '0.85rem', marginTop: '0.3rem', fontWeight: 600 }}>
                {userName} <span style={{ opacity: 0.5, fontWeight: 400 }}>({userEmail || 'Sin Email'})</span>
              </div>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', opacity: 0.8, transition: 'opacity 0.2s' }} className="btn-hover-dark">
              <X size={22} />
            </button>
          </div>

          <div style={{
            background: 'rgba(0, 242, 255, 0.1)',
            border: '1px solid rgba(0, 242, 255, 0.2)',
            borderRadius: '1rem',
            padding: '0.75rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.9rem',
            fontWeight: 800,
            color: '#00f2ff'
          }}>
            <span>Total de Predicciones:</span>
            <span style={{ fontSize: '1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <CalendarDays size={16} color="#00f2ff" /> {predictions.length}
            </span>
          </div>

          {/* Predictions List */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.6rem',
            overflowY: 'auto',
            flex: 1,
            paddingRight: '0.5rem'
          }} className="team-selection-list">
            {predictions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', opacity: 0.4, fontSize: '0.9rem', fontStyle: 'italic' }}>
                Este usuario no ha participado en el prode todavía.
              </div>
            ) : (
              predictions.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()).map((pred) => {
                const match = fixtureMatches.find(m => m.id === pred.match_id);
                if (!match) return null;
                const result = results[pred.match_id];
                let points = 0;
                let wonExact = false;
                let wonResult = false;
                if (result && result.status === 'finished') {
                  wonExact = pred.score_a === result.scoreA && pred.score_b === result.scoreB;
                  const predWinner = pred.score_a > pred.score_b ? 'A' : (pred.score_a < pred.score_b ? 'B' : 'Draw');
                  const resWinner = result.scoreA > result.scoreB ? 'A' : (result.scoreA < result.scoreB ? 'B' : 'Draw');
                  wonResult = predWinner === resWinner;
                  if (wonExact) points = 3;
                  else if (wonResult) points = 1;
                }

                return (
                  <div key={pred.match_id} style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '1rem',
                    padding: '0.75rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', minWidth: '100px' }}>
                         <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>{match.group}</span>
                         <span style={{ fontSize: '0.7rem', opacity: 0.4 }}>{match.date}</span>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, justifyContent: 'center' }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, justifyContent: 'flex-end' }}>
                           <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{match.teamA}</span>
                           <span style={{ fontSize: '1.2rem' }}>{match.flagA}</span>
                         </div>
                         <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '60px' }}>
                           <div style={{ background: 'rgba(0,0,0,0.5)', padding: '0.2rem 0.5rem', borderRadius: '0.5rem', fontWeight: 900, color: '#00f2ff', fontSize: '1rem' }}>
                             {pred.score_a} - {pred.score_b}
                           </div>
                         </div>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                           <span style={{ fontSize: '1.2rem' }}>{match.flagB}</span>
                           <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{match.teamB}</span>
                         </div>
                      </div>
                    </div>

                    <div style={{ minWidth: '80px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center', gap: '0.25rem' }}>
                      {result?.status === 'finished' ? (
                        <>
                           {points > 0 ? (
                             <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#00e676', fontSize: '0.75rem', fontWeight: 800 }}>
                               <CheckCircle size={14} /> {points} Pts
                             </div>
                           ) : (
                             <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#ff4444', fontSize: '0.75rem', fontWeight: 800 }}>
                               <X size={14} /> 0 Pts
                             </div>
                           )}
                           <div style={{ fontSize: '0.65rem', opacity: 0.6 }}>Real: {result.scoreA}-{result.scoreB}</div>
                        </>
                      ) : (
                         <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', fontWeight: 800 }}>
                           <Circle size={14} /> Pende
                         </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

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
