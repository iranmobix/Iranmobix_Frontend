export type ProductInquiryContext = {
  title?: string;
  code?: string;
  sourceUrl?: string;
  quantity: number;
};
const httpUrl = (value?: string | null) => {
  try {
    const url = new URL(value || "");
    return url.protocol === "https:" || url.protocol === "http:" ? url : null;
  } catch {
    return null;
  }
};
export function buildProductInquiryMessage(context?: ProductInquiryContext) {
  const lines = [
    "سلام، برای استعلام قیمت و خرید این محصول با ارسال هوایی راهنمایی می‌خواهم.",
  ];
  if (context?.title?.trim()) lines.push(`نام محصول: ${context.title.trim()}`);
  if (context?.code?.trim()) lines.push(`کد محصول: ${context.code.trim()}`);
  if (
    context &&
    Number.isSafeInteger(context.quantity) &&
    context.quantity >= 1
  )
    lines.push(`تعداد: ${context.quantity.toLocaleString("fa-IR")} عدد`);
  const source = httpUrl(context?.sourceUrl);
  if (source) lines.push(`لینک محصول: ${source.href}`);
  return lines.join("\n");
}
export function buildExpertChatLink(
  platform: "whatsapp" | "telegram",
  value: string | null | undefined,
  message: string,
) {
  const url = httpUrl(value);
  if (!url || url.username || url.password) return null;
  const valid =
    platform === "whatsapp"
      ? url.hostname === "wa.me" && /^\/\d{7,15}\/?$/.test(url.pathname)
      : ["t.me", "telegram.me"].includes(url.hostname) &&
        /^\/(?:[a-zA-Z][a-zA-Z0-9_]{3,31}|\+\d{7,15})\/?$/.test(url.pathname);
  if (!valid) return null;
  url.searchParams.set("text", message);
  // Open the conversation rather than the optional Telegram profile screen.
  if (platform === "telegram") url.searchParams.delete("profile");
  return url.href;
}
