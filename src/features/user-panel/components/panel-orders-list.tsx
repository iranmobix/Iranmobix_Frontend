"use client";
import { useId, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { PanelOrder } from "../types/panel-order.types";
import PanelOrderTimeline from "./panel-order-timeline";
import PanelInvoiceLink from "./panel-invoice-link";
import { customerOrdersApi } from "../api/customer-orders.api";
import {
  formatPanelMoney,
  formatPanelDate,
} from "../utils/panel-display.utils";
const MISSING_VALUE = "بدون مقدار از سمت بک‌اند";
export default function PanelOrdersList({ orders }: { orders: PanelOrder[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const selected = orders.find((order) => order.id === expandedId);
  const detailQuery = useQuery({
    queryKey: ["user-panel", "order-detail", selected?.code],
    queryFn: () => {
      if (!selected) throw new Error("سفارشی انتخاب نشده است.");
      return customerOrdersApi.get(selected.code);
    },
    enabled: Boolean(selected && selected.code !== MISSING_VALUE),
    retry: false,
  });
  const id = useId();
  return (
    <div className="pt-5">
      <div className="overflow-x-auto rounded-md border border-primary-100">
        <table className="w-full min-w-[700px] table-fixed border-collapse text-right text-[11px] leading-5">
          <caption className="sr-only">فهرست سفارشات</caption>
          <thead>
            <tr>
              {[
                "محصول",
                "کد سفارش",
                "تعداد",
                "مبلغ سفارش",
                "وضعیت",
                "تاریخ سفارش",
                "جزئیات",
              ].map((label) => (
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
            {orders.map((order) => (
              <tr key={order.id} className="align-top text-neutral-700">
                <td className="border-b border-l border-primary-100 px-3 py-3 [tr:last-child_&]:border-b-0">
                  <bdi>{order.productTitle}</bdi>
                </td>
                <td className="break-all border-b border-l border-primary-100 px-3 py-3 [tr:last-child_&]:border-b-0">
                  <bdi>{order.code}</bdi>
                </td>
                <td className="border-b border-l border-primary-100 px-3 py-3 [tr:last-child_&]:border-b-0">
                  {order.quantity === null
                    ? MISSING_VALUE
                    : order.quantity.toLocaleString("fa-IR")}
                </td>
                <td className="border-b border-l border-primary-100 px-3 py-3 [tr:last-child_&]:border-b-0">
                  {order.amount ? (
                    <>
                      <bdi>{formatPanelMoney(order.amount, order.currency ?? "")}</bdi>
                      {!order.currency && (
                        <span className="block text-[10px] text-neutral-500">
                          واحد پول: {MISSING_VALUE}
                        </span>
                      )}
                    </>
                  ) : (
                    MISSING_VALUE
                  )}
                </td>
                <td className="border-b border-l border-primary-100 px-3 py-3 [tr:last-child_&]:border-b-0">
                  {order.statusLabel}
                </td>
                <td className="border-b border-l border-primary-100 px-3 py-3 [tr:last-child_&]:border-b-0">
                  {order.orderedAt ? (
                    <time dateTime={order.orderedAt}>
                      {formatPanelDate(order.orderedAt)}
                    </time>
                  ) : (
                    MISSING_VALUE
                  )}
                </td>
                <td className="border-b border-primary-100 px-3 py-3 [tr:last-child_&]:border-b-0">
                  <button
                    type="button"
                    onClick={() => setExpandedId(order.id)}
                    aria-label={"مشاهده وضعیت سفارش " + order.code}
                    aria-expanded={order.id === selected?.id}
                    aria-controls={id}
                    className="rounded text-primary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
                  >
                    مشاهده
                  </button>
                  <span className="mt-1 block text-[10px] text-neutral-500">
                    فاکتور: <PanelInvoiceLink invoice={order.invoice} />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-5 flex justify-center">
        <button
          type="button"
          aria-expanded={Boolean(selected)}
          aria-controls={id}
          onClick={() =>
            setExpandedId(selected ? null : (orders[0]?.id ?? null))
          }
          className="flex items-center gap-1 rounded px-3 py-2 text-xs text-primary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
        >
          {selected ? "نمایش کمتر" : "نمایش بیشتر"}
          {selected ? (
            <ChevronUp size={16} aria-hidden="true" />
          ) : (
            <ChevronDown size={16} aria-hidden="true" />
          )}
        </button>
      </div>
      <div id={id}>
        {selected && (
          <>
            <div className="mt-5 rounded-md bg-neutral-50 p-3 text-xs text-neutral-700">
              {selected.code === MISSING_VALUE ? (
                <p>جزئیات سفارش: بدون مقدار از سمت بک‌اند</p>
              ) : detailQuery.isPending ? (
                <p role="status">در حال دریافت جزئیات سفارش…</p>
              ) : detailQuery.isError ? (
                <div role="alert" className="flex items-center justify-between gap-3">
                  <span>دریافت جزئیات سفارش ناموفق بود.</span>
                  <button
                    type="button"
                    onClick={() => void detailQuery.refetch()}
                    className="text-primary-500"
                  >
                    تلاش مجدد
                  </button>
                </div>
              ) : (
                <>
                  <p>
                    کد سفارش: {detailQuery.data?.order_code || MISSING_VALUE}
                  </p>
                  <p className="mt-1 text-neutral-500">
                    اطلاعات تکمیلی سفارش در پاسخ این API ارسال نشده است.
                  </p>
                </>
              )}
            </div>
            <PanelOrderTimeline
              steps={selected.steps}
              code={selected.code}
              invoice={selected.invoice}
            />
          </>
        )}
      </div>
    </div>
  );
}
