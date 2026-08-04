import { supabase } from "../../../lib/supabase";
import type { CreatorApplication } from "./useAdminData";

export const useAdminApplications = (
  applications: CreatorApplication[],
  setApplications: (apps: CreatorApplication[]) => void,
  userRoles: any[],
  setUserRoles: (roles: any[]) => void
) => {
  const handleApplicationStatus = async (
    id: string,
    status: "approved" | "rejected"
  ) => {
    try {
      const { error } = await supabase
        .from("creator_applications")
        .update({ status })
        .eq("id", id);
      if (error) throw error;

      setApplications(
        applications.map((app) => (app.id === id ? { ...app, status } : app))
      );

      if (status === "approved") {
        const app = applications.find((a) => a.id === id);
        if (app) {
          const { error: roleError } = await supabase
            .from("user_roles")
            .upsert({ user_id: app.user_id, role: "creator" });
          
          if (!roleError) {
            const updated = userRoles.filter((r: any) => r.user_id !== app.user_id);
            updated.push({ user_id: app.user_id, role: "creator" });
            setUserRoles(updated);
          }
        }
      } else if (status === "rejected") {
        const app = applications.find((a) => a.id === id);
        if (app) {
          const { error: roleError } = await supabase
            .from("user_roles")
            .delete()
            .eq("user_id", app.user_id)
            .eq("role", "creator");
            
          if (!roleError) {
            setUserRoles(userRoles.filter((r: any) => !(r.user_id === app.user_id && r.role === "creator")));
          }
        }
      }
    } catch (err) {
      console.error("Error updating application status:", err);
      alert("Hubo un error al actualizar la solicitud.");
    }
  };

  return { handleApplicationStatus };
};
