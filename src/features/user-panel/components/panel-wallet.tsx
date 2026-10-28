"use client";
import { useState, type FormEvent } from "react";
import axios from "axios";
import { Dialog } from "radix-ui";
import { X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePanelWallet } from "../hooks/use-panel-wallet";
import { userPanelService } from "../services/user-panel.service";
import { PANEL_WALLET_QUERY_KEY } from "../constants/user-panel.constants";
import type { CustomerWalletCashoutApi } from "../types/panel-wallet.types";
import {
  formatPanelDate,
  formatPanelMoney,
} from "../utils/panel-display.utils";
const MISSING_VALUE = "بدون مقدار از سمت بک‌اند";
function walletAmount(value: string | null, currency: string | null) {
  if (!value) return MISSING_VALUE;
  return (
    <>
      <bdi>{formatPanelMoney(value, currency ?? "")}</bdi>
      {!currency && (
        <span className="block text-[10px] text-neutral-500">
          واحد پول: {MISSING_VALUE}
        </span>
      )}
    </>
  );
}
function walletDate(value: string | null) {
  if (!value) return MISSING_VALUE;
  const formatted = formatPanelDate(value);
  return formatted === "—" ? value : formatted;
}
type WalletAction = "charge" | "cashout";
function getActionError(issue: unknown) {
  if (axios.isAxiosError(issue)) {
    const body = issue.response?.data;
    if (typeof body?.detail === "string") return body.detail;
    if (typeof body?.message === "string") return body.message;
    if (typeof body?.error?.message === "string") return body.error.message;
    const fields = body?.error?.fields;
    if (fields && typeof fields === "object") {
      const fieldError = Object.values(fields)
        .flatMap((value) => (Array.isArray(value) ? value : [value]))
        .find((value) => typeof value === "string");
      if (typeof fieldError === "string") return fieldError;
    }
  }
  return issue instanceof Error ? issue.message : "عملیات انجام نشد. دوباره تلاش کنید.";
}
export default function PanelWallet() {
  const query = usePanelWallet();
  const queryClient = useQueryClient();
  const [action, setAction] = useState<WalletAction | null>(null);
  const [amount, setAmount] = useState("");
  const [sheba, setSheba] = useState("");
  const [actionError, setActionError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [cashoutResult, setCashoutResult] = useState<CustomerWalletCashoutApi | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const wallet = query.data;
  const hasBalance = Boolean(
    wallet &&
    wallet.balance &&
    /^\d+(\.\d+)?$/.test(wallet.balance) &&
    /[1-9]/.test(wallet.balance),
  );
  const closeAction = () => {
    if (submitting) return;
    setAction(null);
    setAmount("");
    setSheba("");
    setActionError("");
    setSuccessMessage("");
    setCashoutResult(null);
  };
  const submitAction = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!action) return;
    setSubmitting(true);
    setActionError("");
    try {
      if (action === "cashout") {
        const result = await userPanelService.cashoutWallet(amount, sheba);
        setSuccessMessage(
          `درخواست نقدکردن ثبت شد. وضعیت: ${result.status || MISSING_VALUE}`,
        );
        setCashoutResult(result);
        setAmount("");
        setSheba("");
        await queryClient.invalidateQueries({ queryKey: PANEL_WALLET_QUERY_KEY });
      } else {
        const result = await userPanelService.chargeWallet(amount);
        userPanelService.redirectWalletCharge(result);
      }
    } catch (issue) {
      setActionError(getActionError(issue));
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <section
      aria-labelledby="panel-wallet-heading"
      className={!wallet?.charges.length ? "min-h-[360px]" : undefined}
    >
      <h1
        id="panel-wallet-heading"
        className="border-b border-neutral-200 pb-4 text-sm font-medium text-neutral-900"
      >
        کیف پول
      </h1>
      {query.isPending ? (
        <div role="status" className="space-y-4 py-12">
          <span className="sr-only">در حال دریافت اطلاعات کیف پول…</span>
          <div className="mx-auto h-16 w-48 rounded bg-neutral-50 motion-safe:animate-pulse" />
        </div>
      ) : query.isError || !wallet ? (
        <div
          role="alert"
          className="flex min-h-64 flex-col items-center justify-center gap-4 text-sm"
        >
          <p>دریافت اطلاعات کیف پول ناموفق بود.</p>
          <Button onClick={() => void query.refetch()}>تلاش مجدد</Button>
        </div>
      ) : (
        <>
          <div className="flex flex-col items-center pt-12 pb-8">
            <p className="mb-2 text-xs text-neutral-700">موجودی</p>
            <p className="text-sm font-medium text-secondary-500">
              {walletAmount(wallet.balance, wallet.currency)}
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Button
                type="button"
                onClick={() => {
                  setAction("charge");
                  setActionError("");
                  setSuccessMessage("");
                  setCashoutResult(null);
                }}
                className="h-9 min-w-[140px] px-4 text-xs"
              >
                شارژ کیف پول
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setAction("cashout");
                  setActionError("");
                  setSuccessMessage("");
                  setCashoutResult(null);
                }}
                variant="secondary"
                disabled={!hasBalance}
                className="h-9 min-w-[126px] px-4 text-xs"
              >
                نقد کردن موجودی
              </Button>
            </div>
          </div>
          {wallet.charges.length > 0 && (
            <section
              aria-labelledby="panel-wallet-history-heading"
              className="mt-1"
            >
              <h2
                id="panel-wallet-history-heading"
                className="mb-4 text-xs text-neutral-700"
              >
                تاریخچه تراکنش‌های کیف پول
              </h2>
              <div className="overflow-x-auto rounded-md border border-primary-100">
                <table className="w-full min-w-[420px] table-fixed border-collapse text-center text-xs leading-6">
                  <caption className="sr-only">
                    تاریخچه تراکنش‌های کیف پول و مانده پس از هر تراکنش
                  </caption>
                  <thead>
                    <tr>
                      {["مبلغ", "تاریخ", "مانده"].map((label) => (
                        <th
                          key={label}
                          scope="col"
                          className="border-b border-l border-primary-100 px-3 py-2 font-medium text-neutral-900 last:border-l-0"
                        >
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {wallet.charges.map((charge) => (
                      <tr key={charge.id} className="text-neutral-700">
                        <td className="border-b border-l border-primary-100 px-3 py-1.5 [tr:last-child_&]:border-b-0">
                          {walletAmount(
                            charge.amount,
                            charge.currency ?? wallet.currency,
                          )}
                          <span className="block text-[10px] text-neutral-500">
                            {charge.details || MISSING_VALUE}
                          </span>
                        </td>
                        <td className="border-b border-l border-primary-100 px-3 py-1.5 [tr:last-child_&]:border-b-0">
                          {charge.chargedAt ? (
                            <time dateTime={charge.chargedAt}>
                              {walletDate(charge.chargedAt)}
                            </time>
                          ) : (
                            MISSING_VALUE
                          )}
                        </td>
                        <td className="border-b border-primary-100 px-3 py-1.5 [tr:last-child_&]:border-b-0">
                          {walletAmount(
                            charge.balanceAfter,
                            charge.currency ?? wallet.currency,
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </>
      )}
      <Dialog.Root
        open={Boolean(action)}
        onOpenChange={(open) => {
          if (!open) closeAction();
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
          <Dialog.Content
            dir="rtl"
            className="fixed top-1/2 left-1/2 z-50 w-[min(92vw,420px)] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-xl"
          >
            <div className="flex items-center justify-between gap-3">
              <Dialog.Title className="text-sm font-medium text-neutral-900">
                {action === "cashout" ? "نقدکردن موجودی" : "شارژ کیف پول"}
              </Dialog.Title>
              <Dialog.Close
                aria-label="بستن"
                disabled={submitting}
                className="rounded p-1 text-primary-500 focus-visible:ring-2 focus-visible:ring-primary-300"
              >
                <X size={18} />
              </Dialog.Close>
            </div>
            <Dialog.Description className="mt-2 text-xs leading-6 text-neutral-600">
              {action === "cashout"
                ? "مبلغ و شماره شبای مقصد را وارد کنید."
                : "مبلغ شارژ را وارد کنید تا به درگاه پرداخت منتقل شوید."}
            </Dialog.Description>
            {successMessage ? (
              <div role="status" className="mt-5 space-y-4 text-sm">
                <p>{successMessage}</p>
                  {cashoutResult && (
                    <dl className="space-y-2 text-xs leading-6 text-neutral-700">
                      <div className="flex justify-between gap-3">
                        <dt>مبلغ درخواست</dt>
                        <dd>{walletAmount(cashoutResult.amount || null, cashoutResult.currency || null)}</dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt>مانده کیف پول</dt>
                        <dd>{walletAmount(cashoutResult.remaining || null, cashoutResult.currency || null)}</dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt>شماره شبا</dt>
                        <dd dir="ltr">{cashoutResult.sheba_number || MISSING_VALUE}</dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt>وضعیت</dt>
                        <dd>{cashoutResult.status || MISSING_VALUE}</dd>
                      </div>
                    </dl>
                  )}
                {wallet?.balance && (
                  <p className="text-xs text-neutral-600">
                    موجودی فعلی: {walletAmount(wallet.balance, wallet.currency)}
                  </p>
                )}
                <Button type="button" onClick={closeAction} className="w-full">
                  بستن
                </Button>
              </div>
            ) : (
              <form onSubmit={(event) => void submitAction(event)} className="mt-5 space-y-4">
                <label className="block space-y-2 text-xs text-neutral-700">
                  <span>مبلغ ({wallet?.currency || "واحد پول نامشخص"})</span>
                  <Input
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    placeholder="مبلغ را وارد کنید"
                    required
                    disabled={submitting}
                    dir="ltr"
                    className="text-right"
                  />
                </label>
                {action === "cashout" && (
                  <label className="block space-y-2 text-xs text-neutral-700">
                    <span>شماره شبا</span>
                    <Input
                      type="text"
                      inputMode="text"
                      autoComplete="off"
                      value={sheba}
                      onChange={(event) => setSheba(event.target.value)}
                      placeholder="IR۰۰۰۰۰۰۰۰۰۰۰۰۰۰۰۰۰۰۰۰۰۰۰۰"
                      required
                      disabled={submitting}
                      dir="ltr"
                      className="text-left"
                    />
                  </label>
                )}
                {actionError && (
                  <p role="alert" className="text-xs leading-6 text-red-600">
                    {actionError}
                  </p>
                )}
                <div className="flex gap-3">
                  <Button type="submit" disabled={submitting} className="flex-1">
                    {submitting ? "در حال ارسال…" : action === "cashout" ? "ثبت درخواست" : "ادامه به پرداخت"}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={submitting}
                    onClick={closeAction}
                  >
                    انصراف
                  </Button>
                </div>
              </form>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </section>
  );
}
