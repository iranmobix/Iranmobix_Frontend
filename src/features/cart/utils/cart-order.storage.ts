type Attempt = { key: string; accepted: boolean; trackingCode?: string };
const memory = new Map<string, Attempt>();
const prefix = "iranmobix.cart-order.v1:";
function read(fingerprint: string): Attempt | null {
  const existing = memory.get(fingerprint);
  if (existing) return existing;
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(prefix + fingerprint);
    const value: unknown = raw ? JSON.parse(raw) : null;
    if (
      value &&
      typeof value === "object" &&
      "key" in value &&
      typeof value.key === "string" &&
      value.key.startsWith("cart-submit-") &&
      "accepted" in value &&
      typeof value.accepted === "boolean"
    )
      return {
        key: value.key,
        accepted: value.accepted,
        trackingCode:
          "trackingCode" in value && typeof value.trackingCode === "string"
            ? value.trackingCode
            : undefined,
      };
  } catch {
    /* Keep same-tab retries safe when browser storage is unavailable. */
  }
  return null;
}
function write(fingerprint: string, attempt: Attempt) {
  memory.set(fingerprint, attempt);
  if (typeof window !== "undefined") {
    try {
      window.sessionStorage.setItem(
        prefix + fingerprint,
        JSON.stringify(attempt),
      );
    } catch {
      /* In-memory fallback. */
    }
  }
}
export const cartOrderStorage = {
  getOrCreate(fingerprint: string): Attempt {
    const existing = read(fingerprint);
    if (existing) return existing;
    const attempt = {
      key: `cart-submit-${crypto.randomUUID()}`,
      accepted: false,
    };
    write(fingerprint, attempt);
    return attempt;
  },
  markAccepted(fingerprint: string, key: string, trackingCode?: string) {
    write(fingerprint, { key, accepted: true, trackingCode });
  },
};
