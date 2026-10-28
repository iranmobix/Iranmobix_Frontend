import type {
  PanelFavorite,
  PanelFavoriteApi,
} from "../types/panel-favorite.types";
import { mapProductListItem } from "@/features/product/mappers/product-list.mapper";
import type { ProductListItemApi } from "@/features/product/types/api/product-list-api.types";
import type {
  CustomerCommentApi,
  PanelComment,
  PanelCommentApi,
} from "../types/panel-comment.types";
import type {
  PanelTicket,
  PanelTicketAttachment,
  PanelTicketApi,
  PanelTicketMessageApi,
  PanelTicketMessage,
  PanelTicketInput,
  CustomerTicketApi,
} from "../types/panel-ticket.types";
import type {
  CustomerWalletTransactionsApi,
  PanelWallet,
  PanelWalletApi,
} from "../types/panel-wallet.types";
import type {
  CustomerOrderApi,
  PanelOrder,
  PanelOrderApi,
} from "../types/panel-order.types";
import type {
  PanelPayment,
  PanelPaymentApi,
  CustomerPaymentApi,
} from "../types/panel-payment.types";
import type {
  CustomerProfileApi,
  UserPanelAccountApi,
} from "../types/user-panel-api.types";
import type { UserPanelAccount } from "../types/user-panel.types";

export function mapUserPanelAccount(
  response: UserPanelAccountApi,
): UserPanelAccount {
  return {
    id: response.id,
    accountType: response.account_type,
    isForeignNational: response.is_foreign_national,
    firstName: response.first_name,
    lastName: response.last_name,
    nationalCode: response.national_code,
    birthDate: response.birth_date,
    company: response.company ? { ...response.company } : null,
    identityDocument: response.identity_document
      ? { ...response.identity_document }
      : null,
    email: response.email,
    mobile: response.mobile,
    avatarUrl: response.avatar_url,
    identityVerified: response.identity_verified,
    addresses: response.addresses.map((address) => ({
      id: address.id,
      title: address.title,
      province: address.province,
      city: address.city,
      street: address.street,
      no: address.no,
      unit: address.unit,
      postalCode: address.postal_code,
      receiverName: address.receiver_name,
      receiverMobile: address.receiver_mobile,
    })),
  };
}

const PROFILE_KEYS = [
  "account_type", "first_name", "last_name", "national_code", "birth_date",
  "mobile", "email", "profile_photo", "company_name", "manager_name",
  "manager_mobile", "economic_code", "company_address", "company_postal_code",
  "company_phone",
] as const;

export function mapCustomerProfile(response: CustomerProfileApi): UserPanelAccount {
  const accountType = response.account_type;
  const isLegal = accountType === "legal" || accountType === "حقوقی";
  const birthDate = response.birth_date ?? "";
  const company = isLegal
    ? {
        name: response.company_name ?? "",
        registrationNumber: "",
        nationalId: "",
        economicCode: response.economic_code ?? "",
        address: response.company_address ?? "",
        phone: response.company_phone ?? "",
        mobile: response.manager_mobile ?? "",
        email: response.email ?? "",
      }
    : null;

  return {
    id: 0,
    accountType: isLegal ? "legal" : "individual",
    isForeignNational: response.national_code === "تبعه خارجی",
    firstName: response.first_name ?? (isLegal ? response.company_name : "") ?? "",
    lastName: response.last_name ?? "",
    nationalCode: response.national_code ?? "",
    birthDate,
    company,
    identityDocument: null,
    email: response.email ?? null,
    mobile: response.mobile ?? null,
    avatarUrl: response.profile_photo ?? null,
    identityVerified: false,
    addresses: [],
    profileSource: "backend",
    backendMissingFields: PROFILE_KEYS.filter(
      (key) => !Object.prototype.hasOwnProperty.call(response, key),
    ),
  };
}

export function mapPanelOrder(response: PanelOrderApi): PanelOrder {
  return {
    id: response.id,
    productTitle: response.product_title,
    code: response.code,
    quantity: response.quantity,
    amount: response.amount,
    currency: response.currency,
    invoice: null,
    tab: response.tab,
    statusLabel: response.status_label,
    orderedAt: response.ordered_at,
    steps: response.steps.map((step) => ({
      id: step.id,
      label: step.label,
      kind: step.kind,
      state: step.state,
      occurredAt: step.occurred_at,
    })),
  };
}

const ORDER_VALUE_MISSING = "بدون مقدار از سمت بک‌اند";

function nonEmpty(value: string | null | undefined) {
  return value?.trim() || null;
}

function getOrderTab(value: string) {
  const normalized = value.toLocaleLowerCase();
  if (/لغو|cancel/.test(normalized)) return "canceled" as const;
  if (/تحویل|تکمیل|deliver|complete/.test(normalized))
    return "delivered" as const;
  return "current" as const;
}

export function mapCustomerOrder(response: CustomerOrderApi, index = 0): PanelOrder {
  const code = nonEmpty(response.order_code);
  const lastStatus = nonEmpty(response.last_status);
  const statuses = response.order_status ?? [];
  const activeIndex = statuses.findIndex((status) => status.active === true);
  const tab = getOrderTab(lastStatus ?? "");

  return {
    id: code ?? `order-${index}`,
    productTitle: nonEmpty(response.product_name) ?? ORDER_VALUE_MISSING,
    code: code ?? ORDER_VALUE_MISSING,
    quantity: response.number ?? null,
    amount: nonEmpty(response.final_price) ?? "",
    currency: null,
    invoice: nonEmpty(response.invoice),
    tab,
    statusLabel: lastStatus ?? ORDER_VALUE_MISSING,
    orderedAt: nonEmpty(response.order_date),
    steps: statuses.map((status, index) => ({
      id: status.code || `status-${index}`,
      label: nonEmpty(status.title) ?? ORDER_VALUE_MISSING,
      kind: "package",
      state:
        index === activeIndex
          ? "current"
          : activeIndex < 0
            ? tab === "delivered" || tab === "canceled"
              ? "completed"
              : "upcoming"
            : index < activeIndex
              ? "completed"
              : "upcoming",
      occurredAt: null,
    })),
  };
}

export function mapPanelPayment(response: PanelPaymentApi): PanelPayment {
  return {
    id: response.id,
    amount: response.amount,
    currency: response.currency,
    methodLabel: response.method_label,
    paidAt: response.paid_at,
    paidTime: null,
  };
}

export function mapCustomerPayment(
  response: CustomerPaymentApi,
  index = 0,
): PanelPayment {
  const date = response.date?.trim() || null;
  const time = response.time?.trim() || null;
  return {
    id: `${date ?? "payment"}-${time ?? index}-${index}`,
    amount: response.price?.trim() ?? "",
    currency: null,
    methodLabel: response.payment_method?.trim() || "بدون مقدار از سمت بک‌اند",
    paidAt: date,
    paidTime: time,
  };
}

export function mapPanelWallet(response: PanelWalletApi): PanelWallet {
  return {
    balance: response.balance,
    currency: response.currency,
    charges: response.charges.map((charge) => ({
      id: charge.id,
      amount: charge.amount,
      currency: response.currency,
      details: null,
      chargedAt: charge.charged_at,
      balanceAfter: charge.balance_after,
    })),
  };
}

export function mapCustomerWallet(
  response: CustomerWalletTransactionsApi,
): PanelWallet {
  return {
    balance: response.total_balance ?? null,
    currency: response.currency ?? null,
    charges: (response.transactions ?? []).map((transaction, index) => ({
      id: `${transaction.date ?? "wallet-transaction"}-${index}`,
      amount: transaction.amount ?? null,
      currency: transaction.currency ?? null,
      details: transaction.details?.trim() || null,
      chargedAt: transaction.date ?? null,
      balanceAfter: transaction.remaining ?? null,
    })),
  };
}

export function mapPanelTicket(response: PanelTicketApi): PanelTicket {
  return {
    id: response.id,
    code: response.code,
    title: response.title,
    message: response.message,
    messages: response.messages.map(mapPanelTicketMessage),
    createdAt: response.created_at,
    status: response.status,
    attachment: response.attachment ? { ...response.attachment } : null,
    canReply: response.status !== "closed",
    fromBackend: false,
  };
}

export function mapPanelTicketMessage(
  response: PanelTicketMessageApi,
): PanelTicketMessage {
  return {
    id: response.id,
    author: response.author,
    authorName: response.author_name,
    body: response.body,
    sentAt: response.sent_at,
    attachment: response.attachment ? { ...response.attachment } : null,
  };
}

const TICKET_VALUE_MISSING = "بدون مقدار از سمت بک‌اند";

function ticketString(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return String(value);
  }
  return null;
}

function ticketStatus(value: string | null, fallback?: PanelTicket["status"]): PanelTicket["status"] {
  if (!value) return fallback ?? "processing";
  const normalized = value.toLocaleLowerCase();
  if (/closed|بسته/.test(normalized)) return "closed";
  if (/resolved|solved|حل.?شده/.test(normalized)) return "resolved";
  if (/suspend|معلق/.test(normalized)) return "suspended";
  if (/answer|reply|پاسخ/.test(normalized)) return "answered";
  return "processing";
}

function ticketAttachment(value: unknown): PanelTicketAttachment | null {
  if (typeof value === "string" && value.trim()) {
    const rawUrl = value.trim();
    const name = rawUrl.split(/[/?#]/).filter(Boolean).at(-1) || "فایل پیوست";
    let url = rawUrl;
    try {
      url = new URL(rawUrl, process.env.NEXT_PUBLIC_API_URL || "http://localhost").toString();
    } catch {}
    return { name, size: 0, type: "", url };
  }
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const rawUrl = ticketString(record.url, record.file_url, record.file_to_upload, record.path);
  let url = rawUrl;
  if (rawUrl) {
    try {
      url = new URL(rawUrl, process.env.NEXT_PUBLIC_API_URL || "http://localhost").toString();
    } catch {}
  }
  const name = ticketString(record.name, record.file_name) ||
    (url?.split(/[/?#]/).filter(Boolean).at(-1) ?? TICKET_VALUE_MISSING);
  return {
    name,
    size: typeof record.size === "number" ? record.size : 0,
    type: ticketString(record.type, record.content_type) ?? "",
    url,
  };
}

function mapCustomerTicketMessage(
  value: Record<string, unknown>,
  index: number,
  fallbackDate: string | null,
): PanelTicketMessage {
  const authorValue = ticketString(value.author, value.sender, value.role, value.user_type) ?? "";
  const author: PanelTicketMessage["author"] =
    /support|admin|staff|expert|پشتیبان|کارشناس/i.test(authorValue) || value.is_staff === true
      ? "support"
      : "customer";
  const date = ticketString(value.sent_at, value.created_at, value.date);
  const time = ticketString(value.time, value.created_time);
  const sentAt = date && time && !date.includes("T") ? `${date}T${time}` : date || fallbackDate;
  return {
    id: ticketString(value.id, value.message_id) ?? `message-${index}`,
    author,
    authorName:
      ticketString(value.author_name, value.sender_name, value.name) ??
      (author === "support" ? "پشتیبانی" : "شما"),
    body: ticketString(value.text, value.body, value.message, value.content) ?? TICKET_VALUE_MISSING,
    sentAt,
    attachment: ticketAttachment(
      value.attachment ?? value.file_to_upload ?? value.file_url ?? value.file,
    ),
  };
}

export function mapCustomerTicket(
  response: CustomerTicketApi,
  fallback?: PanelTicket,
  submitted?: PanelTicketInput,
): PanelTicket {
  const code = ticketString(response.ticket_code) ?? fallback?.code ?? TICKET_VALUE_MISSING;
  const createdDate = ticketString(response.created_date);
  const createdTime = ticketString(response.created_time);
  const createdAt = createdDate && createdTime
    ? `${createdDate}T${createdTime}`
    : createdDate ?? fallback?.createdAt ?? "";
  const status = ticketStatus(ticketString(response.status), fallback?.status);
  const messages = Array.isArray(response.messages)
    ? response.messages.map((message, index) =>
        mapCustomerTicketMessage(message, index, createdAt || null),
      )
    : [...(fallback?.messages ?? [])];
  const submittedMessage = submitted
    ? messages.find((message) => message.author === "customer" && message.body === submitted.message)
    : undefined;
  if (submitted && submittedMessage && !submittedMessage.attachment && submitted.file) {
    submittedMessage.attachment = {
      name: submitted.file.name,
      size: submitted.file.size,
      type: submitted.file.type,
    };
  } else if (submitted && !submittedMessage) {
    messages.push({
      id: `submitted-${Date.now()}`,
      author: "customer",
      authorName: "شما",
      body: submitted.message,
      sentAt: createdAt || null,
      attachment: submitted.file
        ? { name: submitted.file.name, size: submitted.file.size, type: submitted.file.type }
        : null,
    });
  }
  const firstAttachment = messages.find((message) => message.attachment)?.attachment ?? null;
  return {
    id: code,
    code,
    title: ticketString(response.title) ?? fallback?.title ?? TICKET_VALUE_MISSING,
    message: messages[0]?.body ?? submitted?.message ?? fallback?.message ?? TICKET_VALUE_MISSING,
    createdAt,
    status,
    attachment: firstAttachment,
    messages,
    canReply: response.can_reply ?? fallback?.canReply ?? status !== "closed",
    fromBackend: true,
  };
}

export function mapPanelComment(response: PanelCommentApi): PanelComment {
  return {
    id: response.id,
    productTitle: response.product_title,
    productImage: response.product_image,
    body: response.body,
    status: response.status,
  };
}

export function mapCustomerComment(
  response: CustomerCommentApi,
  index = 0,
): PanelComment {
  const rawStatus = response.status?.trim().toLocaleLowerCase() ?? "";
  let status: PanelComment["status"] = null;
  if (/approved|تایید|تأیید/.test(rawStatus)) status = "approved";
  else if (/pending|انتظار|بررس/.test(rawStatus)) status = "pending";
  else if (/reject|رد/.test(rawStatus)) status = "rejected";
  return {
    id: `comment-${index}`,
    productTitle: response.product_name?.trim() || "بدون مقدار از سمت بک‌اند",
    productImage: null,
    body: response.comment?.trim() || "بدون مقدار از سمت بک‌اند",
    status,
  };
}

export function mapPanelFavorite(response: PanelFavoriteApi): PanelFavorite {
  return {
    id: response.id,
    slug: response.id,
    title: response.title,
    image: response.image,
    sourceUrl: response.source_url,
    priceCny: response.price_cny,
    priceToman: response.price_toman,
    sellerName: response.seller_name,
    sellerVerified: response.seller_verified,
    colors: response.colors.map((color) => ({ ...color })),
  };
}

export function mapCustomerFavorite(response: ProductListItemApi): PanelFavorite {
  const product = mapProductListItem(response);
  return {
    id: product.slug,
    slug: product.slug,
    title: product.title || "بدون مقدار از سمت بک‌اند",
    image: product.image || null,
    sourceUrl: product.officialUrl || product.source.url,
    priceCny:
      product.price.amount === null
        ? ""
        : String(product.price.amount),
    priceToman:
      product.price.amountIrr === null
        ? null
        : String(product.price.amountIrr / 10),
    sellerName: product.seller?.name || "بدون مقدار از سمت بک‌اند",
    sellerVerified: Boolean(
      product.seller?.badges?.some((badge) => badge === "verified"),
    ),
    colors: product.colors.map(({ name, value }) => ({ name, value })),
  };
}
