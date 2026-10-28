import {
  onlineRedirectSchema,
  onlinePaymentContextSchema,
} from "../schemas/online-payment.schema";
import type { OnlineRedirect } from "../types/domain/online-payment.types";
const storageKey = "cart-online-payment";
const eventName = "cart-online-payment-change";
export function onlineReturnUrl(paymentId: number) {
  return "/cart/payment/return?payment_id=" + paymentId;
}
export const onlinePaymentStorage = {
  read: () => {
    try {
      return window.sessionStorage.getItem(storageKey);
    } catch {
      return null;
    }
  },
  parse: (value: string | null) => {
    if (!value) return null;
    try {
      const result = onlinePaymentContextSchema.safeParse(JSON.parse(value));
      return result.success ? result.data : null;
    } catch {
      return null;
    }
  },
  save: (paymentId: number, trackingCode: string, sessionId: string) => {
    try {
      window.sessionStorage.setItem(
        storageKey,
        JSON.stringify(
          onlinePaymentContextSchema.parse({
            paymentId,
            trackingCode,
            sessionId,
          }),
        ),
      );
      window.dispatchEvent(new Event(eventName));
    } catch {
      /* The payment return route also works without browser storage. */
    }
  },
  clear: (paymentId: number) => {
    const stored = onlinePaymentStorage.parse(onlinePaymentStorage.read());
    if (stored?.paymentId !== paymentId) return;
    try {
      window.sessionStorage.removeItem(storageKey);
      window.dispatchEvent(new Event(eventName));
    } catch {}
  },
  subscribe: (listener: () => void) => {
    window.addEventListener("storage", listener);
    window.addEventListener(eventName, listener);
    return () => {
      window.removeEventListener("storage", listener);
      window.removeEventListener(eventName, listener);
    };
  },
};
export function redirectToOnlineGateway(input: OnlineRedirect) {
  const redirect = onlineRedirectSchema.parse(input);
  if (!redirect.url) throw new Error("آدرس درگاه از بک دریافت نشد.");
  const url = new URL(redirect.url);
  if (redirect.method === "GET") {
    for (const [key, value] of Object.entries(redirect.fields))
      url.searchParams.set(key, String(value));
    window.location.assign(url.href);
    return;
  }
  const form = document.createElement("form");
  form.method = "POST";
  form.action = url.href;
  form.style.display = "none";
  for (const [key, value] of Object.entries(redirect.fields)) {
    const field = document.createElement("input");
    field.type = "hidden";
    field.name = key;
    field.value = String(value);
    form.appendChild(field);
  }
  document.body.appendChild(form);
  try {
    HTMLFormElement.prototype.submit.call(form);
  } finally {
    form.remove();
  }
}
