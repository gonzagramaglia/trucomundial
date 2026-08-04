import { useState, useCallback } from "react";
import { supabase } from "../../../lib/supabase";
import { normalizeTournamentPrizes } from "../../../lib/formatters";
import { useTranslation } from "react-i18next";
import { ADMIN_EMAILS } from "../../../lib/constants";

export interface MatchSummary {
  id: string;
  match_id: string;
  userId: string;
  rivalName: string;
  myScore: number;
  rivalScore: number;
  winner: "player" | "cpu";
  date: string;
  log: string[];
  isTournament?: boolean;
  tournamentId?: string;
  tournamentName?: string;
}

export interface CreatorApplication {
  id: string;
  user_id: string;
  email: string;
  channel_name: string;
  social_link?: string;
  streaming_link?: string;
  motivation?: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

export const useAdminData = (user: any) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [rpcError, setRpcError] = useState(false);

  const [history, setHistory] = useState<MatchSummary[]>([]);
  const [applications, setApplications] = useState<CreatorApplication[]>([]);
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [usedCodes, setUsedCodes] = useState<Record<string, { code: string; userId: string }[]>>({});
  const [profiles, setProfiles] = useState<any[]>([]);
  const [globalVotesData, setGlobalVotesData] = useState<any[]>([]);
  const [prodePredictions, setProdePredictions] = useState<any[]>([]);
  const [userRoles, setUserRoles] = useState<any[]>([]);

  const isAdmin = user && user.email && ADMIN_EMAILS.includes(user.email);

  const fetchGlobalData = useCallback(async () => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }
    setLoading(true);

    try {
      // 1. Fetch Profiles via RPC (to get emails and auth data safely)
      let { data: profilesData, error: profilesError } = await supabase.rpc("get_admin_users_data");

      if (profilesError) {
        console.warn("RPC get_admin_users_data failed (did you run the SQL script?), falling back to profiles table:", profilesError);
        setRpcError(true);
        const fallback = await supabase.from("profiles").select("*");
        profilesData = fallback.data;
        profilesError = fallback.error;
      }

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
      } else if (profilesData) {
        setProfiles(profilesData);
      }

      // 2. Fetch User Roles
      const { data: rolesData, error: rolesError } = await supabase
        .from("user_roles")
        .select("*");

      if (rolesError) {
        console.error("Error fetching user roles:", rolesError);
      } else if (rolesData) {
        setUserRoles(rolesData);
      }

      // 3. Fetch Matches and Votes
      const { data: syncData, error: syncError } = await supabase
        .from("game_sync")
        .select("id, match_id, last_move, updated_at")
        .or("match_id.like.user_history_%,match_id.like.user_votes_%");

      if (syncError) {
        console.error("Error fetching global sync data:", syncError);
      } else if (syncData) {
        const historyData = syncData.filter(item => item.match_id.startsWith("user_history_"));
        const votesData = syncData.filter(item => item.match_id.startsWith("user_votes_"));

        setGlobalVotesData(votesData);

        const formattedHistory: MatchSummary[] = historyData
          .map((item: any) => {
            const summary = item.last_move;
            return {
              id: item.id,
              match_id: item.match_id,
              userId: summary.userId || "Desconocido",
              rivalName: summary.rivalName || t("rival"),
              myScore: summary.myScore || 0,
              rivalScore: summary.rivalScore || 0,
              winner: summary.winner || "cpu",
              date: summary.date || item.updated_at,
              log: summary.log || [],
              isTournament: summary.isTournament,
              tournamentId: summary.tournamentId,
              tournamentName: summary.tournamentName,
            };
          })
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        setHistory(formattedHistory);
      }

      // Fetch Applications
      const { data: appsData, error: appsError } = await supabase
        .from("creator_applications")
        .select("*")
        .order("created_at", { ascending: false });

      if (appsError) {
        console.error("Error fetching applications:", appsError);
      } else if (appsData) {
        setApplications(appsData);
      }

      // Fetch Tournaments
      const { data: tourneysData, error: tourneysError } = await supabase
        .from("tournaments")
        .select("*")
        .order("created_at", { ascending: false });

      if (tourneysError) {
        console.error("Error fetching tournaments:", tourneysError);
      } else if (tourneysData) {
        setTournaments(
          tourneysData.map((tournament: any) => ({
            ...tournament,
            prize: normalizeTournamentPrizes(tournament.prize),
          })),
        );
        if (tourneysData.length > 0) {
          const tIds = tourneysData.map((t: any) => t.id);
          const { data: regData } = await supabase
            .from("tournament_registrations")
            .select("tournament_id, code_used, user_id")
            .in("tournament_id", tIds);

          if (regData) {
            const codeMap: Record<string, { code: string; userId: string }[]> = {};
            regData.forEach((r: any) => {
              if (!codeMap[r.tournament_id]) codeMap[r.tournament_id] = [];
              if (r.code_used)
                codeMap[r.tournament_id].push({
                  code: r.code_used,
                  userId: r.user_id || "",
                });
            });
            setUsedCodes(codeMap);
          }
        }
      }

      // Fetch Prode Predictions
      const { data: prodeData, error: prodeError } = await supabase
        .from('prode_predictions')
        .select('*');
        
      if (prodeError) {
        console.error('Error fetching prode predictions:', prodeError);
      } else if (prodeData) {
        setProdePredictions(prodeData);
      }

      // Fetch Support Tickets
      const { data: ticketsData, error: ticketsError } = await supabase
        .from("support_tickets")
        .select("*")
        .order("created_at", { ascending: false });

      if (ticketsError) {
        console.error("Error fetching tickets:", ticketsError);
      } else if (ticketsData) {
        setTickets(ticketsData);
      }
    } catch (err) {
      console.error("Unknown error fetching global data:", err);
    } finally {
      setLoading(false);
    }
  }, [isAdmin, t]);

  return {
    loading,
    rpcError,
    history,
    applications,
    tournaments,
    tickets,
    usedCodes,
    profiles,
    globalVotesData,
    prodePredictions,
    userRoles,
    fetchGlobalData,
    isAdmin,
    setApplications,
    setTournaments,
    setTickets,
    setUserRoles,
  };
};
