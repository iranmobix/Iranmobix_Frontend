import { tokenStorage } from "@/features/auth/utils/token-storage";
import { cartMockApi } from "../api/cart.api.mock";
import { getCartMergeIssues } from "../utils/cart.utils";
import { cartApi } from "../api/cart.api";
import {
  addToCartSchema,
  updateCartItemSchema,
  removeCartItemSchema,
  cartMergeSchema,
} from "../schemas/cart.schema";
import { mapCartMerge } from "../mappers/cart.mapper";
import { mapCartForDisplay } from "../mappers/cart-display.mapper";
import { ensureGuestCartSession } from "./cart-session.service";
import { cartSessionStorage } from "../utils/cart-session.storage";
import type {
  AddToCartInput,
  UpdateCartItemInput,
  RemoveCartItemInput,
} from "../types/api/cart-payload.types";
import type {
  CartMergeResult,
  CartDataSource,
} from "../types/domain/cart.types";
let pendingMerge: Promise<CartMergeResult | null> | null = null;

export const cartService = {
  async getCart(
    options: { source?: CartDataSource; signal?: AbortSignal } = {},
  ) {
    if (options.source === "mock") {
      return mapCartForDisplay(await cartMockApi.getCart());
    }
    options.signal?.throwIfAborted();
    // A first-time guest needs an identity before reading the cart, too.
    const session = tokenStorage.getAccessToken()
      ? cartSessionStorage.read()
      : await ensureGuestCartSession();
    options.signal?.throwIfAborted();
    const response = await cartApi.getCart(session, options.signal);
    return mapCartForDisplay(response);
  },
  async addItem(input: AddToCartInput): Promise<void> {
    const parsed = addToCartSchema.parse(input);
    const session = await ensureGuestCartSession();
    // Never retry a POST automatically: a lost response may still mean the item was added.
    await cartApi.addItem(parsed, session);
  },
  async updateItem(input: UpdateCartItemInput): Promise<void> {
    const parsed = updateCartItemSchema.parse(input);
    await cartApi.updateItem(parsed, cartSessionStorage.read());
  },
  async removeItem(input: RemoveCartItemInput): Promise<void> {
    const parsed = removeCartItemSchema.parse(input);
    await cartApi.removeItem(parsed, cartSessionStorage.read());
  },

  mergeGuestCart(): Promise<CartMergeResult | null> {
    if (pendingMerge) return pendingMerge;
    const session = cartSessionStorage.read();
    if (!session) return Promise.resolve(null);
    pendingMerge = (async () => {
      const result = mapCartMerge(
        cartMergeSchema.parse(await cartApi.merge(session)),
      );
      // Keep the guest token on partial/failed transfers; never silently abandon those items.
      if (getCartMergeIssues(result).length === 0) {
        cartSessionStorage.clear(session.token);
      }
      return result;
    })().finally(() => {
      pendingMerge = null;
    });
    return pendingMerge;
  },
};
