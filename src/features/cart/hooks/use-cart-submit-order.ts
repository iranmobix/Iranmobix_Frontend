"use client";
import { useRef, useState } from "react";
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
} from "../services/cart-order.service";
import { getCartSubmissionIssue } from "../mappers/cart-submit-order.mapper";
import {
  CART_QUERY_KEY,
  CART_SUBMIT_MUTATION_KEY,
} from "../constants/cart-query-keys";
import type {
  CartShippingMethod,
  ServerCart,
} from "../types/domain/cart.types";

export function useCartSubmitOrder(
  cart: ServerCart | undefined,
  isMock: boolean,
  isStale: boolean,
) {
  const [shippingMethod, setShippingMethod] =
    useState<CartShippingMethod | null>(null);
  const router = useRouter();
  const queryClient = useQueryClient();
  const locked = useRef(false);
  const busy = useIsMutating({ mutationKey: ["cart"] }) > 0;
  const issue = isMock
    ? "سبد نمونه قابل ثبت واقعی نیست."
    : !shippingMethod
      ? "لطفاً روش ارسال را انتخاب کنید."
      : cart
      ? getCartSubmissionIssue(cart, shippingMethod)
      : "اطلاعات سبد هنوز دریافت نشده است.";
  const mutation = useMutation({
    mutationKey: CART_SUBMIT_MUTATION_KEY,
    retry: false,
    mutationFn: async ({
      snapshot,
      shippingMethod,
    }: {
      snapshot: ServerCart;
      shippingMethod: CartShippingMethod;
    }) => {
      const trackingCode = await cartOrderService.submit(
        snapshot,
        "api",
        shippingMethod,
      );
      return {
        trackingCode,
        quantity: snapshot.totalQuantity,
        total: snapshot.finalTotal,
        currency: snapshot.currency,
      };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });
  const submit = async () => {
    if (
      !cart ||
      !shippingMethod ||
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
      await mutation.mutateAsync({ snapshot: cart, shippingMethod });
    } catch {
      /* Keep the error visible and the same submission key for manual retry. */
    } finally {
      locked.current = false;
    }
  };
  return {
    shippingMethod,
    setShippingMethod,
    submit: () => void submit(),
    isPending: mutation.isPending,
    disabled: Boolean(issue) || isStale || busy || mutation.isSuccess,
    unavailableReason: issue,
    error: mutation.isError ? getCartSubmitError(mutation.error) : null,
    accepted: mutation.isSuccess ? mutation.data : null,
    backToCart: () => mutation.reset(),
  };
}
