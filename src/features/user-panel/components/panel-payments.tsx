"use client";
import { useState } from "react";
import { Dialog } from "radix-ui";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePanelPayments } from "../hooks/use-panel-payments";
import {
  formatPanelDate,
  formatPanelMoney,
} from "../utils/panel-display.utils";
const MISSING_VALUE = "بدون مقدار از سمت بک‌اند";
function paymentDate(value: string | null) {
  if (!value) return MISSING_VALUE;
  const formatted = formatPanelDate(value);
  return formatted === "—" ? value : formatted;
}
export default function PanelPayments() {
  const query = usePanelPayments();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const payments = query.data ?? [];
  const selected = payments.find((payment) => payment.id === selectedId);
  return (
    <section aria-labelledby="panel-payments-heading">
      <h1
        id="panel-payments-heading"
        className="border-b border-neutral-200 pb-4 text-sm font-medium text-neutral-900"
      >
        پرداخت‌ها
      </h1>
      {query.isPending ? (
        <div role="status" className="space-y-3 py-5">
          <span className="sr-only">در حال دریافت پرداخت‌ها…</span>
          <div className="h-64 rounded bg-neutral-50 motion-safe:animate-pulse" />
        </div>
      ) : query.isError ? (
        <div
          role="alert"
          className="flex min-h-64 flex-col items-center justify-center gap-4 text-sm"
        >
          <p>دریافت پرداخت‌ها ناموفق بود.</p>
          <Button onClick={() => void query.refetch()}>تلاش مجدد</Button>
        </div>
      ) : payments.length === 0 ? (
        <p role="status" className="py-20 text-center text-xs text-neutral-700">
          تاکنون پرداختی ثبت نشده است.
        </p>
      ) : (
        <div className="mt-5 overflow-x-auto rounded-md border border-primary-100">
          <table className="w-full min-w-[480px] table-fixed border-collapse text-center text-xs leading-6">
            <caption className="sr-only">تاریخچه پرداخت‌ها</caption>
            <thead>
              <tr>
                {["مبلغ", "روش پرداخت", "تاریخ", "جزئیات"].map((label) => (
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
              {payments.map((payment) => (
                <tr key={payment.id} className="text-neutral-700">
                  <td className="border-b border-l border-primary-100 px-3 py-1.5 [tr:last-child_&]:border-b-0">
                    {payment.amount ? (
                      <>
                        <bdi>{formatPanelMoney(payment.amount, payment.currency ?? "")}</bdi>
                        {!payment.currency && (
                          <span className="block text-[10px] text-neutral-500">
                            واحد پول: {MISSING_VALUE}
                          </span>
                        )}
                      </>
                    ) : (
                      MISSING_VALUE
                    )}
                  </td>
                  <td className="border-b border-l border-primary-100 px-3 py-1.5 [tr:last-child_&]:border-b-0">
                    {payment.methodLabel}
                  </td>
                  <td className="border-b border-l border-primary-100 px-3 py-1.5 [tr:last-child_&]:border-b-0">
                    {payment.paidAt ? (
                      <time dateTime={payment.paidAt}>{paymentDate(payment.paidAt)}</time>
                    ) : (
                      MISSING_VALUE
                    )}
                  </td>
                  <td className="border-b border-primary-100 px-3 py-1.5 [tr:last-child_&]:border-b-0">
                    <button
                      type="button"
                      onClick={() => setSelectedId(payment.id)}
                      aria-label={
                        "مشاهده پرداخت " +
                        (payment.amount
                          ? formatPanelMoney(payment.amount, payment.currency ?? "")
                          : MISSING_VALUE) +
                        " در " +
                        paymentDate(payment.paidAt)
                      }
                      className="rounded px-2 text-primary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
                    >
                      مشاهده
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Dialog.Root
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null);
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
          <Dialog.Content
            dir="rtl"
            className="fixed top-1/2 left-1/2 z-50 w-[min(92vw,420px)] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-xl"
          >
            <div className="flex items-center justify-between gap-3">
              <Dialog.Title className="text-sm font-medium">
                جزئیات پرداخت
              </Dialog.Title>
              <Dialog.Close
                aria-label="بستن"
                className="rounded p-1 text-primary-500 focus-visible:ring-2 focus-visible:ring-primary-300"
              >
                <X size={18} />
              </Dialog.Close>
            </div>
            <Dialog.Description className="sr-only">
              اطلاعات پرداخت انتخاب‌شده از تاریخچه
            </Dialog.Description>
            {selected && (
              <dl className="mt-5 space-y-3 text-xs leading-6">
                <div className="flex justify-between gap-4">
                  <dt>مبلغ</dt>
                  <dd>
                    <bdi>
                      {selected.amount
                        ? formatPanelMoney(selected.amount, selected.currency ?? "")
                        : MISSING_VALUE}
                    </bdi>
                    {selected.amount && !selected.currency && (
                      <span className="block text-[10px] text-neutral-500">
                        واحد پول: {MISSING_VALUE}
                      </span>
                    )}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>روش پرداخت</dt>
                  <dd>{selected.methodLabel}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>تاریخ</dt>
                  <dd>{paymentDate(selected.paidAt)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>ساعت</dt>
                  <dd>{selected.paidTime || MISSING_VALUE}</dd>
                </div>
              </dl>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </section>
  );
}
