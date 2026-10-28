import type { ServerCartItem } from "../types/domain/cart.types";
import { getCartFieldNote } from "./cart-data-issues";

export function getCartOptionName(option: unknown): string | null {
  if (typeof option === "string") return option.trim() || null;
  if (option && typeof option === "object" && "name" in option && typeof option.name === "string") return option.name.trim() || null;
  return null;
}

// Do not turn absent backend data into a plausible product value.
export function getCartItemDataNotes(item: ServerCartItem) {
  const color = item.selectedColor?.name.trim();
  const guarantee = item.product.guarantee;
  return {
    title: item.product.title.trim() || item.product.shortTitle.trim() || null,
    color: color || null,
    colorNote: color
      ? item.selectedColor?.value
        ? null
        : "کد رنگ از بک ارسال نشده"
      : item.selectedOptions.color == null
        ? "رنگ انتخاب‌شده از بک ارسال نشده"
        : "ساختار رنگ دریافتی از بک مشخص نیست",
    guaranteeNote:
      getCartOptionName(item.selectedOptions.guarantee) || getCartFieldNote(item.dataIssues,"product.guarantee.available") || (item.selectedOptions.guarantee != null
        ? "ساختار گارانتی انتخاب‌شده از بک مشخص نیست"
        : !guarantee.available
          ? "ندارد (طبق پاسخ بک)"
          : "گارانتی انتخاب‌شده از بک ارسال نشده"),
    sellerNote:
      getCartOptionName(item.product.seller) || getCartFieldNote(item.dataIssues,"product.seller") || (item.product.seller == null
        ? "از بک ارسال نشده"
        : "ساختار فروشندهٔ دریافتی از بک مشخص نیست"),
  };
}
