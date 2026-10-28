import type { GuestCartSession } from "../types/domain/cart.types";
const STORAGE_KEY = "iranmobix.guest-cart.v1";
let memorySession: GuestCartSession | null = null;
let memoryOnly = false;
function valid(value: unknown): value is GuestCartSession {
  if (!value || typeof value !== "object") return false;
  const session = value as Partial<GuestCartSession>;
  return (
    typeof session.token === "string" &&
    session.token.length > 0 &&
    session.header === "X-Guest-Cart-Token" &&
    typeof session.expiresAt === "number" &&
    Number.isFinite(session.expiresAt) &&
    session.expiresAt > Date.now()
  );
}
export const cartSessionStorage = {
  read(): GuestCartSession | null {
    if (typeof window === "undefined") return null;
    if (memoryOnly) return valid(memorySession) ? memorySession : null;
    let raw: string | null;
    try {
      raw = window.localStorage.getItem(STORAGE_KEY);
    } catch {
      return valid(memorySession) ? memorySession : null;
    }
    // A removal in another tab must not resurrect an old in-memory session.
    memorySession = null;
    if (!raw) return null;
    try {
      const parsed: unknown = JSON.parse(raw);
      if (valid(parsed)) {
        memorySession = parsed;
        return parsed;
      }
    } catch {
      /* Corrupt persisted data is discarded, not trusted. */
    }
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* Storage unavailable. */
    }
    return null;
  },
  write(session: GuestCartSession) {
    if (typeof window === "undefined")
      throw new Error("سبد مهمان فقط در مرورگر قابل استفاده است.");
    if (!valid(session)) throw new Error("نشست سبد خرید معتبر نیست.");
    memorySession = session;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      memoryOnly = false;
    } catch {
      memoryOnly = true;
    }
  },
  clear(expectedToken?: string) {
    if (expectedToken && this.read()?.token !== expectedToken) return;
    memorySession = null;
    memoryOnly = false;
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        /* Storage unavailable. */
      }
    }
  },
};
