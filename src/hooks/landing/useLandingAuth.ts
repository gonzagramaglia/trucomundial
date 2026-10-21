import type { User } from '@supabase/supabase-js';
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { ADMIN_EMAILS } from "../../lib/constants";
import { getLocalUser, subscribeToLocalUser } from "../../lib/localAuth";

export const useLandingAuth = () => {
  const [user, setUser] = useState<User | any>(() => getLocalUser());
  const [isApprovedCreator, setIsApprovedCreator] = useState(false);

  const isSuperAdmin = Boolean(
    user?.email &&
    ADMIN_EMAILS.includes(user.email)
  );

  useEffect(() => {
    const unsubscribeLocal = subscribeToLocalUser((updatedUser) => {
      setUser(updatedUser);
    });

    try {
      supabase.auth.getSession().then(({ data: { session } }: any) => {
        if (session?.user) {
          setUser(session.user);
        } else {
          setUser(getLocalUser());
        }
      }).catch(() => {
        setUser(getLocalUser());
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
        if (session?.user) {
          setUser(session.user);
        } else {
          setUser(getLocalUser());
        }
      });

      return () => {
        unsubscribeLocal();
        subscription?.unsubscribe?.();
      };
    } catch {
      return () => unsubscribeLocal();
    }
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
    redirectToProfile();
  };

  return { user, isSuperAdmin, isApprovedCreator, handleAuth };
};
