import { httpGet, httpPost } from "@/shared/api/http";
import type { CustomerTicketApi, PanelTicketInput } from "../types/panel-ticket.types";

function ticketFormData(input: Pick<PanelTicketInput, "message" | "file">, title?: string) {
  const body = new FormData();
  if (title !== undefined) body.append("title", title);
  body.append("text", input.message);
  if (input.file) body.append("file_to_upload", input.file);
  return body;
}

const multipartConfig = { headers: { "Content-Type": undefined } };

export const customerTicketsApi = {
  create(input: PanelTicketInput) {
    return httpPost<CustomerTicketApi>(
      "/api/customer/tickets/profile/",
      ticketFormData(input, input.title),
      multipartConfig,
    );
  },
  get(ticketCode: string) {
    return httpGet<CustomerTicketApi>(
      `/api/customer/tickets/profile/${encodeURIComponent(ticketCode)}/`,
    );
  },
  reply(ticketCode: string, input: Pick<PanelTicketInput, "message" | "file">) {
    return httpPost<CustomerTicketApi>(
      `/api/customer/tickets/profile/${encodeURIComponent(ticketCode)}/replies/`,
      ticketFormData(input),
      multipartConfig,
    );
  },
};
