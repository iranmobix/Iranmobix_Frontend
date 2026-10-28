import { submitOrderResponseSchema } from "../schemas/cart.schema";
import { tokenStorage } from "@/features/auth/utils/token-storage";
import { cartApi } from "../api/cart.api";
import { mapCartToSubmitOrderPayload } from "../mappers/cart-submit-order.mapper";
import { cartOrderStorage } from "../utils/cart-order.storage";
import { cartSessionStorage } from "../utils/cart-session.storage";
import type {
  CartDataSource,
  CartShippingMethod,
  ServerCart,
} from "../types/domain/cart.types";

const pending = new Map<string, Promise<string | null>>();
export function getCartSubmitError(error: unknown): string {
  if (error && typeof error === "object" && "response" in error) {
    const response = error.response;
    if (
      response &&
      typeof response === "object" &&
      "status" in response &&
      response.status === 401
    )
      return "نشست ورود معتبر نیست؛ دوباره وارد حساب شوید.";
    if (response && typeof response === "object" && "data" in response) {
      const data = response.data;
      if (data && typeof data === "object") {
        if ("detail" in data && typeof data.detail === "string")
          return data.detail;
        if (
          "error" in data &&
          data.error &&
          typeof data.error === "object" &&
          "message" in data.error &&
          typeof data.error.message === "string"
        )
          return data.error.message;
      }
    }
  }
  return "ثبت اولیه تأیید نشد. تلاش مجدد برای همین سبد با همان شناسه انجام می‌شود.";
}
export const cartOrderService = {
  async submit(
    cart: ServerCart,
    source: CartDataSource,
    shippingMethod: CartShippingMethod,
  ): Promise<string | null> {
    if (source !== "api") throw new Error("سبد نمونه قابل ثبت واقعی نیست.");
    const token = tokenStorage.getAccessToken();
    if (!token) throw new Error("برای ثبت اولیه وارد حساب شوید.");
    const payload = mapCartToSubmitOrderPayload(
      cart,
      "pending-key",
      shippingMethod,
    );
    const session = cartSessionStorage.read();
    // No token or payload is persisted: only a hash, random key and acknowledgement.
    const identity =
      cart.owner.userId !== null
        ? `user:${cart.owner.userId}`
        : tokenStorage.getSessionId();
    const canonical = JSON.stringify({
      identity,
      guest: session?.token ?? null,
      items: payload.items,
      shipping_method: payload.shipping_method,
    });
    const digest = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(canonical),
    );
    const fingerprint = Array.from(new Uint8Array(digest), (byte) =>
      byte.toString(16).padStart(2, "0"),
    ).join("");
    if (tokenStorage.getAccessToken() !== token)
      throw new Error("نشست ورود تغییر کرده است؛ سبد را دوباره دریافت کنید.");
    const active = pending.get(fingerprint);
    if (active) return active;
    const attempt = cartOrderStorage.getOrCreate(fingerprint);
    if (attempt.accepted) return attempt.trackingCode ?? null;
    const request = (async () => {
      const response = await cartApi.submitOrder(
        { ...payload, idempotency_key: attempt.key },
        session,
      );
      // Do not treat an explicit error envelope as a successful submission.
      if (
        response &&
        typeof response === "object" &&
        "error" in response &&
        response.error
      )
        throw new Error("سرور ثبت اولیه را تأیید نکرد.");
      const result =
        response == null ? null : submitOrderResponseSchema.parse(response);
      const trackingCode = result?.tracking_code;
      cartOrderStorage.markAccepted(fingerprint, attempt.key, trackingCode);
      return trackingCode ?? null;
    })().finally(() => pending.delete(fingerprint));
    pending.set(fingerprint, request);
    return request;
  },
};
