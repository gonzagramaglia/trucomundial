import React, { useState, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, ArrowLeft, Send, Clock, XCircle, User, Link, MessageSquare } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { creatorApplicationSchema, type CreatorApplicationFormData } from '../../lib/schemas';
import { TwitchButton } from '../shared/TwitchButton';


interface CreatorsApplicationScreenProps {
  user: any;
  handleAuth: () => void;
  onBack: () => void;
}

export const CreatorsApplicationScreen: React.FC<CreatorsApplicationScreenProps> = ({ user, handleAuth, onBack }) => {
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  const [loading, setLoading] = useState(true);
  const [applicationStatus, setApplicationStatus] = useState<'none' | 'pending' | 'approved' | 'rejected'>('none');
  
  const { register, handleSubmit, formState: { errors } } = useForm<CreatorApplicationFormData>({
    resolver: zodResolver(creatorApplicationSchema),
    defaultValues: {
      channel_name: '',
      social_link: '',
      streaming_link: ''
    }
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchApplication = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        const { data } = await supabase
          .from('creator_applications')
          .select('status')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (data) {
          setApplicationStatus(data.status as any);
        }
      } catch (err) {
        // No application found or error
      } finally {
        setLoading(false);
      }
    };
    
    fetchApplication();
  }, [user]);

  const onSubmit = async (data: CreatorApplicationFormData) => {
    if (!user || !data.channel_name) return;
    
    setSubmitting(true);
    try {
      const { error } = await supabase.from('creator_applications').insert([{
        user_id: user.id,
        email: user.email,
        channel_name: data.channel_name,
        social_link: data.social_link,
        streaming_link: data.streaming_link,
        motivation: data.motivation,
        status: 'pending'
      }]);

      if (error) throw error;
      
      setApplicationStatus('pending');
    } catch (err: any) {
      alert('Error enviando la solicitud: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: '1200px',
      margin: '0 auto',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      padding: isMobile ? '1.25rem 1rem 4rem 1rem' : '1rem 1rem 4rem 1rem',
      color: '#fff',
      boxSizing: 'border-box'
    }}>
      {/* HEADER SECTION */}
      {!isMobile && (
        <button
          onClick={onBack}
          className="home-btn-fixed btn-hover-dark profile-nav-btn"
          style={{
            position: "fixed",
            top: "1.5rem",
            left: "1rem",
            background: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(12px)",
            zIndex: 2000,
            height: "36px",
            borderRadius: "0.85rem",
            padding: "0 0.85rem",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            color: "white",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "none",
            fontWeight: 900,
            fontSize: "0.7rem",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            cursor: "pointer"
          }}
        >
          <ArrowLeft size={14} />
          <span>Volver</span>
        </button>
      )}

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: isMobile ? '0.5rem' : '1rem',
        width: '100%',
        position: 'relative'
      }}>
        {isMobile ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'flex-start', width: '100%', marginBottom: '1rem' }}>
              <button
                onClick={onBack}
                className="btn-hover-dark"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: 'white',
                  height: '36px',
                  borderRadius: '0.75rem',
                  padding: '0 0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '3px 3px 0px #000',
                }}
              >
                <ArrowLeft size={14} />
                Volver
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={24} style={{ color: '#10b981', filter: 'drop-shadow(0 0 6px rgba(16, 185, 129, 0.25))' }} />
                <h2 className="text-display" style={{
                  fontSize: '1.4rem',
                  margin: 0,
                  letterSpacing: '0.05em',
                  color: '#10b981',
                  textShadow: '0 0 8px rgba(16, 185, 129, 0.1)'
                }}>
                  PROGRAMA DE CREADORES
                </h2>
              </div>
              <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>Solicitud para organizar torneos</div>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <ShieldCheck size={36} style={{ color: '#10b981', filter: 'drop-shadow(0 0 10px rgba(16, 185, 129, 0.3))' }} />
              <h2 className="text-display" style={{
                fontSize: '2.2rem',
                margin: 0,
                letterSpacing: '0.05em',
                color: '#10b981',
                textShadow: '0 0 15px rgba(16, 185, 129, 0.2)'
              }}>
                PROGRAMA DE CREADORES
              </h2>
            </div>
            <div style={{ fontSize: '0.9rem', opacity: 0.6 }}>Solicitud para organizar torneos oficiales</div>
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: '#10b981', fontWeight: 800, fontSize: '1.2rem' }}>
          Cargando...
        </div>
      ) : !user ? (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1.5px dashed rgba(16, 185, 129, 0.3)',
            borderRadius: '2rem',
            padding: '3rem 2rem',
            textAlign: 'center',
            maxWidth: '500px'
          }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#10b981', fontSize: '1.25rem', fontWeight: 900 }}>
              INICIÁ SESIÓN PARA APLICAR
            </h3>
            <p style={{ margin: '0 0 2rem 0', opacity: 0.8, lineHeight: 1.5, fontSize: '0.9rem' }}>
              Necesitás tener una cuenta activa en Truco Mundial para poder enviar tu solicitud al programa de creadores de torneos.
            </p>
            <button
              onClick={handleAuth}
              className="btn-hover-dark"
              style={{
                background: '#9146ff',
                border: 'none',
                color: '#fff',
                height: '46px',
                borderRadius: '1.25rem',
                padding: '0 2rem',
                fontSize: '0.9rem',
                fontWeight: 950,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.6rem',
                cursor: 'pointer',
                boxShadow: '4px 4px 0px #000'
              }}
            >
              Iniciar sesión con Google
            </button>
          </div>
        </div>
      ) : applicationStatus !== 'none' ? (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: `1.5px solid ${applicationStatus === 'approved' ? '#10b981' : applicationStatus === 'rejected' ? '#ef4444' : '#f59e0b'}`,
            borderRadius: '2rem',
            padding: '3rem 2rem',
            textAlign: 'center',
            maxWidth: '500px',
            width: '100%',
            boxShadow: `0 0 30px ${applicationStatus === 'approved' ? 'rgba(16, 185, 129, 0.1)' : applicationStatus === 'rejected' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)'}`
          }}>
            {applicationStatus === 'pending' && (
              <>
                <Clock size={48} style={{ color: '#f59e0b', margin: '0 auto 1.5rem auto' }} />
                <h3 style={{ margin: '0 0 1rem 0', color: '#f59e0b', fontSize: '1.5rem', fontWeight: 900 }}>SOLICITUD EN REVISIÓN</h3>
                <p style={{ margin: 0, opacity: 0.8, lineHeight: 1.5 }}>Tu solicitud ha sido recibida y está siendo revisada por los administradores. Te avisaremos pronto.</p>
              </>
            )}
            {applicationStatus === 'approved' && (
              <>
                <ShieldCheck size={48} style={{ color: '#10b981', margin: '0 auto 1.5rem auto' }} />
                <h3 style={{ margin: '0 0 1rem 0', color: '#10b981', fontSize: '1.5rem', fontWeight: 900 }}>¡FELICIDADES!</h3>
                <p style={{ margin: '0 0 2rem 0', opacity: 0.8, lineHeight: 1.5 }}>Sos parte del programa de creadores oficiales.</p>
                <button
                  onClick={() => window.location.href = window.location.pathname.startsWith('/en') ? '/en/creador' : '/creador'}
                  className="btn-hover-dark"
                  style={{
                    background: '#10b981', border: 'none', color: '#000', height: '46px', borderRadius: '1.25rem',
                    padding: '0 2rem', fontSize: '0.9rem', fontWeight: 900, cursor: 'pointer', boxShadow: '4px 4px 0px #000'
                  }}
                >
                  IR AL PANEL DE CREADOR
                </button>
              </>
            )}
            {applicationStatus === 'rejected' && (
              <>
                <XCircle size={48} style={{ color: '#ef4444', margin: '0 auto 1.5rem auto' }} />
                <h3 style={{ margin: '0 0 1rem 0', color: '#ef4444', fontSize: '1.5rem', fontWeight: 900 }}>SOLICITUD RECHAZADA</h3>
                <p style={{ margin: 0, opacity: 0.8, lineHeight: 1.5 }}>Lo sentimos, tu solicitud para el programa de creadores no ha sido aprobada en esta ocasión.</p>
              </>
            )}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <form onSubmit={handleSubmit(onSubmit)} style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '2rem',
            padding: isMobile ? '2rem 1.5rem' : '3rem',
            maxWidth: '550px',
            width: '100%',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
          }}>
            <p style={{ margin: '0 0 2.5rem 0', opacity: 0.8, lineHeight: 1.6, textAlign: 'center' }}>
              Convertite en organizador oficial de Truco Mundial. Llená este formulario y nuestro equipo revisará tu perfil para habilitarte el panel de torneos.
            </p>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ marginBottom: '0.75rem', fontSize: '0.9rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <User size={16} style={{ color: '#10b981' }}/> Nombre público
              </label>
              <input
                type="text"
                {...register('channel_name')}
                placeholder="Ej: Mucho Movimiento"
                style={{
                  width: '100%', background: 'rgba(0,0,0,0.3)', border: errors.channel_name ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.15)', color: '#fff',
                  padding: '1rem', borderRadius: '1rem', fontSize: '1rem', outline: 'none', transition: 'border 0.2s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = '#10b981'}
                onBlur={(e) => e.target.style.borderColor = errors.channel_name ? '#ef4444' : 'rgba(255,255,255,0.15)'}
              />
              {errors.channel_name && <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.5rem', display: 'block', fontWeight: 700 }}>{errors.channel_name.message}</span>}
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ marginBottom: '0.75rem', fontSize: '0.9rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Link size={16} style={{ color: '#10b981' }}/> Link a tu red social principal
              </label>
              <input
                type="text"
                {...register('social_link')}
                placeholder="Ej: https://instagram.com/tu_cuenta"
                style={{
                  width: '100%', background: 'rgba(0,0,0,0.3)', border: errors.social_link ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.15)', color: '#fff',
                  padding: '1rem', borderRadius: '1rem', fontSize: '1rem', outline: 'none', transition: 'border 0.2s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = '#10b981'}
                onBlur={(e) => e.target.style.borderColor = errors.social_link ? '#ef4444' : 'rgba(255,255,255,0.15)'}
              />
              {errors.social_link && <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.5rem', display: 'block', fontWeight: 700 }}>{errors.social_link.message}</span>}
            </div>

            <div style={{ marginBottom: '2.5rem' }}>
              <label style={{ marginBottom: '0.75rem', fontSize: '0.9rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Link size={16} style={{ color: '#10b981' }}/> Link a tu Canal de Streaming
              </label>
              <input
                type="text"
                {...register('streaming_link')}
                placeholder="Ej: https://twitch.tv/tu_canal"
                style={{
                  width: '100%', background: 'rgba(0,0,0,0.3)', border: errors.streaming_link ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.15)', color: '#fff',
                  padding: '1rem', borderRadius: '1rem', fontSize: '1rem', outline: 'none', transition: 'border 0.2s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = '#10b981'}
                onBlur={(e) => e.target.style.borderColor = errors.streaming_link ? '#ef4444' : 'rgba(255,255,255,0.15)'}
              />
              {errors.streaming_link && <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.5rem', display: 'block', fontWeight: 700 }}>{errors.streaming_link.message}</span>}
            </div>

            <div style={{ marginBottom: '2.5rem' }}>
              <label style={{ marginBottom: '0.75rem', fontSize: '0.9rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MessageSquare size={16} style={{ color: '#10b981' }}/> ¿Por qué querés ser creador?
              </label>
              <textarea
                {...register('motivation')}
                placeholder="Ej: Quiero organizar torneos para mi comunidad..."
                style={{
                  width: '100%', background: 'rgba(0,0,0,0.3)', border: errors.motivation ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.15)', color: '#fff',
                  padding: '1rem', borderRadius: '1rem', fontSize: '1rem', fontFamily: 'inherit', minHeight: '100px', resize: 'vertical', outline: 'none', transition: 'border 0.2s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = '#10b981'}
                onBlur={(e) => e.target.style.borderColor = errors.motivation ? '#ef4444' : 'rgba(255,255,255,0.15)'}
              />
              {errors.motivation && <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.5rem', display: 'block', fontWeight: 700 }}>{errors.motivation.message}</span>}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-hover-dark"
              style={{
                width: '100%', background: '#10b981', border: 'none', color: '#000', height: '54px',
                borderRadius: '1.25rem', fontSize: '1.05rem', fontWeight: 900, cursor: submitting ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                boxShadow: '4px 4px 0px #000', opacity: submitting ? 0.7 : 1
              }}
            >
              {submitting ? 'ENVIANDO...' : 'ENVIAR SOLICITUD'}
              <Send size={18} />
            </button>
          </form>
        </div>
      )}

      {/* Twitch Button - Way Down Bottom & Centered */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0 2rem 0' }}>
        <TwitchButton />
      </div>
    </div>
  );
};
