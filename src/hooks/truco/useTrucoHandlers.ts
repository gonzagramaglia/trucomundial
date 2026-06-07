import { useCallback, useRef, useEffect } from "react";
import type { Card } from "../../data/cards";
import type { PlayerRole } from "../../lib/truco/types";
import i18n from "../../lib/i18n";
import { audioManager } from "../../lib/audio";

export const useTrucoHandlers = (state: any, logic: any) => {
  const {
    setPlayerHand, setPlayedCards, setTrucoState, setEnvidoState, setPendingAction, setSuspendedTruco, setIsRoundEnding, setIsCooldown, setActiveCall, setPlayerFolded,
    isRoundEnding, isCooldown, pendingAction, trucoState, envidoState, suspendedTruco, gameMode, isHost, setMatchLog
  } = state;
  const { triggerCall, addPoints, resetRound, resolveEnvido } = logic;

  const handleMazo = useCallback((remote: boolean = false) => {
    const win = remote ? "player" : "cpu";
    if (!remote) {
      setPlayerFolded(true);
    }
    
    const pts = trucoState.status === "accepted"
      ? (trucoState.level + 1)
      : (trucoState.level + 1 + (envidoState.status === "none" || envidoState.status === "pending" ? 1 : 0));
      
    const reason = remote ? "Se fue al mazo" : "Te fuiste al mazo";
    triggerCall(reason, "#ffffff");
    audioManager.playAlMazo(remote ? "cpu" : "player");
    
    const logMessage = remote ? "El Rival se fue al mazo." : "Te fuiste al mazo.";
    setMatchLog((prev: string[]) => [...prev, `${logMessage} ${remote ? 'Ganaste' : 'Perdiste'} ${pts} puntos.`]);

    addPoints(win, pts, reason);
    setIsRoundEnding(true);
    if (gameMode !== "multiplayer" || isHost) {
      setTimeout(() => resetRound(), 4500);
    }
  }, [trucoState.level, envidoState.status, triggerCall, addPoints, setIsRoundEnding, resetRound, isHost, gameMode, setPlayerFolded, setMatchLog]);

  const playedCardsTracker = useRef(new Set<string>());

  useEffect(() => {
    if (state.playedCards && state.playedCards.length === 0) {
      playedCardsTracker.current.clear();
    }
  }, [state.playedCards]);

  const playCard = useCallback((card: Card) => {
    if (isRoundEnding || isCooldown || pendingAction) return null;
    if (playedCardsTracker.current.has(card.id)) return null;
    
    playedCardsTracker.current.add(card.id);
    setMatchLog((prev: string[]) => [...prev, `Jugaste a ${card.name} (${card.country})`]);
    setPlayerHand((prev: Card[]) => prev.filter(c => c.id !== card.id));
    setPlayedCards((prev: any[]) => [...prev, { ...card, owner: "player", id: `${card.id}_${Date.now()}` }]);
    return card;
  }, [isRoundEnding, isCooldown, pendingAction, setPlayerHand, setPlayedCards, setMatchLog]);

  const handleCall = useCallback((type: "truco" | "envido", level: number, caller: PlayerRole) => {
    let text = "";
    let rawCallForAudio = "";
    if (type === "truco") {
      rawCallForAudio = level === 1 ? "truco" : (level === 2 ? "re truco" : "vale cuatro");
      text = level === 1 ? i18n.t("call_truco") : (level === 2 ? i18n.t("call_retruco") : i18n.t("call_vale_4"));
    } else {
      if (pendingAction && pendingAction.type === "truco") {
        rawCallForAudio = "el envido esta primero";
        text = i18n.t("envido_is_first");
      } else if (level === 3) { rawCallForAudio = "real envido"; text = i18n.t("call_real_envido"); }
      else if (level === 4) { rawCallForAudio = "falta envido"; text = i18n.t("call_falta_envido"); }
      else { rawCallForAudio = "envido"; text = i18n.t("call_envido"); }
    }

    audioManager.playCall(rawCallForAudio, caller);

    const speaker = (caller === "player" || caller === "partner") ? "Vos" : "El Rival";
    setMatchLog((prev: string[]) => [...prev, `${speaker} cantó ${text}`]);

    const isPlayer = caller === "player" || caller === "partner";
    const color = !isPlayer ? "#F77502" : (type === "envido" ? "#00f2ff" : "var(--color-accent)");
    triggerCall(text, color);

    if (type === "truco") {
      setTrucoState({ status: "pending", level, caller });
      setPendingAction({ type, level, caller });
    } else {
      if (pendingAction && pendingAction.type === "truco") {
        setSuspendedTruco(pendingAction);
      }
      
      setEnvidoState((prev: any) => {
        const levelPoints: Record<number, number> = { 1: 2, 2: 2, 3: 3, 4: 0 };
        const callValue = levelPoints[level] || 0;
        return { 
          status: "pending", 
          level, 
          caller, 
          prevLevel: prev.level,
          prevAccumulated: prev.accumulated || 0, // Guardamos lo que ya estaba querido
          accumulated: (prev.accumulated || 0) + callValue
        };
      });
      setPendingAction({ type, level, caller });
    }
  }, [triggerCall, pendingAction, setTrucoState, setPendingAction, setSuspendedTruco, setEnvidoState, setMatchLog]);

  const handleResponse = useCallback((accept: boolean, remote: boolean = false) => {
    if (!pendingAction) return 0;
    const resp = remote ? "cpu" : "player";
    const responderName = remote ? "El Rival" : "Vos";
    const isEnvidoResp = pendingAction && pendingAction.type === "envido";
    const color = remote ? "#F77502" : (isEnvidoResp ? "#00f2ff" : "var(--color-accent)");
    triggerCall(accept ? i18n.t("call_quiero") : i18n.t("call_no_quiero"), color);
    audioManager.playResponse(accept, remote ? "cpu" : "player");

    setMatchLog((prev: string[]) => [...prev, `${responderName} respondió: ${accept ? 'QUIERO' : 'NO QUIERO'}`]);

    if (accept) {
      if (pendingAction.type === "truco") {
        setTrucoState((prev: any) => ({ ...prev, status: "accepted" }));
      } else {
        setEnvidoState((prev: any) => ({ ...prev, status: "accepted" }));
        resolveEnvido();
      }
    } else {
      let pts = 1;
      if (pendingAction.type === "envido") {
        // En el rechazo, cobramos lo que ya estaba acumulado antes de esta apuesta
        pts = Math.max(1, envidoState.prevAccumulated || 0);
      } else {
        pts = pendingAction.level === 1 ? 1 : pendingAction.level - 1;
      }

      const winnerText = resp === "player" ? "El Rival gana" : "Ganaste";
      setMatchLog((prev: string[]) => [...prev, `Al no querer, ${winnerText} ${pts} puntos.`]);

      const isPlayerResponder = resp === "player";
      const reason = pendingAction.type === "envido" ? (isPlayerResponder ? "No quisiste Envido" : "No quiso Envido") :
        pendingAction.level === 1 ? (isPlayerResponder ? "No quisiste Truco" : "No quiso Truco") :
        pendingAction.level === 2 ? (isPlayerResponder ? "No quisiste Retruco" : "No quiso Retruco") : 
        (isPlayerResponder ? "No quisiste Vale 4" : "No quiso Vale 4");
      addPoints(resp === "player" ? "cpu" : "player", pts, reason);
      if (pendingAction.type === "truco") {
        setIsRoundEnding(true);
        if (gameMode !== "multiplayer") {
          setTimeout(() => resetRound(), 4500);
        }
      }
      else {
        setEnvidoState((prev: any) => ({ ...prev, status: "finished" }));
        if (suspendedTruco) {
          setTimeout(() => {
            setPendingAction(suspendedTruco);
            setSuspendedTruco(null);
            triggerCall(
              suspendedTruco.level === 1 ? i18n.t("call_truco") : (suspendedTruco.level === 2 ? i18n.t("call_retruco") : i18n.t("call_vale_4")),
              (suspendedTruco.caller === "player" || suspendedTruco.caller === "partner") ? "var(--color-accent)" : "var(--color-secondary)"
            );
            setIsCooldown(false);
          }, 1500);
        } else {
          setIsCooldown(false);
        }
      }
    }

    setPendingAction(null);
    return 0;
  }, [pendingAction, envidoState.prevAccumulated, suspendedTruco, triggerCall, setTrucoState, setEnvidoState, resolveEnvido, addPoints, setIsRoundEnding, resetRound, setPendingAction, setSuspendedTruco, setIsCooldown, setActiveCall, setMatchLog]);

  return {
    handleMazo, playCard, handleCall, handleResponse
  };
};
