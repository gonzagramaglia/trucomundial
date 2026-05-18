import { useCallback } from "react";
import { supabase } from "../../lib/supabase";
import type { GameMode } from "../../lib/truco/types";

export const useMatchmakingBroadcast = (
  sessionId: string,
  gameMode: GameMode,
  matchId: string | null,
  roomInfoRef: React.MutableRefObject<any>
) => {
  const broadcastMove = useCallback(async (payload: any, overrideId?: string) => {
    const finalId = overrideId || matchId;
    if (!finalId || (gameMode !== "multiplayer" && !overrideId)) return;

    const moveData = {
      ...payload,
      senderId: sessionId,
      roomInfo: roomInfoRef?.current || payload.roomInfo
    };

    const { error } = await supabase
      .from('game_sync')
      .upsert({ 
        match_id: finalId, 
        last_move: moveData,
        updated_at: new Date().toISOString()
      }, { onConflict: 'match_id' });

    if (error) console.error("Error syncing move:", error);
  }, [gameMode, matchId, sessionId, roomInfoRef]);

  const cleanupMatch = useCallback(async (overrideId?: string) => {
    const finalId = overrideId || matchId;
    if (!finalId) return;
    await supabase.from('game_sync').delete().eq('match_id', finalId);
  }, [matchId]);

  return { broadcastMove, cleanupMatch };
};
