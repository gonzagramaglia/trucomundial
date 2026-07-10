import { supabase } from "./supabase";

function genCode(len = 8) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < len; i++)
    out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

/** Represents a tournament match row in the database. */
export type MatchRow = {
  id?: string;
  tournament_id: string;
  round: number;
  match_position: number;
  match_code?: string;
  player_a_id?: string | null;
  player_b_id?: string | null;
  winner_id?: string | null;
  ended_at?: string | null;
  log?: any;
};

/**
 * Generates unique match codes and inserts match records for a tournament bracket.
 * @param tournamentId - The tournament to create matches for
 * @param rows - Array of match definitions (round, position, players)
 */
export async function generateMatchCodes(
  tournamentId: string,
  rows: MatchRow[],
) {
  const payload = rows.map((r) => ({
    tournament_id: tournamentId,
    round: r.round,
    match_position: r.match_position,
    match_code: genCode(8),
    player_a_id: r.player_a_id || null,
    player_b_id: r.player_b_id || null,
  }));

  const { data, error } = await supabase
    .from("tournament_matches")
    .insert(payload);
  if (error) throw error;
  return data;
}

/** Saves a game log and marks a match as ended by match ID. */
export async function saveMatchLog(matchId: string, log: unknown) {
  const { data, error } = await supabase
    .from("tournament_matches")
    .update({ log: log, ended_at: new Date().toISOString() })
    .eq("id", matchId);
  if (error) throw error;
  return data;
}

/**
 * Saves a match result by code, advances the winner to the next bracket round,
 * and updates global leaderboard stats.
 * @param matchCode - The unique match code
 * @param log - Game log data to persist
 * @param winnerId - ID of the winning user (if determined)
 * @param myUserId - Current user's ID for leaderboard calculation
 * @returns Match data with placement, points earned, and prizes
 */
export async function saveMatchLogByCode(matchCode: string, log: unknown, winnerId?: string, myUserId?: string) {
  const { data: currentMatch, error: fetchError } = await supabase
    .from("tournament_matches")
    .select("*")
    .eq("match_code", matchCode)
    .single();

  if (fetchError || !currentMatch) {
    console.error("Match not found for code", matchCode);
    return null;
  }

  // Update current match
  const updatePayload: any = { log, ended_at: new Date().toISOString() };
  if (winnerId) {
    updatePayload.winner_id = winnerId;
  }

  const { data, error } = await supabase
    .from("tournament_matches")
    .update(updatePayload)
    .eq("id", currentMatch.id)
    .select()
    .single();

  if (error) throw error;

  // Auto-advance logic
  if (winnerId) {
    const nextRound = currentMatch.round + 1;
    const nextPosition = Math.floor(currentMatch.match_position / 2);

    const { data: nextMatch } = await supabase
      .from("tournament_matches")
      .select("id, player_a_id, player_b_id")
      .eq("tournament_id", currentMatch.tournament_id)
      .eq("round", nextRound)
      .eq("match_position", nextPosition)
      .single();

    if (nextMatch) {
      const isPlayerA = currentMatch.match_position % 2 === 0;
      const advancePayload = isPlayerA
        ? { player_a_id: winnerId }
        : { player_b_id: winnerId };
      
      await supabase
        .from("tournament_matches")
        .update(advancePayload)
        .eq("id", nextMatch.id);
    }
  }

  let finalPlacement = 0;
  let pointsEarned = 0;
  let prizes: string[] = [];
  let tName = "Torneo";

  // Calculate Global Leaderboard Points and Placement
  if (myUserId) {
    try {
      const { data: tournamentData } = await supabase
        .from("tournaments")
        .select("name, max_participants, prize")
        .eq("id", currentMatch.tournament_id)
        .single();
        
      if (tournamentData) {
        tName = tournamentData.name;
        const maxRound = Math.log2(tournamentData.max_participants);
        
        // Find if there is a next match in the tournament (round + 1)
        const { data: hasNextMatch } = await supabase
          .from("tournament_matches")
          .select("id")
          .eq("tournament_id", currentMatch.tournament_id)
          .eq("round", currentMatch.round + 1)
          .limit(1);

        if (winnerId !== myUserId) {
          // Lost
          const roundsLeft = maxRound - currentMatch.round;
          finalPlacement = Math.pow(2, roundsLeft + 1); // 2, 4, 8, 16...
        } else if (!hasNextMatch || hasNextMatch.length === 0) {
          // Won final
          finalPlacement = 1;
        }

        if (finalPlacement > 0) {
          if (finalPlacement === 1) pointsEarned = 100;
          else if (finalPlacement === 2) pointsEarned = 50;
          else if (finalPlacement <= 4) pointsEarned = 25;
          else if (finalPlacement <= 8) pointsEarned = 10;
          
          if (tournamentData.prize) {
             const prizeStr = tournamentData.prize.find((p: string) => p.startsWith(`${finalPlacement}º`));
             if (prizeStr) prizes.push(prizeStr);
          }

          if (pointsEarned > 0) {
            // Check if player exists in global_leaderboard
            const { data: existingPlayer } = await supabase
              .from("global_leaderboard")
              .select("points, tournaments_played, tournaments_won")
              .eq("user_id", myUserId)
              .single();
              
            if (existingPlayer) {
               await supabase.from("global_leaderboard").update({
                  points: existingPlayer.points + pointsEarned,
                  tournaments_played: existingPlayer.tournaments_played + 1,
                  tournaments_won: existingPlayer.tournaments_won + (finalPlacement === 1 ? 1 : 0)
               }).eq("user_id", myUserId);
            } else {
               await supabase.from("global_leaderboard").insert({
                  user_id: myUserId,
                  points: pointsEarned,
                  tournaments_played: 1,
                  tournaments_won: finalPlacement === 1 ? 1 : 0
               });
            }
          }
        }
      }
    } catch (e) {
      console.error("Failed calculating global leaderboard stats", e);
    }
  }

  // Insert to global history for Admin View
  try {
    const { data: tournamentData } = await supabase
      .from("tournaments")
      .select("name")
      .eq("id", currentMatch.tournament_id)
      .single();

    const extendedLog: any = {
      ...(log as object),
      tournamentId: currentMatch.tournament_id,
      tournamentName: tournamentData?.name || "Torneo",
      isTournament: true
    };

    if (winnerId) {
      // Only the winner saves the global history so we don't get duplicates
      await supabase.from("game_sync").upsert({
        match_id: `user_history_${winnerId}_${matchCode}`,
        last_move: extendedLog,
        updated_at: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.error("Failed to save global tournament history", err);
  }

  return { ...data, finalPlacement, pointsEarned, prizes, tournamentName: tName };
}

/** Fetches all matches for a tournament, ordered by round and position. */
export async function getMatchesByTournament(tournamentId: string) {
  const { data, error } = await supabase
    .from("tournament_matches")
    .select("*")
    .eq("tournament_id", tournamentId)
    .order("round", { ascending: true })
    .order("match_position", { ascending: true });
  if (error) throw error;
  return data;
}
