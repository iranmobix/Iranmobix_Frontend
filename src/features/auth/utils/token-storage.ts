const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const SESSION_ID_KEY = "auth_session_id";

const TOKEN_CHANGE_EVENT = "auth-token-change";

export const tokenStorage = {
  subscribe(listener: () => void) {
    window.addEventListener("storage", listener);
    window.addEventListener("focus", listener);
    window.addEventListener(TOKEN_CHANGE_EVENT, listener);
    return () => {
      window.removeEventListener("storage", listener);
      window.removeEventListener("focus", listener);
      window.removeEventListener(TOKEN_CHANGE_EVENT, listener);
    };
  },
  setAccessToken(token: string, options: { preserveSession?: boolean } = {}) {
    if (typeof window === "undefined") return;

    if (!options.preserveSession)
      window.localStorage.setItem(SESSION_ID_KEY, crypto.randomUUID());
    window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
    window.dispatchEvent(new Event(TOKEN_CHANGE_EVENT));
  },

  getAccessToken() {
    if (typeof window === "undefined") return null;

    try {
      return window.localStorage.getItem(ACCESS_TOKEN_KEY);
    } catch {
      return null;
    }
  },

  setRefreshToken(token: string) {
    if (typeof window === "undefined") return;

    window.localStorage.setItem(REFRESH_TOKEN_KEY, token);
  },

  // A non-secret login identifier keeps order idempotency stable across token rotation.
  getSessionId(): string | null {
    if (!tokenStorage.getAccessToken()) return null;
    const stored = window.localStorage.getItem(SESSION_ID_KEY);
    if (stored) return stored;
    const id = crypto.randomUUID();
    window.localStorage.setItem(SESSION_ID_KEY, id);
    return id;
  },
  getRefreshToken() {
    if (typeof window === "undefined") return null;

    try {
      return window.localStorage.getItem(REFRESH_TOKEN_KEY);
    } catch {
      return null;
    }
  },

  clearTokens() {
    if (typeof window === "undefined") return;

    try {
      window.localStorage.removeItem(ACCESS_TOKEN_KEY);
      window.localStorage.removeItem(REFRESH_TOKEN_KEY);
      window.localStorage.removeItem(SESSION_ID_KEY);
    } finally {
      window.dispatchEvent(new Event(TOKEN_CHANGE_EVENT));
    }
  },
};
