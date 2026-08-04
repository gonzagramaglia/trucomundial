import { supabase } from "../../../lib/supabase";

export const useAdminTournaments = (fetchGlobalData: () => Promise<void>) => {
  const handleDeleteTournament = async (id: string) => {
    try {
      const { error } = await supabase.from("tournaments").delete().eq("id", id);
      if (error) throw error;
      await fetchGlobalData();
    } catch (err) {
      console.error("Error al borrar torneo:", err);
      alert("Hubo un error al borrar el torneo.");
    }
  };

  const handleApproveTournament = async (id: string) => {
    try {
      const { error } = await supabase
        .from("tournaments")
        .update({ status: "upcoming" })
        .eq("id", id);
      if (error) throw error;
      await fetchGlobalData();
    } catch (err) {
      console.error("Error al aprobar torneo:", err);
      alert("Hubo un error al aprobar el torneo.");
    }
  };

  return { handleDeleteTournament, handleApproveTournament };
};
