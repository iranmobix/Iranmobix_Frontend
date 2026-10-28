"use client";
import { useId, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePanelTickets } from "../hooks/use-panel-tickets";
import { userPanelService } from "../services/user-panel.service";
import { formatPanelDate } from "../utils/panel-display.utils";
import { PANEL_TICKET_STATUSES as statusLabels } from "../constants/panel-ticket.constants";
import PanelTicketDetails from "./panel-ticket-details";
import PanelTicketForm from "./panel-ticket-form";
export default function PanelTickets() {
  const query = usePanelTickets();
  const searchId = useId();
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const tickets = query.data ?? [];
  const normalize = (value: string) =>
    value.replace(/ي/g, "ی").replace(/ك/g, "ک").trim().toLocaleLowerCase("fa");
  const visible = tickets.filter((ticket) =>
    normalize(ticket.title).includes(normalize(search)),
  );
  const selected = tickets.find((ticket) => ticket.id === selectedId);
  const detailQuery = useQuery({
    queryKey: ["user-panel", "ticket-detail", selected?.code],
    queryFn: () => {
      if (!selected) throw new Error("تیکتی انتخاب نشده است.");
      return userPanelService.getTicket(selected.code, selected);
    },
    enabled: Boolean(selected?.fromBackend && selected.code),
    staleTime: 60_000,
    retry: false,
  });
  if (selected)
    return (
      <PanelTicketDetails
        key={selected.id}
        ticket={detailQuery.data ?? selected}
        pending={query.reply.isPending}
        detailPending={detailQuery.isFetching && !detailQuery.data}
        detailError={detailQuery.isError}
        onRetry={() => void detailQuery.refetch()}
        onBack={() => setSelectedId(null)}
        onReply={async (input) => {
          await query.reply.mutateAsync({
            ticket: selected,
            message: input.message,
            file: input.file,
          });
        }}
      />
    );
  if (creating)
    return (
      <PanelTicketForm
        pending={query.create.isPending}
        onCancel={() => setCreating(false)}
        onSend={async (input) => {
          await query.create.mutateAsync(input);
          setCreating(false);
          setSearch("");
          setNotice("تیکت جدید در پیش‌نمایش ثبت شد.");
        }}
      />
    );
  return (
    <section aria-labelledby="panel-tickets-heading">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 pb-4">
        <h1
          id="panel-tickets-heading"
          className="text-sm font-medium text-neutral-900"
        >
          تیکت‌ها
        </h1>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <label htmlFor={searchId} className="sr-only">
              جستجو براساس عنوان
            </label>
            <Search
              size={14}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-primary-500"
              aria-hidden="true"
            />
            <input
              id={searchId}
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="جستجو براساس عنوان"
              className="h-9 w-56 max-w-full rounded-md border border-neutral-300 pr-9 pl-3 text-xs outline-none focus:border-primary-500"
            />
          </div>
          <Button
            type="button"
            onClick={() => {
              setNotice("");
              setCreating(true);
            }}
            className="h-9 gap-1 px-3 text-xs"
          >
            <Plus size={14} aria-hidden="true" />
            تیکت جدید
          </Button>
        </div>
      </div>
      {notice && (
        <p role="status" className="mt-3 text-xs text-teal-700">
          {notice}
        </p>
      )}
      {query.isPending ? (
        <p role="status" className="py-20 text-center text-xs">
          در حال دریافت تیکت‌ها…
        </p>
      ) : query.isError ? (
        <div
          role="alert"
          className="flex min-h-64 flex-col items-center justify-center gap-4 text-sm"
        >
          <p>دریافت تیکت‌ها ناموفق بود.</p>
          <Button onClick={() => void query.refetch()}>تلاش مجدد</Button>
        </div>
      ) : visible.length === 0 ? (
        <p role="status" className="py-20 text-center text-xs text-neutral-700">
          {tickets.length
            ? "تیکتی با این عنوان پیدا نشد."
            : "تاکنون تیکتی ثبت نشده است."}
        </p>
      ) : (
        <div className="mt-5 overflow-x-auto rounded-md border border-primary-100">
          <table className="w-full min-w-[480px] table-fixed border-collapse text-center text-xs leading-6">
            <caption className="sr-only">لیست تیکت‌ها</caption>
            <thead>
              <tr>
                {["کد", "عنوان تیکت", "تاریخ", "وضعیت"].map((label) => (
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
              {visible.map((ticket) => (
                <tr key={ticket.id} className="text-neutral-700">
                  <td className="border-b border-l border-primary-100 px-3 py-1.5 [tr:last-child_&]:border-b-0">
                    <button
                      type="button"
                      onClick={() => setSelectedId(ticket.id)}
                      aria-label={"مشاهده تیکت " + ticket.code}
                      className="rounded text-primary-600 focus-visible:ring-2 focus-visible:ring-primary-300"
                    >
                      <bdi>
                        {ticket.code.replace(
                          /\d/g,
                          (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)],
                        )}
                      </bdi>
                    </button>
                  </td>
                  <td className="border-b border-l border-primary-100 px-3 py-1.5 [tr:last-child_&]:border-b-0">
                    <button
                      type="button"
                      onClick={() => setSelectedId(ticket.id)}
                      className="break-words rounded text-primary-600 focus-visible:ring-2 focus-visible:ring-primary-300"
                    >
                      {ticket.title}
                    </button>
                  </td>
                  <td className="border-b border-l border-primary-100 px-3 py-1.5 [tr:last-child_&]:border-b-0">
                    {ticket.createdAt && formatPanelDate(ticket.createdAt) !== "—" ? (
                      <time dateTime={ticket.createdAt}>
                        {formatPanelDate(ticket.createdAt)}
                      </time>
                    ) : (
                      ticket.createdAt || "بدون مقدار از سمت بک‌اند"
                    )}
                  </td>
                  <td className="border-b border-primary-100 px-3 py-1.5 [tr:last-child_&]:border-b-0">
                    <span
                      className={
                        "inline-block rounded px-2 text-[11px] " +
                        statusLabels[ticket.status].style
                      }
                    >
                      {statusLabels[ticket.status].label}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
