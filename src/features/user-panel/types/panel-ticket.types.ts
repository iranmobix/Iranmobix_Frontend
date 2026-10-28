export type PanelTicketStatus =
  "processing" | "answered" | "resolved" | "suspended" | "closed";
export interface PanelTicketAttachment {
  name: string;
  size: number;
  type: string;
  url?: string | null;
}
export interface PanelTicket {
  id: string;
  code: string;
  title: string;
  message: string;
  createdAt: string;
  status: PanelTicketStatus;
  attachment: PanelTicketAttachment | null;
  messages: PanelTicketMessage[];
  canReply: boolean;
  fromBackend: boolean;
}
export interface PanelTicketInput {
  title: string;
  message: string;
  file: File | null;
}
// Provisional mock response; replace with the agreed ticket API.
export interface PanelTicketApi {
  id: string;
  code: string;
  title: string;
  message: string;
  created_at: string;
  status: PanelTicketStatus;
  attachment: PanelTicketAttachment | null;
  messages: PanelTicketMessageApi[];
}

export interface PanelTicketMessage {
  id: string;
  author: "customer" | "support";
  authorName: string;
  body: string;
  sentAt: string | null;
  attachment: PanelTicketAttachment | null;
}
export interface PanelTicketMessageApi {
  id: string;
  author: "customer" | "support";
  author_name: string;
  body: string;
  sent_at: string;
  attachment: PanelTicketAttachment | null;
}
export interface PanelTicketReplyInput {
  ticket: PanelTicket;
  message: string;
  file: File | null;
}

export interface CustomerTicketApi {
  title?: string | null;
  ticket_code?: string | null;
  created_date?: string | null;
  created_time?: string | null;
  status?: string | null;
  messages?: Array<Record<string, unknown>> | null;
  can_reply?: boolean | null;
}
