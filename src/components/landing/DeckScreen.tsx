import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Lock,
  Home,
  Layers,
  Unlock,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  Star,
  Clock,
} from "lucide-react";
import { isTopCard, getCardVotes } from "../../lib/votesStore";
import { useTranslation } from "react-i18next";
import { CARDS } from "../../data/cards";
import { Sticker } from "../shared/Sticker";
import { EmptyState } from "../shared/EmptyState";
import { supabase } from "../../lib/supabase";
import { audioManager } from "../../lib/audio";
import { UtilityButtons } from "../shared/UtilityButtons";

interface DeckScreenProps {
  user: any;
  handleAuth: () => void;
  onBack: () => void;
}


export const DeckScreen: React.FC<DeckScreenProps> = ({
  user,
  handleAuth: _handleAuth,
  onBack,
}) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const cleanString = (str: string): string =>
    str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [unlockedCards, setUnlockedCards] = useState<string[]>([]);

  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false,
  );
  const [openingPack, setOpeningPack] = useState(false);
  const [newCardsRevealed, setNewCardsRevealed] = useState<string[]>([]);
  const [highlightingCards, setHighlightingCards] = useState(false);
  const [showRevealModal, setShowRevealModal] = useState(false);

  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [redeemCode, setRedeemCode] = useState("");
  const [redeeming, setRedeeming] = useState(false);
  const [redeemError, setRedeemError] = useState("");

  useEffect(() => {
    audioManager.playTheme();
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const LOCAL_STORAGE_KEY = `trucomundial-deck-${user?.id || "anonymous"}`;
  const LAST_UNLOCK_KEY = `trucomundial-deck-last-unlock-${user?.id || "anonymous"}`;
  const FOUR_HOURS_MS = 4 * 60 * 60 * 1000;

  const [lastUnlockTime, setLastUnlockTime] = useState<number | null>(() => {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem(
      `trucomundial-deck-last-unlock-${user?.id || "anonymous"}`,
    );
    return stored ? parseInt(stored, 10) : null;
  });
  const [currentTime, setCurrentTime] = useState<number>(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem(LAST_UNLOCK_KEY);
    if (stored) {
      setLastUnlockTime(parseInt(stored, 10));
    } else if (unlockedCards.length >= 24) {
      const now = Date.now();
      localStorage.setItem(LAST_UNLOCK_KEY, String(now));
      setLastUnlockTime(now);
    }
  }, [user, unlockedCards.length, LAST_UNLOCK_KEY]);

  const timeRemainingMs =
    unlockedCards.length >= 24 && lastUnlockTime !== null
      ? Math.max(0, lastUnlockTime + FOUR_HOURS_MS - currentTime)
      : 0;

  const isCardAvailable =
    unlockedCards.length >= 24 && timeRemainingMs <= 0;

  const formatCountdown = (ms: number): string => {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  useEffect(() => {
    const fetchDeck = async () => {
      setLoading(true);
      try {
        // Load from localStorage first
        const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (parsed) {
              setUnlockedCards(parsed.unlockedCards || []);
            }
          } catch (e) {}
        }

        if (user) {
          // Try Supabase user_decks table
          try {
            const { data, error } = await supabase
              .from("user_decks")
              .select("*")
              .eq("id", user.id)
              .single();

            if (!error && data) {
              setUnlockedCards(data.unlocked_cards || []);
              localStorage.setItem(
                LOCAL_STORAGE_KEY,
                JSON.stringify({
                  unlockedCards: data.unlocked_cards,
                }),
              );
            }
          } catch (e) {
            // Offline or table not configured; local storage is active
          }
        }
      } catch (err) {
        console.error("Unexpected error fetching deck:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDeck();
  }, [user]);

  const toggleCountryFilter = (country: string) => {
    setSelectedCountries((prev) => {
      if (prev.includes(country)) {
        return prev.filter((c) => c !== country);
      } else {
        return [...prev, country];
      }
    });
  };

  const handleRedeemCode = async () => {
    if (!user) {
      setRedeemError(t("error_login_redeem"));
      return;
    }
    if (redeemCode.length !== 4) {
      setRedeemError(t("error_code_length"));
      return;
    }
    setRedeeming(true);
    setRedeemError("");

    // Check localStorage first (from Prode rewards)
    const localCodesKey = `trucomundial_reward_codes_${user.id}`;
    let redeemedLocal = false;
    try {
      const cached = localStorage.getItem(localCodesKey);
      if (cached) {
        const codes: any[] = JSON.parse(cached);
        const matchIdx = codes.findIndex((c: any) => c.code === redeemCode.toUpperCase() && !c.used);
        if (matchIdx !== -1) {
          codes[matchIdx].used = true;
          localStorage.setItem(localCodesKey, JSON.stringify(codes));
          redeemedLocal = true;
        }
      }
    } catch (e) {}

    if (redeemedLocal) {
      setShowRedeemModal(false);
      setRedeemCode("");
      setRedeeming(false);
      await buyMysteryCard(3);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("reward_codes")
        .select("*")
        .eq("code", redeemCode.toUpperCase())
        .eq("used", false)
        .eq("user_id", user.id)
        .single();

      if (error || !data) {
        setRedeemError(t("error_invalid_code"));
        setRedeeming(false);
        return;
      }

      await supabase
        .from("reward_codes")
        .update({ used: true })
        .eq("id", data.id);

      setShowRedeemModal(false);
      setRedeemCode("");

      await buyMysteryCard(3);
    } catch (err) {
      setRedeemError(t("error_invalid_code"));
      setRedeeming(false);
    }
  };

  const handleResetCollection = () => {
    if (confirm("¿Estás seguro de que querés reiniciar tus cartas y sobres? Podrás abrir los 8 sobres iniciales desde cero.")) {
      setUnlockedCards([]);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      localStorage.removeItem(LAST_UNLOCK_KEY);
      setLastUnlockTime(null);
    }
  };

  const buyMysteryCard = async (count: number = 3) => {
    if (openingPack) return;

    const lockedCards = CARDS.map((c) => c.id).filter(
      (id) => !unlockedCards.includes(id)
    );
    if (lockedCards.length === 0) {
      alert(t("alert_all_cards_unlocked"));
      return;
    }

    setOpeningPack(true);

    // Sort all cards by votes to determine rank
    const allRanked = CARDS.map(c => ({ id: c.id, votes: getCardVotes(c.id) })).sort((a, b) => b.votes - a.votes);

    // Calculate weight for each locked card
    const availableLockedWithWeights = lockedCards.map(id => {
      let weight = 100;
      if (isTopCard(id)) {
        const rank = allRanked.findIndex(c => c.id === id); // 0 is top 1
        weight = Math.max(60, 60 + rank * 5); // Rank 0 -> 60, Rank 1 -> 65, etc.
      }
      return { id, weight };
    });

    // Pick up to count random cards based on weights
    const cardsToUnlock: string[] = [];
    for (let i = 0; i < count; i++) {
      if (availableLockedWithWeights.length === 0) break;
      
      const totalWeight = availableLockedWithWeights.reduce((sum, item) => sum + item.weight, 0);
      let randomVal = Math.random() * totalWeight;
      let selectedIndex = 0;
      for (let j = 0; j < availableLockedWithWeights.length; j++) {
        randomVal -= availableLockedWithWeights[j].weight;
        if (randomVal <= 0) {
          selectedIndex = j;
          break;
        }
      }
      cardsToUnlock.push(availableLockedWithWeights[selectedIndex].id);
      availableLockedWithWeights.splice(selectedIndex, 1);
    }

    const newUnlocked = [...unlockedCards, ...cardsToUnlock];

    // Simulate animation delay
    setTimeout(async () => {
      const hasTopCard = cardsToUnlock.some((id) => isTopCard(id));
      if (hasTopCard) {
        audioManager.playSystemSound("rare-rewarding-card");
      } else {
        audioManager.playSystemSound("rewarding-card");
      }
      setUnlockedCards(newUnlocked);
      setNewCardsRevealed(cardsToUnlock);
      setShowRevealModal(true);
      setOpeningPack(false);

      // Start/reset 4-hour countdown if we have reached or exceeded 24 unlocked cards
      if (newUnlocked.length >= 24) {
        const now = Date.now();
        localStorage.setItem(LAST_UNLOCK_KEY, String(now));
        setLastUnlockTime(now);
      }

      // Save to db immediately
      if (user) {
        const { error } = await supabase.from("user_decks").upsert({
          id: user.id,
          unlocked_cards: newUnlocked,
          updated_at: new Date().toISOString(),
        });
        if (error) console.error("Error guardando sobre:", error);
      }
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({
          unlockedCards: newUnlocked,
        }),
      );
    }, 1500);
  };

  const handleBackRequest = () => {
    onBack();
  };

  const handleCloseRevealModal = () => {
    setShowRevealModal(false);
    setTimeout(() => {
      if (newCardsRevealed.length > 0) {
        setHighlightingCards(true);
        const firstCardId = newCardsRevealed[0];
        const element = document.getElementById(`deck-card-${firstCardId}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }

        setTimeout(() => {
          setHighlightingCards(false);
          setNewCardsRevealed([]);
        }, 2000);
      }
    }, 300);
  };

  const unlockedCountries = Array.from(
    new Set(
      CARDS.filter((c) => unlockedCards.includes(c.id)).map((c) => c.country),
    ),
  );

  const filteredPlayers = CARDS.filter((p) => {
    if (
      selectedCountries.length > 0 &&
      !selectedCountries.includes(p.country)
    ) {
      return false;
    }

    const q = cleanString(search);
    if (!q) return true;

    const translatedCountry = t(
      `country_${p.country
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()}`,
      p.country,
    );
    return (
      cleanString(p.name).includes(q) ||
      cleanString(p.country).includes(q) ||
      cleanString(translatedCountry).includes(q) ||
      cleanString(p.club).includes(q)
    );
  }).sort((a, b) => {
    // Sort logic: unlocked first, then locked, then by envido
    const aUnlocked = unlockedCards.includes(a.id);
    const bUnlocked = unlockedCards.includes(b.id);
    if (aUnlocked && !bUnlocked) return -1;
    if (!aUnlocked && bUnlocked) return 1;

    return b.env - a.env;
  });

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "1200px",
        margin: "0 auto",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        padding: isMobile ? "1.5rem 1rem 4rem 1rem" : "1.1rem 1rem 4rem 1rem",
        color: "#fff",
        boxSizing: "border-box",
      }}
    >
      {!isMobile && (
        <>
          <button
            onClick={handleBackRequest}
            className="home-btn-fixed btn-hover-dark profile-nav-btn"
            style={{
              position: "fixed",
              top: "1.5rem",
              left: "1.5rem",
              background: "rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(12px)",
              zIndex: 2000,
              height: "40px",
              borderRadius: "1rem",
              padding: "0 1.25rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              color: "white",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              fontWeight: 900,
              fontSize: "0.75rem",
              letterSpacing: "0.05em",
              cursor: "pointer",
            }}
          >
            <Home size={18} />
            <span>{t("home")}</span>
          </button>
          <UtilityButtons />
        </>
      )}

      {/* HEADER SECTION (Responsive Container) */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: isMobile ? "1.5rem" : "2rem",
          width: "100%",
          position: "relative",
        }}
      >
        {isMobile ? (
          <>
            {/* Mobile Header Layout */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
                gap: "0.75rem",
                marginBottom: "1rem",
              }}
            >
              <button
                onClick={handleBackRequest}
                className="btn-hover-dark"
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  color: "white",
                  height: "36px",
                  borderRadius: "0.75rem",
                  padding: "0 0.85rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  fontSize: "0.8rem",
                  fontWeight: 800,
                  cursor: "pointer",
                  boxShadow: "3px 3px 0px #000",
                }}
              >
                <Home size={14} /> {t("home")}
              </button>
              <UtilityButtons isMobile={true} />
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.25rem",
                justifyContent: "center",
                textAlign: "center",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <Layers
                  size={24}
                  style={{
                    color: "#f97316",
                    filter: "drop-shadow(0 0 6px rgba(249, 115, 22, 0.25))",
                  }}
                />
                <h2
                  className="text-display"
                  style={{
                    fontSize: "1.4rem",
                    margin: 0,
                    letterSpacing: "0.05em",
                    color: "#f97316",
                    textShadow: "0 0 8px rgba(249, 115, 22, 0.15)",
                  }}
                >
                  {t("deck_build_title")}
                </h2>
              </div>
              <p
                style={{
                  fontSize: "0.75rem",
                  opacity: 0.6,
                  margin: "4px 0 0 0",
                }}
              >
                {t("deck_build_subtitle")}
              </p>
            </div>
          </>
        ) : (
          <>
            {/* Desktop Centered Header Layout */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.5rem",
                textAlign: "center",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
              >
                <Layers
                  size={36}
                  style={{
                    color: "#f97316",
                    filter: "drop-shadow(0 0 10px rgba(249, 115, 22, 0.3))",
                  }}
                />
                <h2
                  className="text-display"
                  style={{
                    fontSize: "2.2rem",
                    margin: 0,
                    letterSpacing: "0.05em",
                    color: "#f97316",
                    textShadow: "0 0 15px rgba(249, 115, 22, 0.2)",
                  }}
                >
                  {t("deck_build_title")}
                </h2>
              </div>
              <p
                style={{
                  fontSize: "0.95rem",
                  opacity: 0.65,
                  margin: "4px 0 0 0",
                  fontWeight: 600,
                }}
              >
                {t("deck_build_subtitle")}
              </p>
            </div>
          </>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          position: "relative",
          zIndex: 1,
          background:
            "linear-gradient(135deg, rgba(249, 115, 22, 0.15), rgba(234, 88, 12, 0.05))",
          border: "2px dashed rgba(249, 115, 22, 0.4)",
          borderRadius: "2rem",
          padding: "1.5rem 2rem",
          marginBottom: "2rem",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1.5rem",
          backdropFilter: "blur(16px)",
        }}
      >
        <div style={{ flex: "1 1 300px" }}>
          <h3
            style={{
              margin: "0 0 0.5rem 0",
              color: "#f97316",
              fontSize: "1.1rem",
              fontWeight: 900,
            }}
          >
            {unlockedCards.length >= 24
              ? isCardAvailable
                ? t("next_card_ready")
                : t("next_card_on_the_way")
              : unlockedCards.length > 0
              ? t("continue_building_deck")
              : t("start_building_deck")}
          </h3>
          <p
            style={{
              margin: 0,
              opacity: 0.8,
              fontSize: "0.9rem",
              lineHeight: 1.5,
              maxWidth: isMobile ? "400px" : "none",
            }}
          >
            {unlockedCards.length >= 24
              ? t("packs_completed_desc")
              : t("new_user_packs_desc")}
          </p>
          <div
            style={{
              marginTop: "0.6rem",
              fontSize: "0.85rem",
              fontWeight: 800,
              color: "#f97316",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <span>
              Colección: {unlockedCards.length} / {CARDS.length} cartas ({Math.round((unlockedCards.length / CARDS.length) * 100)}%)
            </span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() => {
              if (unlockedCards.length < 24) {
                buyMysteryCard(3);
              } else if (isCardAvailable) {
                buyMysteryCard(1);
              }
            }}
            disabled={
              openingPack ||
              (unlockedCards.length >= 24 && !isCardAvailable) ||
              CARDS.filter((c) => !unlockedCards.includes(c.id)).length === 0
            }
            className="btn-hover-dark"
            style={{
              background:
                unlockedCards.length >= 24 && !isCardAvailable
                  ? "rgba(249, 115, 22, 0.2)"
                  : "#f97316",
              border:
                unlockedCards.length >= 24 && !isCardAvailable
                  ? "1px solid rgba(249, 115, 22, 0.4)"
                  : "none",
              color:
                unlockedCards.length >= 24 && !isCardAvailable
                  ? "#fdba74"
                  : "#fff",
              height: "48px",
              borderRadius: "1.25rem",
              padding: "0 1.5rem",
              fontSize: "0.9rem",
              fontWeight: 900,
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              cursor:
                openingPack ||
                (unlockedCards.length >= 24 && !isCardAvailable) ||
                CARDS.filter((c) => !unlockedCards.includes(c.id)).length === 0
                  ? "not-allowed"
                  : "pointer",
              opacity: openingPack ? 0.7 : 1,
              boxShadow:
                unlockedCards.length >= 24 && !isCardAvailable
                  ? "none"
                  : "4px 4px 0px #000",
              transition: "all 0.2s ease",
            }}
          >
            {openingPack ? (
              <RefreshCw size={18} className="spin" />
            ) : unlockedCards.length >= 24 && !isCardAvailable ? (
              <Clock size={18} />
            ) : (
              <Unlock size={18} />
            )}
            {CARDS.filter((c) => !unlockedCards.includes(c.id)).length === 0
              ? t("all_cards_unlocked_btn")
              : unlockedCards.length < 24
              ? t("open_free_pack", {
                  count: Math.max(0, 8 - Math.floor(unlockedCards.length / 3)),
                })
              : isCardAvailable
              ? t("unlock_free_card")
              : t("next_card_in", { time: formatCountdown(timeRemainingMs) })}
          </button>

          <button
            onClick={() => setShowRedeemModal(true)}
            className="btn-hover-dark"
            style={{
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              color: "#fff",
              height: "48px",
              borderRadius: "1.25rem",
              padding: "0 1.25rem",
              fontSize: "0.9rem",
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              cursor: "pointer",
              boxShadow: "3px 3px 0px #000",
            }}
          >
            <Unlock size={16} />
            {t("redeem_code")}
          </button>

          {unlockedCards.length > 0 && (
            <button
              onClick={handleResetCollection}
              title="Reiniciar cartas y sobres a estado inicial"
              className="btn-hover-dark"
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "#a0a0ab",
                height: "48px",
                borderRadius: "1.25rem",
                padding: "0 1rem",
                fontSize: "0.85rem",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                cursor: "pointer",
              }}
            >
              <RefreshCw size={16} />
              Reiniciar
            </button>
          )}
        </div>
      </motion.div>

      <div
        style={{
          background: "rgba(255, 223, 0, 0.1)",
          border: "1px solid rgba(255, 223, 0, 0.3)",
          borderRadius: "1rem",
          padding: "1rem",
          marginBottom: "1rem",
          marginTop: "0",
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <Star size={24} color="#ffdf00" style={{ flexShrink: 0 }} />
        <div>
          <h4
            style={{
              margin: "0 0 0.25rem 0",
              color: "#ffdf00",
              textAlign: "left",
            }}
          >
            {t("deck_ranking_promo_title")}
          </h4>
          <p
            style={{
              margin: 0,
              fontSize: "0.85rem",
              color: "rgba(255,255,255,0.8)",
              textAlign: "left",
            }}
          >
            <span>{t("deck_ranking_promo_text")} </span>
            <a
              href="/votar"
              style={{
                color: "#ffdf00",
                fontWeight: 800,
                textDecoration: "none",
                whiteSpace: "nowrap",
              }}
            >
              <ExternalLink
                size={14}
                style={{
                  verticalAlign: "middle",
                  marginRight: "0.2rem",
                  marginTop: "-0.1rem",
                }}
              />
              {t("deck_ranking_promo_link")}
            </a>
            .
          </p>
        </div>
      </div>

      <div
        style={{
          background: "rgba(0, 242, 255, 0.1)",
          border: "1px solid rgba(0, 242, 255, 0.3)",
          borderRadius: "1rem",
          padding: "1rem",
          marginBottom: "2rem",
          marginTop: "0",
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <AlertCircle size={24} color="#00f2ff" style={{ flexShrink: 0 }} />
        <div>
          <h4
            style={{
              margin: "0 0 0.25rem 0",
              color: "#00f2ff",
              textAlign: "left",
            }}
          >
            {t("deck_prode_promo_title")}
          </h4>
          <p
            style={{
              margin: 0,
              fontSize: "0.85rem",
              color: "rgba(255,255,255,0.8)",
              textAlign: "left",
            }}
          >
            <span>{t("deck_prode_promo_text")} </span>
            <a
              href="/prode"
              style={{
                color: "#00f2ff",
                fontWeight: 800,
                textDecoration: "none",
                whiteSpace: "nowrap",
              }}
            >
              <ExternalLink
                size={14}
                style={{
                  verticalAlign: "middle",
                  marginRight: "0.2rem",
                  marginTop: "-0.1rem",
                }}
              />
              {t("deck_prode_promo_link")}
            </a>
            .
          </p>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          width: "100%",
          marginBottom: "2rem",
        }}
      >
        <div style={{ position: "relative", width: "100%" }}>
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "1.25rem",
              transform: "translateY(-50%)",
              color: "rgba(255,255,255,0.4)",
              pointerEvents: "none",
            }}
          >
            <Search size={20} />
          </div>
          <input
            type="text"
            placeholder={t("search_name_country_club")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "1.25rem 1.25rem 1.25rem 3.25rem",
              background: "rgba(255, 255, 255, 0.05)",
              border: "2px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "1.5rem",
              color: "#fff",
              fontSize: "1.1rem",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        {unlockedCountries.length > 0 && (
          <>
            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                flexWrap: "wrap",
                width: "100%",
              }}
            >
              <button
                onClick={() => setSelectedCountries([])}
                style={{
                  height: "42px",
                  padding: "0 1.25rem",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxSizing: "border-box",
                  borderRadius: "1.1rem",
                  background:
                    selectedCountries.length === 0
                      ? "rgba(249, 115, 22, 0.2)"
                      : "rgba(255, 255, 255, 0.05)",
                  border:
                    selectedCountries.length === 0
                      ? "1.5px solid #f97316"
                      : "1px solid rgba(255, 255, 255, 0.1)",
                  color: "#fff",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  boxShadow:
                    selectedCountries.length === 0
                      ? "0 0 10px rgba(249, 115, 22, 0.2)"
                      : "none",
                  whiteSpace: "nowrap",
                }}
              >
                <span style={{ marginRight: "0.4rem" }}>🌎</span>{" "}
                {t("filter_all")}
              </button>

              {[
                { id: "Argelia", code: "ALG", flag: "🇩🇿" },
                { id: "Argentina", code: "ARG", flag: "🇦🇷" },
                { id: "Australia", code: "AUS", flag: "🇦🇺" },
                { id: "Austria", code: "AUT", flag: "🇦🇹" },
                { id: "Bélgica", code: "BEL", flag: "🇧🇪" },
                { id: "Bosnia y Herz", code: "BIH", flag: "🇧🇦" },
                { id: "Brasil", code: "BRA", flag: "🇧🇷" },
                { id: "Canadá", code: "CAN", flag: "🇨🇦" },
                { id: "Costa de Marfil", code: "CIV", flag: "🇨🇮" },
                { id: "DR Congo", code: "COD", flag: "🇨🇩" },
                { id: "Colombia", code: "COL", flag: "🇨🇴" },
                { id: "Cabo Verde", code: "CPV", flag: "🇨🇻" },
                { id: "Croacia", code: "CRO", flag: "🇭🇷" },
                { id: "Curaçao", code: "CUW", flag: "🇨🇼" },
                { id: "República Checa", code: "CZE", flag: "🇨🇿" },
                { id: "Ecuador", code: "ECU", flag: "🇪🇨" },
                { id: "Egipto", code: "EGY", flag: "🇪🇬" },
                { id: "Inglaterra", code: "ENG", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
                { id: "España", code: "ESP", flag: "🇪🇸" },
                { id: "Francia", code: "FRA", flag: "🇫🇷" },
                { id: "Alemania", code: "GER", flag: "🇩🇪" },
                { id: "Ghana", code: "GHA", flag: "🇬🇭" },
                { id: "Haití", code: "HAI", flag: "🇭🇹" },
                { id: "Irán", code: "IRN", flag: "🇮🇷" },
                { id: "Iraq", code: "IRQ", flag: "🇮🇶" },
                { id: "Jordania", code: "JOR", flag: "🇯🇴" },
                { id: "Japón", code: "JPN", flag: "🇯🇵" },
                { id: "Corea del Sur", code: "KOR", flag: "🇰🇷" },
                { id: "Arabia Saudita", code: "KSA", flag: "🇸🇦" },
                { id: "Marruecos", code: "MAR", flag: "🇲🇦" },
                { id: "México", code: "MEX", flag: "🇲🇽" },
                { id: "Países Bajos", code: "NED", flag: "🇳🇱" },
                { id: "Noruega", code: "NOR", flag: "🇳🇴" },
                { id: "Nueva Zelanda", code: "NZL", flag: "🇳🇿" },
                { id: "Panamá", code: "PAN", flag: "🇵🇦" },
                { id: "Paraguay", code: "PAR", flag: "🇵🇾" },
                { id: "Portugal", code: "POR", flag: "🇵🇹" },
                { id: "Qatar", code: "QAT", flag: "🇶🇦" },
                { id: "Sudáfrica", code: "RSA", flag: "🇿🇦" },
                { id: "Escocia", code: "SCO", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
                { id: "Senegal", code: "SEN", flag: "🇸🇳" },
                { id: "Suiza", code: "SUI", flag: "🇨🇭" },
                { id: "Suecia", code: "SWE", flag: "🇸🇪" },
                { id: "Túnez", code: "TUN", flag: "🇹🇳" },
                { id: "Türkiye", code: "TUR", flag: "🇹🇷" },
                { id: "Uruguay", code: "URU", flag: "🇺🇾" },
                { id: "USA", code: "USA", flag: "🇺🇸" },
                { id: "Uzbekistán", code: "UZB", flag: "🇺🇿" },
              ]
                .filter((c) => unlockedCountries.includes(c.id))
                .map((country) => (
                  <button
                    key={country.id}
                    onClick={() => toggleCountryFilter(country.id)}
                    style={{
                      height: "42px",
                      padding: "0 1.25rem",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxSizing: "border-box",
                      borderRadius: "1.1rem",
                      background: selectedCountries.includes(country.id)
                        ? "rgba(249, 115, 22, 0.2)"
                        : "rgba(255, 255, 255, 0.05)",
                      border: selectedCountries.includes(country.id)
                        ? "1.5px solid #f97316"
                        : "1px solid rgba(255, 255, 255, 0.1)",
                      color: selectedCountries.includes(country.id)
                        ? "#fff"
                        : "rgba(255, 255, 255, 0.6)",
                      fontWeight: selectedCountries.includes(country.id)
                        ? "bold"
                        : "normal",
                      boxShadow: selectedCountries.includes(country.id)
                        ? "0 0 10px rgba(249, 115, 22, 0.2)"
                        : "none",
                      whiteSpace: "nowrap",
                      cursor: "pointer",
                    }}
                  >
                    <span style={{ marginRight: "0.4rem" }}>
                      {country.flag}
                    </span>{" "}
                    {country.code}
                  </button>
                ))}
            </div>
          </>
        )}
      </div>

      {loading ? (
        <div style={{ width: "100%" }}>
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
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "4rem 0",
              gap: "1.25rem",
            }}
          >
            <div
              style={{ position: "relative", width: "60px", height: "60px" }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  border: "4px solid transparent",
                  borderTopColor: "#f97316",
                  borderRadius: "50%",
                  animation:
                    "spin-clockwise 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite",
                  boxShadow: "0 0 15px rgba(249, 115, 22, 0.45)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: "6px",
                  border: "4px solid transparent",
                  borderTopColor: "#f97316",
                  borderRadius: "50%",
                  animation:
                    "spin-counter 0.8s cubic-bezier(0.5, 0, 0.5, 1) infinite",
                  boxShadow: "0 0 10px rgba(249, 115, 22, 0.35)",
                }}
              />
            </div>
            <p
              style={{
                margin: 0,
                fontSize: "0.95rem",
                fontWeight: 800,
                letterSpacing: "0.05em",
                color: "#f97316",
                textShadow: "0 0 8px rgba(249, 115, 22, 0.2)",
                animation: "pulse-soft 1.5s ease-in-out infinite",
              }}
            >
              {t("loading_inventory")}
            </p>
          </div>
        </div>
      ) : filteredPlayers.length === 0 ? (
        <EmptyState
          icon="🔍"
          title={t("no_results")}
          description={t("no_results_deck_desc")}
          actionText={search ? t("clear_search") : undefined}
          onAction={search ? () => setSearch("") : undefined}
          color="#f97316"
        />
      ) : (
        <>
          <AnimatePresence>
            {highlightingCards && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  position: "fixed",
                  inset: 0,
                  background: "rgba(0, 0, 0, 0.75)",
                  zIndex: 10,
                  pointerEvents: "none",
                }}
              />
            )}
          </AnimatePresence>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
              gap: isMobile ? "0.75rem" : "1.5rem",
              width: "100%",
            }}
          >
            {filteredPlayers.map((player) => {
              const isUnlocked = unlockedCards.includes(player.id);
              const isRevealed = newCardsRevealed.includes(player.id);

              return (
                <motion.div
                  key={player.id}
                  id={`deck-card-${player.id}`}
                  layoutId={`deck-card-${player.id}`}
                  initial={isRevealed ? { scale: 0, rotate: -180 } : false}
                  animate={isRevealed ? { scale: [0, 1.2, 1], rotate: 0 } : {}}
                  transition={{ duration: 0.8, type: "spring" }}
                  style={{
                    position: "relative",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    zIndex: isRevealed && highlightingCards ? 20 : 1,
                    opacity: isUnlocked ? 1 : 0.5,
                    filter: isUnlocked ? "none" : "grayscale(100%)",
                    cursor: "default",
                    transition:
                      "transform 0.2s ease, filter 0.2s ease, opacity 0.2s ease",
                  }}
                >
                  <div style={{ position: "relative" }}>
                    {!isUnlocked && (
                      <div
                        style={{
                          position: "absolute",
                          top: "38%",
                          left: "50%",
                          transform: "translate(-50%, -50%)",
                          zIndex: 2000,
                          background: "rgba(0,0,0,0.6)",
                          width: "48px",
                          height: "48px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "50%",
                          pointerEvents: "none",
                        }}
                      >
                        <Lock size={24} color="#fff" />
                      </div>
                    )}
                    <Sticker
                      card={player}
                      disabled={!isUnlocked}
                      showBack={false}
                    />
                  </div>
                  <div
                    style={{
                      marginTop: "0.5rem",
                      textAlign: "center",
                      width: "100%",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.8rem",
                        fontWeight: 800,
                        color: "#fff",
                      }}
                    >
                      {player.name}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </>
      )}

      {showRevealModal && newCardsRevealed.length > 0 && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 3500,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.60)",
            backdropFilter: "blur(8px)",
          }}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0, rotateY: 180 }}
            animate={{ scale: 1, opacity: 1, rotateY: 0 }}
            transition={{ type: "spring", damping: 15, stiffness: 100 }}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              position: "relative",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                gap: isMobile ? "1.25rem" : "2rem",
                alignItems: "center",
                justifyContent: "center",
                transform: "scale(1.1)",
                marginBottom: "2rem",
                width: "100%",
              }}
              className="white-scrollbar"
            >
              {newCardsRevealed.map((cardId: string) => (
                <div
                  key={cardId}
                  style={{
                    position: "relative",
                    filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.5))",
                  }}
                >
                  <motion.div
                    animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.75, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      x: "-50%",
                      y: "-50%",
                      width: "260px",
                      height: "360px",
                      background:
                        "radial-gradient(circle, rgba(249,115,22,0.55) 0%, rgba(249,115,22,0) 70%)",
                      zIndex: -1,
                      filter: "blur(25px)",
                      pointerEvents: "none",
                    }}
                  />
                  <Sticker
                    card={CARDS.find((c) => c.id === cardId)!}
                    disabled={false}
                    showBack={false}
                  />
                </div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              style={{
                textAlign: "center",
                marginTop: isMobile ? "0" : "1rem",
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
                alignItems: "center",
              }}
            >
              <h2
                style={{
                  margin: isMobile ? "0 0 0.5rem 0" : "0 0 1rem 0",
                  color: "#f97316",
                  fontWeight: 950,
                  fontSize: isMobile ? "1.5rem" : "2rem",
                  textShadow: "0 4px 20px rgba(249,115,22,0.6)",
                  letterSpacing: "1px",
                }}
              >
                {newCardsRevealed.length === 1
                  ? t("card_unlocked")
                  : t("cards_unlocked")}
              </h2>

              <button
                onClick={handleCloseRevealModal}
                className="btn-hover-dark"
                style={{
                  background: "linear-gradient(135deg, #f97316, #ea580c)",
                  border: "none",
                  color: "#fff",
                  padding: "1rem 3rem",
                  borderRadius: "2rem",
                  fontSize: "1.1rem",
                  fontWeight: 900,
                  cursor: "pointer",
                  boxShadow: "0 10px 25px -5px rgba(249,115,22,0.5)",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                {t("continue")}
              </button>
            </motion.div>
          </motion.div>
        </div>
      )}

      {showRedeemModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(8px)",
            padding: "1rem",
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              background: "rgba(26, 26, 46, 0.6)",
              backdropFilter: "blur(16px)",
              padding: "2.5rem",
              borderRadius: "1.5rem",
              maxWidth: "400px",
              width: "100%",
              textAlign: "center",
              border: "1px solid rgba(249, 115, 22, 0.3)",
            }}
          >
            <h2
              style={{
                color: "#f97316",
                marginTop: 0,
                marginBottom: "1rem",
                textTransform: "uppercase",
              }}
            >
              {t("redeem_code_title")}
            </h2>
            <p
              style={{
                color: "#fff",
                fontSize: "0.95rem",
                marginBottom: "1.5rem",
                lineHeight: 1.5,
              }}
            >
              <span>{t("redeem_code_desc_1")}</span>{" "}
              <a
                href="/prode"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "#00f2ff",
                  fontWeight: 900,
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.2rem",
                  verticalAlign: "middle",
                }}
              >
                <ExternalLink size={14} />
                {t("prode")}
              </a>
              <span
                dangerouslySetInnerHTML={{ __html: t("redeem_code_desc_2") }}
              />
            </p>
            <input
              type="text"
              maxLength={4}
              value={redeemCode}
              onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
              placeholder="ABCD"
              style={{
                width: "100%",
                padding: "1rem",
                background: "rgba(255,255,255,0.1)",
                border: "2px solid rgba(249, 115, 22, 0.5)",
                borderRadius: "1rem",
                color: "#fff",
                fontSize: "2rem",
                textAlign: "center",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                marginBottom: "1rem",
                outline: "none",
                fontWeight: 900,
                boxSizing: "border-box",
              }}
            />
            {redeemError && (
              <p
                style={{
                  color: "#ef4444",
                  fontSize: "0.85rem",
                  margin: "0 0 1rem 0",
                  fontWeight: 700,
                }}
              >
                {redeemError}
              </p>
            )}
            <div style={{ display: "flex", gap: "1rem" }}>
              <button
                onClick={() => {
                  setShowRedeemModal(false);
                  setRedeemError("");
                  setRedeemCode("");
                }}
                style={{
                  flex: 1,
                  padding: "1rem",
                  background: "rgba(255,255,255,0.1)",
                  border: "none",
                  color: "#fff",
                  borderRadius: "1rem",
                  cursor: "pointer",
                  fontWeight: 800,
                }}
              >
                {t("cancel")}
              </button>
              <button
                onClick={handleRedeemCode}
                disabled={redeeming || redeemCode.length !== 4}
                style={{
                  flex: 1,
                  padding: "1rem",
                  background: "#f97316",
                  border: "none",
                  color: "#fff",
                  borderRadius: "1rem",
                  cursor:
                    redeeming || redeemCode.length !== 4
                      ? "not-allowed"
                      : "pointer",
                  fontWeight: 800,
                  opacity: redeeming || redeemCode.length !== 4 ? 0.5 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                }}
              >
                <Unlock size={18} />
                {redeeming ? t("redeeming") : t("redeem_btn")}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
