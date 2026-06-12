import { useState, useRef, useEffect, useCallback } from "react";
import { LandingPage } from "./components/landing/LandingPage";
import { TrucoGameView } from "./components/game/layout/TrucoGameView";
import { supabase } from "./lib/supabase";
import { useTrucoGame } from "./hooks/useTrucoGame";
import { useMatchmaking } from "./hooks/useMatchmaking";
import { saveMatchLogByCode } from "./lib/matches";
import { AnimatePresence } from "framer-motion";
import type { GameMode, PlayerRole } from "./lib/truco/types";
import { ScrollIndicator } from "./components/ui/ScrollIndicator";
import i18n from "./lib/i18n";
import { updateVotesRegistry, snapshotVotesForGame, setGameActive, setTournamentVotesSnapshot } from "./lib/votesStore";
import { TournamentResultModal } from "./components/game/modals/TournamentResultModal";
import { audioManager } from "./lib/audio";
import { CARDS } from "./data/cards";
import { fixtureMatches } from "./lib/fixtureData";
function App() {
  const [user, setUser] = useState<any>(null);
  const [sessionId] = useState(
    () => `sess_${Math.random().toString(36).substr(2, 9)}`,
  );
  const [showExitModal, setShowExitModal] = useState(false);
  const [currentRoomCode, setCurrentRoomCode] = useState<string | null>(null);
  const [isCreator, setIsCreator] = useState(false);
  const [tournamentResult, setTournamentResult] = useState<any>(null);

  useEffect(() => {
    const fetchGlobalVotes = async () => {
      try {
        const { data } = await supabase
          .from('game_sync')
          .select('match_id, last_move')
          .like('match_id', 'user_votes_%');
        
        const { data: resultsData } = await supabase.from('fixture_results').select('match_id, score_a, score_b, status');
        
        let fixtureStars: Record<string, number> = {};
        if (resultsData) {
          resultsData.forEach(r => {
            const match = fixtureMatches.find(m => m.id === r.match_id);
            if (match && r.status === 'finished') {
              if (r.score_a > r.score_b) {
                fixtureStars[match.teamA] = (fixtureStars[match.teamA] || 0) + 2;
              } else if (r.score_b > r.score_a) {
                fixtureStars[match.teamB] = (fixtureStars[match.teamB] || 0) + 2;
              } else {
                fixtureStars[match.teamA] = (fixtureStars[match.teamA] || 0) + 1;
                fixtureStars[match.teamB] = (fixtureStars[match.teamB] || 0) + 1;
              }
            }
          });
        }

        const aggregate: Record<string, number> = {};
        if (data) {
          data.forEach(item => {
            const votes = item.last_move?.votes;
            if (votes && typeof votes === 'object') {
              Object.entries(votes).forEach(([cardId, count]) => {
                if (typeof count === 'number') {
                  aggregate[cardId] = (aggregate[cardId] || 0) + count;
                }
              });
            }
          });
        }
          
        CARDS.forEach(c => {
          const base = c.country === 'Argentina' ? 3 : c.country === 'Francia' ? 2 : c.country === 'Croacia' ? 1 : 0;
          const fix = fixtureStars[c.country] || 0;
          aggregate[c.id] = Math.min(999, (aggregate[c.id] || 0) + base + fix);
        });

        updateVotesRegistry(aggregate);
      } catch (err) {
        console.error('Error fetching global votes on init:', err);
      }
    };
    fetchGlobalVotes();
    audioManager.preloadAll();
  }, []);

  const syncRef = useRef<((data: any) => void) | null>(null);
  const roomInfoRef = useRef<any>(null);

  const stableHandleSync = useCallback((data: any) => {
    if (syncRef.current) syncRef.current(data);
  }, []);

  const core = useTrucoGame(sessionId, stableHandleSync);
  const actualIsHost = currentRoomCode
    ? isCreator
    : sessionId && core.rivalId
      ? sessionId < core.rivalId
      : false;

  const { broadcastMove } = useMatchmaking({
    sessionId,
    user,
    gameMode: core.gameMode,
    rivalId: core.rivalId,
    isHost: actualIsHost,
    matchId: currentRoomCode, // Use the room code as match identifier
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
    wrappedHandleCall: (t: any, l: number, c: PlayerRole, r: boolean) =>
      wrappedHandleCall(t, l, c, r),
    wrappedHandleResponse: (w: boolean, r: boolean) =>
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
    setIsRivalConnected: core.setIsRivalConnected,
    setIsSelfConnected: core.setIsSelfConnected,
    isSelfConnected: core.isSelfConnected,
    handWinners: core.handWinners,
    trucoState: core.trucoState,
    envidoState: core.envidoState,
    maxPoints: core.maxPoints,
  });

  useEffect(() => {
    core.setIsHost(actualIsHost);
    core.setMyIndex(actualIsHost ? 0 : 1);
  }, [actualIsHost, core.setIsHost, core.setMyIndex]);

  useEffect(() => {
    syncRef.current = (data: any) => {
      if (core.gameMode === "multiplayer" && actualIsHost) {
        broadcastMove({
          type: "sync",
          playerHand: data.playerHand,
          cpuHand: data.cpuHand,
          starter: data.starter,
        });
      }
    };
  }, [core.gameMode, actualIsHost, broadcastMove]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const isPlayingRef = useRef(false);

  const wrappedPlayCard = (card: any) => {
    if (core.isBusy || isPlayingRef.current) return;
    isPlayingRef.current = true;
    const move = core.playCard(card);
    if (move && core.gameMode === "multiplayer") {
      broadcastMove({ type: "playCard", card });
    }
    setTimeout(() => {
      isPlayingRef.current = false;
    }, 300);
  };

  const wrappedHandleCall = (
    type: "truco" | "envido",
    level: number,
    caller: PlayerRole,
    isRemote: boolean = false,
  ) => {
    core.handleCall(type, level, caller);
    if (core.gameMode === "multiplayer" && !isRemote && caller === "player") {
      broadcastMove({ type: "call", callType: type, level });
    }
  };

  const wrappedHandleResponse = (wants: boolean, isRemote: boolean = false) => {
    core.handleResponse(wants, isRemote);
    if (core.gameMode === "multiplayer" && !isRemote) {
      broadcastMove({ type: "response", wants });
    }
  };

  const wrappedHandleMazo = (isRemote: boolean = false) => {
    core.handleMazo(isRemote);
    if (core.gameMode === "multiplayer" && !isRemote) {
      broadcastMove({ type: "mazo" });
    }
  };

  const startGameWithSync = (
    mode: GameMode,
    points: number,
    rName?: string,
    rId?: string,
    isCreatorFlag?: boolean,
    roomCode?: string,
    isReconnecting?: boolean,
    selectedTeams?: string[],
  ) => {
    snapshotVotesForGame();
    setGameActive(true);

    if (selectedTeams) {
      core.setActiveCountries(selectedTeams);
    }

    const isHostForThisMatch =
      mode === "multiplayer" ? isCreatorFlag || false : false;
    setIsCreator(isHostForThisMatch);
    setCurrentRoomCode(roomCode || null);

    if (mode === "multiplayer") {
      const actualIsHost = isHostForThisMatch;
      const myId = user?.id || sessionId;
      const myName =
        user?.user_metadata?.full_name?.split(" ")[0] ||
        (actualIsHost ? i18n.t("host") : i18n.t("guest"));

      roomInfoRef.current = {
        creatorId: actualIsHost ? myId : rId,
        creatorName: actualIsHost ? myName : rName,
        guestId: actualIsHost ? rId : myId,
        guestName: actualIsHost ? rName : myName,
        points: points,
      };

      core.setIsHost(actualIsHost);
      core.setMyIndex(actualIsHost ? 0 : 1);

      if (isReconnecting) {
        core.setGameMode(mode);
        core.setRivalId(rId || "");
        core.setRivalName(rName || "RIVAL");
        core.setMaxPoints(points);
        core.setGameState("playing");
        core.setIsGameStarting(true);
        core.setShowCountdown(true);

        setTimeout(() => {
          broadcastMove(
            {
              type: "reconnect_request",
              requesterRole: actualIsHost ? "host" : "guest",
              requesterId: myId,
            },
            roomCode,
          );
        }, 1000);
      } else if (actualIsHost) {
        core.setGameMode(mode);
        core.setRivalId(rId || "");
        core.setRivalName(rName || "RIVAL");
        const syncData = core.startGame(
          mode,
          rName || "RIVAL",
          rId || "",
          points,
          selectedTeams,
        );
        if (syncData) {
          setTimeout(() => {
            console.log(
              "Host enviando cartas iniciales vía broadcastMove...",
              roomCode,
            );
            broadcastMove(
              {
                type: "sync",
                starter: syncData.starter,
                playerHand: syncData.playerHand,
                cpuHand: syncData.cpuHand,
                maxPoints: points,
                senderId: sessionId,
                senderName:
                  user?.user_metadata?.full_name?.split(" ")[0] ||
                  i18n.t("host"),
              },
              roomCode,
            );
          }, 1000);
          core.setIsGameStarting(true);
          core.setShowCountdown(true);
          setTimeout(() => {
            core.setIsGameStarting(false);
            core.setShowCountdown(false);
          }, 4500);
        }
      } else {
        // Guest MUST set "playing" to see the board, but doesn't startGame()
        core.setGameMode(mode);
        core.setRivalId(rId || "");
        core.setRivalName(rName || "RIVAL");
        core.setMaxPoints(points);
        core.setGameState("playing");
        core.setIsGameStarting(true);
        core.setShowCountdown(true);
        setTimeout(() => {
          core.setIsGameStarting(false);
          core.setShowCountdown(false);
        }, 3000);
      }
    } else {
      // Local modes
      core.startGame(mode, rName || "CPU", rId || "", points, selectedTeams);
    }
  };

  const handleConfirmExit = () => {
    setGameActive(false);
    setTournamentVotesSnapshot(null);
    setShowExitModal(false);
    core.setWinnerModal(null);
    core.handleRestartGame();
    core.setRivalName("CPU");
    core.setGameState("landing");
    setTournamentResult(null);
  };

  // Persist match logs to tournament_matches when a match finishes and a room code exists
  useEffect(() => {
    const saveIfTournamentMatch = async () => {
      if (!core.winnerModal || !currentRoomCode) return;
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const userId = session?.user?.id;
        const summary = {
          winner: core.winnerModal,
          myScore: core.score.player,
          rivalScore: core.score.cpu,
          userId: userId || null,
          date: new Date().toISOString(),
          log: core.matchLog,
        };
        const winnerId = core.winnerModal === "player" ? userId : (core.rivalId || undefined);
        const result = await saveMatchLogByCode(currentRoomCode, summary, winnerId, userId);
        console.log("Saved tournament match log for code", currentRoomCode);
        
        if (result && result.finalPlacement && result.finalPlacement > 0) {
          setTournamentResult({
             finalPlacement: result.finalPlacement,
             pointsEarned: result.pointsEarned || 0,
             prizes: result.prizes || [],
             tournamentName: result.tournamentName || "Torneo"
          });
        }
      } catch (err) {
        console.error("Failed saving tournament match log:", err);
      }
    };
    saveIfTournamentMatch();
  }, [core.winnerModal, currentRoomCode, core.score.player, core.score.cpu]);

  return (
    <main style={{ minHeight: "100vh" }}>
      <AnimatePresence mode="wait">
        {core.gameState === "landing" ? (
          <LandingPage
            key="landing"
            sessionId={sessionId}
            onStart={startGameWithSync}
          />
        ) : (
          <>
            <ScrollIndicator />
            <TrucoGameView
              key="game"
              user={user}
              {...core}
              roomCode={currentRoomCode}
              rivalName={core.rivalName}
              showExitModal={showExitModal}
              onExitRequest={() => setShowExitModal(true)}
              onRestartGame={core.handleRestartGame}
              onPlayCard={wrappedPlayCard}
              onHandleCall={wrappedHandleCall}
              onHandleResponse={wrappedHandleResponse}
              onHandleMazo={wrappedHandleMazo}
              onCloseExit={() => setShowExitModal(false)}
              onConfirmExit={handleConfirmExit}
              activeCountries={core.activeCountries}
            />
          </>
        )}
      </AnimatePresence>
      <TournamentResultModal
        isOpen={!!tournamentResult}
        onClose={() => setTournamentResult(null)}
        result={tournamentResult}
      />
    </main>
  );
}

export default App;
