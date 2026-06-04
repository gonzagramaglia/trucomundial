import { supabase } from "./supabase";

function genCode(len = 8) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < len; i++)
    out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

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

export async function saveMatchLog(matchId: string, log: unknown) {
  const { data, error } = await supabase
    .from("tournament_matches")
    .update({ log: log, ended_at: new Date().toISOString() })
    .eq("id", matchId);
  if (error) throw error;
  return data;
}

export async function saveMatchLogByCode(matchCode: string, log: unknown, winnerId?: string) {
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

  return data;
}

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
