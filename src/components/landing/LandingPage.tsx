import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Home, User, ArrowLeft, Trophy, ShieldAlert, BookOpen, Layers } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { audioManager } from "../../lib/audio";
import { UtilityButtons } from "../shared/UtilityButtons";
import { LandingHeader } from "./LandingHeader";
import { GameModeSelector } from "./GameModeSelector";
import { PointSelector } from "./PointSelector";
import { MatchmakingOverlay } from "./MatchmakingOverlay";
import { RankingScreen } from "./RankingScreen";
import { TournamentScreen } from "./TournamentScreen";
import { DeckScreen } from "./DeckScreen";
import TournamentEventPage from "./tournaments/TournamentEventPage";
import { RoadmapScreen } from "./RoadmapScreen";
import { FixtureScreen } from "./FixtureScreen";
import { ProdeScreen } from "./ProdeScreen";
import { NationalityModal } from "./NationalityModal";
import { ProfileScreen } from "./ProfileScreen";
import { AdminScreen } from "../admin/AdminScreen";
import { CreatorScreen } from "../admin/CreatorScreen";
import { CreatorsApplicationScreen } from "./CreatorsApplicationScreen";
import { RulesModal } from "../shared/RulesModal";
import { TwitchButton } from '../shared/TwitchButton';
import { setTournamentVotesSnapshot } from "../../lib/votesStore";


interface LandingPageProps {
  onStart: (
    mode: "1v1" | "2v2" | "multiplayer",
    points: 15 | 30,
    rivalName?: string,
    rivalId?: string,
    isCreator?: boolean,
    roomCode?: string,
    isReconnecting?: boolean,
    selectedTeams?: string[],
  ) => void;
  sessionId: string;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStart,
  sessionId,
}) => {
  const { t } = useTranslation();
  const [isWaiting, setIsWaiting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);
  const [user, setUser] = useState<any>(null);
  const [rivalData, setRivalData] = useState<{
    name: string;
    id: string;
  } | null>(null);
  const [showVersus, setShowVersus] = useState(false);
  const [selectedMode, setSelectedMode] = useState<
    "1v1" | "2v2" | "multiplayer" | null
  >(null);
  const [isSelectingPoints, setIsSelectingPoints] = useState(false);
  const [isSelectingTeams, setIsSelectingTeams] = useState(false);
  const [selectedPoints, setSelectedPoints] = useState<15 | 30>(15);
  const [selectedTeams, setSelectedTeams] = useState<string[]>(() => {
    const saved = localStorage.getItem('truco_selected_teams');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) { }
    }
    return [];
  });
  const [showRules, setShowRules] = useState(false);

  useEffect(() => {
    localStorage.setItem('truco_selected_teams', JSON.stringify(selectedTeams));
  }, [selectedTeams]);

  const [roomCode, setRoomCode] = useState<string>("");
  const [isJoining, setIsJoining] = useState(false);
  const [inputCode, setInputCode] = useState("");
  const [joinError, setJoinError] = useState("");
  const [isCreator, setIsCreator] = useState(false);
  const [isApprovedCreator, setIsApprovedCreator] = useState(false);
  const isSuperAdmin = user?.email && ["gonzagramaglia@gmail.com", "ciberportero@gmail.com"].includes(user.email);
  const [showRanking, setShowRanking] = useState(
    () =>
      typeof window !== "undefined" &&
      (window.location.pathname === "/votar" ||
        window.location.pathname === "/en/votar"),
  );
  const [showTournament, setShowTournament] = useState(
    () =>
      typeof window !== "undefined" &&
      (window.location.pathname === "/torneos" ||
        window.location.pathname === "/en/torneos"),
  );
  const [showRoadmap, setShowRoadmap] = useState(
    () =>
      typeof window !== "undefined" &&
      (window.location.pathname === "/ruta" ||
        window.location.pathname === "/en/ruta"),
  );
  const [showFixture, setShowFixture] = useState(
    () =>
      typeof window !== "undefined" &&
      (window.location.pathname === "/fixture" ||
        window.location.pathname === "/en/fixture"),
  );
  const [showProde, setShowProde] = useState(
    () =>
      typeof window !== "undefined" &&
      (window.location.pathname === "/prode" ||
        window.location.pathname === "/en/prode"),
  );
  const [showDeck, setShowDeck] = useState(
    () =>
      typeof window !== "undefined" &&
      (window.location.pathname === "/mazo" ||
        window.location.pathname === "/en/mazo"),
  );

  useEffect(() => {
    // Only play theme if not in voting or fixture, which handle it themselves,
    // actually LandingPage mounts first, so it can just play it. 
    // audioManager will not restart if already playing.
    audioManager.playTheme();
  }, []);

  const [showProfile, setShowProfile] = useState(
    () =>
      typeof window !== "undefined" &&
      (window.location.pathname === "/perfil" ||
        window.location.pathname === "/en/perfil"),
  );
  const [showAdmin, setShowAdmin] = useState(
    () =>
      typeof window !== "undefined" &&
      (window.location.pathname === "/admin" ||
        window.location.pathname === "/en/admin"),
  );
  const [showCreator, setShowCreator] = useState(
    () =>
      typeof window !== "undefined" &&
      (window.location.pathname === "/creador" ||
        window.location.pathname === "/en/creador"),
  );
  const [showCreatorsApp, setShowCreatorsApp] = useState(
    () =>
      typeof window !== "undefined" &&
      (window.location.pathname === "/creadores" ||
        window.location.pathname === "/en/creadores"),
  );
  const [showTournamentEvent, setShowTournamentEvent] = useState(
    () =>
      typeof window !== "undefined" &&
      (window.location.pathname.startsWith("/torneos/") ||
        window.location.pathname.startsWith("/en/torneos/")),
  );

  const [hasUnlockedDeck, setHasUnlockedDeck] = useState<boolean>(true); // start true to prevent flash
  const [showDeckLockModal, setShowDeckLockModal] = useState<boolean>(false);

  useEffect(() => {
    const checkDeckUnlocked = async () => {
      try {
        if (user) {
          const { data } = await supabase
            .from('user_decks')
            .select('unlocked_cards')
            .eq('id', user.id)
            .single();
          if (data && data.unlocked_cards && data.unlocked_cards.length >= 22) {
            setHasUnlockedDeck(true);
            return;
          }
        } else {
          const local = localStorage.getItem(`trucomundial-deck-anonymous`);
          if (local) {
            const parsed = JSON.parse(local);
            if (parsed.unlockedCards && parsed.unlockedCards.length >= 22) {
              setHasUnlockedDeck(true);
              return;
            }
          }
        }
        setHasUnlockedDeck(false);
      } catch (e) {
        console.error("Error checking deck", e);
        setHasUnlockedDeck(false);
      }
    };
    // give a slight delay to allow DeckScreen saves if returning from it
    const timer = setTimeout(checkDeckUnlocked, 100);
    return () => clearTimeout(timer);
  }, [user, showDeck]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      const activeUser = session?.user ?? null;
      setUser(activeUser);
      // Redirect to home if unauthenticated and path is /perfil
      if (
        !activeUser &&
        (window.location.pathname === "/perfil" ||
          window.location.pathname === "/en/perfil")
      ) {
        setShowProfile(false);
        const isEn = window.location.pathname.startsWith("/en");
        window.history.pushState({}, "", isEn ? "/en" : "/");
      }
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      const activeUser = session?.user ?? null;
      setUser(activeUser);
      if (
        !activeUser &&
        (window.location.pathname === "/perfil" ||
          window.location.pathname === "/en/perfil" ||
          window.location.pathname === "/admin" ||
          window.location.pathname === "/en/admin" ||
          window.location.pathname === "/creador" ||
          window.location.pathname === "/en/creador" ||
          window.location.pathname === "/creadores" ||
          window.location.pathname === "/en/creadores")
      ) {
        setShowProfile(false);
        // Do not redirect /admin, /creador, or /creadores here because they have their own "Restricted Access" prompt.
        if (window.location.pathname.includes("/perfil")) {
          const isEn = window.location.pathname.startsWith("/en");
          window.history.pushState({}, "", isEn ? "/en" : "/");
        }
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const checkCreatorStatus = async () => {
      if (!user) {
        setIsApprovedCreator(false);
        return;
      }
      if (isSuperAdmin) {
        setIsApprovedCreator(true);
        return;
      }
      try {
        const { data } = await supabase
          .from("creator_applications")
          .select("status")
          .eq("user_id", user.id)
          .eq("status", "approved")
          .single();
        if (data) setIsApprovedCreator(true);
      } catch (err) {
        setIsApprovedCreator(false);
      }
    };
    checkCreatorStatus();
  }, [user, isSuperAdmin]);

  const [showNationalityModal, setShowNationalityModal] = useState(false);
  useEffect(() => {
    if (user && !user.user_metadata?.nationality) {
      setShowNationalityModal(true);
    }
  }, [user, isSuperAdmin]);

  // Dynamic SEO, Open Graph & Twitter metadata updates
  useEffect(() => {
    if (typeof document === "undefined") return;

    const updateMetaTag = (nameOrProperty: string, content: string) => {
      // Try finding by name attribute
      let tag = document.querySelector(`meta[name="${nameOrProperty}"]`);
      if (tag) {
        tag.setAttribute("content", content);
        return;
      }
      // Try finding by property attribute (Open Graph style)
      tag = document.querySelector(`meta[property="${nameOrProperty}"]`);
      if (tag) {
        tag.setAttribute("content", content);
      }
    };

    if (showRanking) {
      document.title = "Ranking de Cartas de Truco Mundial";
      updateMetaTag(
        "description",
        "Votá en el ranking oficial de cartas de Truco Mundial y decidí cuáles son las mejores y peores figuras del mundial.",
      );
      updateMetaTag("og:title", "Ranking de Cartas de Truco Mundial");
      updateMetaTag(
        "og:description",
        "Votá en el ranking oficial de cartas de Truco Mundial y decidí cuáles son las mejores y peores figuras del mundial.",
      );
      updateMetaTag("twitter:title", "Ranking de Cartas de Truco Mundial");
      updateMetaTag(
        "twitter:description",
        "Votá en el ranking oficial de cartas de Truco Mundial y decidí cuáles son las mejores y peores figuras del mundial.",
      );
    } else if (showRoadmap) {
      document.title = "Hoja de Ruta de Truco Mundial";
      updateMetaTag(
        "description",
        "Conocé la hoja de ruta de Truco Mundial. Descubrí el futuro competitivo, torneos con sponsors, personalizaciones y el juego cooperativo 2v2.",
      );
      updateMetaTag("og:title", "Hoja de Ruta de Truco Mundial");
      updateMetaTag(
        "og:description",
        "Conocé la hoja de ruta de Truco Mundial. Descubrí el futuro competitivo, torneos con sponsors, personalizaciones y el juego cooperativo 2v2.",
      );
      updateMetaTag("twitter:title", "Hoja de Ruta de Truco Mundial");
      updateMetaTag(
        "twitter:description",
        "Conocé la hoja de ruta de Truco Mundial. Descubrí el futuro competitivo, torneos con sponsors, personalizaciones y el juego cooperativo 2v2.",
      );
    } else if (showFixture) {
      document.title = "Fixture del Mundial 2026";
      updateMetaTag("description", "Fixture del Mundial 2026 de Truco Mundial.");
      updateMetaTag("og:title", "Fixture del Mundial 2026");
      updateMetaTag("og:description", "Fixture del Mundial 2026 de Truco Mundial.");
      updateMetaTag("twitter:title", "Fixture del Mundial 2026");
      updateMetaTag("twitter:description", "Fixture del Mundial 2026 de Truco Mundial.");
    } else if (showTournament) {
      document.title = "Torneos de Truco Mundial";
      updateMetaTag(
        "description",
        "Competí en los torneos y clasificatorios de streamers de Truco Mundial. Copa Mucho Movimiento, Dybbuk y Barbaroja 1vs1.",
      );
      updateMetaTag("og:title", "Torneos de Truco Mundial");
      updateMetaTag(
        "og:description",
        "Competí en los torneos y clasificatorios de streamers de Truco Mundial. Copa Mucho Movimiento, Dybbuk y Barbaroja 1vs1.",
      );
      updateMetaTag("twitter:title", "Torneos de Truco Mundial");
      updateMetaTag(
        "twitter:description",
        "Competí en los torneos y clasificatorios de streamers de Truco Mundial. Copa Mucho Movimiento, Dybbuk y Barbaroja 1vs1.",
      );
    } else if (showProfile) {
      document.title = "Mi Perfil de Truco Mundial";
      updateMetaTag(
        "description",
        "Accedé a tu perfil de Truco Mundial. Revisá tu historial de partidas online y estadísticas de rendimiento.",
      );
      updateMetaTag("og:title", "Mi Perfil de Truco Mundial");
      updateMetaTag(
        "og:description",
        "Accedé a tu perfil de Truco Mundial. Revisá tu historial de partidas online y estadísticas de rendimiento.",
      );
      updateMetaTag("twitter:title", "Mi Perfil de Truco Mundial");
      updateMetaTag(
        "twitter:description",
        "Accedé a tu perfil de Truco Mundial. Revisá tu historial de partidas online y estadísticas de rendimiento.",
      );
    } else if (showAdmin) {
      document.title = "Admin de Truco Mundial";
    } else if (showCreator) {
      document.title = "Creador de Truco Mundial";
    } else if (showCreatorsApp) {
      document.title = "Programa de Creadores - Truco Mundial";
    } else {
      document.title = "Truco Mundial";
      updateMetaTag(
        "description",
        "Truco Mundial: La evolución del Truco argentino. Un juego de cartas tácticas donde el ingenio del truco se fusiona con la pasión de las figuritas mundialistas. ¡Jugá online con amigos o local contra la CPU!",
      );
      updateMetaTag("og:title", "Truco Mundial");
      updateMetaTag(
        "og:description",
        "Viví la evolución del Truco argentino con figuritas coleccionables de tus jugadores de fútbol favoritos. ¡Jugá partidas online en tiempo real de 15 o 30 puntos gratis contra amigos o local contra la CPU!",
      );
      updateMetaTag("twitter:title", "Truco Mundial");
      updateMetaTag(
        "twitter:description",
        "Viví la evolución del Truco argentino con figuritas coleccionables de tus jugadores de fútbol favoritos. ¡Jugá partidas online en tiempo real gratis contra amigos o local contra la CPU!",
      );
    }
  }, [showRanking, showRoadmap, showFixture, showProde, showTournament, showProfile]);

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

  // Listen to history navigation so SPA route-like changes update the UI
  useEffect(() => {
    const onPop = () => {
      const p = window.location.pathname;
      setShowRanking(p === "/votar" || p === "/en/votar");
      setShowTournament(p === "/torneos" || p === "/en/torneos");
      setShowTournamentEvent(
        p.startsWith("/torneos/") || p.startsWith("/en/torneos/"),
      );
      setShowRoadmap(p === "/ruta" || p === "/en/ruta");
      setShowFixture(p === "/fixture" || p === "/en/fixture");
      setShowProde(p === "/prode" || p === "/en/prode");
      setShowDeck(p === "/mazo" || p === "/en/mazo");
      setShowProfile(p === "/perfil" || p === "/en/perfil");
      setShowAdmin(p === "/admin" || p === "/en/admin");
      setShowCreator(p === "/creador" || p === "/en/creador");
      setShowCreatorsApp(p === "/creadores" || p === "/en/creadores");
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const handleAuth = async () => {
    if (user) {
      // Navigate to profile when already logged in
      setShowProfile(true);
      if (typeof window !== "undefined") {
        const isEn = window.location.pathname.startsWith("/en");
        window.history.pushState({}, "", isEn ? "/en/perfil" : "/perfil");
      }
    } else {
      const origin = window.location.origin;
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: origin,
          queryParams: {
            prompt: "select_account",
          },
        },
      });
    }
  };

  const generateRoomCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const fetchUserDeck = async (userId?: string): Promise<string[]> => {
    let deck: string[] = [];
    if (userId) {
      const { data } = await supabase.from('user_decks').select('selected_deck').eq('id', userId).single();
      if (data && data.selected_deck) deck = data.selected_deck;
    }
    if (!deck.length) {
      const cached = localStorage.getItem(`trucomundial-deck-${userId || 'anonymous'}`);
      if (cached) {
        try { deck = JSON.parse(cached).selectedDeck || []; } catch (e) { }
      }
    }
    return deck;
  };

  const initiateGame = (
    mode: "1v1" | "2v2" | "multiplayer",
    points: 15 | 30,
  ) => {
    setIsSelectingPoints(false);

    if (mode === "multiplayer") {
      if (!user) {
        handleAuth();
      } else {
        handleCreateRoom(points); // Pass points directly to avoid state race
      }
    } else {
      onStart(mode, points, undefined, undefined, undefined, undefined, false, selectedTeams);
    }
  };

  const handleCreateRoom = async (pointsToUse: number, customCode?: string) => {
    const code = customCode || generateRoomCode();
    setRoomCode(code);
    setIsCreator(true);
    setIsWaiting(true);
    setTimeLeft(300);

    const hostDeck = await fetchUserDeck(user?.id);

    const newRoomInfo = {
      creatorId: user?.id || sessionId,
      creatorName: user?.user_metadata?.full_name?.split(" ")[0] || "HOST",
      points: pointsToUse,
      hostDeck,
    };

    // Register room in table
    const { error } = await supabase.from("game_sync").upsert(
      {
        match_id: code,
        last_move: {
          type: "room_state",
          status: "waiting",
          roomInfo: newRoomInfo,
          ...newRoomInfo,
        },
        updated_at: new Date().toISOString(),
      },
      { onConflict: "match_id" },
    );

    if (error) console.error("Error creating room:", error);
  };

  const handleJoinRoom = async (customCode?: string) => {
    const code = customCode ? customCode.toUpperCase() : inputCode.toUpperCase();
    if (!customCode && code.length !== 4) return;
    setIsCreator(false);

    console.log("Buscando sala en la tabla:", code);

    // If it's a tournament match code (8 characters), fetch the allowed teams and snapshot ratings first!
    if (code.length === 8) {
      try {
        const { data: mData } = await supabase
          .from("tournament_matches")
          .select("tournament_id")
          .eq("match_code", code)
          .maybeSingle();

        if (mData && mData.tournament_id) {
          const { data: tData } = await supabase
            .from("tournaments")
            .select("allowed_teams, ranking_snapshot")
            .eq("id", mData.tournament_id)
            .maybeSingle();

          if (tData) {
            if (tData.allowed_teams && tData.allowed_teams.length === 4) {
              setSelectedTeams(tData.allowed_teams);
            }
            if (tData.ranking_snapshot) {
              setTournamentVotesSnapshot(tData.ranking_snapshot);
            }
          }
        }
      } catch (err) {
        console.error("Error loading tournament details on join:", err);
      }
    }

    // 1. Check if room exists
    const { data, error } = await supabase
      .from("game_sync")
      .select("last_move")
      .eq("match_id", code)
      .maybeSingle();

    if (error || !data || !data.last_move) {
      console.log("Sala no encontrada:", error || data);
      setJoinError("Código incorrecto o la sala ya no existe.");
      setInputCode("");
      return;
    }

    const state = data.last_move;

    if (state.status === "waiting") {
      console.log("¡Sala encontrada en espera! Intentando unirnos...", state);

      const rivalName = state.creatorName;
      const rivalId = state.creatorId;
      const matchPoints = state.points || 30;
      const guestName =
        user?.user_metadata?.full_name?.split(" ")[0] || "GUEST";
      const guestId = user?.id || sessionId;

      const guestDeck = await fetchUserDeck(user?.id);

      const newRoomInfo = {
        creatorId: rivalId,
        creatorName: rivalName,
        guestId: guestId,
        guestName: guestName,
        points: matchPoints,
        hostDeck: state.roomInfo?.hostDeck || [],
        guestDeck: guestDeck,
      };

      const { error: updateError } = await supabase
        .from("game_sync")
        .update({
          last_move: {
            type: "room_state",
            status: "matched",
            roomInfo: newRoomInfo,
            ...newRoomInfo,
          },
          updated_at: new Date().toISOString(),
        })
        .eq("match_id", code);

      if (updateError) {
        setJoinError("No se pudo unir a la sala. Intenta de nuevo.");
        return;
      }

      setRoomCode(code);
      setRivalData({ name: rivalName, id: rivalId });
      setIsWaiting(true);
      setShowVersus(true);

      setTimeout(() => {
        setIsWaiting(false);
        setShowVersus(false);
        onStart(
          "multiplayer",
          matchPoints as 15 | 30,
          rivalName,
          rivalId,
          false,
          code,
          false,
          [...(state.roomInfo?.hostDeck || []), ...guestDeck],
        );
      }, 3500);
    } else {
      const roomInfo =
        state.roomInfo || (state.status === "matched" ? state : null);
      if (!roomInfo || (!roomInfo.creatorId && !roomInfo.guestId)) {
        setJoinError("Código incorrecto o la sala ya no existe.");
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
          onStart(
            "multiplayer",
            roomInfo.points as 15 | 30,
            roomInfo.guestName,
            roomInfo.guestId,
            true,
            code,
            true,
            [...(roomInfo.hostDeck || []), ...(roomInfo.guestDeck || [])],
          );
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
          onStart(
            "multiplayer",
            roomInfo.points as 15 | 30,
            roomInfo.creatorName,
            roomInfo.creatorId,
            false,
            code,
            true,
            [...(roomInfo.hostDeck || []), ...(roomInfo.guestDeck || [])],
          );
        }, 2000);
      } else {
        setJoinError("La sala ya está en juego con otros jugadores.");
        setInputCode("");
      }
    }
  };

  const startTournamentMatch = async (matchCode: string, isHost: boolean) => {
    setShowTournament(false);
    setShowTournamentEvent(false);
    setSelectedMode("multiplayer");
    setSelectedPoints(30);

    // 1. Fetch allowed_teams & ranking_snapshot
    try {
      const { data: mData } = await supabase
        .from("tournament_matches")
        .select("tournament_id")
        .eq("match_code", matchCode)
        .maybeSingle();

      let allowed = ["Argelia","Argentina","Austria","Bosnia y Herz","Brasil","Canadá","Colombia","Croacia","República Checa","Ecuador","Inglaterra","España","Francia","Japón","Corea del Sur","Marruecos","México","Países Bajos","Noruega","Nueva Zelanda","Panamá","Paraguay","Portugal","Qatar","Sudáfrica","Suiza","Uruguay","USA"];
      if (mData && mData.tournament_id) {
        const { data: tData } = await supabase
          .from("tournaments")
          .select("allowed_teams, ranking_snapshot")
          .eq("id", mData.tournament_id)
          .maybeSingle();

        if (tData) {
          if (tData.allowed_teams && tData.allowed_teams.length === 4) {
            allowed = tData.allowed_teams;
          }
          if (tData.ranking_snapshot) {
            setTournamentVotesSnapshot(tData.ranking_snapshot);
          }
        }
      }

      setSelectedTeams(allowed);

      if (isHost) {
        await handleCreateRoom(30, matchCode);
      } else {
        await handleJoinRoom(matchCode);
      }
    } catch (err) {
      console.error(err);
      alert("Error al iniciar la partida del torneo.");
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
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "game_sync",
          filter: `match_id=eq.${roomCode}`,
        },
        (payload) => {
          const state = payload.new.last_move;
          if (isCreator && state?.status === "matched" && !rivalData) {
            console.log("¡Rival encontrado vía Tabla!", state.guestName);
            setRivalData({ name: state.guestName, id: state.guestId });
            setShowVersus(true);

            setTimeout(() => {
              setIsWaiting(false);
              setShowVersus(false);
              onStart(
                "multiplayer",
                state.points as 15 | 30,
                state.guestName,
                state.guestId,
                true,
                roomCode,
                false,
                [...(state.roomInfo?.hostDeck || []), ...(state.roomInfo?.guestDeck || [])],
              );
            }, 3500);
          }
        },
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [isWaiting, user, roomCode, isCreator, rivalData, onStart, selectedTeams]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const renderLeftNav = (offset = false) => {
    const hideRulesBtn = showRanking || showFixture || showDeck || showProde;
    return (
    <div style={{ position: "fixed", top: offset ? "4.5rem" : "1.5rem", left: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem", zIndex: 6000 }}>
      {!hideRulesBtn && (
      <button
        onClick={() => setShowRules(true)}
        className="btn-hover-dark"
        style={{
          background: "rgba(255, 255, 255, 0.1)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          color: "white",
          height: "40px",
          width: "40px",
          borderRadius: "50%",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backdropFilter: "blur(12px)",
          transition: "none",
        }}
        title={t("rules")}
      >
        <BookOpen size={20} />
      </button>
      )}

      {user && !showProfile && !showAdmin && (
        <button
          onClick={() => {
            const isEn = window.location.pathname.startsWith("/en");
            const target = isEn ? "/en/perfil" : "/perfil";
            if (window.location.pathname !== target) {
              window.history.pushState({}, "", target);
              window.dispatchEvent(new PopStateEvent("popstate"));
            }
          }}
          className="btn-hover-dark"
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            color: "white",
            height: "40px",
            width: "40px",
            borderRadius: "50%",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(12px)",
            transition: "none",
          }}
          title={t("profile")}
        >
          <User size={20} style={{ color: "#ffffff" }} />
        </button>
      )}

      {isApprovedCreator && !showCreator && !showAdmin && (
        <button
          onClick={() => {
            const isEn = window.location.pathname.startsWith("/en");
            const path = isEn ? "/en/creador" : "/creador";
            window.history.pushState({}, "", path);
            window.dispatchEvent(new PopStateEvent("popstate"));
          }}
          className="btn-hover-dark"
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            color: "white",
            height: "40px",
            width: "40px",
            borderRadius: "50%",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(12px)",
            transition: "none",
          }}
          title="Panel de Creador"
        >
          <Trophy size={18} style={{ color: "#ffffff" }} />
        </button>
      )}

      {isSuperAdmin && !showAdmin && (
        <button
          onClick={() => {
            const isEn = window.location.pathname.startsWith("/en");
            const path = isEn ? "/en/admin" : "/admin";
            window.history.pushState({}, "", path);
            window.dispatchEvent(new PopStateEvent("popstate"));
          }}
          className="btn-hover-dark"
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            color: "white",
            height: "40px",
            width: "40px",
            borderRadius: "50%",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(12px)",
            transition: "none",
          }}
          title="Panel de Admin"
        >
          <ShieldAlert size={18} style={{ color: "#ffffff" }} />
        </button>
      )}
    </div>
  );
  };

  if (showProfile) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "transparent",
          width: "100%",
          height: "100vh",
          overflowY: "auto",
          zIndex: 1500,
        }}
      >
        {renderLeftNav(true)}
        <ProfileScreen
          user={user}
          handleAuth={handleAuth}
          onBack={() => {
            setShowProfile(false);
            if (typeof window !== "undefined") {
              const isEn = window.location.pathname.startsWith("/en");
              window.history.pushState({}, "", isEn ? "/en" : "/");
            }
          }}
        />
      </div>
    );
  }

  if (showRanking) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "transparent",
          width: "100%",
          height: "100vh",
          overflowY: "auto",
          zIndex: 1500,
        }}
      >
        {renderLeftNav(true)}
        <RankingScreen
          user={user}
          handleAuth={handleAuth}
          onBack={() => {
            setShowRanking(false);
            if (typeof window !== "undefined") {
              const isEn = window.location.pathname.startsWith("/en");
              window.history.pushState({}, "", isEn ? "/en" : "/");
            }
          }}
        />
      </div>
    );
  }

  if (showTournamentEvent) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "transparent",
          width: "100%",
          height: "100vh",
          overflowY: "auto",
          zIndex: 1500,
        }}
      >
        {renderLeftNav(true)}
        <TournamentEventPage
          user={user}
          handleAuth={handleAuth}
          onPlayMatch={startTournamentMatch}
          onBack={() => {
            setShowTournamentEvent(false);
            if (typeof window !== "undefined") {
              const isEn = window.location.pathname.startsWith("/en");
              window.history.pushState(
                {},
                "",
                isEn ? "/en/torneos" : "/torneos",
              );
              window.dispatchEvent(new PopStateEvent("popstate"));
            }
          }}
        />
      </div>
    );
  }

  if (showTournament) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "transparent",
          width: "100%",
          height: "100vh",
          overflowY: "auto",
          zIndex: 1500,
        }}
      >
        {renderLeftNav(true)}
        <TournamentScreen
          user={user}
          handleAuth={handleAuth}
          onBack={() => {
            setShowTournament(false);
            if (typeof window !== "undefined") {
              const isEn = window.location.pathname.startsWith("/en");
              window.history.pushState({}, "", isEn ? "/en" : "/");
            }
          }}
        />
      </div>
    );
  }

  if (showDeck) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "transparent",
          width: "100%",
          height: "100vh",
          overflowY: "auto",
          zIndex: 1500,
        }}
      >
        {renderLeftNav(true)}
        <DeckScreen
          user={user}
          handleAuth={handleAuth}
          onBack={() => {
            setShowDeck(false);
            if (typeof window !== "undefined") {
              const isEn = window.location.pathname.startsWith("/en");
              window.history.pushState({}, "", isEn ? "/en" : "/");
            }
          }}
        />
      </div>
    );
  }

  if (showRoadmap) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "transparent",
          width: "100%",
          height: "100vh",
          overflowY: "auto",
          zIndex: 1500,
        }}
      >
        {renderLeftNav(true)}
        <RoadmapScreen
          onBack={() => {
            setShowRoadmap(false);
            if (typeof window !== "undefined") {
              const isEn = window.location.pathname.startsWith("/en");
              window.history.pushState({}, "", isEn ? "/en" : "/");
            }
          }}
        />
      </div>
    );
  }

  if (showProde) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "transparent",
          width: "100%",
          height: "100vh",
          overflowY: "auto",
          zIndex: 1500,
        }}
      >
        {renderLeftNav(true)}
        <ProdeScreen
          user={user}
          handleAuth={handleAuth}
          onBack={() => {
            setShowProde(false);
            if (typeof window !== "undefined") {
              const isEn = window.location.pathname.startsWith("/en");
              window.history.pushState({}, "", isEn ? "/en" : "/");
            }
          }}
        />
      </div>
    );
  }

  if (showFixture) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "transparent",
          width: "100%",
          height: "100vh",
          overflowY: "auto",
          zIndex: 1500,
        }}
      >
        {renderLeftNav(true)}
        <FixtureScreen
          user={user}
          onBack={() => {
            setShowFixture(false);
            if (typeof window !== "undefined") {
              const isEn = window.location.pathname.startsWith("/en");
              window.history.pushState({}, "", isEn ? "/en" : "/");
            }
          }}
        />
      </div>
    );
  }

  if (showAdmin) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "transparent",
          width: "100%",
          height: "100vh",
          overflowY: "auto",
          zIndex: 1500,
        }}
      >
        {renderLeftNav(true)}
        <AdminScreen
          user={user}
          handleAuth={handleAuth}
          onBack={() => {
            setShowAdmin(false);
            if (typeof window !== "undefined") {
              const isEn = window.location.pathname.startsWith("/en");
              window.history.pushState({}, "", isEn ? "/en" : "/");
            }
          }}
        />
      </div>
    );
  }

  if (showCreator) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "transparent",
          width: "100%",
          height: "100vh",
          overflowY: "auto",
          zIndex: 1500,
        }}
      >
        {renderLeftNav(true)}
        <CreatorScreen
          user={user}
          handleAuth={handleAuth}
          onBack={() => {
            setShowCreator(false);
            if (typeof window !== "undefined") {
              const isEn = window.location.pathname.startsWith("/en");
              window.history.pushState({}, "", isEn ? "/en" : "/");
            }
          }}
        />
      </div>
    );
  }

  if (showCreatorsApp) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "transparent",
          width: "100%",
          height: "100vh",
          overflowY: "auto",
          zIndex: 1500,
        }}
      >
        {renderLeftNav(true)}
        <CreatorsApplicationScreen
          user={user}
          handleAuth={handleAuth}
          onBack={() => {
            setShowCreatorsApp(false);
            if (typeof window !== "undefined") {
              const isEn = window.location.pathname.startsWith("/en");
              window.history.pushState({}, "", isEn ? "/en" : "/");
            }
          }}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      {/* Profile / Music - Top Left */}
      {renderLeftNav(false)}

      {/* Utility buttons column (Top Right) */}
      <div
        style={{
          position: "fixed",
          top: "1.5rem",
          right: "1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
          zIndex: 4000,
        }}
      >
        <UtilityButtons />

        {/* Instagram Button (Hidden for now) */}
        {/*
        <a
          href="https://instagram.com/trucomundial"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-hover-dark"
          style={{
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
            backdropFilter: 'blur(12px)'
          }}
          title="Instagram"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
          </svg>
        </a>
        */}
      </div>


      <MatchmakingOverlay
        isWaiting={isWaiting}
        timeLeft={timeLeft}
        showVersus={showVersus}
        rivalData={rivalData}
        userName={user?.user_metadata.full_name?.split(" ")[0] || "VOS"}
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
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          maxWidth: "600px",
        }}
      >
        <LandingHeader user={user} />

        <p
          style={{
            fontFamily: "var(--font-main)",
            color: "#00f2ff",
            fontSize: "0.95rem",
            textTransform: "uppercase",
            maxWidth: "600px",
            margin: "0 0 1.5rem 0",
            fontWeight: 700,
            opacity: 1,
            textAlign: "center",
            letterSpacing: "0.05em",
            whiteSpace: "pre-line"
          }}
        >
          <span className="desktop-only">{t("subtitle")}</span>
          <span className="mobile-only">{t("subtitle").replace(" con ", "\ncon ")}</span>
        </p>

        <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
          <GameModeSelector
            selectedMode={selectedMode || "multiplayer"}
            user={user}
            hasUnlockedDeck={hasUnlockedDeck}
            onSelect={(mode) => {
              if ((mode as string) === "login") {
                handleAuth();
                return;
              }
              if ((mode as string) === "ranking") {
                setShowRanking(true);
                if (typeof window !== "undefined") {
                  const isEn = window.location.pathname.startsWith("/en");
                  window.history.pushState(
                    {},
                    "",
                    isEn ? "/en/votar" : "/votar",
                  );
                }
                return;
              }
              if ((mode as string) === "tournament") {
                setShowTournament(true);
                if (typeof window !== "undefined") {
                  const isEn = window.location.pathname.startsWith("/en");
                  window.history.pushState(
                    {},
                    "",
                    isEn ? "/en/torneos" : "/torneos",
                  );
                }
                return;
              }
              if ((mode as string) === "deck") {
                setShowDeck(true);
                if (typeof window !== "undefined") {
                  const isEn = window.location.pathname.startsWith("/en");
                  window.history.pushState(
                    {},
                    "",
                    isEn ? "/en/mazo" : "/mazo",
                  );
                }
                return;
              }
              if ((mode as string) === "roadmap") {
                setShowRoadmap(true);
                if (typeof window !== "undefined") {
                  const isEn = window.location.pathname.startsWith("/en");
                  window.history.pushState({}, "", isEn ? "/en/ruta" : "/ruta");
                }
                return;
              }
              if ((mode as string) === "fixture") {
                setShowFixture(true);
                if (typeof window !== "undefined") {
                  const isEn = window.location.pathname.startsWith("/en");
                  window.history.pushState({}, "", isEn ? "/en/fixture" : "/fixture");
                }
                return;
              }
              if ((mode as string) === "prode") {
                setShowProde(true);
                if (typeof window !== "undefined") {
                  const isEn = window.location.pathname.startsWith("/en");
                  window.history.pushState({}, "", isEn ? "/en/prode" : "/prode");
                  window.dispatchEvent(new PopStateEvent("popstate"));
                }
                return;
              }

              if (mode === "multiplayer") {
                if (!hasUnlockedDeck) {
                  if (!user) {
                    handleAuth();
                    return;
                  }
                  setShowDeckLockModal(true);
                  return;
                }
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
      <TwitchButton />

      {/* Point Selection Modal */}
      <AnimatePresence>
        {isSelectingPoints && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0, 0, 0, 0.45)",
              backdropFilter: "blur(10px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 2000,
              padding: "2rem",
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                padding: "3rem",
                borderRadius: "2.5rem",
                width: "100%",
                maxWidth: "500px",
                textAlign: "center",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
              }}
            >
              <h2
                className="text-display"
                style={{
                  fontSize: "3rem",
                  color: "#fff",
                  marginBottom: "2.5rem",
                  lineHeight: 1,
                  whiteSpace: "pre-wrap",
                }}
              >
                {t("how_many_points").split("\n")[0]}
                <br />
                <span style={{ color: "#00f2ff" }}>
                  {t("how_many_points").split("\n")[1]}
                </span>
              </h2>

              <PointSelector
                onSelect={(points) => {
                  setSelectedPoints(points as 15 | 30);
                  setIsSelectingPoints(false);
                  if (selectedMode === "multiplayer") {
                    initiateGame("multiplayer", points as 15 | 30);
                  } else {
                    setIsSelectingTeams(true);
                  }
                }}
              />

              <motion.div
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <button
                  onClick={() => setIsSelectingPoints(false)}
                  className="btn-hover-dark"
                  style={{
                    background: "rgba(255, 255, 255, 0.1)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    color: "white",
                    marginTop: "0.25rem",
                    height: "40px",
                    borderRadius: "1rem",
                    padding: "0 1.5rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    fontSize: "0.8rem",
                    fontWeight: 900,
                    cursor: "pointer",
                    transition: "none",
                  }}
                >
                  {selectedMode === "multiplayer" ? <ArrowLeft size={18} /> : <Home size={18} />}
                  {t("back")}
                </button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Team Selection Modal */}
      <AnimatePresence>
        {isSelectingTeams && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0, 0, 0, 0.45)",
              backdropFilter: "blur(10px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 2000,
              padding: "2rem",
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="team-selection-card"
            >
              <h2 className="text-display team-selection-title" style={{ marginBottom: "0.5rem" }}>
                {t("deck_selection_title_line1")}
                <br />
                <span style={{ color: "#00f2ff" }}>{t("deck_selection_title_line2")}</span>
              </h2>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "1.05rem", marginBottom: "1rem", fontWeight: 500 }}>
                {t("deck_selection_subtitle")}
              </p>

              {(() => {
                const ALL_TEAMS_LIST = [
                  { id: 'Argelia', flag: '🇩🇿', code: 'ALG' },
                  { id: 'Argentina', flag: '🇦🇷', code: 'ARG' },
                  { id: 'Austria', flag: '🇦🇹', code: 'AUT' },
                  { id: 'Bosnia y Herz', flag: '🇧🇦', code: 'BIH' },
                  { id: 'Brasil', flag: '🇧🇷', code: 'BRA' },
                  { id: 'Canadá', flag: '🇨🇦', code: 'CAN' },
                  { id: 'Colombia', flag: '🇨🇴', code: 'COL' },
                  { id: 'Croacia', flag: '🇭🇷', code: 'CRO' },
                  { id: 'República Checa', flag: '🇨🇿', code: 'CZE' },
                  { id: 'Ecuador', flag: '🇪🇨', code: 'ECU' },
                  { id: 'Inglaterra', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', code: 'ENG' },
                  { id: 'España', flag: '🇪🇸', code: 'ESP' },
                  { id: 'Francia', flag: '🇫🇷', code: 'FRA' },
                  { id: 'Japón', flag: '🇯🇵', code: 'JPN' },
                  { id: 'Corea del Sur', flag: '🇰🇷', code: 'KOR' },
                  { id: 'Marruecos', flag: '🇲🇦', code: 'MAR' },
                  { id: 'México', flag: '🇲🇽', code: 'MEX' },
                  { id: 'Países Bajos', flag: '🇳🇱', code: 'NED' },
                  { id: 'Noruega', flag: '🇳🇴', code: 'NOR' },
                  { id: 'Nueva Zelanda', flag: '🇳🇿', code: 'NZL' },
                  { id: 'Panamá', flag: '🇵🇦', code: 'PAN' },
                  { id: 'Paraguay', flag: '🇵🇾', code: 'PAR' },
                  { id: 'Portugal', flag: '🇵🇹', code: 'POR' },
                  { id: 'Qatar', flag: '🇶🇦', code: 'QAT' },
                  { id: 'Sudáfrica', flag: '🇿🇦', code: 'RSA' },
                  { id: 'Suiza', flag: '🇨🇭', code: 'SUI' },
                  { id: 'Uruguay', flag: '🇺🇾', code: 'URU' },
                  { id: 'USA', flag: '🇺🇸', code: 'USA' }
                ];
                const pinnedTeams = ALL_TEAMS_LIST.filter(t => selectedTeams.includes(t.id));
                const unpinnedTeams = ALL_TEAMS_LIST.filter(t => !selectedTeams.includes(t.id));

                const renderTeamButton = (team: any) => {
                  const isChecked = selectedTeams.includes(team.id);
                  const isLimitReached = selectedTeams.length >= 4;
                  const isDisabled = !isChecked && isLimitReached;

                  return (
                    <button
                      key={team.id}
                      type="button"
                      onClick={() => {
                        if (isDisabled) return;
                        setSelectedTeams(prev =>
                          prev.includes(team.id)
                            ? prev.filter(t => t !== team.id)
                            : [...prev, team.id]
                        );
                      }}
                      style={{
                        background: isChecked ? "#ffdf00" : "rgba(255,255,255,0.1)",
                        border: "1px solid",
                        borderColor: isChecked ? "#ffdf00" : "rgba(255,255,255,0.2)",
                        borderRadius: "2rem",
                        padding: "0.5rem 1rem",
                        color: isChecked ? "#000" : "white",
                        cursor: isDisabled ? "not-allowed" : "pointer",
                        transition: "all 0.2s ease",
                        fontSize: "0.9rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        opacity: isDisabled ? 0.45 : 1,
                        fontWeight: 800,
                        boxShadow: isChecked ? '0 0 15px rgba(255, 223, 0, 0.4)' : 'none',
                        flexShrink: 0
                      }}
                    >
                      <span style={{ fontSize: "1.2rem" }}>{team.flag}</span>
                      <span>{team.code}</span>
                    </button>
                  );
                };

                return (
                  <>
                    {/* Pinned Teams (Always Visible) */}
                    {pinnedTeams.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', justifyContent: 'center', marginBottom: '0.8rem' }}>
                        {pinnedTeams.map(renderTeamButton)}
                      </div>
                    )}

                    {/* Unpinned Teams (Scrollable) */}
                    <div
                      className="white-scrollbar"
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        overflowY: 'auto',
                        maxHeight: '22vh',
                        minHeight: '120px',
                        gap: '0.6rem',
                        justifyContent: 'center',
                        marginBottom: '1.5rem',
                        padding: '0.5rem',
                        WebkitOverflowScrolling: 'touch',
                        borderTop: pinnedTeams.length > 0 ? '1px solid rgba(255,255,255,0.1)' : 'none',
                        paddingTop: pinnedTeams.length > 0 ? '0.8rem' : '0.5rem'
                      }}
                    >
                      {unpinnedTeams.map(renderTeamButton)}
                    </div>
                  </>
                );
              })()}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
                <button
                  disabled={selectedTeams.length !== 4}
                  onClick={() => {
                    setIsSelectingTeams(false);
                    initiateGame(selectedMode!, selectedPoints);
                  }}
                  className="btn-hover-dark"
                  style={{
                    width: "100%",
                    height: "50px",
                    fontSize: "1.2rem",
                    fontWeight: 950,
                    backgroundColor: selectedTeams.length !== 4 ? "rgba(255,255,255,0.1)" : "#00f2ff",
                    color: selectedTeams.length !== 4 ? "rgba(255,255,255,0.3)" : "#000",
                    border: "none",
                    borderRadius: "1rem",
                    boxShadow: "4px 4px 0px #000",
                    fontStyle: "italic",
                    cursor: selectedTeams.length !== 4 ? "default" : "pointer"
                  }}
                >
                  {t("play_now")}
                </button>

                <button
                  onClick={() => {
                    setIsSelectingTeams(false);
                    setIsSelectingPoints(true);
                  }}
                  className="btn-hover-dark"
                  style={{
                    background: "rgba(255, 255, 255, 0.1)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    color: "white",
                    height: "40px",
                    borderRadius: "1rem",
                    padding: "0 1.5rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    fontSize: "0.8rem",
                    fontWeight: 900,
                    cursor: "pointer",
                    transition: "none",
                    marginTop: '1.25rem'
                  }}
                >
                  <ArrowLeft size={18} />
                  {t("back")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Room Selection Modal (Multiplayer only) */}
      <AnimatePresence>
        {selectedMode === "multiplayer" && !isWaiting && !isSelectingPoints && !isSelectingTeams && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0, 0, 0, 0.45)",
              backdropFilter: "blur(10px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 2000,
              padding: "2rem",
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                padding: "3rem",
                borderRadius: "2.5rem",
                width: "100%",
                maxWidth: "500px",
                textAlign: "center",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
              }}
            >
              <h2
                className="text-display"
                style={{
                  fontSize: "3rem",
                  color: "#fff",
                  marginBottom: "1rem",
                  lineHeight: 1,
                  whiteSpace: "pre-wrap",
                }}
              >
                {t("private_match").split("\n")[0]}
                <br />
                <span style={{ color: "#00f2ff" }}>
                  {t("private_match").split("\n")[1]}
                </span>
              </h2>

              {!isJoining ? (
                <>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: window.innerWidth < 768 ? "column" : "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "1.25rem",
                      width: "100%",
                      padding: "0.5rem 0",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "0.75rem",
                      }}
                    >
                      <button
                        onClick={() => { if (!user) { handleAuth(); return; } setIsJoining(true); }}
                        className="btn-hover-dark"
                        style={{
                          background: "#00f2ff",
                          border: "none",
                          color: "#000",
                          width: "160px",
                          height: "80px",
                          fontSize: "2rem",
                          fontWeight: 950,
                          cursor: "pointer",
                          boxShadow: "6px 6px 0px #000",
                          transition: "transform 0.1s ease",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        onMouseDown={(e) =>
                        (e.currentTarget.style.transform =
                          "translate(2px, 2px)")
                        }
                        onMouseUp={(e) =>
                        (e.currentTarget.style.transform =
                          "translate(0px, 0px)")
                        }
                      >
                        {t("join")}
                      </button>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "0.75rem",
                      }}
                    >
                      <button
                        onClick={() => { if (!user) { handleAuth(); return; } setIsSelectingPoints(true); }}
                        className="btn-hover-dark"
                        style={{
                          background: "#00f2ff",
                          border: "none",
                          color: "#000",
                          width: "160px",
                          height: "80px",
                          fontSize: "2rem",
                          fontWeight: 950,
                          cursor: "pointer",
                          boxShadow: "6px 6px 0px #000",
                          transition: "transform 0.1s ease",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        onMouseDown={(e) =>
                        (e.currentTarget.style.transform =
                          "translate(2px, 2px)")
                        }
                        onMouseUp={(e) =>
                        (e.currentTarget.style.transform =
                          "translate(0px, 0px)")
                        }
                      >
                        {t("create")}
                      </button>
                    </div>
                  </div>

                  <motion.div
                    style={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "center",
                      marginTop: "1rem",
                    }}
                  >
                    <button
                      onClick={() => {
                        setSelectedMode(null);
                        setInputCode("");
                      }}
                      className="btn-hover-dark"
                      style={{
                        background: "rgba(255, 255, 255, 0.1)",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        color: "white",
                        height: "40px",
                        borderRadius: "1rem",
                        padding: "0 1.5rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        fontSize: "0.8rem",
                        fontWeight: 900,
                        cursor: "pointer",
                        transition: "none",
                      }}
                    >
                      <Home size={18} />
                      {t("back")}
                    </button>
                  </motion.div>
                </>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1.5rem",
                    width: "100%",
                  }}
                >
                  <input
                    type="text"
                    maxLength={4}
                    placeholder={t("code")}
                    value={inputCode}
                    onChange={(e) => {
                      setInputCode(e.target.value.toUpperCase());
                      setJoinError("");
                    }}
                    style={{
                      background: "rgba(0,0,0,0.3)",
                      border: "2px solid #00f2ff",
                      borderRadius: "0",
                      padding: "0.75rem",
                      color: "#fff",
                      fontSize: "clamp(1.5rem, 6vw, 2rem)",
                      textAlign: "center",
                      fontFamily: "var(--font-display)",
                      fontStyle: "italic",
                      fontWeight: 900,
                      letterSpacing: "0.3rem",
                      outline: "none",
                      width: "100%",
                      maxWidth: "240px",
                      margin: "0.5rem auto 0 auto",
                      boxSizing: "border-box",
                      boxShadow: "4px 4px 0px #00f2ff",
                    }}
                  />
                  {joinError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        color: "#ef4444",
                        fontSize: "0.95rem",
                        fontWeight: 600,
                        textAlign: "center",
                        marginTop: "-0.5rem",
                        marginBottom: "-0.75rem",
                        background: "rgba(239, 68, 68, 0.1)",
                        padding: "0.5rem",
                        borderRadius: "0.5rem",
                        border: "1px solid rgba(239, 68, 68, 0.2)",
                      }}
                    >
                      {joinError}
                    </motion.div>
                  )}
                  <button
                    onClick={() => handleJoinRoom()}
                    className="btn-hover-dark"
                    style={{
                      background: "#00f2ff",
                      color: "#000",
                      border: "none",
                      padding: "0.75rem",
                      borderRadius: "0",
                      fontSize: "2rem",
                      fontWeight: 950,
                      fontStyle: "italic",
                      cursor: "pointer",
                      textTransform: "uppercase",
                      width: "100%",
                      maxWidth: "240px",
                      margin: "0 auto",
                      boxShadow: "6px 6px 0px #000",
                      transition: "transform 0.1s ease",
                    }}
                    onMouseDown={(e) =>
                      (e.currentTarget.style.transform = "translate(2px, 2px)")
                    }
                    onMouseUp={(e) =>
                      (e.currentTarget.style.transform = "translate(0px, 0px)")
                    }
                  >
                    {t("start")}
                  </button>

                  <motion.div
                    style={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "center",
                      marginTop: "0.5rem",
                    }}
                  >
                    <button
                      onClick={() => {
                        setIsJoining(false);
                        setInputCode("");
                        setJoinError("");
                      }}
                      className="btn-hover-dark"
                      style={{
                        background: "rgba(255, 255, 255, 0.1)",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        color: "white",
                        height: "40px",
                        borderRadius: "1rem",
                        padding: "0 1.5rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        fontSize: "0.8rem",
                        fontWeight: 900,
                        cursor: "pointer",
                        transition: "none",
                      }}
                    >
                      <ArrowLeft size={18} />
                      {t("back")}
                    </button>
                  </motion.div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeckLockModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDeckLockModal(false)}
            style={{
              position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(10px)",
              display: "flex", alignItems: "center", justifyContent: "center", zIndex: 3000, padding: "1.5rem"
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                padding: typeof window !== "undefined" && window.innerWidth < 768 ? "2rem 1.5rem" : "3rem",
                borderRadius: "2.5rem",
                maxWidth: "500px",
                width: "100%",
                textAlign: "center",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
              }}
            >
              <div style={{
                width: typeof window !== "undefined" && window.innerWidth < 768 ? '60px' : '80px', 
                height: typeof window !== "undefined" && window.innerWidth < 768 ? '60px' : '80px', 
                borderRadius: '50%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', color: '#00f2ff', 
                fontSize: typeof window !== "undefined" && window.innerWidth < 768 ? '1.8rem' : '2.5rem'
              }}>
                🔒
              </div>
              <h2
                className="text-display"
                style={{ margin: "0 0 1rem 0", color: "#fff", fontSize: typeof window !== "undefined" && window.innerWidth < 768 ? "1.5rem" : "2.5rem", lineHeight: 1 }}
              >
                MAZO <span style={{ color: "#f97316" }}>INCOMPLETO</span>
              </h2>
              <p style={{ margin: "0 0 1.5rem 0", color: "#fff", opacity: 0.8, fontSize: typeof window !== "undefined" && window.innerWidth < 768 ? "0.85rem" : "1.1rem", lineHeight: 1.5 }}>
                Para jugar online primero <b style={{color: "#fff"}}>tenés que abrir <br className="desktop-only" />tus sobres gratuitos de bienvenida</b><br className="desktop-only" /> en la sección "Armá/Personalizá tu mazo".
              </p>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <button
                  onClick={() => setShowDeckLockModal(false)}
                  className="btn-hover-dark"
                  style={{ 
                    width: "100%", 
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    padding: typeof window !== "undefined" && window.innerWidth < 768 ? "0.8rem" : "1rem", 
                    background: "#f97316", 
                    border: "none", 
                    color: "#000", 
                    borderRadius: "1rem", 
                    cursor: "pointer", 
                    fontWeight: 900,
                    fontSize: typeof window !== "undefined" && window.innerWidth < 768 ? "0.95rem" : "1.1rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em"
                  }}
                >
                  <Layers size={20} />
                  Entendido
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <RulesModal isOpen={showRules} onClose={() => setShowRules(false)} />

      {showNationalityModal && (
        <NationalityModal user={user} onSaved={() => setShowNationalityModal(false)} />
      )}
    </div>
  );
};
