import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Home, LogOut, Music, Globe } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { LandingHeader } from './LandingHeader';
import { GameModeSelector } from './GameModeSelector';
import { PointSelector } from './PointSelector';
import { MatchmakingOverlay } from './MatchmakingOverlay';

interface LandingPageProps {
  onStart: (mode: "1v1" | "2v2" | "multiplayer", points: 15 | 30, rivalName?: string, rivalId?: string, isCreator?: boolean, roomCode?: string, isReconnecting?: boolean) => void;
  sessionId: string;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart, sessionId }) => {
  const { t } = useTranslation();
  const [isWaiting, setIsWaiting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);
  const [user, setUser] = useState<any>(null);
  const [rivalData, setRivalData] = useState<{ name: string, id: string } | null>(null);
  const [showVersus, setShowVersus] = useState(false);
  const [selectedMode, setSelectedMode] = useState<"1v1" | "2v2" | "multiplayer" | null>(null);
  const [isSelectingPoints, setIsSelectingPoints] = useState(false);
  const [roomCode, setRoomCode] = useState<string>("");
  const [isJoining, setIsJoining] = useState(false);
  const [inputCode, setInputCode] = useState("");
  const [isCreator, setIsCreator] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }: any) => setUser(session?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => setUser(session?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    let timer: any;
    if (isWaiting && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0 && isWaiting) {
      setIsWaiting(false);
      setRoomCode("");
      setInputCode("");
      setSelectedMode(null);
      alert("El tiempo de espera ha expirado. El código ya no es válido.");
    }
    return () => clearInterval(timer);
  }, [isWaiting, timeLeft]);

  const handleAuth = async () => {
    if (user) {
      await supabase.auth.signOut();
    } else {
      const origin = window.location.origin;
      await supabase.auth.signInWithOAuth({ 
        provider: 'google', 
        options: { 
          redirectTo: origin,
          queryParams: {
            prompt: 'select_account',
          }
        } 
      });
    }
  };

  const generateRoomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const initiateGame = (mode: "1v1" | "2v2" | "multiplayer", points: 15 | 30) => {
    setIsSelectingPoints(false);
    
    if (mode === 'multiplayer') {
      if (!user) {
        handleAuth();
      } else {
        handleCreateRoom(points); // Pass points directly to avoid state race
      }
    } else {
      onStart(mode, points);
    }
  };

  const handleCreateRoom = async (pointsToUse: number) => {
    const code = generateRoomCode();
    setRoomCode(code);
    setIsCreator(true);
    setIsWaiting(true);
    setTimeLeft(300);

    const newRoomInfo = {
      creatorId: user?.id || sessionId,
      creatorName: user?.user_metadata?.full_name?.split(' ')[0] || "HOST",
      points: pointsToUse
    };

    // Register room in table
    const { error } = await supabase
      .from('game_sync')
      .upsert({ 
        match_id: code, 
        last_move: { 
          type: 'room_state', 
          status: 'waiting', 
          roomInfo: newRoomInfo,
          ...newRoomInfo
        },
        updated_at: new Date().toISOString()
      }, { onConflict: 'match_id' });
    
    if (error) console.error("Error creating room:", error);
  };

  const handleJoinRoom = async () => {
    if (inputCode.length !== 4) return;
    setIsCreator(false);
    
    const code = inputCode.toUpperCase();
    console.log("Buscando sala en la tabla:", code);
    
    // 1. Check if room exists
    const { data, error } = await supabase
      .from('game_sync')
      .select('last_move')
      .eq('match_id', code)
      .maybeSingle();

    if (error || !data || !data.last_move) {
      console.log("Sala no encontrada:", error || data);
      alert("Código incorrecto o la sala ya no existe.");
      setInputCode("");
      return;
    }

    const state = data.last_move;

    if (state.status === 'waiting') {
      console.log("¡Sala encontrada en espera! Intentando unirnos...", state);

      const rivalName = state.creatorName;
      const rivalId = state.creatorId;
      const matchPoints = state.points || 30;
      const guestName = user?.user_metadata?.full_name?.split(' ')[0] || "GUEST";
      const guestId = user?.id || sessionId;

      const newRoomInfo = {
        creatorId: rivalId,
        creatorName: rivalName,
        guestId: guestId,
        guestName: guestName,
        points: matchPoints
      };

      const { error: updateError } = await supabase
        .from('game_sync')
        .update({ 
          last_move: { 
            type: 'room_state', 
            status: 'matched', 
            roomInfo: newRoomInfo,
            ...newRoomInfo
          },
          updated_at: new Date().toISOString()
        })
        .eq('match_id', code);

      if (updateError) {
        alert("No se pudo unir a la sala. Intenta de nuevo.");
        return;
      }

      setRoomCode(code);
      setRivalData({ name: rivalName, id: rivalId });
      setIsWaiting(true);
      setShowVersus(true);
      
      setTimeout(() => {
        setIsWaiting(false);
        setShowVersus(false);
        onStart("multiplayer", matchPoints as 15 | 30, rivalName, rivalId, false, code, false);
      }, 3500);
    }
    else {
      const roomInfo = state.roomInfo || (state.status === 'matched' ? state : null);
      if (!roomInfo || (!roomInfo.creatorId && !roomInfo.guestId)) {
        alert("Código incorrecto o la sala ya no existe.");
        setInputCode("");
        return;
      }

      const myId = user?.id || sessionId;
      if (myId === roomInfo.creatorId) {
        console.log("¡Reconectando como HOST!");
        setRoomCode(code);
        setRivalData({ name: roomInfo.guestName, id: roomInfo.guestId });
        setIsWaiting(true);
        setShowVersus(true);
        setTimeout(() => {
          setIsWaiting(false);
          setShowVersus(false);
          onStart("multiplayer", roomInfo.points as 15 | 30, roomInfo.guestName, roomInfo.guestId, true, code, true);
        }, 2000);
      } else if (myId === roomInfo.guestId) {
        console.log("¡Reconectando como GUEST!");
        setRoomCode(code);
        setRivalData({ name: roomInfo.creatorName, id: roomInfo.creatorId });
        setIsWaiting(true);
        setShowVersus(true);
        setTimeout(() => {
          setIsWaiting(false);
          setShowVersus(false);
          onStart("multiplayer", roomInfo.points as 15 | 30, roomInfo.creatorName, roomInfo.creatorId, false, code, true);
        }, 2000);
      } else {
        alert("La sala ya está en juego con otros jugadores.");
        setInputCode("");
      }
    }
  };

  useEffect(() => {
    if (inputCode.length === 4) {
      handleJoinRoom();
    }
  }, [inputCode]);

  useEffect(() => {
    if (!isWaiting || !user || !roomCode) return;
    
    // The Host listens for the Guest's 'matched' update
    const channel = supabase
      .channel(`matchmaking_${roomCode}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'game_sync', filter: `match_id=eq.${roomCode}` },
        (payload) => {
          const state = payload.new.last_move;
          if (isCreator && state?.status === 'matched' && !rivalData) {
            console.log("¡Rival encontrado vía Tabla!", state.guestName);
            setRivalData({ name: state.guestName, id: state.guestId });
            setShowVersus(true);
            
            setTimeout(() => {
              setIsWaiting(false);
              setShowVersus(false);
              onStart("multiplayer", state.points as 15 | 30, state.guestName, state.guestId, true, roomCode, false);
            }, 3500);
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [isWaiting, user, roomCode, isCreator, rivalData, onStart]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      position: 'relative',
      overflowX: 'hidden'
    }}>
      {/* Language Switch - Top Left */}
      <button
        onClick={() => {
          const newLang = t("play_now") === "JUGAR AHORA" ? "en" : "es";
          localStorage.setItem('lang', newLang);
          window.location.href = newLang === "en" ? "/en" : "/";
        }}
        className="btn-hover-dark"
        style={{
          position: 'absolute',
          top: '1.5rem',
          left: '1.5rem',
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          color: 'white',
          height: '40px',
          width: '40px',
          borderRadius: '50%',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(12px)',
          zIndex: 1000
        }}
        title="Cambiar Idioma / Change Language"
      >
        <Globe size={20} />
      </button>

      {/* Music Button - Top Right */}
      <a
        href="https://youtu.be/bqT0dq9SSZo"
        target="_blank"
        rel="noopener noreferrer"
        className="btn-hover-dark"
        style={{
          position: 'absolute',
          top: '1.5rem',
          right: '1.5rem',
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          color: 'white',
          height: '40px',
          width: '40px',
          borderRadius: '50%',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(12px)',
          zIndex: 1000,
          textDecoration: 'none'
        }}
        title="Music"
      >
        <Music size={20} />
      </a>
      
      {/* Auth Button - Way Up Top & Centered */}
      <button
        onClick={handleAuth}
        className="btn-hover-dark"
        style={{
          position: 'absolute',
          top: '3.5rem',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          color: 'white',
          height: '40px',
          padding: '0 1.25rem',
          borderRadius: '1rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
          fontSize: '0.75rem',
          fontWeight: 800,
          letterSpacing: '0.05em',
          backdropFilter: 'blur(12px)',
          textTransform: 'uppercase',
          transition: 'none',
          zIndex: 1000
        }}
      >
        {user ? (
          <>
            <LogOut size={18} style={{ transform: 'scaleX(-1)' }} />
            {t("logout")}
          </>
        ) : (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            {t("login")}
          </>
        )}
      </button>

      <MatchmakingOverlay
        isWaiting={isWaiting}
        timeLeft={timeLeft}
        showVersus={showVersus}
        rivalData={rivalData}
        userName={user?.user_metadata.full_name?.split(' ')[0] || "VOS"}
        onCancel={() => {
          setIsWaiting(false);
          setRoomCode("");
        }}
        formatTime={formatTime}
        roomCode={roomCode}
      />

      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '600px' }}
      >
        <LandingHeader user={user} />

        <p style={{ color: '#00f2ff', fontSize: '1.25rem', maxWidth: '600px', margin: '1rem 0 2rem 0', fontWeight: 700, opacity: 1, textAlign: 'center' }}>
          {t("subtitle")}
        </p>

        <div style={{ width: '100%', paddingLeft: '22px' }}>
          <GameModeSelector
            selectedMode={selectedMode || "multiplayer"}
            onSelect={(mode) => {
              if (mode === "multiplayer" && !user) {
                handleAuth(); // Triggers the Google login
                return;
              }
              setSelectedMode(mode);
              if (mode !== "multiplayer") {
                setIsSelectingPoints(true);
              }
            }}
          />
        </div>
      </motion.div>

      {/* Twitch Button - Way Down Bottom & Centered */}
      <a
        href="https://twitch.tv/muchomovimiento/videos"
        target="_blank"
        rel="noopener noreferrer"
        className="btn-hover-dark"
        style={{
          position: 'fixed',
          bottom: window.innerWidth < 768 ? '1.5rem' : '4.5rem',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(145, 70, 255, 0.2)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(145, 70, 255, 0.3)',
          color: 'white',
          height: '40px',
          padding: '0 1.25rem',
          borderRadius: '1rem',
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          fontSize: '0.75rem',
          fontWeight: 800,
          letterSpacing: '0.05em',
          zIndex: 1000,
          textTransform: 'uppercase'
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 2H3v16h5v4l4-4h5l4-4V2zm-10 9V7m5 4V7" />
        </svg>
        MUCHOMOVIMIENTO
      </a>

      {/* Point Selection Modal */}
      <AnimatePresence>
        {isSelectingPoints && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2000,
              padding: '2rem'
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '3rem',
                borderRadius: '2.5rem',
                width: '100%',
                maxWidth: '500px',
                textAlign: 'center',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
              }}
            >
              <h2 className="text-display" style={{ fontSize: '3rem', color: '#fff', marginBottom: '2.5rem', lineHeight: 1, whiteSpace: 'pre-wrap' }}>
                {t("how_many_points").split('\n')[0]}<br />
                <span style={{ color: '#00f2ff' }}>{t("how_many_points").split('\n')[1]}</span>
              </h2>

              <PointSelector onSelect={(points) => initiateGame(selectedMode!, points as 15 | 30)} />

              <motion.div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                <button
                  onClick={() => setIsSelectingPoints(false)}
                  className="btn-hover-dark"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    marginTop: '0.25rem',
                    height: '40px',
                    borderRadius: '1rem',
                    padding: '0 1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.8rem',
                    fontWeight: 900,
                    cursor: 'pointer',
                    transition: 'none'
                  }}
                >
                  <Home size={18} />
                  {t("back")}
                </button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Room Selection Modal (Multiplayer only) */}
      <AnimatePresence>
        {selectedMode === "multiplayer" && !isWaiting && !isSelectingPoints && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2000,
              padding: '2rem'
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '3rem',
                borderRadius: '2.5rem',
                width: '100%',
                maxWidth: '500px',
                textAlign: 'center',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
              }}
            >
              <h2 className="text-display" style={{ fontSize: '3rem', color: '#fff', marginBottom: '1rem', lineHeight: 1, whiteSpace: 'pre-wrap' }}>
                {t("private_match").split('\n')[0]}<br />
                <span style={{ color: '#00f2ff' }}>{t("private_match").split('\n')[1]}</span>
              </h2>

              {!isJoining ? (
                <>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', width: '100%', padding: '0.5rem 0' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                    <button 
                      onClick={() => setIsJoining(true)}
                      className="btn-hover-dark"
                      style={{
                        background: '#00f2ff',
                        border: 'none',
                        color: '#000',
                        width: '160px',
                        height: '80px',
                        fontSize: '2rem',
                        fontWeight: 950,
                        fontStyle: 'italic',
                        cursor: 'pointer',
                        boxShadow: '6px 6px 0px #000',
                        transition: 'transform 0.1s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      onMouseDown={(e) => e.currentTarget.style.transform = 'translate(2px, 2px)'}
                      onMouseUp={(e) => e.currentTarget.style.transform = 'translate(0px, 0px)'}
                    >
                      {t("join")}
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                    <button 
                      onClick={() => setIsSelectingPoints(true)}
                      className="btn-hover-dark"
                      style={{
                        background: '#00f2ff',
                        border: 'none',
                        color: '#000',
                        width: '160px',
                        height: '80px',
                        fontSize: '2rem',
                        fontWeight: 950,
                        fontStyle: 'italic',
                        cursor: 'pointer',
                        boxShadow: '6px 6px 0px #000',
                        transition: 'transform 0.1s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      onMouseDown={(e) => e.currentTarget.style.transform = 'translate(2px, 2px)'}
                      onMouseUp={(e) => e.currentTarget.style.transform = 'translate(0px, 0px)'}
                    >
                      {t("create")}
                    </button>
                  </div>
                </div>
                  
                  <motion.div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
                    <button
                      onClick={() => {
                        setSelectedMode(null);
                        setInputCode("");
                      }}
                      className="btn-hover-dark"
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        height: '40px',
                        borderRadius: '1rem',
                        padding: '0 1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.8rem',
                        fontWeight: 900,
                        cursor: 'pointer',
                        transition: 'none'
                      }}
                    >
                      <Home size={18} />
                      {t("back")}
                    </button>
                  </motion.div>
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
                  <input 
                    type="text"
                    maxLength={4}
                    placeholder="CÓDIGO"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                    style={{
                      background: 'rgba(0,0,0,0.3)',
                      border: '2px solid #00f2ff',
                      borderRadius: '1.5rem',
                      padding: '1.5rem',
                      color: '#fff',
                      fontSize: '2.5rem',
                      textAlign: 'center',
                      fontWeight: 900,
                      letterSpacing: '0.5rem',
                      outline: 'none',
                      boxShadow: '0 0 20px rgba(0, 242, 255, 0.1)'
                    }}
                  />
                  <button 
                    onClick={handleJoinRoom}
                    className="btn-hover-dark"
                    style={{
                      background: '#00f2ff',
                      color: '#000',
                      border: 'none',
                      padding: '1.25rem',
                      borderRadius: '1.25rem',
                      fontSize: '1.25rem',
                      fontWeight: 900,
                      cursor: 'pointer',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em'
                    }}
                  >
                    {t("enter_match")}
                  </button>
                  
                  <motion.div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: '0.5rem' }}>
                    <button
                      onClick={() => {
                        setIsJoining(false);
                        setInputCode("");
                      }}
                      className="btn-hover-dark"
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        height: '40px',
                        borderRadius: '1rem',
                        padding: '0 1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.8rem',
                        fontWeight: 900,
                        cursor: 'pointer',
                        transition: 'none'
                      }}
                    >
                      <Home size={18} />
                      {t("back")}
                    </button>
                  </motion.div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
