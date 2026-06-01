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
