import { mapGuestCartSession } from "../mappers/cart.mapper";
import { cartApi } from "../api/cart.api";
import { cartSessionSchema } from "../schemas/cart.schema";
import { cartSessionStorage } from "../utils/cart-session.storage";
import type { GuestCartSession } from "../types/domain/cart.types";

let pendingSession: Promise<GuestCartSession> | null = null;
export function ensureGuestCartSession(): Promise<GuestCartSession> {
  const existing = cartSessionStorage.read();
  if (existing) return Promise.resolve(existing);
  if (pendingSession) return pendingSession;
  pendingSession = (async () => {
    const startedAt = Date.now();
    const response = cartSessionSchema.parse(await cartApi.createSession());
    const session = mapGuestCartSession(response, startedAt);
    cartSessionStorage.write(session);
    return session;
  })().finally(() => {
    pendingSession = null;
  });
  return pendingSession;
}
