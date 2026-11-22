"use client";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import {
  useMutation,
  useQueryClient,
  useIsMutating,
} from "@tanstack/react-query";
import { tokenStorage } from "@/features/auth/utils/token-storage";
import {
  cartOrderService,
  getCartSubmitError,
  getCartSubmitConflictCart,
} from "../services/cart-order.service";
import { getCartSubmissionIssue } from "../mappers/cart-submit-order.mapper";
import {
  CART_QUERY_KEY,
  CART_SUBMIT_MUTATION_KEY,
} from "../constants/cart-query-keys";
import type { ServerCart } from "../types/domain/cart.types";

export function useCartSubmitOrder(
  cart: ServerCart | undefined,
  isMock: boolean,
  isStale: boolean,
) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const locked = useRef(false);
  const busy = useIsMutating({ mutationKey: ["cart"] }) > 0;
  const issue = isMock
    ? "سبد نمونه قابل ثبت واقعی نیست."
    : cart
      ? getCartSubmissionIssue(cart)
      : "اطلاعات سبد هنوز دریافت نشده است.";
  const mutation = useMutation({
    mutationKey: CART_SUBMIT_MUTATION_KEY,
    retry: false,
    mutationFn: async ({ snapshot }: { snapshot: ServerCart }) => {
      const trackingCode = await cartOrderService.submit(snapshot, "api");
      return {
        trackingCode,
        quantity: snapshot.totalQuantity,
        total: snapshot.finalTotal,
        currency: snapshot.currency,
      };
    },
    onError: async (error) => {
      const latestCart = getCartSubmitConflictCart(error);
      if (!latestCart) return;
      await queryClient.cancelQueries({ queryKey: CART_QUERY_KEY });
      queryClient.setQueryData(CART_QUERY_KEY, latestCart);
      // GET refreshes the displayed snapshot before the next explicit submit.
      await queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });
  const submit = async () => {
    if (
      !cart ||
      issue ||
      isStale ||
      locked.current ||
      mutation.isSuccess ||
      queryClient.isMutating({ mutationKey: ["cart"] }) ||
      queryClient.isFetching({ queryKey: CART_QUERY_KEY })
    )
      return;
    if (!tokenStorage.getAccessToken()) {
      router.push("/login?returnTo=/cart");
      return;
    }
    locked.current = true;
    try {
      await mutation.mutateAsync({ snapshot: cart });
    } catch {
      /* Keep the server error visible; do not repeat an order POST automatically. */
    } finally {
      locked.current = false;
    }
  };
  return {
    submit: () => void submit(),
    isPending: mutation.isPending,
    disabled: Boolean(issue) || isStale || busy || mutation.isSuccess,
    unavailableReason: issue,
    error: mutation.isError ? getCartSubmitError(mutation.error) : null,
    accepted: mutation.isSuccess ? mutation.data : null,
    backToCart: () => mutation.reset(),
  };
}
