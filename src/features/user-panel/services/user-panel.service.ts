import axios from "axios";
import { latinDigits } from "../utils/panel-form.utils";
import { authApi } from "@/features/auth/api/auth.api";
import type {
  PanelTicket,
  PanelTicketInput,
  PanelTicketReplyInput,
} from "../types/panel-ticket.types";
import { userPanelMockApi } from "../api/user-panel.api.mock";
import { customerProfileApi } from "../api/customer-profile.api";
import { customerOrdersApi } from "../api/customer-orders.api";
import { customerPaymentsApi } from "../api/customer-payments.api";
import { customerWalletApi } from "../api/customer-wallet.api";
import { customerTicketsApi } from "../api/customer-tickets.api";
import { customerCommentsApi } from "../api/customer-comments.api";
import { customerFavoritesApi } from "../api/customer-favorites.api";
import { tokenStorage } from "@/features/auth/utils/token-storage";
import { redirectToOnlineGateway } from "@/features/cart/utils/online-payment.utils";
import {
  mapCustomerProfile,
  mapCustomerOrder,
  mapCustomerPayment,
  mapCustomerWallet,
  mapPanelTicket,
  mapPanelTicketMessage,
  mapCustomerTicket,
  mapCustomerComment,
  mapCustomerFavorite,
} from "../mappers/user-panel.mapper";
import type {
  PanelAccountChange,
  UserPanelAccount,
} from "../types/user-panel.types";
import type { CustomerProfilePatch } from "../types/user-panel-api.types";

function mobileChangeError(issue: unknown): Error {
  if (axios.isAxiosError(issue)) {
    const body = issue.response?.data;
    const apiError = body?.error;
    const fields = apiError?.fields;
    if (fields && typeof fields === "object") {
      const detail = Object.values(fields)
        .flatMap((value) => (Array.isArray(value) ? value : [value]))
        .find((value) => typeof value === "string");
      if (typeof detail === "string") return new Error(detail);
    }
    if (typeof apiError?.message === "string")
      return new Error(apiError.message);
    if (typeof body?.message === "string") return new Error(body.message);
    if (issue.response?.status === 429)
      return new Error("برای درخواست دوباره کمی صبر کنید.");
  }
  return issue instanceof Error ? issue : new Error("تغییر شماره ناموفق بود.");
}

function customerTicketError(issue: unknown): Error {
  if (axios.isAxiosError(issue)) {
    const body = issue.response?.data;
    if (typeof body?.detail === "string") return new Error(body.detail);
    if (typeof body?.message === "string") return new Error(body.message);
    if (typeof body?.error?.message === "string") return new Error(body.error.message);
    const fields = body?.error?.fields;
    if (fields && typeof fields === "object") {
      const detail = Object.values(fields)
        .flatMap((value) => (Array.isArray(value) ? value : [value]))
        .find((value) => typeof value === "string");
      if (typeof detail === "string") return new Error(detail);
    }
  }
  return issue instanceof Error ? issue : new Error("عملیات تیکت ناموفق بود.");
}

function toProfilePatch(change: PanelAccountChange): CustomerProfilePatch | null {
  if (change.type === "email") return { email: change.value.trim() };
  if (change.type === "mobile") return { mobile: change.value.trim() };
  if (change.type !== "personal") return null;
  const value = change.value;
  const [year, month, day] = value.birthDate.split("/").map((part) => Number(latinDigits(part)));
  const payload: CustomerProfilePatch = {
    account_type: value.accountType === "legal" ? "legal" : "real",
  };
  if (value.accountType === "legal") {
    Object.assign(payload, {
      company_name: value.company?.name.trim(),
      manager_mobile: value.company?.mobile.trim(),
      economic_code: value.company?.economicCode.trim(),
      company_address: value.company?.address.trim(),
      company_phone: value.company?.phone.trim(),
      email: value.company?.email.trim(),
    });
  } else {
    Object.assign(payload, {
      first_name: value.firstName.trim(),
      last_name: value.lastName.trim(),
      ...(value.isForeignNational
        ? { is_foreign: true }
        : { national_code: latinDigits(value.nationalCode.trim()), is_foreign: false }),
      ...(year && month && day
        ? { birth_year: year, birth_month: month, birth_day: day }
        : {}),
    });
  }
  return payload;
}

export const userPanelService = {
  async requestMobileChange(value: string) {
    const mobile = latinDigits(value.trim());
    if (!/^09\d{9}$/.test(mobile))
      throw new Error("شماره موبایل معتبر وارد کنید.");
    try {
      return await authApi.requestMobileChange(mobile);
    } catch (issue) {
      throw mobileChangeError(issue);
    }
  },
  async resendMobileChange() {
    try {
      return await authApi.resendMobileChange();
    } catch (issue) {
      throw mobileChangeError(issue);
    }
  },
  async verifyMobileChange(mobile: string, value: string) {
    const code = latinDigits(value.trim());
    if (!/^\d{6}$/.test(code)) throw new Error("کد تأیید باید ۶ رقم باشد.");
    try {
      const response = await authApi.verifyMobileChange(code);
      tokenStorage.setRefreshToken(response.refresh);
      tokenStorage.setAccessToken(response.access, { preserveSession: true });
      return response.user.mobile || mobile;
    } catch (issue) {
      throw mobileChangeError(issue);
    }
  },
  async getFavorites() {
    const response = await customerFavoritesApi.list();
    return response.results.map(mapCustomerFavorite);
  },
  async removeFavorite(slug: string) {
    return customerFavoritesApi.remove(slug);
  },
  async addFavorite(slug: string) {
    return customerFavoritesApi.add(slug);
  },
  async getComments() {
    return (await customerCommentsApi.list()).map(mapCustomerComment);
  },
  async replyToTicket(input: PanelTicketReplyInput) {
    if (!input.ticket.canReply)
      throw new Error("این تیکت بسته شده است.");
    const message = input.message.trim();
    if (!message || message.length > 5000)
      throw new Error("پیام را وارد کنید؛ حداکثر ۵۰۰۰ کاراکتر.");
    const error = validateTicketFile(input.file);
    if (error) throw new Error(error);
    try {
      if (input.ticket.fromBackend) {
        return mapCustomerTicket(
          await customerTicketsApi.reply(input.ticket.code, {
            message,
            file: input.file,
          }),
          input.ticket,
          { title: "", message, file: input.file },
        );
      }
      const reply = mapPanelTicketMessage(
        await userPanelMockApi.replyToTicket({ message, file: input.file }),
      );
      return {
        ...input.ticket,
        status: "processing" as const,
        messages: [...input.ticket.messages, reply],
      };
    } catch (issue) {
      throw customerTicketError(issue);
    }
  },
  async getTickets() {
    return (await userPanelMockApi.getTickets()).map(mapPanelTicket);
  },
  async getTicket(code: string, fallback?: PanelTicket) {
    try {
      return mapCustomerTicket(await customerTicketsApi.get(code), fallback);
    } catch (issue) {
      throw customerTicketError(issue);
    }
  },
  async createTicket(input: PanelTicketInput) {
    const normalized = {
      ...input,
      title: input.title.trim(),
      message: input.message.trim(),
    };
    if (!normalized.title || normalized.title.length > 200)
      throw new Error("عنوان را وارد کنید؛ حداکثر ۲۰۰ کاراکتر.");
    if (!normalized.message || normalized.message.length > 5000)
      throw new Error("پیام را وارد کنید؛ حداکثر ۵۰۰۰ کاراکتر.");
    const error = validateTicketFile(normalized.file);
    if (error) throw new Error(error);
    try {
      return mapCustomerTicket(
        await customerTicketsApi.create(normalized),
        undefined,
        normalized,
      );
    } catch (issue) {
      throw customerTicketError(issue);
    }
  },
  async getWallet() {
    return mapCustomerWallet(await customerWalletApi.getTransactions());
  },
  async cashoutWallet(amountValue: string, shebaValue: string) {
    const amount = latinDigits(amountValue.trim()).replaceAll(",", "");
    const sheba = latinDigits(shebaValue).replace(/\s+/g, "").toUpperCase();
    if (!/^\d+(\.\d+)?$/.test(amount) || !Number.isFinite(Number(amount)) || Number(amount) <= 0)
      throw new Error("مبلغ معتبر و بزرگ‌تر از صفر وارد کنید.");
    if (!/^(?:IR)?\d{24}$/.test(sheba))
      throw new Error("شماره شبا باید شامل IR و ۲۴ رقم باشد.");
    return customerWalletApi.cashout(
      amount,
      sheba.startsWith("IR") ? sheba : `IR${sheba}`,
    );
  },
  async chargeWallet(amountValue: string) {
    const amount = latinDigits(amountValue.trim()).replaceAll(",", "");
    if (!/^\d+(\.\d+)?$/.test(amount) || !Number.isFinite(Number(amount)) || Number(amount) <= 0)
      throw new Error("مبلغ معتبر و بزرگ‌تر از صفر وارد کنید.");
    return customerWalletApi.charge(amount);
  },
  redirectWalletCharge(response: Awaited<ReturnType<typeof customerWalletApi.charge>>) {
    const method = response.redirect_method.toUpperCase();
    if (method !== "GET" && method !== "POST")
      throw new Error("روش انتقال به درگاه از سمت بک‌اند معتبر نیست.");
    redirectToOnlineGateway({
      method,
      url: response.payment_url,
      fields: response.redirect_fields ?? {},
    });
  },
  async getPayments() {
    return (await customerPaymentsApi.list()).map(mapCustomerPayment);
  },
  async getOrders() {
    return (await customerOrdersApi.list()).map(mapCustomerOrder);
  },
  async getAccount(): Promise<UserPanelAccount> {
    return mapCustomerProfile(await customerProfileApi.get());
  },
  async updateProfile(change: PanelAccountChange): Promise<UserPanelAccount | null> {
    if (change.type === "avatar") {
      const response = await customerProfileApi.updatePhoto(change.value);
      if (response.access) tokenStorage.setAccessToken(response.access, { preserveSession: true });
      if (response.refresh) tokenStorage.setRefreshToken(response.refresh);
      return mapCustomerProfile(response);
    }
    const payload = toProfilePatch(change);
    if (!payload) return null;
    const response = await customerProfileApi.update(payload);
    if (response.access) tokenStorage.setAccessToken(response.access, { preserveSession: true });
    if (response.refresh) tokenStorage.setRefreshToken(response.refresh);
    return mapCustomerProfile(response);
  },
};

// Local preview updates. No server writes or persistent storage.
export function applyPanelAccountChange(
  account: UserPanelAccount,
  change: PanelAccountChange,
): UserPanelAccount {
  switch (change.type) {
    case "personal":
      return { ...account, ...change.value, identityVerified: false };
    case "mobile":
      return { ...account, mobile: change.value };
    case "email":
      return { ...account, email: change.value };
    case "avatar":
      return account;
    case "address":
      return {
        ...account,
        addresses: account.addresses.some(
          (address) => address.id === change.value.id,
        )
          ? account.addresses.map((address) =>
              address.id === change.value.id ? change.value : address,
            )
          : [...account.addresses, change.value],
      };
    case "delete-address":
      return {
        ...account,
        addresses: account.addresses.filter(
          (address) => address.id !== change.id,
        ),
      };
  }
}

export function validateTicketFile(file: File | null): string | null {
  if (!file) return null;
  if (!file.size) return "فایل انتخاب‌شده خالی است.";
  if (file.size > 5 * 1024 * 1024)
    return "حجم فایل باید حداکثر ۵ مگابایت باشد.";
  if (
    !/\.(jpe?g|png|pdf)$/i.test(file.name) ||
    (file.type &&
      !["image/jpeg", "image/png", "application/pdf"].includes(file.type))
  )
    return "فقط فایل JPG، JPEG، PNG یا PDF مجاز است.";
  return null;
}
