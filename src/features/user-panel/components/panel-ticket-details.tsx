"use client";
import { useState } from "react";
import { ArrowRight, Headset, UserRound } from "lucide-react";
import type {
  PanelTicket,
  PanelTicketInput,
} from "../types/panel-ticket.types";
import { formatPanelDate } from "../utils/panel-display.utils";
import { PANEL_TICKET_STATUSES } from "../constants/panel-ticket.constants";
import PanelTicketForm from "./panel-ticket-form";
export default function PanelTicketDetails({
  ticket,
  pending,
  detailPending,
  detailError,
  onRetry,
  onBack,
  onReply,
}: {
  ticket: PanelTicket;
  pending: boolean;
  detailPending: boolean;
  detailError: boolean;
  onRetry: () => void;
  onBack: () => void;
  onReply: (input: PanelTicketInput) => Promise<void>;
}) {
  const [notice, setNotice] = useState("");
  const status = PANEL_TICKET_STATUSES[ticket.status];
  return (
    <section aria-labelledby="ticket-detail-title">
      <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-3 border-b border-neutral-200 pb-4 text-xs leading-6">
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={onBack}
            aria-label="بازگشت به تیکت‌ها"
            className="rounded p-1 text-primary-600 focus-visible:ring-2 focus-visible:ring-primary-300"
          >
            <ArrowRight size={16} />
          </button>
          <h1 id="ticket-detail-title" className="font-medium text-neutral-900">
            {ticket.title}
          </h1>
        </div>
        <p>
          کد:{" "}
          <bdi>
            {ticket.code.replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)])}
          </bdi>
        </p>
        <p>
          تاریخ ایجاد:{" "}
          {ticket.createdAt && formatPanelDate(ticket.createdAt) !== "—" ? (
            <time dateTime={ticket.createdAt}>
              {formatPanelDate(ticket.createdAt)}
            </time>
          ) : (
            ticket.createdAt || "بدون مقدار از سمت بک‌اند"
          )}
        </p>
        <p>
          وضعیت:{" "}
          <span className={"rounded px-2 py-1 text-[11px] " + status.style}>
            {status.label}
          </span>
        </p>
      </div>
      {detailPending && (
        <p role="status" className="py-3 text-xs text-neutral-600">
          در حال دریافت گفت‌وگوی تیکت…
        </p>
      )}
      {detailError && (
        <div role="alert" className="flex items-center justify-between gap-3 py-3 text-xs">
          <span>دریافت گفت‌وگوی تیکت ناموفق بود.</span>
          <button type="button" onClick={onRetry} className="text-primary-600">
            تلاش مجدد
          </button>
        </div>
      )}
      <ol aria-label="گفت‌وگوی تیکت" className="space-y-5 py-5">
        {ticket.messages.map((message) => (
          <li
            key={message.id}
            className={
              "flex items-start gap-3 " +
              (message.author === "support" ? "flex-row-reverse" : "")
            }
          >
            <span
              className={
                "flex size-10 shrink-0 items-center justify-center rounded-full border " +
                (message.author === "customer"
                  ? "border-primary-200 bg-amber-50 text-amber-500"
                  : "border-amber-300 bg-neutral-800 text-amber-300")
              }
              aria-hidden="true"
            >
              {message.author === "customer" ? (
                <UserRound size={23} />
              ) : (
                <Headset size={23} />
              )}
            </span>
            <article
              aria-label={message.authorName}
              className={
                "w-[calc(100%-52px)] rounded-2xl p-4 text-xs leading-7 sm:w-[78%] " +
                (message.author === "customer"
                  ? "bg-primary-100"
                  : "bg-neutral-100")
              }
            >
              <header className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] leading-5">
                <h2 className="font-medium">{message.authorName}</h2>
                <span className="hidden grow border-t border-dashed border-neutral-300 sm:block" />
                {message.sentAt ? (
                  <time
                    dateTime={message.sentAt}
                    className="mr-auto text-neutral-600"
                  >
                    {Number.isFinite(new Date(message.sentAt).getTime())
                      ? new Date(message.sentAt).toLocaleString("fa-IR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          timeZone: "Asia/Tehran",
                        })
                      : message.sentAt}
                  </time>
                ) : (
                  <span className="mr-auto text-neutral-600">
                    بدون مقدار از سمت بک‌اند
                  </span>
                )}
              </header>
              <p className="whitespace-pre-wrap break-words text-neutral-700">
                {message.body}
              </p>
              {message.attachment && (
                <p className="mt-3 break-words border-t border-black/5 pt-2 text-primary-600">
                  پیوست: {message.attachment.url ? (
                    <a
                      href={message.attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      <bdi>{message.attachment.name}</bdi>
                    </a>
                  ) : (
                    <bdi>{message.attachment.name}</bdi>
                  )}
                </p>
              )}
            </article>
          </li>
        ))}
      </ol>
      {!ticket.canReply ? (
        <p
          role="status"
          className="pb-2 text-center text-xs leading-6 text-neutral-600"
        >
          این تیکت بسته شده است.
        </p>
      ) : (
        <div className="border-t border-neutral-200 pt-5">
          {notice && (
            <p role="status" className="mb-3 text-xs text-teal-700">
              {notice}
            </p>
          )}
          <PanelTicketForm
            reply
            pending={pending}
            onCancel={onBack}
            onSend={async (input) => {
              await onReply(input);
              setNotice("پاسخ در پیش‌نمایش ثبت شد.");
            }}
          />
        </div>
      )}
    </section>
  );
}
