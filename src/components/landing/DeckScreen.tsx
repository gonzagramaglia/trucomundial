import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Save, Search, Lock, Home, Check, Layers, Unlock, RefreshCw } from 'lucide-react';
import { isTopCard } from '../../lib/votesStore';
import { useTranslation } from 'react-i18next';
import { CARDS } from '../../data/cards';
import { Sticker } from '../shared/Sticker';
import { EmptyState } from '../shared/EmptyState';
import { supabase } from '../../lib/supabase';
import { audioManager } from "../../lib/audio";
import { UtilityButtons } from "../shared/UtilityButtons";

interface DeckScreenProps {
  user: any;
  handleAuth: () => void;
  onBack: () => void;
}

const TOP_CARDS = [
  'messi', 'dibu', 'mbappe', 'vinicius_jr', 'lautaro', 'rodri', 'yamal', 'pedri', 'macallister', 'alisson',
  'estevao', 'maignan', 'barcola', 'ekitike', 'doue', 'james_rodriguez', 'luis_diaz', 'cristiano_ronaldo',
  'rafael_leao', 'moises_caicedo', 'kendry_paez', 'julio_enciso', 'ramon_sosa', 'christian_pulisic',
  'alphonso_davies', 'xavi_simons', 'frenkie_de_jong', 'son_heung_min'
];

export const DeckScreen: React.FC<DeckScreenProps> = ({ user, handleAuth, onBack }) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [unlockedCards, setUnlockedCards] = useState<string[]>([]);
  const [selectedDeck, setSelectedDeck] = useState<string[]>([]);
  const lastSavedDeckRef = useRef<string[]>([]);

  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [openingPack, setOpeningPack] = useState(false);
  const [newCardsRevealed, setNewCardsRevealed] = useState<string[]>([]);
  const [showRevealModal, setShowRevealModal] = useState(false);

  useEffect(() => {
    audioManager.playTheme();
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const LOCAL_STORAGE_KEY = `trucomundial-deck-${user?.id || 'anonymous'}`;



  useEffect(() => {
    const fetchDeck = async () => {
      setLoading(true);
      try {
        if (!user) {
          // Anonymous users cannot build decks anymore. Clean up any leftover local storage.
          localStorage.removeItem(LOCAL_STORAGE_KEY);
          setUnlockedCards([]);
          setSelectedDeck([]);
          lastSavedDeckRef.current = [];
          return;
        }

        // Try Supabase user_decks table
        const { data, error } = await supabase
          .from('user_decks')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          if (error.code === 'PGRST116' || error.code === '42P01') {
            // Not found, create initial (or table doesn't exist)
            // Try inserting if table exists
            if (error.code !== '42P01') {
              const { error: insertErr } = await supabase.from('user_decks').insert({
                id: user.id,
                unlocked_cards: [],
                selected_deck: []
              });
              if (insertErr) {
                console.error("Error creating deck, falling back to local:", insertErr);
              }
            }

            const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (cached) {
              const parsed = JSON.parse(cached);
              setUnlockedCards(parsed.unlockedCards || []);
              setSelectedDeck(parsed.selectedDeck || []);
              lastSavedDeckRef.current = parsed.selectedDeck || [];
            } else {
              setUnlockedCards([]);
              setSelectedDeck([]);
              lastSavedDeckRef.current = [];
              localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ unlockedCards: [], selectedDeck: [] }));
            }
          } else {
            console.error('Error fetching deck:', error);
          }
        } else if (data) {
          setUnlockedCards(data.unlocked_cards || []);
          setSelectedDeck(data.selected_deck || []);
          lastSavedDeckRef.current = data.selected_deck || [];
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ unlockedCards: data.unlocked_cards, selectedDeck: data.selected_deck }));
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDeck();
  }, [user]);

  const toggleCardSelection = (cardId: string) => {
    if (!unlockedCards.includes(cardId)) return; // Can't select locked

    setSelectedDeck(prev => {
      if (prev.includes(cardId)) {
        return prev.filter(id => id !== cardId);
      } else {
        if (prev.length >= 22) return prev; // Max 22
        return [...prev, cardId];
      }
    });
  };

  const handleSaveDeck = async () => {
    if (!user) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ unlockedCards, selectedDeck }));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
      lastSavedDeckRef.current = selectedDeck;
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('user_decks')
        .upsert({
          id: user.id,
          unlocked_cards: unlockedCards,
          selected_deck: selectedDeck,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
      lastSavedDeckRef.current = selectedDeck;
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ unlockedCards, selectedDeck }));
    } catch (err) {
      console.error('Error saving deck:', err);
      // Fallback local
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ unlockedCards, selectedDeck }));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
      lastSavedDeckRef.current = selectedDeck;
    } finally {
      setSaving(false);
    }
  };

  const buyMysteryCard = async () => {
    if (openingPack) return;

    const lockedCards = CARDS.map(c => c.id).filter(id => !unlockedCards.includes(id) && !TOP_CARDS.includes(id));
    if (lockedCards.length === 0) {
      alert("¡Ya tenés todas las cartas desbloqueadas!");
      return;
    }

    setOpeningPack(true);

    // Pick up to 3 random cards
    const cardsToUnlock: string[] = [];
    const availableLocked = [...lockedCards];
    for (let i = 0; i < 3; i++) {
      if (availableLocked.length === 0) break;
      const randomIndex = Math.floor(Math.random() * availableLocked.length);
      cardsToUnlock.push(availableLocked[randomIndex]);
      availableLocked.splice(randomIndex, 1);
    }

    const newUnlocked = [...unlockedCards, ...cardsToUnlock];
    let newSelected = [...selectedDeck];
    for (const cardId of cardsToUnlock) {
      if (newSelected.length < 22 && !newSelected.includes(cardId)) {
        newSelected.push(cardId);
      }
    }

    // Simulate animation delay
    setTimeout(async () => {
      const hasTopCard = cardsToUnlock.some(id => isTopCard(id));
      if (hasTopCard) {
        audioManager.playSystemSound("rare-rewarding-card");
      } else {
        audioManager.playSystemSound("rewarding-card");
      }
      setUnlockedCards(newUnlocked);
      setSelectedDeck(newSelected);
      setNewCardsRevealed(cardsToUnlock);
      setShowRevealModal(true);
      setOpeningPack(false);

      // Save to db immediately
      if (user) {
        const { error } = await supabase.from('user_decks').upsert({
          id: user.id,
          unlocked_cards: newUnlocked,
          selected_deck: newSelected,
          updated_at: new Date().toISOString()
        });
        if (error) console.error("Error guardando sobre:", error);
      }
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ unlockedCards: newUnlocked, selectedDeck: newSelected }));
      lastSavedDeckRef.current = newSelected;
    }, 1500);
  };

  const hasUnsavedChanges = () => {
    if (selectedDeck.length !== lastSavedDeckRef.current.length) return true;
    for (const id of selectedDeck) {
      if (!lastSavedDeckRef.current.includes(id)) return true;
    }
    return false;
  };

  const handleBackRequest = () => {
    if (hasUnsavedChanges()) {
      setShowUnsavedModal(true);
    } else {
      onBack();
    }
  };

  const cleanString = (str: string): string => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  const filteredPlayers = CARDS.filter(p => {
    const q = cleanString(search);
    if (!q) return true;

    return (
      cleanString(p.name).includes(q) ||
      cleanString(p.country).includes(q) ||
      cleanString(p.club).includes(q)
    );
  }).sort((a, b) => {
    // Sort logic: selected first, then unlocked, then locked
    const aSelected = selectedDeck.includes(a.id);
    const bSelected = selectedDeck.includes(b.id);
    if (aSelected && !bSelected) return -1;
    if (!aSelected && bSelected) return 1;

    const aUnlocked = unlockedCards.includes(a.id);
    const bUnlocked = unlockedCards.includes(b.id);
    if (aUnlocked && !bUnlocked) return -1;
    if (!aUnlocked && bUnlocked) return 1;

    return b.env - a.env;
  });

  return (
    <div style={{
      width: '100%', maxWidth: '1200px', margin: '0 auto', minHeight: '100vh',
      display: 'flex', flexDirection: 'column',
      padding: isMobile ? '1.5rem 1rem 4rem 1rem' : '1.1rem 1rem 4rem 1rem',
      color: '#fff', boxSizing: 'border-box'
    }}>
      {!isMobile && (
        <>
          <button onClick={handleBackRequest} className="home-btn-fixed btn-hover-dark profile-nav-btn" style={{
            position: "fixed", top: "1.5rem", left: "1.5rem", background: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(12px)", zIndex: 2000, height: "40px", borderRadius: "1rem", padding: "0 1.25rem",
            display: "flex", alignItems: "center", gap: "0.5rem", color: "white", border: "1px solid rgba(255, 255, 255, 0.2)",
            fontWeight: 900, fontSize: "0.75rem", letterSpacing: "0.05em", cursor: "pointer"
          }}>
            <Home size={18} /><span>{t("home")}</span>
          </button>
          <UtilityButtons />
        </>
      )}

      {isMobile && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: '0.75rem', marginBottom: '1rem' }}>
          <button onClick={handleBackRequest} className="btn-hover-dark" style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)', color: 'white', height: '36px', borderRadius: '0.75rem', padding: '0 0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer', boxShadow: '3px 3px 0px #000' }}>
            <Home size={14} /> {t("home")}
          </button>
          <UtilityButtons isMobile={true} />
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Layers size={36} style={{ color: '#f97316', filter: 'drop-shadow(0 0 10px rgba(249, 115, 22, 0.3))' }} />
          <h2 style={{ fontSize: isMobile ? '1.4rem' : '2.2rem', margin: 0, letterSpacing: '0.05em', color: '#f97316', textShadow: '0 0 15px rgba(249, 115, 22, 0.2)' }}>
            ARMÁ/PERSONALIZÁ TU MAZO
          </h2>
        </div>
        <p style={{ fontSize: '0.95rem', opacity: 0.65, margin: '4px 0 0 0', fontWeight: 600 }}>Abrí sobres, desbloqueá nuevas cartas y seleccioná exactamente 22 para armar tu mazo competitivo online.</p>
        <p style={{ fontSize: '0.85rem', opacity: 0.8, margin: '8px 0 0 0', fontWeight: 700, color: '#f97316' }}>
          * En partidas online, tus 22 cartas seleccionadas se van a sumar y mezclar con las 22 cartas de tu rival para formar el mazo de 44 cartas de la partida.
        </p>
      </div>



      {user && (
        <div style={{
          position: 'sticky', top: '1rem', zIndex: 3000, background: 'rgba(15, 10, 25, 0.9)',
          border: selectedDeck.length === 22 ? '2px solid rgba(16, 185, 129, 0.45)' : '2px solid rgba(249, 115, 22, 0.25)',
          borderRadius: '2rem', padding: '1.25rem 2rem', marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem', backdropFilter: 'blur(16px)'
        }}>
          <div style={{ flex: '1 1 300px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 800 }}>
              <span style={{ color: selectedDeck.length === 22 ? '#10b981' : '#f97316', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Layers size={18} />
                Cartas Seleccionadas
              </span>
              <span style={{ color: selectedDeck.length === 22 ? '#10b981' : '#fff' }}>
                {selectedDeck.length} / 22
              </span>
            </div>
            <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
              <motion.div
                animate={{ width: `${(selectedDeck.length / 22) * 100}%` }}
                style={{
                  height: '100%',
                  background: selectedDeck.length === 22 ? 'linear-gradient(to right, #10b981, #059669)' : 'linear-gradient(to right, #f97316, #ea580c)'
                }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            {unlockedCards.length >= 22 && (
              <button
                disabled={true}
                className="btn-hover-dark"
                style={{
                  background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.4), rgba(217, 119, 6, 0.4))', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', height: '48px', borderRadius: '1.25rem', padding: '0 1.5rem', fontSize: '0.9rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'not-allowed'
                }}
                title="Próximamente"
              >
                <Lock size={18} />
                Comprar Carta Misteriosa
              </button>
            )}

            <button
              onClick={handleSaveDeck}
              disabled={saving || saveSuccess || selectedDeck.length !== 22}
              className="btn-hover-dark"
              style={{
                background: saveSuccess ? '#10b981' : (hasUnsavedChanges() ? '#ffb800' : '#f97316'),
                border: 'none', color: '#fff', height: '48px', borderRadius: '1.25rem', padding: '0 2rem', fontSize: '1rem', fontWeight: 950, display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: (saving || saveSuccess || selectedDeck.length !== 22) ? 'default' : 'pointer', opacity: (saving || selectedDeck.length !== 22) ? 0.5 : 1
              }}
            >
              {saveSuccess ? <Check size={18} /> : <Save size={18} />}
              {saveSuccess ? "Guardado" : saving ? "Guardando..." : "Guardar Mazo"}
            </button>
          </div>
        </div>
      )}

      {unlockedCards.length < 24 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            position: !user ? 'sticky' : 'relative',
            top: !user ? '1rem' : undefined,
            zIndex: !user ? 3000 : 1,
            background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.15), rgba(234, 88, 12, 0.05))',
            border: '2px dashed rgba(249, 115, 22, 0.4)',
            borderRadius: '2rem', padding: '1.5rem 2rem', marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem', backdropFilter: 'blur(16px)'
          }}
        >
          <div style={{ flex: '1 1 300px' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#f97316', fontSize: '1.1rem', fontWeight: 900 }}>
              {user && unlockedCards.length > 0 ? "¡Seguí armando tu mazo!" : "¡Empezá a armar tu mazo!"}
            </h3>
            <p style={{ margin: 0, opacity: 0.8, fontSize: '0.9rem', lineHeight: 1.5, maxWidth: isMobile ? '400px' : 'none' }}>
              {user ? "Como nuevo usuario, tenés 8 sobres de bienvenida gratuitos (de 3 cartas cada uno) para armar tu mazo." : "Iniciá sesión para abrir tus 8 sobres de bienvenida gratuitos (de 3 cartas cada uno) y armar tu mazo."}
            </p>
          </div>
          {user ? (
            <button
              onClick={buyMysteryCard}
              disabled={openingPack}
              className="btn-hover-dark"
              style={{
                background: '#f97316', border: 'none', color: '#fff', height: '48px', borderRadius: '1.25rem', padding: '0 1.5rem', fontSize: '0.9rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: openingPack ? 'default' : 'pointer', opacity: openingPack ? 0.7 : 1
              }}
            >
              {openingPack ? <RefreshCw size={18} className="spin" /> : <Unlock size={18} />}
              Abrir sobre gratis ({Math.max(0, 8 - Math.floor(unlockedCards.length / 3))} restantes)
            </button>
          ) : (
            <button
              onClick={handleAuth}
              className="btn-hover-dark"
              style={{
                background: '#f97316', border: 'none', color: '#fff', height: '48px', borderRadius: '1.25rem', padding: '0 1.5rem', fontSize: '0.9rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer'
              }}
            >
              <Lock size={18} /> Iniciar Sesión
            </button>
          )}
        </motion.div>
      )}

      <div style={{ position: 'relative', width: '100%', marginBottom: '1rem' }}>
        <div style={{ position: 'absolute', top: '50%', left: '1.25rem', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)', pointerEvents: 'none' }}>
          <Search size={20} />
        </div>
        <input
          type="text" placeholder="Buscar por nombre, país o club..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', padding: '1.25rem 1.25rem 1.25rem 3.25rem', background: 'rgba(255, 255, 255, 0.05)', border: '2px solid rgba(255, 255, 255, 0.1)', borderRadius: '1.5rem', color: '#fff', fontSize: '1.1rem', outline: 'none', boxSizing: 'border-box' }}
        />
      </div>

      {loading ? (
        <div style={{ width: '100%' }}>
          <style>{`
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
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 0', gap: '1.25rem' }}>
            <div style={{ position: 'relative', width: '60px', height: '60px' }}>
              <div style={{ position: 'absolute', inset: 0, border: '4px solid transparent', borderTopColor: '#f97316', borderRadius: '50%', animation: 'spin-clockwise 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite', boxShadow: '0 0 15px rgba(249, 115, 22, 0.45)' }} />
              <div style={{ position: 'absolute', inset: '6px', border: '4px solid transparent', borderTopColor: '#f97316', borderRadius: '50%', animation: 'spin-counter 0.8s cubic-bezier(0.5, 0, 0.5, 1) infinite', boxShadow: '0 0 10px rgba(249, 115, 22, 0.35)' }} />
            </div>
            <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, letterSpacing: '0.05em', color: '#f97316', textShadow: '0 0 8px rgba(249, 115, 22, 0.2)', animation: 'pulse-soft 1.5s ease-in-out infinite' }}>
              Cargando inventario...
            </p>
          </div>
        </div>
      ) : filteredPlayers.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="No hay resultados"
          description="No encontramos ninguna carta que coincida con tu búsqueda. Intentá buscar otra cosa."
          actionText={search ? "Limpiar búsqueda" : undefined}
          onAction={search ? () => setSearch('') : undefined}
          color="#f97316"
        />
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
          gap: isMobile ? '0.75rem' : '1.5rem',
          width: '100%'
        }}>
          {filteredPlayers.map(player => {
            const isUnlocked = unlockedCards.includes(player.id);
            const isSelected = selectedDeck.includes(player.id);
            const isRevealed = newCardsRevealed.includes(player.id);

            return (
              <motion.div
                key={player.id}
                layoutId={`deck-card-${player.id}`}
                initial={isRevealed ? { scale: 0, rotate: -180 } : false}
                animate={isRevealed ? { scale: [0, 1.2, 1], rotate: 0 } : {}}
                transition={{ duration: 0.8, type: 'spring' }}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative',
                  opacity: isUnlocked ? 1 : 0.5,
                  filter: isUnlocked ? 'none' : 'grayscale(100%)',
                  cursor: isUnlocked ? 'pointer' : 'default',
                  transform: isSelected ? 'translateY(-5px)' : 'none',
                  transition: 'transform 0.2s ease, filter 0.2s ease, opacity 0.2s ease'
                }}
                onClick={() => toggleCardSelection(player.id)}
                whileHover={isUnlocked ? "hover" : undefined}
              >
                <div style={{ position: 'relative' }}>
                  {!isUnlocked && (
                    <div style={{ position: 'absolute', top: '38%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 2000, background: 'rgba(0,0,0,0.6)', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', pointerEvents: 'none' }}>
                      <Lock size={24} color="#fff" />
                    </div>
                  )}
                  {isSelected && (
                    <motion.div variants={{ hover: { scale: 1.25 } }} style={{ position: 'absolute', top: -12, right: -12, zIndex: 2000, background: '#10b981', color: 'white', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(15,10,25,0.9)', boxShadow: '0 4px 10px rgba(16, 185, 129, 0.4)', pointerEvents: 'none' }}>
                      <Check size={16} strokeWidth={3} />
                    </motion.div>
                  )}
                  <Sticker
                    card={player}
                    disabled={!isUnlocked}
                    showBack={false}
                  />
                </div>
                <div style={{ marginTop: '0.5rem', textAlign: 'center', width: '100%' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#fff' }}>{player.name}</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {showUnsavedModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)' }}>
          <div style={{ background: '#1a1a2e', padding: '2rem', borderRadius: '1.5rem', maxWidth: '400px', width: '90%', textAlign: 'center', border: '1px solid rgba(255,184,0,0.3)' }}>
            <h3 style={{ color: '#ffb800', marginTop: 0 }}>Cambios sin guardar</h3>
            <p>Tenés cambios en tu mazo que no guardaste. ¿Seguro que querés salir sin guardar?</p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button onClick={() => setShowUnsavedModal(false)} style={{ flex: 1, padding: '0.75rem', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: '0.75rem', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={() => { setShowUnsavedModal(false); onBack(); }} style={{ flex: 1, padding: '0.75rem', background: '#e11d48', border: 'none', color: '#fff', borderRadius: '0.75rem', cursor: 'pointer', fontWeight: 'bold' }}>Salir sin guardar</button>
            </div>
          </div>
        </div>
      )}

      {showRevealModal && newCardsRevealed.length > 0 && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 3500, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.60)', backdropFilter: 'blur(8px)' }}>
          <motion.div
            initial={{ scale: 0.5, opacity: 0, rotateY: 180 }}
            animate={{ scale: 1, opacity: 1, rotateY: 0 }}
            transition={{ type: "spring", damping: 15, stiffness: 100 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}
          >
            <div style={{
              display: 'flex',
              flexDirection: 'row',
              gap: isMobile ? '1.25rem' : '2rem',
              alignItems: 'center',
              justifyContent: 'center',
              transform: 'scale(1.1)',
              marginBottom: '2rem',
              width: '100%'
            }} className="white-scrollbar">
              {newCardsRevealed.map((cardId: string) => (
                <div key={cardId} style={{ position: 'relative', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))' }}>
                  <motion.div
                    animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.75, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{ 
                      position: 'absolute', top: '50%', left: '50%', x: '-50%', y: '-50%', 
                      width: '260px', height: '360px', 
                      background: 'radial-gradient(circle, rgba(249,115,22,0.55) 0%, rgba(249,115,22,0) 70%)', 
                      zIndex: -1, filter: 'blur(25px)', pointerEvents: 'none'
                    }}
                  />
                  <Sticker card={CARDS.find(c => c.id === cardId)!} disabled={false} showBack={false} />
                </div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              style={{ textAlign: 'center', marginTop: isMobile ? '0' : '1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}
            >
              <h2 style={{ margin: isMobile ? '0 0 0.5rem 0' : '0 0 1rem 0', color: '#f97316', fontWeight: 950, fontSize: isMobile ? '1.5rem' : '2rem', textShadow: '0 4px 20px rgba(249,115,22,0.6)', letterSpacing: '1px' }}>
                ¡CARTAS DESBLOQUEADAS!
              </h2>

              <button
                onClick={() => setShowRevealModal(false)}
                className="btn-hover-dark"
                style={{
                  background: 'linear-gradient(135deg, #f97316, #ea580c)',
                  border: 'none',
                  color: '#fff',
                  padding: '1rem 3rem',
                  borderRadius: '2rem',
                  fontSize: '1.1rem',
                  fontWeight: 900,
                  cursor: 'pointer',
                  boxShadow: '0 10px 25px -5px rgba(249,115,22,0.5)',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}
              >
                Continuar
              </button>
            </motion.div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
