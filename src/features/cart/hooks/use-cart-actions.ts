"use client";
import { useRef } from "react";
import {
  useMutation,
  useQueryClient,
  useIsMutating,
} from "@tanstack/react-query";
import type { AddToCartInput } from "../types/api/cart-payload.types";
import { cartService } from "../services/cart.service";
import {
  CART_QUERY_KEY,
  CART_EDIT_MUTATION_KEY,
  CART_ADD_MUTATION_KEY,
  CART_MERGE_MUTATION_KEY,
} from "../constants/cart-query-keys";

export function useAddToCart() {
  const queryClient = useQueryClient();
  const locked = useRef(false);
  const pendingAdds = useIsMutating({ mutationKey: ["cart"] });
  const mutation = useMutation({
    mutationKey: CART_ADD_MUTATION_KEY,
    mutationFn: cartService.addItem,
    retry: false,
    onMutate: () => queryClient.cancelQueries({ queryKey: CART_QUERY_KEY }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });
  const add = async (input: AddToCartInput) => {
    if (locked.current || queryClient.isMutating({ mutationKey: ["cart"] }))
      return;
    locked.current = true;
    try {
      await mutation.mutateAsync(input);
    } catch {
      /* Expose the mutation state to the component; never retry a POST. */
    } finally {
      locked.current = false;
    }
  };
  return {
    isPending: mutation.isPending,
    isBusy: pendingAdds > 0,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
    add: (input: AddToCartInput) => void add(input),
  };
}
export function useMergeGuestCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: CART_MERGE_MUTATION_KEY,
    mutationFn: cartService.mergeGuestCart,
    retry: false,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: CART_QUERY_KEY });
      queryClient.removeQueries({ queryKey: CART_QUERY_KEY });
    },
    onSuccess: (result) => {
      if (result) queryClient.setQueryData(CART_QUERY_KEY, result.cart);
      else void queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });
}

type CartEditInput =
  | { type: "quantity"; itemId: string; quantity: number }
  | { type: "remove"; itemId: string };

export function useCartItemActions() {
  const busy = useIsMutating({ mutationKey: ["cart"] }) > 0;
  const queryClient = useQueryClient();
  const locked = useRef(false);
  const mutation = useMutation({
    mutationKey: CART_EDIT_MUTATION_KEY,
    retry: false,
    mutationFn: (input: CartEditInput) =>
      input.type === "quantity"
        ? cartService.updateItem({
            itemId: input.itemId,
            payload: { quantity: input.quantity },
          })
        : cartService.removeItem({ itemId: input.itemId }),
    onMutate: () => queryClient.cancelQueries({ queryKey: CART_QUERY_KEY }),
    // A failed response can still follow a successful write. Reconcile either way; never replay.
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY }),
  });
  const execute = async (input: CartEditInput) => {
    if (locked.current || queryClient.isMutating({ mutationKey: ["cart"] }))
      return;
    locked.current = true;
    try {
      await mutation.mutateAsync(input);
    } catch {
      /* The page displays the mutation error. */
    } finally {
      locked.current = false;
    }
  };
  return {
    isPending: mutation.isPending,
    isError: mutation.isError,
    isBusy: busy,
    changeQuantity: (itemId: string, quantity: number) =>
      void execute({ type: "quantity", itemId, quantity }),
    removeItem: (itemId: string) => void execute({ type: "remove", itemId }),
  };
}
