"use client";
import { useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { useAccessToken } from "@/features/auth/hooks/use-access-token";
import { finalizeOnlinePayment } from "../../services/online-payment.service";
import {
  onlinePaymentStorage,
  onlineReturnUrl,
} from "../../utils/online-payment.utils";
import CartSteps from "../cart-steps";
export default function CheckoutOnlineReturn({
  paymentId,
}: {
  paymentId: number | null;
}) {
  const token = useAccessToken();
  const isLoggedIn = Boolean(token);
  const started = useRef<number | null>(null);
  const result = useMutation({
    mutationFn: finalizeOnlinePayment,
    retry: false,
    onSuccess: (data) => {
      if (data.success) onlinePaymentStorage.clear(data.payment_id);
    },
  });
  const { mutate } = result;
  useEffect(() => {
    if (!isLoggedIn || !paymentId || started.current === paymentId) return;
    started.current = paymentId;
    mutate(paymentId);
  }, [isLoggedIn, paymentId, mutate]);
  const loginUrl =
    "/login?returnTo=" +
    encodeURIComponent(paymentId ? onlineReturnUrl(paymentId) : "/cart");
  const error = axios.isAxiosError(result.error)
    ? result.error.response?.data?.error?.message ||
      result.error.response?.data?.detail ||
      "تأیید نهایی پرداخت انجام نشد؛ دوباره وضعیت را بررسی کنید."
    : "پاسخ تأیید پرداخت معتبر نبود؛ وضعیت را دوباره بررسی کنید.";
  const loginRequired =
    !token ||
    (axios.isAxiosError(result.error) && result.error.response?.status === 401);
  return (
    <div dir="rtl" className="min-h-screen bg-neutral-50 px-4 py-6">
      <div className="mx-auto max-w-3xl space-y-5">
        <CartSteps currentStep="payment" />
        <section className="space-y-4 rounded-lg bg-white p-6 text-sm leading-7">
          <h1 className="font-medium">نتیجه پرداخت آنلاین</h1>
          {!paymentId ? (
            <p role="alert">شناسه پرداخت معتبر نیست.</p>
          ) : loginRequired ? (
            <>
              <p>برای بررسی پرداخت وارد حساب صاحب سفارش شوید.</p>
              <Button asChild>
                <Link href={loginUrl}>ورود به حساب</Link>
              </Button>
            </>
          ) : (
            <>
              {result.isPending && (
                <p role="status">در حال بررسی و تأیید پرداخت از بک…</p>
              )}
              {result.isError && (
                <p role="alert" className="text-red-500">
                  {error}
                </p>
              )}
              {result.data && (
                <div role={result.data.success ? "status" : "alert"}>
                  <p>{result.data.message}</p>
                  <p>وضعیت: {result.data.status}</p>
                  <p>
                    کد پیگیری: <bdi>{result.data.tracking_code}</bdi>
                  </p>
                </div>
              )}
              {!result.isPending && !result.data?.success && (
                <Button onClick={() => mutate(paymentId)}>
                  بررسی مجدد نتیجه پرداخت
                </Button>
              )}
              {result.data?.tracking_code && (
                <Button asChild variant="secondary">
                  <Link
                    href={
                      "/cart/" + encodeURIComponent(result.data.tracking_code)
                    }
                  >
                    مشاهده سفارش
                  </Link>
                </Button>
              )}
            </>
          )}
          <Link href="/cart" className="block text-primary-500">
            بازگشت به سبد خرید
          </Link>
        </section>
      </div>
    </div>
  );
}
