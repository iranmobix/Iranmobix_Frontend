"use client";
import { useId, useRef, useState, type KeyboardEvent } from "react";
import Image from "next/image";
import { Search, X } from "lucide-react";
import PanelOrdersList from "./panel-orders-list";
import { usePanelOrders } from "../hooks/use-panel-orders";
import { latinDigits } from "../utils/panel-form.utils";
import type { PanelOrderTab } from "../types/panel-order.types";
import { Button } from "@/components/ui/button";
import emptyOrders from "../assets/empty-orders.svg";
const tabs = [
  { id: "current", label: "جاری", emptyMessage: "سفارشی در دست انجام ندارید." },
  {
    id: "delivered",
    label: "تحویل‌شده",
    emptyMessage: "تاکنون موردی وجود نداشته است.",
  },
  {
    id: "canceled",
    label: "لغوشده",
    emptyMessage: "تاکنون موردی وجود نداشته است.",
  },
] as const;
export default function PanelOrders() {
  const [activeTab, setActiveTab] = useState<PanelOrderTab>("current");
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ordersQuery = usePanelOrders();
  const orders = ordersQuery.data ?? [];
  const query = latinDigits(search).trim().toLocaleLowerCase();
  const filteredOrders = orders.filter(
    (order) =>
      order.tab === activeTab &&
      (!query ||
        latinDigits(order.code + " " + order.productTitle)
          .toLocaleLowerCase()
          .includes(query)),
  );
  const id = useId();
  const tabButtons = useRef<Array<HTMLButtonElement | null>>([]);
  const selected = tabs.find((tab) => tab.id === activeTab)!;
  const changeTabByKeyboard = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    let next: number;
    if (event.key === "ArrowLeft") next = (index + 1) % tabs.length;
    else if (event.key === "ArrowRight")
      next = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = tabs.length - 1;
    else return;
    event.preventDefault();
    setActiveTab(tabs[next].id);
    tabButtons.current[next]?.focus();
  };
  return (
    <section
      className={
        "flex flex-col " +
        (filteredOrders.length ? "" : "min-h-[440px] sm:min-h-[480px]")
      }
      aria-labelledby={id + "-heading"}
    >
      <header className="flex items-center justify-between gap-3">
        <h1
          id={id + "-heading"}
          className="text-sm font-medium text-neutral-900"
        >
          تاریخچه سفارشات
        </h1>
        <button
          type="button"
          aria-label={searchOpen ? "بستن جست‌وجوی سفارش" : "جست‌وجوی سفارش"}
          aria-expanded={searchOpen}
          aria-controls={id + "-search"}
          onClick={() => {
            setSearchOpen((value) => !value);
            setSearch("");
          }}
          className="rounded p-1 text-primary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
        >
          {searchOpen ? (
            <X size={18} strokeWidth={1.5} aria-hidden="true" />
          ) : (
            <Search size={18} strokeWidth={1.5} aria-hidden="true" />
          )}
        </button>
      </header>
      <div
        role="tablist"
        aria-label="وضعیت سفارشات"
        className="mt-4 flex gap-5 border-b border-neutral-200"
      >
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            ref={(element) => {
              tabButtons.current[index] = element;
            }}
            type="button"
            role="tab"
            id={id + "-tab-" + tab.id}
            aria-selected={activeTab === tab.id}
            aria-controls={id + "-panel"}
            tabIndex={activeTab === tab.id ? 0 : -1}
            onClick={() => setActiveTab(tab.id)}
            onKeyDown={(event) => changeTabByKeyboard(event, index)}
            className={
              "-mb-px border-b-2 pb-3 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 " +
              (activeTab === tab.id
                ? "border-primary-500 text-primary-500"
                : "border-transparent text-neutral-700")
            }
          >
            {tab.label}
            {orders.some((order) => order.tab === tab.id) && (
              <span
                className={
                  "mr-2 inline-flex min-w-4 items-center justify-center rounded px-1 text-[10px] " +
                  (activeTab === tab.id
                    ? "bg-primary-500 text-white"
                    : "bg-neutral-500 text-white")
                }
              >
                {orders
                  .filter((order) => order.tab === tab.id)
                  .length.toLocaleString("fa-IR")}
              </span>
            )}
          </button>
        ))}
      </div>
      {searchOpen && (
        <form
          id={id + "-search"}
          onSubmit={(event) => event.preventDefault()}
          className="mt-4"
        >
          <label htmlFor={id + "-input"} className="sr-only">
            جست‌وجوی سفارش
          </label>
          <input
            id={id + "-input"}
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="کد یا نام سفارش را جست‌وجو کنید"
            className="w-full rounded-md border border-neutral-200 px-3 py-2 text-xs outline-none focus:border-primary-500"
          />
        </form>
      )}
      <div
        role="tabpanel"
        id={id + "-panel"}
        aria-labelledby={id + "-tab-" + activeTab}
        tabIndex={0}
        className="flex-1 outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
      >
        {ordersQuery.isPending ? (
          <div role="status" className="space-y-3 py-8">
            <span className="sr-only">در حال دریافت سفارشات…</span>
            <div className="h-28 rounded bg-neutral-50 motion-safe:animate-pulse" />
          </div>
        ) : ordersQuery.isError ? (
          <div
            role="alert"
            className="flex min-h-64 flex-col items-center justify-center gap-4 text-sm"
          >
            <p>دریافت سفارشات ناموفق بود.</p>
            <Button onClick={() => void ordersQuery.refetch()}>
              تلاش مجدد
            </Button>
          </div>
        ) : filteredOrders.length ? (
          <PanelOrdersList key={activeTab} orders={filteredOrders} />
        ) : (
          <div className="flex min-h-[360px] flex-col items-center justify-center gap-4 py-14">
            <Image
              src={emptyOrders}
              width={104}
              height={100}
              alt=""
              aria-hidden="true"
              className="h-auto w-[104px]"
            />
            <p
              role="status"
              aria-live="polite"
              className="text-center text-xs leading-6 text-neutral-700"
            >
              {search.trim()
                ? "سفارشی با این مشخصات پیدا نشد."
                : selected.emptyMessage}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
