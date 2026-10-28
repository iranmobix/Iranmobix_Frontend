"use client";
import { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import CheckoutOnlineGateways from "./checkout-online-gateways";
import { useOnlinePayment } from "../../hooks/use-online-payment";
import { onlineReturnUrl } from "../../utils/online-payment.utils";
import CheckoutReceiptModal from "./checkout-receipt-modal";
import { useOfflineReceipt } from "../../hooks/use-offline-receipt";
import type { OfflineReceiptInput } from "../../services/offline-receipt.service";
import CheckoutContract from "./checkout-contract";
import CheckoutCoupon from "./checkout-coupon";
import { submitCheckout } from "../../services/checkout-submit.service";
import Link from "next/link";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { useCheckoutPayment } from "../../hooks/use-checkout-payment";
import type { CheckoutPaymentMethod } from "../../types/domain/checkout.types";
import CartSteps from "../cart-steps";
import CheckoutAddresses from "./checkout-addresses";
import CheckoutAddressForm from "./checkout-address-form";
import CheckoutPaymentMethods from "./checkout-payment-methods";
import CheckoutPaymentSummary from "./checkout-payment-summary";
import CheckoutBankDetails from "./checkout-bank-details";

export default function CheckoutPaymentPage({
  trackingCode,
}: {
  trackingCode: string;
}) {
  const payLock = useRef(false);
  const [acceptedContract, setAcceptedContract] = useState<string | null>(null);
  const payment = useMutation({ mutationFn: submitCheckout, retry: false });
  const query = useCheckoutPayment(trackingCode);
  const receipt = useOfflineReceipt();
  const [receiptOpen, setReceiptOpen] = useState(false);
  const receiptInScope =
    receipt.variables?.checkout.tracking_code === trackingCode &&
    receipt.variables?.sessionId === query.sessionId;
  const receiptPending = receiptInScope && receipt.isPending;
  const receiptSuccess = receiptInScope && receipt.isSuccess;
  const [address, setAddress] = useState<string | null>(null);
  const [method, setMethod] = useState<CheckoutPaymentMethod | null>(null);
  const online = useOnlinePayment(
    trackingCode,
    query.sessionId,
    method === "online" && query.canContinue,
  );
  const onlineBusy = online.mutation.isPending || online.mutation.isSuccess;
  const [bankOpen, setBankOpen] = useState(false);
  const [addressOpen, setAddressOpen] = useState(false);
  const [addressNotice, setAddressNotice] = useState("");
  const data = query.data;
  const loginUrl =
    "/login?returnTo=" +
    encodeURIComponent("/cart/" + encodeURIComponent(trackingCode));
  const needsLogin =
    !query.isLoggedIn ||
    (axios.isAxiosError(query.error) && query.error.response?.status === 401);
  const activeMethod =
    query.canContinue &&
    data?.options.some((option) => option.method === method && option.enabled)
      ? method
      : null;
  const addresses = query.addressQuery.data?.items ?? [];
  const selectedAddress =
    addresses.find((a) => a.id === (address ?? data?.selectedAddressId))?.id ??
    null;

  const contractKey = data?.contract
    ? JSON.stringify([
        trackingCode,
        query.sessionId,
        data.contract.templateId,
        data.contract.pdfUrl,
        data.contract.title,
      ])
    : null;
  const accepted = contractKey !== null && acceptedContract === contractKey;
  const canPay = Boolean(
    query.canContinue &&
    selectedAddress &&
    activeMethod &&
    accepted &&
    !query.couponPending &&
    !payment.isPending &&
    !payment.isSuccess &&
    !receiptPending &&
    !receiptSuccess &&
    !onlineBusy &&
    (activeMethod !== "online" ||
      Boolean(
        online.gatewayCode &&
        !online.gateways.isError &&
        !online.gateways.isFetching,
      )),
  );
  const paymentTypes = {
    online: "online",
    wallet: "wallet",
    "bank-transfer": "offline",
    "foreign-transfer": "hawala",
  } as const;
  const submitReceipt = (input: OfflineReceiptInput) => {
    if (
      !canPay ||
      !data ||
      !selectedAddress ||
      activeMethod !== "bank-transfer"
    )
      return;
    receipt.mutate(
      {
        sessionId: query.sessionId,
        receipt: input,
        checkout: {
          tracking_code: trackingCode,
          address_id: Number(selectedAddress),
          payment_type: "offline",
          contract_accepted: true,
          final_amount: data.total,
          ...(query.appliedCouponCode
            ? { coupon_code: query.appliedCouponCode }
            : {}),
        },
      },
      { onSuccess: () => setReceiptOpen(false) },
    );
  };
  const pay = () => {
    if (!canPay || !data || !selectedAddress || !activeMethod) return;
    if (activeMethod === "bank-transfer") {
      receipt.reset();
      setReceiptOpen(true);
      return;
    }
    if (activeMethod === "online") {
      if (!online.gatewayCode) return;
      online.mutation.mutate({
        tracking_code: trackingCode,
        address_id: Number(selectedAddress),
        payment_type: "online",
        gateway_code: online.gatewayCode,
        contract_accepted: true,
        final_amount: data.total,
        ...(query.appliedCouponCode
          ? { coupon_code: query.appliedCouponCode }
          : {}),
      });
      return;
    }
    if (payLock.current) return;
    payLock.current = true;
    payment.mutate(
      {
        tracking_code: trackingCode,
        address_id: Number(selectedAddress),
        payment_type: paymentTypes[activeMethod],
        contract_accepted: true,
        final_amount: data.total,
        ...(query.appliedCouponCode
          ? { coupon_code: query.appliedCouponCode }
          : {}),
      },
      {
        onSettled: () => {
          payLock.current = false;
        },
      },
    );
  };
  const coupon = (
    <CheckoutCoupon
      applied={query.appliedCouponCode}
      pending={query.couponPending}
      error={query.couponError}
      disabled={
        query.isFetching ||
        query.couponPending ||
        payment.isPending ||
        payment.isSuccess ||
        receiptPending ||
        receiptSuccess ||
        onlineBusy
      }
      onApply={(code) => {
        payment.reset();
        query.applyCoupon(code);
      }}
    />
  );
  return (
    <div
      dir="rtl"
      className="min-h-screen bg-neutral-50 px-2 py-3 sm:px-4 sm:py-6 lg:px-9"
    >
      <div className="mx-auto max-w-[1440px] space-y-3 sm:space-y-5">
        <CartSteps
          currentStep={
            needsLogin
              ? "account"
              : data?.status === "approved"
                ? "payment"
                : "review"
          }
        />
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <h1 className="sr-only lg:not-sr-only">انتخاب آدرس و پرداخت</h1>
          <span className="hidden lg:inline">
            کد پیگیری: <bdi>{trackingCode}</bdi>
          </span>
        </div>
        {needsLogin ? (
          <section className="rounded-lg bg-white p-6">
            <p className="mb-4">
              برای مشاهده سفارش، وارد حساب صاحب سفارش شوید.
            </p>
            <Button asChild>
              <Link href={loginUrl}>ورود به حساب</Link>
            </Button>
          </section>
        ) : query.isPending ? (
          <div role="status" className="space-y-4 rounded-lg bg-white p-6">
            <span className="sr-only">در حال دریافت اطلاعات پرداخت</span>
            <div className="h-32 rounded bg-neutral-100 motion-safe:animate-pulse" />
            <div className="h-60 rounded bg-neutral-100 motion-safe:animate-pulse" />
          </div>
        ) : (
          <>
            {online.pendingPayment && (
              <Button asChild variant="secondary">
                <Link href={onlineReturnUrl(online.pendingPayment.paymentId)}>
                  بررسی نتیجه پرداخت آنلاین
                </Link>
              </Button>
            )}
            {online.mutation.isError && (
              <p
                role="alert"
                className="rounded bg-white p-4 text-sm text-red-500"
              >
                {axios.isAxiosError(online.mutation.error)
                  ? online.mutation.error.response?.data?.error?.message ||
                    online.mutation.error.response?.data?.detail ||
                    "اتصال به درگاه ناموفق بود؛ دوباره تلاش کنید."
                  : online.mutation.error.message}
              </p>
            )}
            {query.isError && (
              <div role="alert" className="rounded-lg bg-white p-6 text-sm">
                {axios.isAxiosError(query.error)
                  ? query.error.response?.data?.error?.message ||
                    query.error.response?.data?.detail ||
                    "دریافت اطلاعات پرداخت ناموفق بود؛ کد تخفیف یا دسترسی سفارش را بررسی کنید."
                  : "پاسخ اطلاعات پرداخت نامعتبر بود؛ دوباره بررسی کنید."}
              </div>
            )}
            {payment.isError && (
              <p
                role="alert"
                className="rounded bg-white p-4 text-sm text-red-500"
              >
                {axios.isAxiosError(payment.error)
                  ? payment.error.response?.data?.error?.message ||
                    payment.error.response?.data?.detail ||
                    "ثبت پرداخت تأیید نشد؛ وضعیت سفارش را بررسی کنید."
                  : "پاسخ ثبت پرداخت نامعتبر بود؛ قبل از تکرار وضعیت سفارش را بررسی کنید."}
              </p>
            )}
            {receiptSuccess && (
              <p role="status" className="rounded bg-white p-4 text-sm">
                رسید پرداخت ارسال شد.
                {receipt.data?.payment_status_label && (
                  <span>
                    {" "}
                    وضعیت پرداخت: {receipt.data.payment_status_label}
                  </span>
                )}
              </p>
            )}
            {payment.isSuccess && (
              <p role="status" className="rounded bg-white p-4 text-sm">
                {payment.data.next_action.message ||
                  "درخواست ثبت شد؛ مرحله بعد: " + payment.data.next_action.type}
              </p>
            )}
            <Button
              variant="secondary"
              disabled={
                query.isFetching ||
                query.couponPending ||
                receiptPending ||
                onlineBusy
              }
              onClick={() => void query.refetch()}
            >
              {query.isFetching ? "در حال بررسی…" : "بررسی مجدد وضعیت سفارش"}
            </Button>
            {data && !query.isError && (
              <>
                <p
                  role="status"
                  className="rounded-lg bg-white p-5 text-sm leading-7"
                >
                  {data.status === "approved" && query.expired
                    ? "مهلت قیمت تأییدشده پایان یافته یا تاریخ اعتبار نامعتبر است؛ وضعیت سفارش را مجدداً بررسی کنید."
                    : data.message}
                  {data.status === "pending_review" && (
                    <span className="block text-xs">
                      وضعیت کارشناس هر ۱۵ ثانیه بررسی می‌شود.
                    </span>
                  )}
                  {data.expiresAt && (
                    <span className="block text-xs">
                      اعتبار قیمت تا:{" "}
                      <bdi>
                        {Number.isFinite(Date.parse(data.expiresAt))
                          ? new Date(data.expiresAt).toLocaleString("fa-IR")
                          : "تاریخ نامعتبر از بک"}
                      </bdi>
                    </span>
                  )}
                </p>
                {(data.status === "approved" || data.status === null) && (
                  <div className="grid items-start gap-3 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_330px] xl:grid-cols-[minmax(0,1fr)_410px]">
                    <div className="space-y-3 sm:space-y-6">
                      <CheckoutAddresses
                        addresses={addresses}
                        selectedId={selectedAddress}
                        onSelect={setAddress}
                        onRequestAdd={() => setAddressOpen(true)}
                      />
                      {query.addressQuery.isPending && (
                        <p role="status" className="text-xs">
                          در حال دریافت آدرس‌ها…
                        </p>
                      )}
                      {query.addressQuery.isError && (
                        <div role="alert" className="text-xs text-red-500">
                          دریافت آدرس‌ها ناموفق بود.
                          <Button
                            variant="ghost"
                            disabled={query.addressQuery.isFetching}
                            onClick={() => void query.addressQuery.refetch()}
                          >
                            تلاش مجدد آدرس‌ها
                          </Button>
                        </div>
                      )}
                      {query.addressQuery.data?.hasMore && (
                        <p className="text-xs">
                          فهرست آدرس‌های بک چندصفحه‌ای است؛ فعلاً صفحهٔ اول
                          نمایش داده می‌شود.
                        </p>
                      )}
                      {addressNotice && (
                        <p
                          role="status"
                          className="text-xs leading-6 text-emerald-700"
                        >
                          {addressNotice}
                        </p>
                      )}
                      <p className="sr-only lg:not-sr-only lg:text-xs lg:text-neutral-700">
                        انتخاب آدرس فعلاً محلی است؛ قرارداد ثبت آدرس روی سفارش
                        دریافت نشده است.
                      </p>
                      <CheckoutPaymentMethods
                        value={activeMethod}
                        serverOptions={data.options}
                        walletSnapshot={data.wallet}
                        disabled={
                          !query.canContinue ||
                          payment.isPending ||
                          payment.isSuccess ||
                          receiptPending ||
                          receiptSuccess ||
                          onlineBusy
                        }
                        onChange={setMethod}
                        onBankDetails={() => setBankOpen(true)}
                      />
                      <CheckoutContract
                        contract={data.contract}
                        accepted={accepted}
                        disabled={
                          !query.canContinue ||
                          payment.isPending ||
                          payment.isSuccess ||
                          receiptPending ||
                          receiptSuccess ||
                          onlineBusy
                        }
                        onChange={(value) =>
                          setAcceptedContract(value ? contractKey : null)
                        }
                      />
                      {activeMethod === "online" && (
                        <CheckoutOnlineGateways
                          items={online.gateways.data?.items ?? []}
                          value={online.gatewayCode}
                          onChange={online.selectGateway}
                          pending={online.gateways.isFetching}
                          error={online.gateways.isError}
                          disabled={
                            onlineBusy || payment.isPending || receiptPending
                          }
                          onRetry={() => void online.gateways.refetch()}
                        />
                      )}
                    </div>
                    <CheckoutPaymentSummary
                      data={data}
                      method={activeMethod}
                      canPay={canPay}
                      isSubmitting={
                        payment.isPending ||
                        receiptPending ||
                        online.mutation.isPending
                      }
                      onPay={pay}
                      coupon={coupon}
                    />
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
      {receiptOpen && !needsLogin && (
        <CheckoutReceiptModal
          onDismiss={() => setReceiptOpen(false)}
          onSubmit={submitReceipt}
          pending={receiptPending}
          error={receiptInScope ? receipt.error : null}
          canSubmit={canPay && activeMethod === "bank-transfer"}
        />
      )}
      {addressOpen && !needsLogin && (
        <CheckoutAddressForm
          onDismiss={() => setAddressOpen(false)}
          onSaved={() => {
            setAddressOpen(false);
            setAddressNotice(
              "آدرس ثبت شد؛ فهرست آدرس‌ها دوباره از بک دریافت می‌شود.",
            );
          }}
        />
      )}
      {bankOpen && !needsLogin && !query.isError && (
        <CheckoutBankDetails
          accounts={data?.bankAccounts ?? []}
          onDismiss={() => setBankOpen(false)}
        />
      )}
    </div>
  );
}
