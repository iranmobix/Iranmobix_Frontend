"use client";
import { useRef, useSyncExternalStore } from "react";
import { useMutation } from "@tanstack/react-query";
import { tokenStorage } from "@/features/auth/utils/token-storage";
import { startOnlinePayment } from "../services/online-payment.service";
import type { CheckoutSubmitInput } from "../services/checkout-submit.service";
import {
  onlinePaymentStorage,
  onlineReturnUrl,
  redirectToOnlineGateway,
} from "../utils/online-payment.utils";
export function useOnlinePayment(
  trackingCode: string,
  sessionId: string | null,
) {
  const lock = useRef(false);
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
        tokenStorage.getSessionId() !== sessionId ||
        input.tracking_code !== trackingCode
      )
        throw new Error(
          "نشست کاربری یا سفارش تغییر کرده است؛ دوباره بررسی کنید.",
        );
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
  return { mutation, pendingPayment };
}
