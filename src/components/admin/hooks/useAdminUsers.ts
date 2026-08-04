import { useMemo } from "react";
import { supabase } from "../../../lib/supabase";
import type { MatchSummary, CreatorApplication } from "./useAdminData";

export interface PlayerStats {
  userId: string;
  userName: string;
  email: string;
  totalGames: number;
  wins: number;
  losses: number;
  lastPlayed: string;
  votes: Record<string, number>;
  createdAt?: string;
  prodePredictions?: any[];
}

export const useAdminUsers = (
  history: MatchSummary[],
  globalVotesData: any[],
  applications: CreatorApplication[],
  prodePredictions: any[],
  userRoles: any[],
  profiles: any[],
  setUserRoles: (roles: any[]) => void
) => {
  const playerStats = useMemo(() => {
    const statsMap = new Map<string, PlayerStats>();

    const getOrCreatePlayer = (pId: string, defaultName: string = "Usuario", lastActiveDate: string = ""): PlayerStats => {
      let pStats = statsMap.get(pId);
      if (!pStats) {
        const profile = profiles.find((p) => p.id === pId);
        pStats = {
          userId: pId,
          userName: profile?.raw_user_meta_data?.name || defaultName,
          email: profile?.email || "",
          totalGames: 0,
          wins: 0,
          losses: 0,
          lastPlayed: lastActiveDate,
          votes: {},
          createdAt: profile?.created_at,
          prodePredictions: [],
        };
        statsMap.set(pId, pStats);
      }
      return pStats;
    };

    history.forEach((match) => {
      const pId = match.userId;
      const pStats = getOrCreatePlayer(pId, "Usuario", match.date);
      
      pStats.totalGames += 1;
      if (match.winner === "player") pStats.wins += 1;
      else if (match.winner === "cpu") pStats.losses += 1;

      if (match.date > pStats.lastPlayed) {
        pStats.lastPlayed = match.date;
      }
    });

    globalVotesData.forEach((item: any) => {
      const userId = item.match_id.replace(/^user_votes_/, '');
      const votes = item.last_move?.votes || {};
      const userName = item.last_move?.userName || "Usuario";
      const updatedAt = item.last_move?.updatedAt || item.updated_at;

      const pStats = getOrCreatePlayer(userId, userName, updatedAt);
      pStats.votes = votes;
    });

    prodePredictions.forEach((pred: any) => {
      const pStats = getOrCreatePlayer(pred.user_id, "Usuario", pred.updated_at);
      pStats.prodePredictions = pStats.prodePredictions || [];
      pStats.prodePredictions.push(pred);
    });

    return Array.from(statsMap.values()).sort(
      (a, b) => b.totalGames - a.totalGames
    );
  }, [history, globalVotesData, profiles, prodePredictions]);

  const getPlayerRole = (userId: string): "normal" | "mod" | "admin" | "creator" => {
    const roleRecord = userRoles.find(r => r.user_id === userId);
    if (roleRecord) return roleRecord.role as any;

    const isCreator = applications.some(app => app.user_id === userId && app.status === "approved");
    if (isCreator) return "creator";

    return "normal";
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (newRole === "normal" || newRole === "creator") {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId);
      
      if (!error) {
        setUserRoles(userRoles.filter(r => r.user_id !== userId));
      }

      if (newRole === "creator") {
        const existingApp = applications.find(app => app.user_id === userId);
        if (!existingApp) {
          const profile = profiles.find(p => p.id === userId);
          await supabase.from("creator_applications").insert([{
            user_id: userId,
            email: profile?.email || "",
            channel_name: profile?.raw_user_meta_data?.name || "Usuario",
            status: "approved"
          }]);
        }
      }
    } else {
      const { error } = await supabase
        .from("user_roles")
        .upsert({ user_id: userId, role: newRole });
      
      if (!error) {
        const updated = userRoles.filter(r => r.user_id !== userId);
        updated.push({ user_id: userId, role: newRole });
        setUserRoles(updated);
      }
    }
  };

  return { playerStats, getPlayerRole, handleRoleChange };
};
