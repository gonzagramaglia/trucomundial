import { useEffect } from "react";
import { determineWinner, getCardValue } from "../../lib/truco/engine";
import { supabase } from "../../lib/supabase";

export const useTrucoEffects = (state: any, logic: any) => {
  const {
    playedCards, gameMode, isRoundEnding, isCooldown, trucoState, starterIdx, isHost,
    setIsCooldown, setIsRoundEnding, setHandWinners, setHandWinningCardIds, setRoundWinningCardId, setShowCountdown,
    lastProcessedHandRef, handWinners, score, maxPoints, setWinnerModal, setGameState, matchLog
  } = state;

  const { addPoints, resetRound, clearRoundData, triggerCall } = logic;

  // --- Match Winner Effect ---
  useEffect(() => {
    console.log("[SCORE CHECK]", score.player, score.cpu, "Target:", maxPoints);
    
    const saveMatchHistory = async (finalWinner: "player" | "cpu") => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;
        if (!user || gameMode !== "multiplayer") return;

        const uniqueHistoryId = `user_history_${user.id}_rem_${Date.now()}`;
        const summary = {
          type: "match_summary",
          userId: user.id,
          rivalName: state.rivalName || "CPU",
          myScore: score.player,
          rivalScore: score.cpu,
          winner: finalWinner,
          date: new Date().toISOString(),
          log: matchLog
        };

        const { error } = await supabase
          .from('game_sync')
          .upsert({
            match_id: uniqueHistoryId,
            last_move: summary,
            updated_at: new Date().toISOString()
          }, { onConflict: 'match_id' });

        if (error) {
          console.error("Error saving match history to Supabase:", error);
        } else {
          console.log("Successfully saved match history to Supabase!");
        }
      } catch (err) {
        console.error("Unexpected error saving match history:", err);
      }
    };

    if (score.player >= maxPoints) {
      console.log("[WINNER] Player Wins!");
      setWinnerModal("player");
      setGameState("winner");
      saveMatchHistory("player");
    } else if (score.cpu >= maxPoints) {
      console.log("[WINNER] CPU Wins!");
      setWinnerModal("cpu");
      setGameState("winner");
      saveMatchHistory("cpu");
    }
  }, [score.player, score.cpu, maxPoints, setWinnerModal, setGameState, gameMode, matchLog, state.rivalName]);

  // --- Hand Resolution Effect ---
  useEffect(() => {
    const cardsPerHand = gameMode === "2v2" ? 4 : 2;
    const currentHandIdx = Math.floor((playedCards.length - 1) / cardsPerHand);
    
    if (playedCards.length > 0 && playedCards.length % cardsPerHand === 0 && !isRoundEnding && !isCooldown) {
      if (lastProcessedHandRef.current === currentHandIdx) return;
      lastProcessedHandRef.current = currentHandIdx;
      
      setIsCooldown(true);

      setTimeout(() => {
        const currentHandCards = playedCards.slice(-cardsPerHand);
        const handWinner = determineWinner(currentHandCards);
        const newWinners = [...handWinners, handWinner];

        // --- Robust Truco Round Logic ---
        let roundWinner: "player" | "cpu" | null = null;
        const h1 = newWinners[0], h2 = newWinners[1];
        const isP = (w: any) => w === "player" || w === "partner";
        const isC = (w: any) => w === "cpu" || w === "cpu2" || w === "opponent2";

        if (newWinners.length === 2) {
          if (isP(h1) && isP(h2)) roundWinner = "player";
          else if (isC(h1) && isC(h2)) roundWinner = "cpu";
          else if (h1 === "draw" && isP(h2)) roundWinner = "player";
          else if (h1 === "draw" && isC(h2)) roundWinner = "cpu";
          else if (isP(h1) && h2 === "draw") roundWinner = "player";
          else if (isC(h1) && h2 === "draw") roundWinner = "cpu";
        } else if (newWinners.length === 3) {
          const pWins = newWinners.filter(isP).length;
          const cWins = newWinners.filter(isC).length;
          if (pWins > cWins) roundWinner = "player";
          else if (cWins > pWins) roundWinner = "cpu";
          else {
            if (h1 !== "draw") roundWinner = isP(h1) ? "player" : "cpu";
            else if (h2 !== "draw") roundWinner = isP(h2) ? "player" : "cpu";
            else roundWinner = starterIdx === 0 ? "player" : "cpu"; 
          }
        }

        setHandWinners(newWinners);

        // Track winning cards
        let winningCard: any = undefined;
        if (handWinner === "draw") {
          let maxVal = -1;
          currentHandCards.forEach((c: any) => {
            const val = getCardValue(c);
            if (val > maxVal) maxVal = val;
          });
          const tiedCards = currentHandCards.filter((c: any) => getCardValue(c) === maxVal);
          const tiedCardIds = tiedCards.map((c: any) => c.id);
          setHandWinningCardIds((prev: string[]) => [...prev, ...tiedCardIds]);
        } else {
          winningCard = currentHandCards.find((c: any) => c.owner === handWinner);
          if (winningCard) setHandWinningCardIds((prev: string[]) => [...prev, winningCard.id]);
        }

        if (roundWinner) {
          triggerCall(roundWinner === "player" ? "¡Ganaste la ronda!" : "Perdiste la ronda...", roundWinner === "player" ? "#eab308" : "#f97316");
        }

        // Delay the transition by 1 second so the player has time to see the winner/loser highlights on the table
        setTimeout(() => {
          if (roundWinner) {
            setIsRoundEnding(true);
            setShowCountdown(true);
            
            const points = trucoState.level + 1;
            const winnerStr = roundWinner === "player" ? "Vos" : "El Rival";
            state.setMatchLog((prev: string[]) => [...prev, `★ Fin de la ronda. Gana ${winnerStr} por ${points} puntos.`]);

            if (winningCard) setRoundWinningCardId(winningCard.id);
            
            if (gameMode !== "multiplayer" || isHost) {
              const trucoLabel = points === 1 ? "la Ronda" : points === 2 ? "el Truco" : points === 3 ? "el Retruco" : "el Vale 4";
              const reason = roundWinner === "player" ? `Ganaste ${trucoLabel}` : `Ganó ${trucoLabel}`;
              addPoints(roundWinner, points, reason);
            }
            
            state.setRoundResult(roundWinner === "player" ? "win" : "loss");

            // Clear visual countdown message shortly after (4s)
            setTimeout(() => {
              setShowCountdown(false);
              state.setRoundResult(null);
            }, 4000);
          } else {
            setIsCooldown(false);
          }
        }, 2000);
      }, 1000);
    }
  }, [playedCards.length, gameMode, isRoundEnding, isCooldown, trucoState.level, starterIdx, isHost, addPoints, clearRoundData, setIsCooldown, setIsRoundEnding, setHandWinners, setHandWinningCardIds, setRoundWinningCardId, setShowCountdown, lastProcessedHandRef, handWinners, state.setMatchLog]);

  // Dedicated Round Reset Effect (Crucial for Multiplayer stability)
  useEffect(() => {
    if (isRoundEnding && (gameMode !== "multiplayer" || isHost)) {
      const timer = setTimeout(() => {
        resetRound();
        setIsRoundEnding(false);
        setIsCooldown(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isRoundEnding, isHost, gameMode, resetRound, setIsRoundEnding, setIsCooldown]);
};
