import {
  cartAssignedExpertSchema,
  type CartAssignedExpert,
} from "../schemas/cart-expert.schema";

const memory = new Map<string, CartAssignedExpert>();
const storageKey = (trackingCode: string, sessionId: string) =>
  "iranmobix.order-review.v1:" + JSON.stringify([sessionId, trackingCode]);

/** Only the real assigned-expert profile; no prices, submit keys or authentication tokens. */
export const orderReviewStorage = {
  save(
    trackingCode: string,
    sessionId: string | null,
    expert: CartAssignedExpert | null,
  ) {
    if (!sessionId || typeof window === "undefined") return;
    const key = storageKey(trackingCode, sessionId);
    if (expert) memory.set(key, expert);
    else memory.delete(key);
    try {
      if (expert) window.sessionStorage.setItem(key, JSON.stringify(expert));
      else window.sessionStorage.removeItem(key);
    } catch {
      /* Same-tab memory remains available when storage is blocked. */
    }
  },
  read(
    trackingCode: string,
    sessionId: string | null,
  ): CartAssignedExpert | null {
    if (!sessionId || typeof window === "undefined") return null;
    const key = storageKey(trackingCode, sessionId);
    const cached = memory.get(key);
    if (cached) return cached;
    try {
      const raw = window.sessionStorage.getItem(key);
      const parsed = raw
        ? cartAssignedExpertSchema.safeParse(JSON.parse(raw))
        : null;
      return parsed?.success ? parsed.data : null;
    } catch {
      return null;
    }
  },
};

const statuses = new Map<string, string>();
export const orderReviewStatusStorage = {
  save(trackingCode: string, sessionId: string | null, status: string) {
    if (!sessionId || typeof window === "undefined") return;
    const key = storageKey(trackingCode, sessionId) + ":status";
    statuses.set(key, status);
    try {
      window.sessionStorage.setItem(key, JSON.stringify(status));
    } catch {
      /* Keep same-tab state. */
    }
  },
  read(trackingCode: string, sessionId: string | null): string | null {
    if (!sessionId || typeof window === "undefined") return null;
    const key = storageKey(trackingCode, sessionId) + ":status";
    try {
      const value =
        statuses.get(key) ??
        JSON.parse(window.sessionStorage.getItem(key) ?? "null");
      return typeof value === "string" ? value : null;
    } catch {
      return null;
    }
  },
};
