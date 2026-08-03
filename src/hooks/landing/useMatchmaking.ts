import type { User } from '@supabase/supabase-js';
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { setTournamentVotesSnapshot } from "../../lib/votesStore";

interface UseMatchmakingProps {
  user: User | null;
  sessionId: string;
  onStart: (
    mode: "1v1" | "2v2" | "multiplayer",
    points: 15 | 30,
    rivalName?: string,
    rivalId?: string,
    isHost?: boolean,
    roomCode?: string,
    isReconnect?: boolean,
    customDeck?: string[],
  ) => void;
  setShowVersus: (show: boolean) => void;
  setSelectedMode: (mode: "1v1" | "2v2" | "multiplayer" | null) => void;
  setSelectedPoints: (points: 15 | 30) => void;
  setIsSelectingPoints: (selecting: boolean) => void;
  selectedTeams: string[];
  setSelectedTeams: (teams: string[]) => void;
  setShowTournament: (show: boolean) => void;
  setShowTournamentEvent: (show: boolean) => void;
}

export const useMatchmaking = ({
  user,
  sessionId,
  onStart,
  setShowVersus,
  setSelectedMode,
  setSelectedPoints,
  setIsSelectingPoints,
  selectedTeams,
  setSelectedTeams,
  setShowTournament,
  setShowTournamentEvent,
}: UseMatchmakingProps) => {
  const [isWaiting, setIsWaiting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);
  const [roomCode, setRoomCode] = useState<string>("");
  const [isJoining, setIsJoining] = useState(false);
  const [inputCode, setInputCode] = useState("");
  const [joinError, setJoinError] = useState("");
  const [isCreator, setIsCreator] = useState(false);
  const [rivalData, setRivalData] = useState<{ name: string; id: string } | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
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
  }, [isWaiting, timeLeft, setSelectedMode]);

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
      const { data } = await supabase
        .from("user_decks")
        .select("selected_deck")
        .eq("id", userId)
        .single();
      if (data && data.selected_deck) deck = data.selected_deck;
    }
    if (!deck.length) {
      const cached = localStorage.getItem(`trucomundial-deck-${userId || "anonymous"}`);
      if (cached) {
        try {
          deck = JSON.parse(cached).selectedDeck || [];
        } catch (e) {}
      }
    }
    return deck;
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
      const guestName = user?.user_metadata?.full_name?.split(" ")[0] || "GUEST";
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
      const roomInfo = state.roomInfo || (state.status === "matched" ? state : null);
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

    try {
      const { data: mData } = await supabase
        .from("tournament_matches")
        .select("tournament_id")
        .eq("match_code", matchCode)
        .maybeSingle();

      let allowed = [
        "Alemania", "Ghana", "Haití", "Arabia Saudita", "Argelia", "Argentina",
        "Australia", "Austria", "Bélgica", "Bosnia y Herz", "Brasil", "Cabo Verde",
        "Canadá", "Colombia", "Costa de Marfil", "DR Congo", "Croacia", "Curaçao",
        "República Checa", "Ecuador", "Egipto", "Senegal", "Inglaterra", "España",
        "Francia", "Japón", "Jordania", "Corea del Sur", "Marruecos", "México",
        "Países Bajos", "Noruega", "Nueva Zelanda", "Panamá", "Paraguay", "Portugal",
        "Qatar", "Sudáfrica", "Suiza", "Suecia", "Túnez", "Türkiye", "Uruguay",
        "USA", "Uzbekistán",
      ];
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
                [
                  ...(state.roomInfo?.hostDeck || []),
                  ...(state.roomInfo?.guestDeck || []),
                ],
              );
            }, 3500);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isWaiting, user, roomCode, isCreator, rivalData, onStart, setShowVersus]);

  const initiateGame = (
    mode: "1v1" | "2v2" | "multiplayer",
    points: 15 | 30,
    handleAuth: () => void,
  ) => {
    setIsSelectingPoints(false);

    if (mode === "multiplayer") {
      if (!user) {
        handleAuth();
      } else {
        handleCreateRoom(points);
      }
    } else {
      onStart(
        mode,
        points,
        undefined,
        undefined,
        undefined,
        undefined,
        false,
        selectedTeams,
      );
    }
  };

  return {
    isWaiting, setIsWaiting,
    timeLeft, setTimeLeft,
    roomCode, setRoomCode,
    isJoining, setIsJoining,
    inputCode, setInputCode,
    joinError, setJoinError,
    isCreator, setIsCreator,
    rivalData, setRivalData,
    handleCreateRoom,
    handleJoinRoom,
    startTournamentMatch,
    initiateGame
  };
};
