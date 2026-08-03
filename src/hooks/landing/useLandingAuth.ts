import type { User } from '@supabase/supabase-js';
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { ADMIN_EMAILS } from "../../lib/constants";


export const useLandingAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isApprovedCreator, setIsApprovedCreator] = useState(false);

  const isSuperAdmin = Boolean(
    user?.email &&
    ADMIN_EMAILS.includes(user.email)
  );

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      const activeUser = session?.user ?? null;
      setUser(activeUser);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      const activeUser = session?.user ?? null;
      setUser(activeUser);
    });

    return () => subscription.unsubscribe();
  }, []);

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
    if (user) {
      redirectToProfile();
    } else {
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.href,
          queryParams: {
            prompt: "select_account",
          },
        },
      });
    }
  };

  return { user, isSuperAdmin, isApprovedCreator, handleAuth };
};
