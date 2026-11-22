import {
  orderReviewStorage,
  orderReviewStatusStorage,
} from "../utils/order-review.storage";
import { z } from "zod";
import {
  cartResponseSchema,
  submitOrderResponseSchema,
} from "../schemas/cart.schema";
import { mapCartForDisplay } from "../mappers/cart-display.mapper";
import { tokenStorage } from "@/features/auth/utils/token-storage";
import { cartApi } from "../api/cart.api";
import { mapCartToSubmitOrderPayload } from "../mappers/cart-submit-order.mapper";

import type { CartDataSource, ServerCart } from "../types/domain/cart.types";

const conflictSchema = z.object({
  response: z.object({
    status: z.literal(409),
    data: z.object({
      field: z.literal("cart"),
      cart: z.union([
        z
          .object({
            items: z.array(z.record(z.string(), z.unknown())),
            pay_detail: z.record(z.string(), z.unknown()),
          })
          .passthrough(),
        cartResponseSchema,
      ]),
    }),
  }),
});

export function getCartSubmitConflictCart(error: unknown): ServerCart | null {
  const result = conflictSchema.safeParse(error);
  return result.success
    ? mapCartForDisplay(result.data.response.data.cart)
    : null;
}

const pending = new Map<string, Promise<string>>();
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
  return "ثبت اولیه تأیید نشد. وضعیت سبد را بررسی کنید و دوباره اقدام کنید.";
}
export const cartOrderService = {
  async submit(cart: ServerCart, source: CartDataSource): Promise<string> {
    if (source !== "api") throw new Error("سبد نمونه قابل ثبت واقعی نیست.");
    if (!tokenStorage.getAccessToken())
      throw new Error("برای ثبت اولیه وارد حساب شوید.");
    const payload = mapCartToSubmitOrderPayload(cart);
    // Share only a request still in flight, not an accepted order or a failed attempt.
    const sessionId = tokenStorage.getSessionId();
    const key = JSON.stringify([
      sessionId,
      [...payload.item_ids].sort((a, b) => a - b),
    ]);
    const active = pending.get(key);
    if (active) return active;
    const request = cartApi
      .submitOrder(payload)
      .then((response) => {
        const result = submitOrderResponseSchema.parse(response);
        orderReviewStorage.save(
          result.tracking_code,
          sessionId,
          result.assigned_sales_expert,
        );
        orderReviewStatusStorage.save(
          result.tracking_code,
          sessionId,
          result.expert_pricing_status,
        );
        return result.tracking_code;
      })
      .finally(() => pending.delete(key));
    pending.set(key, request);
    return request;
  },
};
