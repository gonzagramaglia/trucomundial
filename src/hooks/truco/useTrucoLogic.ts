import { useCallback } from "react";
import type { Card } from "../../data/cards";
import { CARDS } from "../../data/cards";
import { calculateEnvido } from "../../lib/truco/engine";
import i18n from "../../lib/i18n";
import { audioManager } from "../../lib/audio";

export const useTrucoLogic = (state: any) => {
  const {
    setScore, setTrucoState, setEnvidoState, setPendingAction, setSuspendedTruco,
    setHandWinners, setIsRoundEnding, setIsCooldown, setStarterIdx, setDealerIdx,
    setPlayerHand, setCpuHandCount, setPlayedCards, setHandWinningCardIds, setRoundWinningCardId,
    setActiveCall, setScorePopups, setPlayerFolded,
    playerHandRef, cpuHandRef, starterIdx, gameMode, lastProcessedHandRef, resetLockRef, setMatchLog,
    activeCountriesRef
  } = state;

  const triggerCall = useCallback((text: string, color: string = "var(--color-primary)") => {
    const id = Date.now();
    setActiveCall({ text, id, color });
    setTimeout(() => setActiveCall((prev: any) => prev?.id === id ? null : prev), 2000);
  }, [setActiveCall]);

  const addPoints = useCallback((side: "player" | "cpu", points: number, reason?: string) => {
    setScore((prev: any) => {
      const newScore = { ...prev, [side]: prev[side] + points };
      return newScore;
    });
    const id = Date.now() + Math.random();
    setScorePopups((prev: any) => [...prev, { id, points, side, reason }]);
    setTimeout(() => setScorePopups((prev: any) => prev.filter((p: any) => p.id !== id)), 3000);
  }, [setScore, setScorePopups]);

  const generateRoundData = useCallback((remoteHands?: { player: Card[], cpu: Card[] }, forcedStarter?: number, overrideCountries?: string[]) => {
    let pHand, cHand;
    if (remoteHands) {
      pHand = remoteHands.player;
      cHand = remoteHands.cpu;
    } else {
      const countriesToUse = overrideCountries || activeCountriesRef.current;
      const filteredCards = CARDS.filter(c => countriesToUse.includes(c.country));
      const deck = [...filteredCards].sort(() => Math.random() - 0.5);
      
      pHand = deck.slice(0, 3);
      cHand = deck.slice(3, 6);
    }
    const nextStarter = forcedStarter !== undefined ? forcedStarter : (starterIdx + 1) % (gameMode === "2v2" ? 4 : 2);
    return { playerHand: pHand, cpuHand: cHand, starter: nextStarter };
  }, [gameMode, starterIdx, activeCountriesRef]);

  const applyRoundData = useCallback((data: { playerHand: Card[], cpuHand: Card[], starter: number }) => {
    setIsRoundEnding(false);
    setIsCooldown(false);
    setTrucoState({ level: 0, caller: null, status: "none" });
    setEnvidoState({ level: 0, caller: null, status: "none" });
    setPendingAction(null);
    setHandWinners([]);
    setPlayedCards([]);
    setHandWinningCardIds([]);
    setRoundWinningCardId(null);
    setSuspendedTruco(null);
    setPlayerFolded(false);
    lastProcessedHandRef.current = -1;
    
    setPlayerHand(data.playerHand);
    cpuHandRef.current = data.cpuHand;
    setCpuHandCount(data.cpuHand.length);
    setStarterIdx(data.starter);
    setDealerIdx((data.starter + (gameMode === "2v2" ? 3 : 1)) % (gameMode === "2v2" ? 4 : 2));
    
    setTimeout(() => { resetLockRef.current = false; }, 800);
  }, [gameMode, setTrucoState, setEnvidoState, setPendingAction, setHandWinners, setPlayedCards, setHandWinningCardIds, setRoundWinningCardId, setSuspendedTruco, setPlayerHand, setCpuHandCount, setStarterIdx, setDealerIdx, setIsRoundEnding, setIsCooldown, setPlayerFolded, cpuHandRef, lastProcessedHandRef, resetLockRef]);

  const resetRound = useCallback((remoteHands?: { player: Card[], cpu: Card[] }, forcedStarter?: number, overrideCountries?: string[]) => {
    if (resetLockRef.current) return;
    if (state.score.player >= state.maxPoints || state.score.cpu >= state.maxPoints) return;
    resetLockRef.current = true;
    const data = generateRoundData(remoteHands, forcedStarter, overrideCountries);
    applyRoundData(data);
    return data;
  }, [generateRoundData, applyRoundData, resetLockRef]);

  const clearRoundData = useCallback(() => {
    setPlayerHand([]);
    cpuHandRef.current = [];
    setCpuHandCount(0);
    setPlayedCards([]);
    setHandWinners([]);
    setHandWinningCardIds([]);
    setRoundWinningCardId(null);
    setPendingAction(null);
  }, [setPlayerHand, setCpuHandCount, setPlayedCards, setHandWinners, setHandWinningCardIds, setRoundWinningCardId, setPendingAction, cpuHandRef]);

  const resolveEnvido = useCallback(() => {
    const pPoints = calculateEnvido(playerHandRef.current);
    const cPoints = calculateEnvido(cpuHandRef.current);
    const isPlayerMano = starterIdx === 0;
    
    setIsCooldown(true);

      // 1st speaker (Mano)
      setTimeout(() => {
        if (isPlayerMano) {
          setMatchLog((prev: string[]) => [...prev, `Vos (Mano) cantás envido con: ${pPoints} puntos`]);
          const text = pPoints >= 10 ? i18n.t("have_points_high", { points: pPoints }) : i18n.t("have_points_low", { points: pPoints });
          triggerCall(text, "#00f2ff");
          audioManager.playTengo(pPoints, "player");
        } else {
          setMatchLog((prev: string[]) => [...prev, `El Rival (Mano) canta envido con: ${cPoints} puntos`]);
          const text = cPoints >= 10 ? i18n.t("have_points_high", { points: cPoints }) : i18n.t("have_points_low", { points: cPoints });
          triggerCall(text, "#F77502");
          audioManager.playTengo(cPoints, "cpu");
        }

        // 2nd speaker (Response)
        setTimeout(() => {
          let pts = 0;
          if (state.envidoState.level === 4) {
            const leaderScore = Math.max(state.score.player, state.score.cpu);
            const target = (state.maxPoints === 30 && leaderScore < 15) ? 15 : state.maxPoints;
            pts = Math.max(1, target - leaderScore);
          } else {
            pts = state.envidoState.accumulated || 2;
          }

          const envidoLevel = state.envidoState.level;
          let envidoName = "el envido";
          if (envidoLevel === 2) envidoName = "el envido envido";
          if (envidoLevel === 3) envidoName = "el real envido";
          if (envidoLevel === 4) envidoName = "el falta envido";

          const playerWinMsg = `Ganaste ${envidoName}`;
          const cpuWinMsg = `Te ganó ${envidoName}`;
          
          const pWins = pPoints > cPoints || (pPoints === cPoints && isPlayerMano);
          
          if (isPlayerMano) {
            if (pWins) {
              setMatchLog((prev: string[]) => [...prev, `El Rival responde: son buenas. Ganás ${pts} puntos de Envido.`]);
              triggerCall(i18n.t("call_son_buenas"), "#F77502");
              audioManager.playSonBuenas("cpu");
              addPoints("player", pts, playerWinMsg);
            } else {
              setMatchLog((prev: string[]) => [...prev, `El Rival responde: tengo ${cPoints}. El Rival gana ${pts} puntos de Envido.`]);
              triggerCall(i18n.t("call_son_mejores", { points: cPoints }), "#F77502");
              audioManager.playSonMejores(cPoints, "cpu");
              addPoints("cpu", pts, cpuWinMsg);
            }
          } else {
            if (pWins) {
              setMatchLog((prev: string[]) => [...prev, `Vos respondés: tengo ${pPoints}. Ganás ${pts} puntos de Envido.`]);
              triggerCall(i18n.t("call_son_mejores", { points: pPoints }), "#00f2ff");
              audioManager.playSonMejores(pPoints, "player");
              addPoints("player", pts, playerWinMsg);
            } else {
              setMatchLog((prev: string[]) => [...prev, `Vos respondés: son buenas. El Rival gana ${pts} puntos de Envido.`]);
              triggerCall(i18n.t("call_son_buenas"), "#00f2ff");
              audioManager.playSonBuenas("player");
              addPoints("cpu", pts, cpuWinMsg);
            }
          }

        if (state.suspendedTruco) {
          setTimeout(() => {
            setPendingAction(state.suspendedTruco);
            setSuspendedTruco(null);
            triggerCall(
              state.suspendedTruco.level === 1 ? i18n.t("call_truco") : (state.suspendedTruco.level === 2 ? i18n.t("call_retruco") : i18n.t("call_vale_4")),
              (state.suspendedTruco.caller === "player" || state.suspendedTruco.caller === "partner") ? "var(--color-accent)" : "#F77502"
            );
            setIsCooldown(false);
          }, 1500);
        } else {
          setIsCooldown(false);
        }
        setEnvidoState((prev: any) => ({ ...prev, status: "finished" }));
      }, 2500);
    }, 1500);
  }, [playerHandRef, cpuHandRef, starterIdx, triggerCall, addPoints, setEnvidoState, setIsCooldown, setPendingAction, setSuspendedTruco, state.envidoState, state.score, state.maxPoints, state.suspendedTruco, setMatchLog]);

  return {
    triggerCall, addPoints, resetRound, generateRoundData, applyRoundData, clearRoundData, resolveEnvido
  };
};
