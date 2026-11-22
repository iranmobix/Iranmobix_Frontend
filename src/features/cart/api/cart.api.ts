import { httpGet, httpPost, httpPatch, httpDelete } from "@/shared/api";
import type {
  SubmitOrderPayload,
  AddToCartInput,
  UpdateCartItemInput,
  RemoveCartItemInput,
} from "../types/api/cart-payload.types";
import type { GuestCartSession } from "../types/domain/cart.types";

const config = (session?: GuestCartSession | null) => ({
  withCredentials: true,
  headers: session ? { [session.header]: session.token } : undefined,
});
/** Shared transport for guest and authenticated carts. */
export const cartApi = {
  createSession: () =>
    httpPost<unknown>("/api/cart/session/", undefined, config()),
  getCart: (session?: GuestCartSession | null, signal?: AbortSignal) =>
    httpGet<unknown>("/api/cart/", { ...config(session), signal }),
  addItem: (
    { slug, payload }: AddToCartInput,
    session?: GuestCartSession | null,
  ) =>
    httpPost<unknown>(
      `/api/add-to-cart/${encodeURIComponent(slug)}`,
      payload,
      config(session),
    ),
  updateItem: (
    { itemId, payload }: UpdateCartItemInput,
    session?: GuestCartSession | null,
  ) =>
    httpPatch<unknown>(
      `/api/cart/${encodeURIComponent(itemId)}`,
      payload,
      config(session),
    ),
  removeItem: (
    { itemId }: RemoveCartItemInput,
    session?: GuestCartSession | null,
  ) =>
    httpDelete<unknown>(
      `/api/cart/${encodeURIComponent(itemId)}`,
      config(session),
    ),
  merge: (session: GuestCartSession) =>
    httpPost<unknown>("/api/cart/merge/", undefined, config(session)),

  submitOrder: (payload: SubmitOrderPayload) =>
    httpPost<unknown>("/api/cart/submit-order", payload, config()),
};
