import type { User, Session } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { getLocalUser, subscribeToLocalUser, type LocalUser } from '../lib/localAuth';

export type AuthUser = User | LocalUser;

export const useCurrentUser = (): AuthUser => {
  const [user, setUser] = useState<AuthUser>(() => getLocalUser());

  useEffect(() => {
    let cancelled = false;

    const unsubscribeLocal = subscribeToLocalUser((updatedUser: LocalUser) => {
      if (!cancelled) {
        setUser(updatedUser);
      }
    });

    try {
      supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
        if (cancelled) return;
        if (session?.user) {
          setUser(session.user);
        } else {
          setUser(getLocalUser());
        }
      }).catch(() => {
        if (cancelled) return;
        setUser(getLocalUser());
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
        if (cancelled) return;
        if (session?.user) {
          setUser(session.user);
        } else {
          setUser(getLocalUser());
        }
      });

      return () => {
        cancelled = true;
        unsubscribeLocal();
        subscription?.unsubscribe?.();
      };
    } catch {
      cancelled = true;
      return () => unsubscribeLocal();
    }
  }, []);

  return user;
};
