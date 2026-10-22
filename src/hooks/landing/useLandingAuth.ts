import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { ADMIN_EMAILS } from "../../lib/constants";
import { useCurrentUser } from "../useCurrentUser";

export const useLandingAuth = () => {
  const user = useCurrentUser();
  const [isApprovedCreator, setIsApprovedCreator] = useState(false);

  const isSuperAdmin = Boolean(
    user?.email &&
    ADMIN_EMAILS.includes(user.email)
  );

  useEffect(() => {
    const checkCreatorStatus = async () => {
      if (!user) {
        setIsApprovedCreator(false);
        return;
      }
      if (isSuperAdmin) {
        setIsApprovedCreator(true);
        return;
      }
      try {
        const { data } = await supabase
          .from("creator_applications")
          .select("status")
          .eq("user_id", user.id)
          .eq("status", "approved")
          .single();
        if (data) { setIsApprovedCreator(true); } else { setIsApprovedCreator(false); }
      } catch {
        setIsApprovedCreator(false);
      }
    };
    checkCreatorStatus();
  }, [user, isSuperAdmin]);

  const handleAuth = async (redirectToProfile: () => void) => {
    redirectToProfile();
  };

  return { user, isSuperAdmin, isApprovedCreator, handleAuth };
};
