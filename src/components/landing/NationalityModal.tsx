import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Globe, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { CARDS } from '../../data/cards';
import { getFlag } from '../../data/flags';


interface NationalityModalProps {
  user: any;
  onSaved: (nationality: string) => void;
}

export const NationalityModal: React.FC<NationalityModalProps> = ({ user, onSaved }) => {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  // Extract unique countries
  const countries = Array.from(new Set(CARDS.map(c => c.country))).sort();
  
  const filteredCountries = countries.filter(c => c.toLowerCase().includes(search.toLowerCase()));

  const handleSave = async () => {
    if (!selected) return;
    setIsSaving(true);
    try {
      await supabase.auth.updateUser({
        data: { nationality: selected }
      });
      
      if (user?.id) {
        const { data } = await supabase
          .from("profiles")
          .update({ nationality: selected })
          .eq("id", user.id)
          .select();

        if (!data || data.length === 0) {
          await supabase.from("profiles").upsert({ 
            id: user.id, 
            nationality: selected,
            username: user?.user_metadata?.custom_username || user?.user_metadata?.full_name || user?.user_metadata?.name || 'Usuario',
            email: user?.email
          }, { onConflict: 'id' });
        }
      }
      onSaved(selected);
    } catch (e) {
      console.error('Error updating nationality', e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div 
      onClick={() => onSaved('')}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 3500,
        padding: '1rem'
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'linear-gradient(145deg, rgba(30, 30, 35, 0.95), rgba(20, 20, 25, 0.95))',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '2rem',
          padding: '2rem',
          width: '100%',
          maxWidth: '450px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          color: '#fff',
          textAlign: 'center'
        }}
      >
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: 900, margin: '0 0 0.5rem 0', textTransform: 'uppercase' }}>
            <span style={{ color: '#fff' }}>¡Bienvenido </span>
            <span style={{ color: '#00f2ff' }}>{user?.user_metadata?.custom_username || user?.email?.split('@')[0]}!</span>
          </h2>
          <p style={{ margin: 0, opacity: 0.8, fontSize: '0.95rem', lineHeight: 1.5 }}>
            Por favor elegí tu nacionalidad.
          </p>
        </div>

        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
          <input 
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar país..."
            style={{
              width: '100%',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '1rem',
              padding: '0.8rem 1rem 0.8rem 2.5rem',
              color: '#fff',
              fontSize: '1rem',
              outline: 'none'
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <div className="white-scrollbar" style={{
            maxHeight: '170px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.4rem',
            paddingRight: '0.5rem',
            textAlign: 'left'
          }}>
            {filteredCountries.length > 0 ? filteredCountries.map(c => (
              <button
                key={c}
                onClick={() => setSelected(c)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.5rem 1rem',
                  background: selected === c ? 'rgba(0, 242, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                  border: `1px solid ${selected === c ? '#00f2ff' : 'transparent'}`,
                  borderRadius: '0.75rem',
                  color: selected === c ? '#00f2ff' : '#fff',
                  cursor: 'pointer',
                  fontWeight: selected === c ? 800 : 500,
                  transition: 'all 0.1s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.2rem' }}>{getFlag(c)}</span>
                  <span>{c}</span>
                </div>
                {selected === c && <Check size={18} />}
              </button>
            )) : (
              <div style={{ padding: '1rem', opacity: 0.5, textAlign: 'center' }}>
                No se encontraron países
              </div>
            )}
          </div>
          
          {/* OTRA BUTTON FIXED AT BOTTOM */}
          <button
            onClick={() => setSelected('Otra')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.5rem 1rem',
              background: selected === 'Otra' ? 'rgba(250, 204, 21, 0.15)' : 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${selected === 'Otra' ? '#facc15' : 'transparent'}`,
              borderRadius: '0.75rem',
              color: selected === 'Otra' ? '#facc15' : '#fff',
              cursor: 'pointer',
              fontWeight: selected === 'Otra' ? 800 : 500,
              transition: 'all 0.1s ease',
              marginTop: '0.2rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.2rem' }}>{getFlag('Otra')}</span>
              <span>Otra</span>
            </div>
            {selected === 'Otra' && <Check size={18} />}
          </button>
        </div>

        <button
          onClick={handleSave}
          disabled={!selected || isSaving}
          className="btn-hover-dark"
          style={{
            width: '100%',
            background: selected ? '#00f2ff' : 'rgba(255,255,255,0.1)',
            border: 'none',
            color: selected ? '#000' : 'rgba(255,255,255,0.3)',
            padding: '1rem',
            borderRadius: '1rem',
            fontWeight: 900,
            fontSize: '1rem',
            textTransform: 'uppercase',
            cursor: selected && !isSaving ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}
        >
          {!isSaving && <Globe size={18} />}
          {isSaving ? 'Guardando...' : 'Comenzá a jugar'}
        </button>

      </motion.div>
    </div>
  );
};
