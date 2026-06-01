import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useTranslation } from 'react-i18next';

interface CreatorProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  creator: any | null;
  onSuccess: () => void;
}

export const CreatorProfileModal: React.FC<CreatorProfileModalProps> = ({
  isOpen,
  onClose,
  creator,
  onSuccess
}) => {
  const { t } = useTranslation();
  const [channelName, setChannelName] = useState('');
  const [socialLink, setSocialLink] = useState('');
  const [streamingLink, setStreamingLink] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && creator) {
      setChannelName(creator.channel_name || '');
      setSocialLink(creator.social_link || '');
      setStreamingLink(creator.streaming_link || '');
      setError('');
    }
  }, [isOpen, creator]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!creator) return;
    
    setLoading(true);
    setError('');

    try {
      const { error: dbError } = await supabase
        .from('creator_applications')
        .update({
          channel_name: channelName,
          social_link: socialLink,
          streaming_link: streamingLink
        })
        .eq('id', creator.id);

      if (dbError) throw dbError;
      
      onSuccess();
      onClose();
    } catch (err: any) {
      setError('Error al actualizar el perfil: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, padding: '1rem'
        }}
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          style={{
            background: 'rgba(20, 15, 30, 0.95)',
            border: '1px solid rgba(168, 85, 247, 0.3)',
            borderRadius: '2rem', padding: '2rem', width: '100%', maxWidth: '500px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 className="text-display" style={{ margin: 0, fontSize: '1.5rem', color: '#a855f7' }}>
              Editar Perfil Creador
            </h3>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 800 }}>{t('channel_name')}</label>
              <input
                type="text"
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
                required
                style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '0.75rem', borderRadius: '0.75rem', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 800 }}>{t('social_link')}</label>
              <input
                type="url"
                value={socialLink}
                onChange={(e) => setSocialLink(e.target.value)}
                placeholder="https://instagram.com/..."
                style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '0.75rem', borderRadius: '0.75rem', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 800 }}>{t('streaming_link')}</label>
              <input
                type="url"
                value={streamingLink}
                onChange={(e) => setStreamingLink(e.target.value)}
                placeholder="https://twitch.tv/..."
                style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '0.75rem', borderRadius: '0.75rem', boxSizing: 'border-box' }}
              />
            </div>

            {error && (
              <div style={{ color: '#ef4444', fontSize: '0.85rem', fontWeight: 800 }}>{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                background: '#a855f7', border: 'none', color: '#fff', height: '48px', borderRadius: '1rem',
                fontSize: '1rem', fontWeight: 900, cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                marginTop: '1rem', opacity: loading ? 0.7 : 1
              }}
            >
              <Save size={18} />
              {t('save')}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
