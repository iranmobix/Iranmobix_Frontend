"use client";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { tokenStorage } from "@/features/auth/utils/token-storage";
import { useAccessToken } from "@/features/auth/hooks/use-access-token";
import { useCustomerAddresses } from "./use-customer-addresses";
import { checkoutPaymentService } from "../services/checkout-payment.service";
import type { CheckoutPayment } from "../types/domain/checkout-payment.types";
import { applyCheckoutCouponPreview } from "../mappers/checkout-payment.mapper";
type PaymentSnapshot = CheckoutPayment & { appliedCouponCode: string };
export function useCheckoutPayment(trackingCode: string) {
  const token = useAccessToken();
  const sessionId = token ? tokenStorage.getSessionId() : null;
  const client = useQueryClient();
  const couponLock = useRef(false);
  const queryKey = ["cart", "payment", trackingCode, sessionId] as const;
  const scope = JSON.stringify(queryKey);
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);
  const query = useQuery({
    queryKey,
    queryFn: async ({ signal }) => {
      const couponCode =
        client.getQueryData<PaymentSnapshot>(queryKey)?.appliedCouponCode ?? "";
      const data = await checkoutPaymentService.get(
        trackingCode,
        signal,
        couponCode,
      );
      return { ...data, appliedCouponCode: couponCode };
    },
    enabled: Boolean(token && trackingCode),
    retry: false,
    // Poll only a confirmed pending state; authentication/schema errors remain visible.
    refetchInterval: (query) =>
      query.state.status === "success" &&
      query.state.data?.status === "pending_review"
        ? 15000
        : false,
    refetchIntervalInBackground: false,
    staleTime: 0,
    gcTime: 0,
  });
  // Preview has its own loading/error state; it never changes the checkout phase.
  const couponMutation = useMutation({
    mutationFn: async ({
      code,
      key,
    }: {
      code: string;
      key: typeof queryKey;
      scope: string;
    }) => {
      await client.cancelQueries({ queryKey: key, exact: true });
      return checkoutPaymentService.get(key[2], undefined, code);
    },
    retry: false,
    onSuccess: async (preview, { code, key }) => {
      await client.cancelQueries({ queryKey: key, exact: true });
      client.setQueryData<PaymentSnapshot>(key, (current) =>
        current
          ? {
              ...applyCheckoutCouponPreview(current, preview),
              appliedCouponCode: code,
            }
          : undefined,
      );
    },
    onSettled: () => {
      couponLock.current = false;
    },
  });
  const couponInScope = couponMutation.variables?.scope === scope;
  const couponPending = couponInScope && couponMutation.isPending;
  const applyCoupon = (code: string) => {
    if (couponLock.current || query.isFetching || !query.data || !token) return;
    couponLock.current = true;
    couponMutation.mutate({ code: code.trim(), key: queryKey, scope });
  };
  const addressQuery = useCustomerAddresses();
  const expiresAt = query.data?.expiresAt;
  const expires = expiresAt ? Date.parse(expiresAt) : NaN;
  const expired = Boolean(
    expiresAt && (now === null || !Number.isFinite(expires) || expires <= now),
  );
  return {
    ...query,
    addressQuery,
    applyCoupon,
    couponPending,
    couponError:
      couponInScope && couponMutation.isError ? couponMutation.error : null,
    appliedCouponCode: query.data?.appliedCouponCode ?? "",
    sessionId,
    isLoggedIn: Boolean(token),
    expired,
    canContinue: Boolean(
      query.data?.canContinue &&
      !expired &&
      !query.isError &&
      !query.isFetching &&
      !query.isPlaceholderData,
    ),
  };
}
