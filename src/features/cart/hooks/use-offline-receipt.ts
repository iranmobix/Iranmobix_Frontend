"use client";
import { useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  submitCheckout,
  type CheckoutSubmitInput,
} from "../services/checkout-submit.service";
import {
  uploadOfflineReceipt,
  validateOfflineReceipt,
  type OfflineReceiptInput,
} from "../services/offline-receipt.service";
export function useOfflineReceipt() {
  // Retrying an upload must reuse the already prepared order.
  const prepared = useRef<{ fingerprint: string; orderId: number } | null>(
    null,
  );
  const lock = useRef(false);
  const mutation = useMutation({
    retry: false,
    mutationFn: async ({
      checkout,
      receipt,
      sessionId,
    }: {
      checkout: CheckoutSubmitInput;
      receipt: OfflineReceiptInput;
      sessionId: string | null;
    }) => {
      if (lock.current) throw new Error("ارسال رسید در حال انجام است.");
      const error = validateOfflineReceipt(receipt);
      if (error) throw new Error(error);
      if (checkout.payment_type !== "offline")
        throw new Error("روش پرداخت کارت به کارت انتخاب نشده است.");
      lock.current = true;
      try {
        const fingerprint = JSON.stringify([sessionId, checkout]);
        if (prepared.current?.fingerprint !== fingerprint) {
          const response = await submitCheckout(checkout);
          if (response.payment_type !== "offline" || !response.order)
            throw new Error("شناسه سفارش برای ارسال رسید از بک دریافت نشد.");
          prepared.current = { fingerprint, orderId: response.order.id };
        }
        return await uploadOfflineReceipt(prepared.current.orderId, receipt);
      } finally {
        lock.current = false;
      }
    },
  });
  return mutation;
}
