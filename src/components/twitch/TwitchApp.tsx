import { useState, useEffect, useCallback, useRef } from "react";
import { Home, BookOpen, Search } from "lucide-react";
import { VolumeControl } from "../shared/VolumeControl";
import { audioManager } from "../../lib/audio";
import { useTrucoGame } from "../../hooks/useTrucoGame";
import { TrucoGameView } from "../game/layout/TrucoGameView";
import { useTwitchChat } from "../../hooks/useTwitchChat";
import { supabase } from "../../lib/supabase";
import { useMatchmaking } from "../../hooks/useMatchmaking";
import { motion, AnimatePresence } from "framer-motion";
import type { PlayerRole } from "../../lib/truco/types";
import { RulesModal } from "../shared/RulesModal";
import { useTranslation } from "react-i18next";

export function TwitchApp() {
  const { t } = useTranslation();
  const [channel, setChannel] = useState<string>("");
  const [points, setPoints] = useState<number>(30);
  const [opponentMode, setOpponentMode] = useState<"cpu" | "streamer">("cpu");
  const [countrySearch, setCountrySearch] = useState("");
  const cleanString = (str: string) =>
    str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  const [selectedTeams, setSelectedTeams] = useState<string[]>(() => {
    const saved = localStorage.getItem("truco_selected_teams_twitch");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return [];
  });
  const [showRules, setShowRules] = useState(false);

  useEffect(() => {
    localStorage.setItem(
      "truco_selected_teams_twitch",
      JSON.stringify(selectedTeams),
    );
  }, [selectedTeams]);

  const [isConfigured, setIsConfigured] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [sessionId] = useState(
    () => `twitch_${Math.random().toString(36).substr(2, 9)}`,
  );
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [isWaiting, setIsWaiting] = useState(false);
  const [rivalData, setRivalData] = useState<any>(null);

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const syncRef = useRef<((data: any) => void) | null>(null);
  const stableHandleSync = useCallback((data: any) => {
    if (syncRef.current) syncRef.current(data);
  }, []);

  const core = useTrucoGame(sessionId, stableHandleSync);
  const {
    activeUser,
    clearActiveUser,
    forceActiveUser,
    lastCommand,
    connectionStatus,
  } = useTwitchChat(isConfigured ? channel : null);

  // Restart activeUser when round resets
  useEffect(() => {
    if (core.playerHand.length === 3 && core.playedCards.length === 0) {
      clearActiveUser();
    }
  }, [core.playerHand, core.playedCards, clearActiveUser]);

  useEffect(() => {
    audioManager.playTheme();
  }, []);

  const { broadcastMove } = useMatchmaking({
    sessionId,
    user: null,
    gameMode: core.gameMode,
    rivalId: core.rivalId,
    isHost: true,
    matchId: roomCode,
    gameState: core.gameState,
    playerHand: core.playerHand,
    playedCards: core.playedCards,
    starterIdx: core.starterIdx,
    cpuHandRef: core.cpuHandRef,
    isRoundEnding: core.isRoundEnding,
    isGameStarting: core.isGameStarting,
    setGameState: core.setGameState,
    setRivalName: core.setRivalName,
    resetRound: core.resetRound,
    playCardRemote: core.playCardRemote,
    wrappedHandleCall: (t: any, l: number, c: PlayerRole, r?: boolean) =>
      wrappedHandleCall(t, l, c, r),
    wrappedHandleResponse: (w: boolean, r?: boolean) =>
      wrappedHandleResponse(w, r),
    handleMazo: core.handleMazo,
    setScore: core.setScore,
    score: core.score,
    setIsGameStarting: core.setIsGameStarting,
    setShowCountdown: core.setShowCountdown,
    setMaxPoints: core.setMaxPoints,
    setIsHost: core.setIsHost,
    setMyIndex: core.setMyIndex,
    setPlayerHand: core.setPlayerHand,
    setPlayedCards: core.setPlayedCards,
    setStarterIdx: core.setStarterIdx,
    setHandWinners: core.setHandWinners,
    setTrucoState: core.setTrucoState,
    setEnvidoState: core.setEnvidoState,
    setCpuHandCount: core.setCpuHandCount,
  } as any);

  const wrappedPlayCard = (c: any, remote?: boolean) => {
    core.playCard(c);
    if (core.gameMode === "multiplayer" && !remote) {
      broadcastMove({ type: "play", cardId: c.id });
    }
  };

  const wrappedHandleCall = (
    t: any,
    l: number,
    c: PlayerRole,
    remote?: boolean,
  ) => {
    core.handleCall(t, l, c);
    if (core.gameMode === "multiplayer" && !remote) {
      broadcastMove({ type: "call", callType: t, level: l, caller: c });
    }
  };

  const wrappedHandleResponse = (w: boolean, remote?: boolean) => {
    core.handleResponse(w);
    if (core.gameMode === "multiplayer" && !remote) {
      broadcastMove({ type: w ? "accept" : "reject" });
    }
  };

  const wrappedHandleMazo = (remote?: boolean) => {
    core.handleMazo();
    if (core.gameMode === "multiplayer" && !remote) {
      broadcastMove({ type: "mazo" });
    }
  };

  // Execute commands from twitch
  useEffect(() => {
    if (!lastCommand || !activeUser) return;

    // Only process if it's player's turn to play a card, or to respond
    const { command } = lastCommand;

    // Slight delay to ensure state isn't jumping
    const timer = setTimeout(() => {
      switch (command) {
        case "carta_1":
          if (core.playerHand[0]) wrappedPlayCard(core.playerHand[0]);
          break;
        case "carta_2":
          if (core.playerHand[1]) wrappedPlayCard(core.playerHand[1]);
          break;
        case "carta_3":
          if (core.playerHand[2]) wrappedPlayCard(core.playerHand[2]);
          break;
        case "truco":
          wrappedHandleCall("truco", 1, "player");
          break;
        case "retruco":
          wrappedHandleCall("truco", 2, "player");
          break;
        case "vale_cuatro":
          wrappedHandleCall("truco", 3, "player");
          break;
        case "envido":
          wrappedHandleCall("envido", 1, "player");
          break;
        case "real_envido":
          wrappedHandleCall("envido", 2, "player");
          break;
        case "falta_envido":
          wrappedHandleCall("envido", 3, "player");
          break;
        case "quiero":
          wrappedHandleResponse(true);
          break;
        case "no_quiero":
          wrappedHandleResponse(false);
          break;
        case "me_voy":
          wrappedHandleMazo();
          break;
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [lastCommand]); // activeUser could be safely ignored here as lastCommand is only generated for active user

  const startGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (channel.trim() === "") return;
    if (selectedTeams.length < 2) return;
    setIsConfigured(true);

    if (opponentMode === "streamer") {
      const code = Math.random().toString(36).substring(2, 6).toUpperCase();
      setRoomCode(code);
      setIsWaiting(true);

      const newRoomInfo = {
        creatorId: sessionId,
        creatorName: "Twitch Host",
        points: points,
      };

      // Register room in table
      await supabase.from("game_sync").upsert({
        match_id: code,
        last_move: {
          type: "room_state",
          status: "waiting",
          roomInfo: newRoomInfo,
        },
        updated_at: new Date().toISOString(),
      });
    } else {
      // Local game vs CPU
      core.startGame("1v1", "CPU", "", points, selectedTeams);
      core.setGameState("playing");
    }
  };

  useEffect(() => {
    if (!isWaiting || !roomCode) return;

    // Listen for the Streamer (Guest) joining
    const channelListener = supabase
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
          if (state?.status === "matched" && !rivalData) {
            console.log("Streamer joined:", state.guestName);
            setRivalData({ name: state.guestName, id: state.guestId });

            setTimeout(() => {
              setIsWaiting(false);
              core.setGameMode("multiplayer");
              core.setRivalId(state.guestId || "");
              core.setRivalName(state.guestName || "Streamer");
              core.startGame(
                "multiplayer",
                state.guestName || "Streamer",
                state.guestId || "",
                points,
                selectedTeams,
              );
              core.setIsGameStarting(true);
              core.setShowCountdown(true);
              setTimeout(() => {
                core.setIsGameStarting(false);
                core.setShowCountdown(false);
              }, 4500);
            }, 1000);
          }
        },
      )
      .subscribe();

    return () => {
      channelListener.unsubscribe();
    };
  }, [isWaiting, roomCode, rivalData, points, selectedTeams, core]);

  if (!isConfigured) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('/background.png')",
          backgroundPosition: "center",
          backgroundSize: "cover",
          color: "white",
        }}
      >
        {/* Home Button */}
        {!isConfigured && (
          <button
            onClick={() => (window.location.href = "/")}
            className="btn-hover-dark"
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
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            <Home size={18} />
            <span>INICIO</span>
          </button>
        )}

        {/* Top Right Controls */}
        {!isConfigured && (
          <div
            style={{
              position: "fixed",
              top: "1.5rem",
              right: "1.5rem",
              zIndex: 2000,
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              alignItems: "center",
            }}
          >
            <VolumeControl expandDirection="left" />
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
          </div>
        )}

        {!isConfigured ? (
          isMobile ? (
            <div
              style={{
                background: "rgba(255,255,255,0.05)",
                padding: "2rem",
                borderRadius: "1rem",
                border: "1px solid rgba(255,255,255,0.1)",
                textAlign: "center",
                maxWidth: "90%",
                color: "white",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "1rem",
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#9146FF"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 2H3v16h5v4l4-4h5l4-4V2zm-10 9V7m5 4V7" />
              </svg>
              <h2 style={{ color: "#9146FF", margin: 0 }}>
                Twitch Juega Truco Mundial
              </h2>
              <p style={{ fontSize: "1.1rem", margin: 0 }}>
                Este modo está diseñado para streamers y solo funciona en
                pantallas grandes (PC o Tablets en horizontal).
              </p>
              <p style={{ margin: 0, opacity: 0.8 }}>
                Por favor, ingresá desde tu computadora para conectar tu canal
                de Twitch.
              </p>
            </div>
          ) : (
            <div
              style={{
                background: "rgba(24, 24, 27, 0.9)",
                padding: "2.5rem 2rem",
                borderRadius: "1rem",
                boxShadow: "0 0 30px rgba(145, 70, 255, 0.3)",
                border: "1px solid #9146FF",
                maxWidth: "600px",
                width: "100%",
                textAlign: "center",
              }}
            >
              <h2
                style={{
                  color: "#9146FF",
                  marginBottom: "2rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.75rem",
                  textTransform: "uppercase",
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 2H3v16h5v4l4-4h5l4-4V2zm-10 9V7m5 4V7" />
                </svg>
                Twitch Juega Truco Mundial
              </h2>
              <form onSubmit={startGame}>
                <div style={{ marginBottom: "1rem", textAlign: "left" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontSize: "0.9rem",
                      color: "#ccc",
                    }}
                  >
                    Canal de Twitch
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: muchomovimiento"
                    value={channel}
                    onChange={(e) => setChannel(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.8rem",
                      borderRadius: "0.5rem",
                      border: "1px solid rgba(255,255,255,0.2)",
                      background: "rgba(0,0,0,0.5)",
                      color: "white",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div style={{ marginBottom: "1rem", textAlign: "left" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontSize: "0.9rem",
                      color: "#ccc",
                    }}
                  >
                    ¿A cuántos puntos va a jugarse la partida?
                  </label>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      type="button"
                      onClick={() => setPoints(15)}
                      style={{
                        flex: 1,
                        padding: "0.8rem",
                        borderRadius: "0.5rem",
                        border:
                          points === 15
                            ? "1px solid #9146FF"
                            : "1px solid rgba(255,255,255,0.2)",
                        background:
                          points === 15
                            ? "rgba(145, 70, 255, 0.2)"
                            : "rgba(0,0,0,0.5)",
                        color: "white",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        fontSize: "0.9rem",
                      }}
                    >
                      A 15 (Rápida)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPoints(30)}
                      style={{
                        flex: 1,
                        padding: "0.8rem",
                        borderRadius: "0.5rem",
                        border:
                          points === 30
                            ? "1px solid #9146FF"
                            : "1px solid rgba(255,255,255,0.2)",
                        background:
                          points === 30
                            ? "rgba(145, 70, 255, 0.2)"
                            : "rgba(0,0,0,0.5)",
                        color: "white",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        fontSize: "0.9rem",
                      }}
                    >
                      A 30 (Clásica)
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: "1rem", textAlign: "left" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontSize: "0.9rem",
                      color: "#ccc",
                    }}
                  >
                    Modalidad
                  </label>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      type="button"
                      onClick={() => setOpponentMode("cpu")}
                      style={{
                        flex: 1,
                        padding: "0.8rem",
                        borderRadius: "0.5rem",
                        border:
                          opponentMode === "cpu"
                            ? "1px solid #9146FF"
                            : "1px solid rgba(255,255,255,0.2)",
                        background:
                          opponentMode === "cpu"
                            ? "rgba(145, 70, 255, 0.2)"
                            : "rgba(0,0,0,0.5)",
                        color: "white",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        fontSize: "0.9rem",
                      }}
                    >
                      Chat vs CPU
                    </button>
                    <button
                      type="button"
                      disabled
                      style={{
                        flex: 1,
                        padding: "0.8rem",
                        borderRadius: "0.5rem",
                        border: "1px solid rgba(255,255,255,0.2)",
                        background: "rgba(0,0,0,0.5)",
                        color: "white",
                        opacity: 0.5,
                        cursor: "not-allowed",
                        transition: "all 0.2s",
                        fontSize: "0.9rem",
                      }}
                    >
                      Chat vs Streamer{" "}
                      <span style={{ opacity: 0.6, fontSize: "0.75rem" }}>
                        (próximamente)
                      </span>
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: "1.5rem", textAlign: "left" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontSize: "0.9rem",
                      color: "#ccc",
                    }}
                  >
                    Conformación del Mazo (Elegí 4 selecciones)
                  </label>

                  {(() => {
                    const ALL_TEAMS_LIST = [
                      { id: "Argelia", flag: "🇩🇿", code: "ALG" },
                      { id: "Argentina", flag: "🇦🇷", code: "ARG" },
                      { id: "Austria", flag: "🇦🇹", code: "AUT" },
                      { id: "Bélgica", code: "BEL", flag: "🇧🇪" },
                      { id: "Bosnia y Herz", flag: "🇧🇦", code: "BIH" },
                      { id: "Brasil", flag: "🇧🇷", code: "BRA" },
                      { id: "Canadá", flag: "🇨🇦", code: "CAN" },
                      { id: "Costa de Marfil", code: "CIV", flag: "🇨🇮" },
                      { id: "Colombia", flag: "🇨🇴", code: "COL" },
                      { id: "Cabo Verde", flag: "🇨🇻", code: "CPV" },
                      { id: "Croacia", flag: "🇭🇷", code: "CRO" },
                      { id: "República Checa", flag: "🇨🇿", code: "CZE" },
                      { id: "Ecuador", flag: "🇪🇨", code: "ECU" },
                      { id: "Egipto", flag: "🇪🇬", code: "EGY" },
                      { id: "Inglaterra", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", code: "ENG" },
                      { id: "España", flag: "🇪🇸", code: "ESP" },
                      { id: "Francia", flag: "🇫🇷", code: "FRA" },
                      { id: "Alemania", code: "GER", flag: "🇩🇪" },
                      { id: "Irán", flag: "🇮🇷", code: "IRN" },
                      { id: "Jordania", flag: "🇯🇴", code: "JOR" },
                      { id: "Japón", flag: "🇯🇵", code: "JPN" },
                      { id: "Corea del Sur", flag: "🇰🇷", code: "KOR" },
                      { id: "Arabia Saudita", flag: "🇸🇦", code: "KSA" },
                      { id: "Marruecos", flag: "🇲🇦", code: "MAR" },
                      { id: "México", flag: "🇲🇽", code: "MEX" },
                      { id: "Países Bajos", flag: "🇳🇱", code: "NED" },
                      { id: "Noruega", flag: "🇳🇴", code: "NOR" },
                      { id: "Nueva Zelanda", flag: "🇳🇿", code: "NZL" },
                      { id: "Panamá", flag: "🇵🇦", code: "PAN" },
                      { id: "Paraguay", flag: "🇵🇾", code: "PAR" },
                      { id: "Portugal", flag: "🇵🇹", code: "POR" },
                      { id: "Qatar", flag: "🇶🇦", code: "QAT" },
                      { id: "Sudáfrica", flag: "🇿🇦", code: "RSA" },
                      { id: "Escocia", code: "SCO", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
                      { id: "Senegal", flag: "🇸🇳", code: "SEN" },
                      { id: "Suiza", flag: "🇨🇭", code: "SUI" },
                      { id: "Suecia", code: "SWE", flag: "🇸🇪" },
                      { id: "Uruguay", flag: "🇺🇾", code: "URU" },
                      { id: "USA", flag: "🇺🇸", code: "USA" },
                    ];

                    const pinnedTeams = ALL_TEAMS_LIST.filter((t) =>
                      selectedTeams.includes(t.id),
                    );
                    const unpinnedTeams = ALL_TEAMS_LIST.filter(
                      (t) => !selectedTeams.includes(t.id),
                    ).filter((c) => {
                      const q = cleanString(countrySearch);
                      return (
                        cleanString(c.id).includes(q) ||
                        cleanString(c.code).includes(q)
                      );
                    });

                    const renderTeamButton = (team: any) => {
                      const isSelected = selectedTeams.includes(team.id);
                      return (
                        <button
                          key={team.id}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setSelectedTeams((prev) =>
                                prev.filter((t) => t !== team.id),
                              );
                            } else {
                              if (selectedTeams.length < 4) {
                                setSelectedTeams((prev) => [...prev, team.id]);
                              }
                            }
                          }}
                          style={{
                            background: isSelected
                              ? "#ffdf00"
                              : "rgba(255,255,255,0.1)",
                            border: "1px solid",
                            borderColor: isSelected ? "#ffdf00" : "transparent",
                            borderRadius: "2rem",
                            padding: "0.4rem 0.8rem",
                            color: isSelected
                              ? "black"
                              : "rgba(255,255,255,0.7)",
                            cursor:
                              !isSelected && selectedTeams.length >= 4
                                ? "not-allowed"
                                : "pointer",
                            opacity:
                              !isSelected && selectedTeams.length >= 4
                                ? 0.5
                                : 1,
                            fontSize: "0.85rem",
                            fontWeight: isSelected ? 800 : "normal",
                            transition: "all 0.2s",
                          }}
                        >
                          {team.flag} {team.code}
                        </button>
                      );
                    };

                    return (
                      <>
                        {/* Pinned Teams (Always Visible) */}
                        {pinnedTeams.length > 0 && (
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: "0.6rem",
                              marginBottom: "0.8rem",
                            }}
                          >
                            {pinnedTeams.map(renderTeamButton)}
                          </div>
                        )}

                        <div
                          style={{
                            position: "relative",
                            width: "100%",
                            marginBottom: "0.75rem",
                          }}
                        >
                          <Search
                            size={18}
                            style={{
                              position: "absolute",
                              left: "1rem",
                              top: "50%",
                              transform: "translateY(-50%)",
                              color: "#9ca3af",
                              pointerEvents: "none",
                            }}
                          />
                          <input
                            type="text"
                            placeholder="Buscar país..."
                            value={countrySearch}
                            onChange={(e) => setCountrySearch(e.target.value)}
                            style={{
                              display: "block",
                              height: "42px",
                              padding: "0 1.25rem 0 2.5rem",
                              borderRadius: "1.1rem",
                              background: "rgba(255, 255, 255, 0.05)",
                              border: "1px solid rgba(255, 255, 255, 0.1)",
                              color: "#fff",
                              fontSize: "0.9rem",
                              outline: "none",
                              width: "100%",
                              boxSizing: "border-box",
                              margin: 0,
                            }}
                          />
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "0.5rem",
                            alignItems: "flex-start",
                            alignContent: "flex-start",
                          }}
                        >
                          {unpinnedTeams.map(renderTeamButton)}
                        </div>
                      </>
                    );
                  })()}
                </div>

                <button
                  type="submit"
                  disabled={selectedTeams.length !== 4 || channel.trim() === ""}
                  style={{
                    width: "100%",
                    padding: "0.8rem",
                    borderRadius: "0.5rem",
                    border: "none",
                    background:
                      selectedTeams.length !== 4 || channel.trim() === ""
                        ? "rgba(145, 70, 255, 0.5)"
                        : "#9146FF",
                    color: "white",
                    fontWeight: "bold",
                    cursor:
                      selectedTeams.length !== 4 || channel.trim() === ""
                        ? "default"
                        : "pointer",
                    transition: "all 0.2s",
                    marginTop: "1rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                  }}
                >
                  <span style={{ textTransform: "uppercase" }}>
                    Conectar y Jugar
                  </span>
                </button>
              </form>
            </div>
          )
        ) : null}
        <RulesModal isOpen={showRules} onClose={() => setShowRules(false)} />
      </div>
    );
  }

  return (
    <div style={{ position: "relative" }}>
      <style>{`
        @media (max-width: 767px) {
          .twitch-desktop-ui {
            display: none !important;
          }
        }
      `}</style>
      <div
        className="twitch-desktop-ui"
        style={{
          position: "absolute",
          top: "10px",
          left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(145, 70, 255, 0.9)",
          padding: "0.5rem 1rem",
          borderRadius: "2rem",
          zIndex: 100,
          fontWeight: "bold",
          color: "white",
          boxShadow: "0 4px 10px rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        <div
          style={{
            width: "10px",
            height: "10px",
            borderRadius: "50%",
            background:
              connectionStatus === "connected"
                ? "#00ff00"
                : connectionStatus === "connecting"
                  ? "#ffff00"
                  : "#ff0000",
          }}
        />
        {activeUser
          ? activeUser === "Streamer"
            ? "Estás jugando esta ronda"
            : `${activeUser} está jugando esta ronda`
          : `Escribí !jugar en el chat para jugar la ronda`}

        {activeUser !== "Streamer" && opponentMode !== "streamer" && (
          <button
            onClick={() => forceActiveUser("Streamer")}
            style={{
              marginLeft: "0.2rem",
              background: "white",
              color: "#9146FF",
              border: "none",
              padding: "0.2rem 0.6rem",
              borderRadius: "1rem",
              fontWeight: "bold",
              cursor: "pointer",
              fontSize: "0.8rem",
            }}
          >
            Jugar Yo
          </button>
        )}
      </div>
      <div className={isWaiting ? "hide-game-actions" : ""}>
        <style>{`
          .hide-game-actions .game-actions {
            display: none !important;
          }
        `}</style>
        <TrucoGameView
          {...core}
          user={null}
          roomCode={roomCode}
          rivalName={
            opponentMode === "cpu" ? "CPU" : rivalData?.name || "Streamer"
          }
          showExitModal={showExitModal}
          onExitRequest={() => setShowExitModal(true)}
          onRestartGame={() => {
            core.handleRestartGame();
            core.startGame(
              core.gameMode,
              opponentMode === "cpu" ? "CPU" : "Streamer",
              "",
              points,
              selectedTeams,
            );
          }}
          onPlayCard={wrappedPlayCard}
          onHandleCall={wrappedHandleCall}
          onHandleResponse={wrappedHandleResponse}
          onHandleMazo={wrappedHandleMazo}
          onCloseExit={() => setShowExitModal(false)}
          onConfirmExit={() => {
            setShowExitModal(false);
            setIsConfigured(false);
          }}
          onRulesClick={() => setShowRules(true)}
          activeCountries={core.activeCountries}
        />
      </div>
      <div
        className="twitch-desktop-ui"
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          background: "rgba(24, 24, 27, 0.9)",
          border: "1px solid #9146FF",
          borderRadius: "0.5rem",
          padding: "1rem",
          color: "white",
          fontSize: "0.85rem",
          zIndex: 100,
          boxShadow: "0 0 15px rgba(145, 70, 255, 0.3)",
          pointerEvents: "none",
        }}
      >
        <h4 style={{ margin: "0 0 0.5rem 0", color: "#9146FF" }}>
          Comandos del Chat
        </h4>
        <ul
          style={{
            margin: 0,
            paddingLeft: "1.2rem",
            opacity: 0.9,
            lineHeight: "1.5",
          }}
        >
          <li>
            <b>!jugar</b> - Reservar turno
          </li>
          <li>
            <b>!carta 1/2/3</b> - Jugar carta
          </li>
          <li>
            <b>!truco</b> / <b>!retruco</b> / <b>!valecuatro</b>
          </li>
          <li>
            <b>!envido</b> / <b>!realenvido</b> / <b>!faltaenvido</b>
          </li>
          <li>
            <b>!quiero</b> / <b>!noquiero</b>
          </li>
          <li>
            <b>!mazo</b> - Irse al mazo
          </li>
        </ul>
      </div>
      {/* Waiting Room Modal for Streamer mode */}
      <AnimatePresence>
        {isWaiting && roomCode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0, 0, 0, 0.4)",
              backdropFilter: "blur(5px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 50,
              padding: "1rem",
            }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: -20 }}
              style={{
                background: "rgba(18, 12, 28, 0.85)",
                border: "1px solid rgba(168, 85, 247, 0.3)",
                borderRadius: "1.5rem",
                padding: "2.5rem",
                maxWidth: "400px",
                width: "100%",
                textAlign: "center",
                boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
              }}
            >
              <h3
                style={{
                  fontSize: "1.5rem",
                  color: "#a855f7",
                  marginBottom: "1rem",
                }}
              >
                Sala Creada
              </h3>
              <p style={{ opacity: 0.8, marginBottom: "2rem" }}>
                Ingresa a la pantalla principal desde tu celular o pc, toca en{" "}
                <strong>Jugar Online</strong> e ingresá este código para jugar
                contra el chat:
              </p>
              <div
                style={{
                  fontSize: "3rem",
                  fontWeight: 900,
                  letterSpacing: "0.2em",
                  color: "white",
                  background: "rgba(255,255,255,0.05)",
                  padding: "1rem",
                  borderRadius: "0.5rem",
                  border: "1px solid rgba(255,255,255,0.1)",
                  marginBottom: "2rem",
                }}
              >
                {roomCode}
              </div>

              <p
                style={{
                  fontSize: "0.9rem",
                  color: "#eab308",
                  marginBottom: "2rem",
                }}
                className="animate-pulse"
              >
                Esperando a que te unas...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <RulesModal isOpen={showRules} onClose={() => setShowRules(false)} />
    </div>
  );
}
