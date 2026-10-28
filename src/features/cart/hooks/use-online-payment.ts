"use client";
import { useRef, useState, useSyncExternalStore } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { tokenStorage } from "@/features/auth/utils/token-storage";
import {
  getOnlineGateways,
  startOnlinePayment,
} from "../services/online-payment.service";
import type { CheckoutSubmitInput } from "../services/checkout-submit.service";
import {
  onlinePaymentStorage,
  onlineReturnUrl,
  redirectToOnlineGateway,
} from "../utils/online-payment.utils";
export function useOnlinePayment(
  trackingCode: string,
  sessionId: string | null,
  enabled: boolean,
) {
  const [selectedCode, selectGateway] = useState<string | null>(null);
  const lock = useRef(false);
  const gateways = useQuery({
    queryKey: ["cart", "gateways", sessionId],
    queryFn: ({ signal }) => getOnlineGateways(signal),
    enabled: enabled && Boolean(sessionId),
    retry: false,
    staleTime: 60000,
    gcTime: 0,
    refetchOnWindowFocus: false,
  });
  const items = gateways.data?.items ?? [];
  const selectable = items.filter((g) => g.enabled && g.selectable);
  const gatewayCode =
    selectable.find((g) => g.code === selectedCode)?.code ??
    selectable.find((g) => g.code === gateways.data?.defaultCode)?.code ??
    selectable.find((g) => g.isDefault)?.code ??
    selectable[0]?.code ??
    null;
  const snapshot = useSyncExternalStore(
    onlinePaymentStorage.subscribe,
    onlinePaymentStorage.read,
    () => null,
  );
  const stored = onlinePaymentStorage.parse(snapshot);
  const pendingPayment =
    stored?.sessionId === sessionId && stored.trackingCode === trackingCode
      ? stored
      : null;
  const mutation = useMutation({
    retry: false,
    mutationFn: async (input: CheckoutSubmitInput) => {
      if (lock.current) throw new Error("درخواست پرداخت در حال انجام است.");
      if (
        !sessionId ||
        !input.gateway_code ||
        !selectable.some((g) => g.code === input.gateway_code)
      )
        throw new Error("یک درگاه فعال انتخاب کنید.");
      lock.current = true;
      try {
        const session = await startOnlinePayment(input);
        if (tokenStorage.getSessionId() !== sessionId)
          throw new Error("نشست کاربری تغییر کرده است؛ دوباره وارد شوید.");
        onlinePaymentStorage.save(session.paymentId, trackingCode, sessionId);
        if (session.alreadyPaid)
          window.location.assign(onlineReturnUrl(session.paymentId));
        else if (session.redirect) redirectToOnlineGateway(session.redirect);
        else throw new Error("لینک درگاه از بک دریافت نشد.");
        return session;
      } finally {
        lock.current = false;
      }
    },
  });
  return { gateways, gatewayCode, selectGateway, mutation, pendingPayment };
}
