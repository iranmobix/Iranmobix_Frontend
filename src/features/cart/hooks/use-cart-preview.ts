"use client";

import { useReducer } from "react";
import type {
  CartSnapshot,
  CartStep,
} from "../types/domain/cart-preview.types";
import { cartReducer, createCartState } from "../services/cart-preview.service";
import { getCartTotals } from "../utils/cart.utils";

export function useCartPreview(
  initialCart: CartSnapshot,
  initialStep: CartStep = "cart",
) {
  const [state, dispatch] = useReducer(cartReducer, initialCart, (snapshot) =>
    createCartState(snapshot, initialStep),
  );
  return {
    ...state,
    totals: getCartTotals(state),
    changeQuantity: (id: string, quantity: number) =>
      dispatch({ type: "quantity", id, quantity }),
    removeItem: (id: string) => dispatch({ type: "remove", id }),
    undoRemove: () => dispatch({ type: "undo-remove" }),
    continueToReview: () => dispatch({ type: "continue" }),
    backToCart: () => dispatch({ type: "back" }),
    approveReview: () => dispatch({ type: "approve" }),
    cancelOrder: () => dispatch({ type: "cancel-order" }),
  };
}
