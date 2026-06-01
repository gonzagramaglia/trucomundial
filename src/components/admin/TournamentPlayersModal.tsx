import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, UserPlus } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Registration {
  user_id: string;
  code_used: string;
  id?: string;
}

interface TournamentPlayersModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournament: any | null;
  registrations: Registration[];
  onSuccess: () => void;
}

export const TournamentPlayersModal: React.FC<TournamentPlayersModalProps> = ({
  isOpen,
  onClose,
  tournament,
  registrations: initialRegistrations,
  onSuccess
}) => {
  const [registrations, setRegistrations] = useState<Registration[]>(initialRegistrations);
  const [newUserId, setNewUserId] = useState('');
  const [newCode, setNewCode] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !tournament) return null;

  const handleRemove = async (reg: Registration) => {
    setSaving(true);
    setError('');
    try {
      let query = supabase
        .from('tournament_registrations')
        .delete()
        .eq('tournament_id', tournament.id)
        .eq('user_id', reg.user_id);

      if (reg.code_used) {
        query = query.eq('code_used', reg.code_used);
      }

      const { error: dbError } = await query;
      if (dbError) throw dbError;

      const newCount = tournament.participants > 0 ? tournament.participants - 1 : 0;
      await supabase.from('tournaments').update({ participants: newCount }).eq('id', tournament.id);

      setRegistrations(prev => prev.filter(r => !(r.user_id === reg.user_id && r.code_used === reg.code_used)));
      onSuccess();
    } catch (err: any) {
      setError('Error al eliminar: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = async () => {
    if (!newUserId.trim()) return;
    setSaving(true);
    setError('');
    try {
      const { error: dbError } = await supabase
        .from('tournament_registrations')
        .insert([{ tournament_id: tournament.id, user_id: newUserId.trim(), code_used: newCode.trim() || null }]);
      if (dbError) throw dbError;

      const newCount = (tournament.participants || 0) + 1;
      await supabase.from('tournaments').update({ participants: newCount }).eq('id', tournament.id);

      setRegistrations(prev => [...prev, { user_id: newUserId.trim(), code_used: newCode.trim() }]);
      setNewUserId('');
      setNewCode('');
      onSuccess();
    } catch (err: any) {
      setError('Error al agregar: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    background: 'rgba(0,0,0,0.3)',
    border: '1px solid rgba(255,255,255,0.15)',
    color: '#fff',
    padding: '0.6rem 0.75rem',
    borderRadius: '0.75rem',
    fontSize: '0.85rem',
    fontFamily: 'monospace',
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3100, padding: '1rem'
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
            borderRadius: '2rem', padding: '2rem', width: '100%', maxWidth: '540px',
            maxHeight: '85vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem'
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 className="text-display" style={{ margin: 0, fontSize: '1.3rem', color: '#a855f7' }}>
                Editar Jugadores
              </h3>
              <div style={{ opacity: 0.5, fontSize: '0.8rem', marginTop: '0.2rem' }}>{tournament.name}</div>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
              <X size={22} />
            </button>
          </div>

          {/* Players List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#ff7800', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Inscriptos ({registrations.length})
            </div>
            {registrations.length === 0 && (
              <div style={{ opacity: 0.4, fontSize: '0.85rem' }}>Sin inscriptos aún.</div>
            )}
            {registrations.map((reg, idx) => (
              <div key={idx} style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '0.75rem',
                padding: '0.6rem 0.85rem',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem'
              }}>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontFamily: 'monospace', fontSize: '0.8rem', opacity: 0.8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {reg.user_id}
                  </div>
                  {reg.code_used && (
                    <div style={{ fontSize: '0.7rem', color: '#a855f7', fontWeight: 800, marginTop: '0.1rem' }}>
                      Código: {reg.code_used}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleRemove(reg)}
                  disabled={saving}
                  style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', width: '32px', height: '32px', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          {/* Add Player */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.25rem' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#ff7800', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Agregar Jugador
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <input
                type="text"
                placeholder="User ID (UUID)"
                value={newUserId}
                onChange={e => setNewUserId(e.target.value)}
                style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }}
              />
              <input
                type="text"
                placeholder="Código (opcional)"
                value={newCode}
                onChange={e => setNewCode(e.target.value)}
                style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }}
              />
              <button
                onClick={handleAdd}
                disabled={saving || !newUserId.trim()}
                style={{
                  background: '#a855f7', border: 'none', color: '#fff',
                  height: '42px', borderRadius: '0.75rem', fontWeight: 800, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  opacity: !newUserId.trim() ? 0.5 : 1
                }}
              >
                <UserPlus size={16} /> Agregar
              </button>
            </div>
          </div>

          {error && (
            <div style={{ color: '#ef4444', fontSize: '0.85rem', fontWeight: 700 }}>{error}</div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
