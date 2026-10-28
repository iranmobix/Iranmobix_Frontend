import type { PanelTicketStatus } from "../types/panel-ticket.types";
export const PANEL_TICKET_STATUSES: Record<
  PanelTicketStatus,
  { label: string; style: string }
> = {
  processing: { label: "در حال بررسی", style: "bg-amber-100 text-amber-700" },
  answered: { label: "پاسخ داده شده", style: "bg-teal-100 text-teal-700" },
  resolved: { label: "حل شده", style: "bg-teal-100 text-teal-700" },
  suspended: { label: "معلق", style: "bg-amber-100 text-amber-700" },
  closed: { label: "بسته شده", style: "bg-neutral-100 text-neutral-600" },
};
