import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Home, User, Music, Globe, ArrowLeft, Trophy, ShieldAlert } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { LandingHeader } from "./LandingHeader";
import { GameModeSelector } from "./GameModeSelector";
import { PointSelector } from "./PointSelector";
import { MatchmakingOverlay } from "./MatchmakingOverlay";
import { RankingScreen } from "./RankingScreen";
import { TournamentScreen } from "./TournamentScreen";
import TournamentEventPage from "./tournaments/TournamentEventPage";
import { RoadmapScreen } from "./RoadmapScreen";
import { FixtureScreen } from "./FixtureScreen";
import { ProfileScreen } from "./ProfileScreen";
import { AdminScreen } from "../admin/AdminScreen";
import { CreatorScreen } from "../admin/CreatorScreen";
import { CreatorsApplicationScreen } from "./CreatorsApplicationScreen";
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
        if (Array.isArray(parsed) && parsed.length >= 2) return parsed;
      } catch (e) {}
    }
    return ["Argentina", "Francia", "España", "Nueva Zelanda"];
  });

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
  }, [showRanking, showRoadmap, showFixture, showTournament, showProfile]);

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

    const newRoomInfo = {
      creatorId: user?.id || sessionId,
      creatorName: user?.user_metadata?.full_name?.split(" ")[0] || "HOST",
      points: pointsToUse,
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

      const newRoomInfo = {
        creatorId: rivalId,
        creatorName: rivalName,
        guestId: guestId,
        guestName: guestName,
        points: matchPoints,
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
          selectedTeams,
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
            selectedTeams,
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
            selectedTeams,
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

      let allowed = ["Argentina", "Francia", "España", "Nueva Zelanda", "Brasil", "Argelia", "México", "Colombia", "Japón", "Uruguay", "Portugal", "Ecuador", "Paraguay", "Panamá", "USA", "Canadá"];
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
                selectedTeams,
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
        <FixtureScreen
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
      {/* Profile / Language Switch - Top Left */}
      <div style={{ position: "absolute", top: "1.5rem", left: "1.5rem", display: "flex", gap: "0.5rem", zIndex: 1000 }}>
        <button
          onClick={() => {
            if (user) {
              const isEn = window.location.pathname.startsWith("/en");
              const target = isEn ? "/en/perfil" : "/perfil";
              if (window.location.pathname !== target) {
                window.history.pushState({}, "", target);
                window.dispatchEvent(new PopStateEvent("popstate"));
              }
            } else {
              const isEn = window.location.pathname.startsWith("/en");
              const newLang = isEn ? "es" : "en";
              localStorage.setItem("lang", newLang);
              window.location.href = newLang === "en" ? "/en" : "/";
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
          title={user ? t("profile") : "Cambiar Idioma / Change Language"}
        >
          {user ? (
            <User size={20} style={{ color: "#ffffff" }} />
          ) : (
            <Globe size={20} style={{ color: "#ffffff" }} />
          )}
        </button>

        {isApprovedCreator && (
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

        {isSuperAdmin && (
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

      {/* Utility buttons column (Top Right) */}
      <div
        style={{
          position: "absolute",
          top: "1.5rem",
          right: "1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
          zIndex: 1000,
        }}
      >
        {/* Music Button */}
        <a
          href="https://youtu.be/vrY1THC_NQE"
          target="_blank"
          rel="noopener noreferrer"
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
            textDecoration: "none",
          }}
          title="Music"
        >
          <Music size={20} />
        </a>

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

      {/* Auth Button - Way Up Top & Centered (Only visible if not logged in) */}
      {!user && (
        <button
          onClick={handleAuth}
          className="btn-hover-dark"
          style={{
            position: "absolute",
            top: typeof window !== "undefined" && window.innerWidth < 768 ? "3.5rem" : "1.5rem",
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            color: "white",
            height: "40px",
            padding: "0 1.25rem",
            borderRadius: "1rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.75rem",
            fontSize: "0.85rem",
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            letterSpacing: "0.05em",
            backdropFilter: "blur(12px)",
            textTransform: "uppercase",
            transition: "none",
            zIndex: 1000,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          {t("login")}
        </button>
      )}

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
            margin: "0 0 2rem 0",
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
            onSelect={(mode) => {
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
              background: "rgba(0, 0, 0, 0.65)",
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
                  setIsSelectingTeams(true);
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
              background: "rgba(0, 0, 0, 0.65)",
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
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "1.05rem", marginBottom: "2rem", fontWeight: 500 }}>
                {t("deck_selection_subtitle")}
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', justifyContent: 'center', marginBottom: '1.5rem', marginTop: '1rem' }}>
                {[
                  { id: 'Argentina', flag: '🇦🇷' },
                  { id: 'Francia', flag: '🇫🇷' },
                  { id: 'España', flag: '🇪🇸' },
                  { id: 'Nueva Zelanda', flag: '🇳🇿' },
                  { id: 'Brasil', flag: '🇧🇷' },
                  { id: 'Argelia', flag: '🇩🇿' },
                  { id: 'México', flag: '🇲🇽' },
                  { id: 'Colombia', flag: '🇨🇴' },
                  { id: 'Japón', flag: '🇯🇵' },
                  { id: 'Uruguay', flag: '🇺🇾' },
                  { id: 'Portugal', flag: '🇵🇹' },
                  { id: 'Ecuador', flag: '🇪🇨' },
                  { id: 'Paraguay', flag: '🇵🇾' },
                  { id: 'Panamá', flag: '🇵🇦' },
                  { id: 'USA', flag: '🇺🇸' },
                  { id: 'Canadá', flag: '🇨🇦' },
                  { id: 'Nueva Zelanda', flag: '🇳🇿' }
                ].map(team => {
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
                        background: isChecked ? "#00f2ff" : "rgba(255,255,255,0.1)",
                        border: "1px solid",
                        borderColor: isChecked ? "#00f2ff" : "rgba(255,255,255,0.2)",
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
                        boxShadow: isChecked ? '0 0 15px rgba(0, 242, 255, 0.4)' : 'none'
                      }}
                    >
                      <span style={{ fontSize: "1.2rem" }}>{team.flag}</span>
                      <span>{t("country_" + team.id.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase())}</span>
                    </button>
                  );
                })}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
                <button
                  disabled={selectedTeams.length < 2}
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
                    backgroundColor: selectedTeams.length < 2 ? "rgba(255,255,255,0.1)" : "#00f2ff",
                    color: selectedTeams.length < 2 ? "rgba(255,255,255,0.3)" : "#000",
                    border: "none",
                    borderRadius: "1rem",
                    boxShadow: "4px 4px 0px #000",
                    fontStyle: "italic",
                    cursor: selectedTeams.length < 2 ? "default" : "pointer"
                  }}
                >
                  {t("play")}
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
              background: "rgba(0, 0, 0, 0.65)",
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
    </div>
  );
};
