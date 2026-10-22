export interface LocalUserMetadata {
  name: string;
  full_name: string;
  custom_username: string;
  nationality?: string;
  avatar_url?: string;
  last_name_change?: string;
}

export interface LocalUser {
  id: string;
  email: string;
  role?: string;
  aud?: string;
  created_at?: string;
  user_metadata: LocalUserMetadata;
  app_metadata?: Record<string, unknown>;
}

const LOCAL_USER_STORAGE_KEY = "trucomundial_local_user";

const DEFAULT_USER: LocalUser = {
  id: "local_player",
  email: "jugador@trucomundial.local",
  role: "authenticated",
  aud: "authenticated",
  created_at: new Date().toISOString(),
  user_metadata: {
    name: "Guacho",
    full_name: "Guacho",
    custom_username: "Guacho",
    nationality: "Argentina",
    avatar_url: "",
  },
  app_metadata: {
    provider: "local",
    providers: ["local"],
  },
};

/**
 * Retrieves the local user from localStorage, creating a default one if none exists.
 */
export function getLocalUser(): LocalUser {
  if (typeof window === "undefined") return DEFAULT_USER;
  try {
    const raw = localStorage.getItem(LOCAL_USER_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.id) {
        if (
          parsed.user_metadata?.custom_username === "Jugador 10" ||
          parsed.user_metadata?.name === "Jugador 10"
        ) {
          parsed.user_metadata = {
            ...parsed.user_metadata,
            name: "Guacho",
            full_name: "Guacho",
            custom_username: "Guacho",
          };
          try {
            localStorage.setItem(LOCAL_USER_STORAGE_KEY, JSON.stringify(parsed));
          } catch {
            // Storage quota exceeded or disabled; keep in-memory update
          }
        }
        return {
          ...DEFAULT_USER,
          ...parsed,
          user_metadata: {
            ...DEFAULT_USER.user_metadata,
            ...(parsed.user_metadata || {}),
          },
        };
      }
    }
  } catch (e) {
    console.error("Error reading local user from storage:", e);
  }

  // Save and return default user
  try {
    localStorage.setItem(LOCAL_USER_STORAGE_KEY, JSON.stringify(DEFAULT_USER));
  } catch {
    // Storage quota exceeded or disabled; fall back to in-memory default
  }
  return DEFAULT_USER;
}

/**
 * Updates the local user metadata in localStorage and dispatches an event.
 */
export function updateLocalUser(
  updates: Partial<LocalUserMetadata>
): LocalUser {
  const current = getLocalUser();
  const updated: LocalUser = {
    ...current,
    user_metadata: {
      ...current.user_metadata,
      ...updates,
    },
  };

  try {
    localStorage.setItem(LOCAL_USER_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(
      new CustomEvent("trucomundial_user_updated", { detail: updated })
    );
  } catch (e) {
    console.error("Error saving local user to storage:", e);
  }

  return updated;
}

/**
 * Subscribes to local user changes.
 */
export function subscribeToLocalUser(callback: (user: LocalUser) => void) {
  if (typeof window === "undefined") return () => { };

  const handler = (e: Event) => {
    if (e instanceof StorageEvent) {
      if (e.key !== LOCAL_USER_STORAGE_KEY) return;
      callback(getLocalUser());
      return;
    }
    const custom = e as CustomEvent<LocalUser>;
    if (custom.detail) {
      callback(custom.detail);
    } else {
      callback(getLocalUser());
    }
  };

  window.addEventListener("trucomundial_user_updated", handler);
  window.addEventListener("storage", handler);

  return () => {
    window.removeEventListener("trucomundial_user_updated", handler);
    window.removeEventListener("storage", handler);
  };
}
