import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Save, Plus, Minus, Search, Trophy, Lock, RefreshCw, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { CARDS } from '../../data/cards';
import { Sticker } from '../shared/Sticker';
import { supabase } from '../../lib/supabase';

interface RankingScreenProps {
  user: any;
  handleAuth: () => void;
  onBack: () => void;
}

const getTraditionalEquivalent = (power: number, t: (key: string) => string): string => {
  const of = t('card_of');
  const s = t('suit_espadas');
  const b = t('suit_bastos');
  const c = t('suit_copas');
  const o = t('suit_oro');
  const macho = t('card_macho');
  const hembra = t('card_hembra');
  const falseAce = t('card_false_ace');
  const falseSeven = t('card_false_seven');

  switch (power) {
    case 1:  return `1 ${of} ${s} (${macho})`;
    case 2:  return `1 ${of} ${b} (${hembra})`;
    case 3:  return `7 ${of} ${s}`;
    case 4:  return `7 ${of} ${o}`;
    case 5:  return `3 ${of} ${s}`;
    case 6:  return `3 ${of} ${b}`;
    case 7:  return `2 ${of} ${s}`;
    case 8:  return `2 ${of} ${b}`;
    case 9:  return `1 ${of} ${c} (${falseAce})`;
    case 10: return `1 ${of} ${o} (${falseAce})`;
    case 11: return `12 ${of} ${s}`;
    case 12: return `12 ${of} ${b}`;
    case 13: return `11 ${of} ${s}`;
    case 14: return `11 ${of} ${b}`;
    case 15: return `10 ${of} ${s}`;
    case 16: return `10 ${of} ${b}`;
    case 17: return `7 ${of} ${c} (${falseSeven})`;
    case 18: return `7 ${of} ${b} (${falseSeven})`;
    case 19: return `6 ${of} ${s}`;
    case 20: return `6 ${of} ${b}`;
    case 21: return `5 ${of} ${s}`;
    case 22: return `5 ${of} ${b}`;
    default: return '';
  }
};

const BASE_PLAYERS = CARDS.map(card => ({
  id: card.id,
  name: card.name,
  country: card.country,
  club: card.club,
  power: card.power,
  env: card.env,
  image: card.image,
  stickerNumber: card.stickerNumber,
  baseVotes: 0
}));

export const RankingScreen: React.FC<RankingScreenProps> = ({ user, handleAuth, onBack }) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dbVotesData, setDbVotesData] = useState<any[]>([]);
  const [myVotes, setMyVotes] = useState<Record<string, number>>({});
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isOrderChanging, setIsOrderChanging] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const lastOrderRef = useRef<string>("");
  const lastVotedCardIdRef = useRef<string | null>(null);
  const lastVoteActionRef = useRef<'add' | 'sub' | null>(null);
  const lastSavedVotesRef = useRef<Record<string, number>>({});
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const LOCAL_STORAGE_KEY = `trucomundial-uservotes-${user?.id || 'anonymous'}`;

  // 1. Fetch user's local/cached votes on mount or when user changes
  useEffect(() => {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setMyVotes(parsed);
        lastSavedVotesRef.current = parsed;
      } catch (e) {
        setMyVotes({});
        lastSavedVotesRef.current = {};
      }
    } else {
      setMyVotes({});
      lastSavedVotesRef.current = {};
    }
  }, [user, LOCAL_STORAGE_KEY]);

  // 2. Fetch global votes from Supabase game_sync table
  const fetchGlobalVotes = async () => {
    setLoading(true);
    try {
      // Fetch all records whose match_id starts with user_votes_
      const { data, error } = await supabase
        .from('game_sync')
        .select('match_id, last_move')
        .like('match_id', 'user_votes_%');

      if (error) {
        console.error('Error fetching votes from Supabase:', error);
      } else if (data) {
        setDbVotesData(data);

        // If logged in, also try to restore our official votes from the DB
        if (user) {
          const myDbRecord = data.find(item => item.match_id === `user_votes_${user.id}`);
          if (myDbRecord && myDbRecord.last_move && myDbRecord.last_move.votes) {
            setMyVotes(myDbRecord.last_move.votes);
            lastSavedVotesRef.current = myDbRecord.last_move.votes;
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(myDbRecord.last_move.votes));
          }
        }
      }
    } catch (err) {
      console.error('Unexpected error fetching global votes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGlobalVotes();
  }, [user]);

  // Calculate current user's distributed votes
  const totalMyVotes = Object.values(myVotes).reduce((sum, v) => sum + v, 0);
  const availableVotes = 100 - totalMyVotes;

  // Handle adding a vote
  const handleAddVote = (cardId: string) => {
    if (!user) return;
    if (availableVotes <= 0) return;

    lastVotedCardIdRef.current = cardId;
    lastVoteActionRef.current = 'add';
    setMyVotes(prev => {
      const current = prev[cardId] ?? 0;
      const updated = { ...prev, [cardId]: current + 1 };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  // Handle subtracting a vote
  const handleSubVote = (cardId: string) => {
    if (!user) return;

    lastVotedCardIdRef.current = cardId;
    lastVoteActionRef.current = 'sub';
    setMyVotes(prev => {
      const current = prev[cardId] ?? 0;
      if (current <= 0) return prev;
      const updated = { ...prev, [cardId]: current - 1 };
      if (updated[cardId] === 0) {
        delete updated[cardId];
      }
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  // Save/Sync votes to Supabase
  const handleSaveVotes = async () => {
    if (!user) return;
    setSaving(true);
    setSaveSuccess(false);

    try {
      const { error } = await supabase
        .from('game_sync')
        .upsert({
          match_id: `user_votes_${user.id}`,
          last_move: {
            type: 'user_votes',
            userId: user.id,
            userName: user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0] || "Usuario",
            votes: myVotes,
            updatedAt: new Date().toISOString()
          },
          updated_at: new Date().toISOString()
        }, { onConflict: 'match_id' });

      if (error) {
        throw error;
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
      lastSavedVotesRef.current = myVotes;

      // Refresh global list to show new calculations
      await fetchGlobalVotes();
    } catch (err) {
      console.error('Error saving votes to Supabase:', err);
      alert(t('save_error'));
    } finally {
      setSaving(false);
    }
  };

  // Check if current local votes differ from the last cloud-saved/synced state
  const hasUnsavedChanges = () => {
    const currentKeys = Object.keys(myVotes);
    const savedKeys = Object.keys(lastSavedVotesRef.current);

    if (currentKeys.length !== savedKeys.length) return true;

    for (const key of currentKeys) {
      if (myVotes[key] !== lastSavedVotesRef.current[key]) {
        return true;
      }
    }
    return false;
  };

  const handleBackRequest = () => {
    if (user && hasUnsavedChanges()) {
      setShowUnsavedModal(true);
    } else {
      onBack();
    }
  };

  // 3. Compile aggregate votes
  // Aggregate all other users' votes from DB
  const aggregateOtherVotes: Record<string, number> = {};
  dbVotesData.forEach(item => {
    // Skip current user's DB record to avoid double counting (we use current user's local state instead)
    if (user && item.match_id === `user_votes_${user.id}`) return;

    const recordVotes = item.last_move?.votes;
    if (recordVotes && typeof recordVotes === 'object') {
      Object.entries(recordVotes).forEach(([cardId, count]) => {
        if (typeof count === 'number') {
          aggregateOtherVotes[cardId] = (aggregateOtherVotes[cardId] ?? 0) + count;
        }
      });
    }
  });

  // Combine: baseVotes + other users' votes + current user's active local votes
  const sortedPlayers = [...BASE_PLAYERS]
    .map(player => {
      const otherVotes = aggregateOtherVotes[player.id] ?? 0;
      const myActiveVotes = myVotes[player.id] ?? 0;
      const totalVotes = player.baseVotes + otherVotes + myActiveVotes;

      return {
        ...player,
        otherVotes,
        myActiveVotes,
        totalVotes
      };
    })
    .sort((a, b) => b.totalVotes - a.totalVotes);

  const currentOrder = sortedPlayers.map(p => p.id).join(',');

  useEffect(() => {
    if (!lastOrderRef.current) {
      lastOrderRef.current = currentOrder;
      return;
    }

    if (currentOrder !== lastOrderRef.current) {
      setIsOrderChanging(true);
      lastOrderRef.current = currentOrder;

      if (lastVotedCardIdRef.current) {
        const cardId = lastVotedCardIdRef.current;
        const tryScroll = () => {
          const element = document.getElementById(`ranking-card-${cardId}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        };

        // First attempt (early layout transition)
        setTimeout(tryScroll, 100);
        // Second attempt (as layout animation is settling)
        setTimeout(tryScroll, 350);
      }

      const timer = setTimeout(() => {
        setIsOrderChanging(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [currentOrder]);

  // Filter players based on search query
  const filteredPlayers = sortedPlayers.filter(p => {
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.country.toLowerCase().includes(q) ||
      p.club.toLowerCase().includes(q)
    );
  });

  return (
    <div style={{
      width: '100%',
      maxWidth: '1200px',
      margin: '0 auto',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      padding: isMobile ? '1.5rem 1rem 4rem 1rem' : '1.1rem 1rem 4rem 1rem',
      color: '#fff',
      boxSizing: 'border-box'
    }}>
      {/* HEADER SECTION (Centered column layout on desktop, responsive style on mobile) */}
      {!isMobile && (
        <>
          {/* Fixed Back Button (Desktop Left Corner) */}
          <button
            onClick={handleBackRequest}
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
            <span>{t("back")}</span>
          </button>

          {/* Fixed Refresh Button (Desktop Right Corner) */}
          <button
            onClick={fetchGlobalVotes}
            disabled={loading}
            className="btn-hover-dark profile-nav-btn"
            style={{
              position: "fixed",
              top: "1.5rem",
              right: "1rem",
              background: "rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(12px)",
              zIndex: 2000,
              height: "36px",
              width: "36px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: "none",
              cursor: "pointer",
              opacity: loading ? 0.5 : 1
            }}
            title={t('refresh_ranking')}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </>
      )}

      {/* HEADER SECTION (Responsive Container) */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: isMobile ? '1.5rem' : '2rem',
        width: '100%',
        position: 'relative'
      }}>
        {isMobile ? (
          <>
            {/* Mobile Header Layout */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
              gap: '0.75rem',
              marginBottom: '1rem'
            }}>
              <button
                onClick={handleBackRequest}
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
                {t("back")}
              </button>

              <button
                onClick={fetchGlobalVotes}
                disabled={loading}
                className="btn-hover-dark"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: 'white',
                  height: '36px',
                  width: '36px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '3px 3px 0px #000',
                  opacity: loading ? 0.5 : 1
                }}
                title={t('refresh_ranking')}
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.25rem',
              justifyContent: 'center',
              textAlign: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Trophy size={24} style={{ color: '#ffdf00', filter: 'drop-shadow(0 0 6px rgba(255, 223, 0, 0.25))' }} />
                <h2 className="text-display" style={{
                  fontSize: '1.4rem',
                  margin: 0,
                  letterSpacing: '0.05em',
                  color: '#ffdf00',
                  textShadow: '0 0 8px rgba(255, 223, 0, 0.15)'
                }}>
                  {t('card_ranking').toUpperCase()}
                </h2>
              </div>
              <p style={{ fontSize: '0.75rem', opacity: 0.6, margin: '4px 0 0 0' }}>
                {t('ranking_subtitle')}
              </p>
            </div>
          </>
        ) : (
          <>
            {/* Desktop Centered Header Layout */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Trophy size={36} style={{ color: '#ffdf00', filter: 'drop-shadow(0 0 10px rgba(255, 223, 0, 0.3))' }} />
                <h2 className="text-display" style={{
                  fontSize: '2.2rem',
                  margin: 0,
                  letterSpacing: '0.05em',
                  color: '#ffdf00',
                  textShadow: '0 0 15px rgba(255, 223, 0, 0.2)'
                }}>
                  {t('card_ranking').toUpperCase()}
                </h2>
              </div>
              <p style={{ fontSize: '0.95rem', opacity: 0.65, margin: '4px 0 0 0', fontWeight: 600 }}>
                {t('ranking_subtitle')}
              </p>
            </div>
          </>
        )}
      </div>

      {/* VOTING CONTROL BLOCK (STICKY HUD) */}
      <AnimatePresence mode="wait">
        {user ? (
          <motion.div
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            style={{
              position: 'sticky',
              top: '1rem',
              zIndex: 100,
              background: 'rgba(15, 10, 25, 0.9)',
              border: '2px solid rgba(168, 85, 247, 0.25)',
              borderRadius: '2rem',
              padding: '1.25rem 2rem',
              marginBottom: '2rem',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1.5rem',
              boxShadow: '0 10px 30px rgba(168, 85, 247, 0.05), inset 0 0 20px rgba(168, 85, 247, 0.05)',
              backdropFilter: 'blur(16px)'
            }}
          >
            <div style={{ flex: '1 1 300px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 800 }}>
                <span style={{ color: '#a855f7', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Trophy size={18} />
                  {t('your_votes_distributed')}
                </span>
                <span style={{ color: availableVotes === 0 ? '#10b981' : '#fff' }}>
                  {totalMyVotes} / 100 {t('votes_label')}
                </span>
              </div>

              {/* Progress bar */}
              <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(totalMyVotes / 100) * 100}%` }}
                  style={{
                    height: '100%',
                    background: availableVotes === 0 ? 'linear-gradient(to right, #10b981, #059669)' : 'linear-gradient(to right, #a855f7, #7c3aed)',
                    boxShadow: availableVotes === 0 ? '0 0 8px rgba(16, 185, 129, 0.8)' : '0 0 8px rgba(168, 85, 247, 0.8)'
                  }}
                />
              </div>

              <div style={{ fontSize: '0.75rem', opacity: 0.5, marginTop: '0.4rem' }}>
                {availableVotes > 0
                  ? t('votes_available_hint', { count: availableVotes })
                  : t('votes_all_used')}
              </div>
            </div>

            {/* Save Button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button
                onClick={handleSaveVotes}
                disabled={saving || saveSuccess}
                className="btn-hover-dark"
                style={{
                  background: saveSuccess ? '#10b981' : '#a855f7',
                  border: 'none',
                  color: '#fff',
                  height: '48px',
                  borderRadius: '1.25rem',
                  padding: '0 2rem',
                  fontSize: '1rem',
                  fontWeight: 950,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  cursor: (saving || saveSuccess) ? 'default' : 'pointer',
                  boxShadow: '4px 4px 0px #000',
                  transition: 'all 0.2s ease',
                  opacity: saving ? 0.7 : 1
                }}
              >
                {saveSuccess ? <Check size={18} /> : <Save size={18} />}
                {saveSuccess ? t('votes_saved') : saving ? t('saving') : t('save_to_cloud')}
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            style={{
              background: 'rgba(145, 70, 255, 0.05)',
              border: '2px dashed rgba(145, 70, 255, 0.45)',
              borderRadius: '2rem',
              padding: '1.5rem 2rem',
              marginBottom: '2rem',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1.5rem',
              backdropFilter: 'blur(16px)'
            }}
          >
            <div style={{ flex: '1 1 300px' }}>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#a855f7', display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1.1rem', fontWeight: 900 }}>
                <Lock size={18} />
                {t('login_to_vote_title')}
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.7, lineHeight: 1.4 }}>
                {t('login_to_vote_desc')}
              </p>
            </div>

            <button
              onClick={handleAuth}
              className="btn-hover-dark"
              style={{
                background: '#9146ff',
                border: 'none',
                color: '#fff',
                height: '46px',
                borderRadius: '1.25rem',
                padding: '0 1.5rem',
                fontSize: '0.9rem',
                fontWeight: 950,
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                cursor: 'pointer',
                boxShadow: '4px 4px 0px #000'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" style={{ fill: 'currentColor' }}>
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              {t('login_with_google')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SEARCH BOX & FILTERS */}
      <div style={{
        position: 'relative',
        width: '100%',
        marginBottom: '2rem'
      }}>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '1.25rem',
          transform: 'translateY(-50%)',
          color: 'rgba(255,255,255,0.4)',
          pointerEvents: 'none'
        }}>
          <Search size={20} />
        </div>
        <input
          type="text"
          placeholder={t('search_placeholder')}
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%',
            padding: '1.25rem 1.25rem 1.25rem 3.25rem',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '2px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '1.5rem',
            color: '#fff',
            fontSize: '1.1rem',
            outline: 'none',
            boxSizing: 'border-box',
            transition: 'all 0.2s ease',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
          }}
          onFocus={e => e.target.style.borderColor = 'rgba(0, 242, 255, 0.5)'}
          onBlur={e => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
        />
      </div>

      {/* LOADER */}
      {loading && dbVotesData.length === 0 ? (
        <div style={{ width: '100%' }}>
          <style>{`
            @keyframes shimmer {
              0% { transform: translateX(-150%); }
              100% { transform: translateX(150%); }
            }
            @keyframes spin-clockwise {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            @keyframes spin-counter {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(-360deg); }
            }
            @keyframes pulse-soft {
              0%, 100% { opacity: 0.45; }
              50% { opacity: 0.85; }
            }
          `}</style>

          {/* Central Concentric Neon Loader */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem 0 4rem 0',
            gap: '1.25rem'
          }}>
            <div style={{ position: 'relative', width: '60px', height: '60px' }}>
              {/* Outer Yellow Ring */}
              <div style={{
                position: 'absolute',
                inset: 0,
                border: '4px solid transparent',
                borderTopColor: '#ffdf00',
                borderRadius: '50%',
                animation: 'spin-clockwise 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite',
                boxShadow: '0 0 15px rgba(255, 223, 0, 0.45)'
              }} />
              {/* Inner Yellow Ring */}
              <div style={{
                position: 'absolute',
                inset: '6px',
                border: '4px solid transparent',
                borderTopColor: '#ffdf00',
                borderRadius: '50%',
                animation: 'spin-counter 0.8s cubic-bezier(0.5, 0, 0.5, 1) infinite',
                boxShadow: '0 0 10px rgba(255, 223, 0, 0.35)'
              }} />
            </div>
            <p style={{
              margin: 0,
              fontSize: '0.95rem',
              fontWeight: 800,
              letterSpacing: '0.05em',
              color: '#ffdf00',
              textShadow: '0 0 8px rgba(255, 223, 0, 0.2)',
              animation: 'pulse-soft 1.5s ease-in-out infinite'
            }}>
              {t('loading_votes')}
            </p>
          </div>

          {/* Skeleton Stickers Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '2.5rem',
            width: '100%'
          }}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={`skeleton-${i}`}
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '2.25rem',
                  padding: '1.5rem',
                  height: '370px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.1)',
                  backdropFilter: 'blur(8px)',
                  animation: 'pulse-soft 1.8s ease-in-out infinite',
                  animationDelay: `${i * 0.15}s`
                }}
              >
                {/* Diagonal Shimmer Shimmer */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.04), transparent)',
                  transform: 'skewX(-20deg)',
                  width: '200%',
                  height: '100%',
                  animation: 'shimmer 1.8s infinite',
                  animationDelay: `${i * 0.1}s`
                }} />

                {/* Skeleton Top Left Badge */}
                <div style={{
                  position: 'absolute',
                  top: '-15px',
                  left: '20px',
                  background: 'rgba(255,255,255,0.06)',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%'
                }} />

                {/* Skeleton Top Right Badge */}
                <div style={{
                  position: 'absolute',
                  top: '-15px',
                  right: '20px',
                  background: 'rgba(255,255,255,0.06)',
                  width: '60px',
                  height: '24px',
                  borderRadius: '1rem'
                }} />

                {/* Skeleton Sticker Box */}
                <div style={{
                  width: '130px',
                  height: '180px',
                  backgroundImage: 'url("/card-loading.png")',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  borderRadius: '1rem',
                  border: '3px solid rgba(255, 255, 255, 0.4)',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
                  margin: '1rem 0 1.25rem 0'
                }} />

                {/* Skeleton Player details */}
                <div style={{ width: '80%', height: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginBottom: '0.6rem' }} />
                <div style={{ width: '60%', height: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '3px', marginBottom: '1.25rem' }} />

                {/* Skeleton Equivalence Badge */}
                <div style={{ width: '70%', height: '28px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* DYNAMIC STICKERS GRID */
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '2.5rem',
          width: '100%'
        }}>
          {filteredPlayers.map((player, index) => {
            return (
              <motion.div
                key={player.id}
                id={`ranking-card-${player.id}`}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.5) }}
                style={{
                  background: (isOrderChanging && lastVotedCardIdRef.current === player.id)
                    ? (lastVoteActionRef.current === 'add' ? 'rgba(168, 85, 247, 0.08)' : 'rgba(255, 255, 255, 0.08)')
                    : 'rgba(255, 255, 255, 0.03)',
                  border: (isOrderChanging && lastVotedCardIdRef.current === player.id)
                    ? (lastVoteActionRef.current === 'add' ? '1.5px solid rgba(168, 85, 247, 0.8)' : '1.5px solid rgba(255, 255, 255, 0.8)')
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '2.25rem',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  position: 'relative',
                  boxShadow: (isOrderChanging && lastVotedCardIdRef.current === player.id)
                    ? (lastVoteActionRef.current === 'add' ? '0 0 30px rgba(168, 85, 247, 0.6), 0 12px 30px rgba(0,0,0,0.2)' : '0 0 30px rgba(255, 255, 255, 0.6), 0 12px 30px rgba(0,0,0,0.2)')
                    : '0 12px 30px rgba(0,0,0,0.15)',
                  backdropFilter: 'blur(8px)',
                  filter: (isOrderChanging && lastVotedCardIdRef.current === player.id)
                    ? 'brightness(1.3)'
                    : 'none',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                {/* RANK TROPHY OR SHADOW BADGE */}
                <div style={{
                  position: 'absolute',
                  top: '-15px',
                  left: '20px',
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: '1px solid rgba(255, 223, 0, 0.4)',
                  color: '#ffdf00',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '1.1rem',
                  zIndex: 10,
                  boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                  backdropFilter: 'blur(10px)'
                }}>
                  {index + 1}
                </div>

                {/* total votes glow badge */}
                <div style={{
                  position: 'absolute',
                  top: '-15px',
                  right: '20px',
                  background: player.myActiveVotes > 0 ? 'rgba(168, 85, 247, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  border: player.myActiveVotes > 0 ? '1px solid #a855f7' : '1px solid rgba(255, 255, 255, 0.1)',
                  color: player.myActiveVotes > 0 ? '#a855f7' : 'rgba(255,255,255,0.7)',
                  borderRadius: '1rem',
                  padding: '4px 12px',
                  fontSize: '0.8rem',
                  fontWeight: 900,
                  zIndex: 10,
                  boxShadow: player.myActiveVotes > 0 ? '0 0 10px rgba(168, 85, 247, 0.3)' : 'none'
                }}>
                  ★ {player.totalVotes}
                </div>

                {/* THE COLLECTIBLE STICKER COMPONENT */}
                <div style={{
                  width: '130px',
                  height: '180px',
                  margin: '1rem 0 1.25rem 0'
                }}>
                  <Sticker card={player as any} disabled={true} />
                </div>

                {/* PLAYER INFO PANEL */}
                <div style={{ width: '100%', textAlign: 'center', marginBottom: '1.25rem' }}>
                  <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.15rem', fontWeight: 900, letterSpacing: '0.05em' }}>
                    {player.name}
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.6, textTransform: 'uppercase' }}>
                    {t(`country_${player.country}`)} · {player.club}
                  </p>

                  {/* Traditional Equivalent */}
                  <div style={{
                    fontSize: '0.78rem',
                    color: '#ffdf00',
                    fontWeight: 700,
                    background: 'rgba(255, 223, 0, 0.05)',
                    border: '1px solid rgba(255, 223, 0, 0.15)',
                    borderRadius: '10px',
                    padding: '6px 12px',
                    marginTop: '10px',
                    display: 'inline-block'
                  }}>
                    {t('equivalent_to')} {getTraditionalEquivalent(player.power, t)}
                  </div>
                </div>

                {/* VOTING ROW BUTTONS */}
                {user ? (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(15, 10, 25, 0.6)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '1.25rem',
                    padding: '4px',
                    width: '100%',
                    boxSizing: 'border-box'
                  }}>
                    {/* Subtract Vote */}
                    <button
                      onClick={() => handleSubVote(player.id)}
                      disabled={player.myActiveVotes <= 0 || isOrderChanging}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: (player.myActiveVotes > 0 && !isOrderChanging) ? '#ffffff' : 'rgba(255,255,255,0.15)',
                        width: '38px',
                        height: '38px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: (player.myActiveVotes > 0 && !isOrderChanging) ? 'pointer' : 'default',
                        borderRadius: '0.85rem'
                      }}
                      className={(player.myActiveVotes > 0 && !isOrderChanging) ? "btn-hover-dark" : ""}
                    >
                      <Minus size={18} />
                    </button>

                    {/* Active Vote Display */}
                    <div style={{
                      flex: 1,
                      textAlign: 'center',
                      fontWeight: 950,
                      fontSize: '1rem',
                      color: player.myActiveVotes > 0 ? '#a855f7' : '#ffffff'
                    }}>
                      {player.myActiveVotes}
                    </div>

                    {/* Add Vote */}
                    <button
                      onClick={() => handleAddVote(player.id)}
                      disabled={availableVotes <= 0 || isOrderChanging}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: (availableVotes > 0 && !isOrderChanging) ? '#a855f7' : 'rgba(255,255,255,0.15)',
                        width: '38px',
                        height: '38px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: (availableVotes > 0 && !isOrderChanging) ? 'pointer' : 'default',
                        borderRadius: '0.85rem'
                      }}
                      className={(availableVotes > 0 && !isOrderChanging) ? "btn-hover-dark" : ""}
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleAuth}
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '1.25rem',
                      padding: '10px 0',
                      width: '100%',
                      color: 'rgba(255,255,255,0.6)',
                      fontSize: '0.8rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                    className="btn-hover-dark"
                  >
                    <Lock size={14} />
                    {t('login_to_vote_btn')}
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
      {/* Twitch Button - Centered at the bottom of the page */}
      <a
        href="https://twitch.tv/muchomovimiento/videos"
        target="_blank"
        rel="noopener noreferrer"
        className="btn-hover-dark"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '3rem auto 0 auto',
          background: 'rgba(145, 70, 255, 0.2)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(145, 70, 255, 0.3)',
          color: 'white',
          height: '40px',
          padding: '0 1.25rem',
          borderRadius: '1rem',
          textDecoration: 'none',
          gap: '0.6rem',
          fontSize: '0.75rem',
          fontWeight: 800,
          letterSpacing: '0.05em',
          width: 'fit-content',
          textTransform: 'uppercase',
          transition: 'all 0.25s ease'
        }}
        title="Twitch"
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

      {/* UNSAVED CHANGES WARNING MODAL */}
      <AnimatePresence>
        {showUnsavedModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(15px)',
              zIndex: 2000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.5rem'
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1.5px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '2rem',
                padding: '2.5rem 2rem',
                width: '100%',
                maxWidth: '480px',
                textAlign: 'center',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1.5rem'
              }}
            >
              {/* Warning Icon inside a red glowing circle */}
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '2.5px solid #ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 20px rgba(239, 68, 68, 0.45)',
                color: '#ef4444',
                fontSize: '2rem'
              }}>
                ⚠️
              </div>

              <h3 className="text-display" style={{ fontSize: '1.5rem', margin: 0, color: '#ef4444', letterSpacing: '0.05em' }}>
                {t('exit_without_saving')}
              </h3>

              <p style={{ margin: 0, fontSize: '0.95rem', opacity: 0.8, lineHeight: '1.5', color: '#fff' }}>
                {t('unsaved_votes_warning')}
              </p>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '1rem', width: '100%', marginTop: '0.5rem' }}>
                <button
                  onClick={() => {
                    setShowUnsavedModal(false);
                    onBack();
                  }}
                  className="btn-hover-dark"
                  style={{
                    flex: 1,
                    height: '46px',
                    borderRadius: '1.25rem',
                    background: 'rgba(239, 68, 68, 0.2)',
                    border: '1px solid #ef4444',
                    color: '#ef4444',
                    fontWeight: 900,
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    boxShadow: '4px 4px 0px #000',
                    transition: 'all 0.2s'
                  }}
                >
                  {t('yes_exit')}
                </button>

                <button
                  onClick={() => setShowUnsavedModal(false)}
                  className="btn-hover-dark"
                  style={{
                    flex: 1,
                    height: '46px',
                    borderRadius: '1.25rem',
                    background: 'linear-gradient(to right, #a855f7, #7c3aed)',
                    border: 'none',
                    color: '#fff',
                    fontWeight: 900,
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    boxShadow: '4px 4px 0px #000',
                    transition: 'all 0.2s'
                  }}
                >
                  {t('no_stay')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
