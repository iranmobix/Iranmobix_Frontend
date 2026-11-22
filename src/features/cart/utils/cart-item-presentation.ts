import type { ServerCartItem } from "../types/domain/cart.types";

export function cartTomanFromRial(amount: string | null | undefined) {
  const parts = amount?.match(/^(\d+)(?:\.(\d+))?$/);
  if (!parts) return null;
  const whole = parts[1];
  const fraction = (whole.slice(-1) + (parts[2] ?? "")).replace(/0+$/, "");
  return (whole.slice(0, -1) || "0") + (fraction ? "." + fraction : "");
}

export function getCartChinaPrice(item: ServerCartItem) {
  return (
    item.chinaPriceCny ??
    item.product.price.amountCny ??
    (item.pricing.currency === "CNY" || item.currency === "CNY"
      ? item.pricing.finalUnitPrice || item.product.price.amount
      : item.product.price.currency === "CNY"
        ? item.product.price.amount
        : null)
  );
}

export const cartShippingLabels: Record<string, string> = {
  ground: "زمینی",
  ground_china_iran: "زمینی",
  sea: "دریایی",
  sea_china_iran: "دریایی",
  sea_china_dubai: "دریایی به دبی",
  air_express: "هوایی اکسپرس",
  commercial_air: "هوایی تجاری",
  commercial_air_iran: "هوایی تجاری",
  commercial_air_dubai: "هوایی تجاری به دبی",
};

/** Keep decimal money exact; the storefront discount is a Toman amount per unit. */
export function getCartDiscountPresentation(
  item: ServerCartItem,
  chinaToman: string | null,
) {
  const discounted = item.discountPriceToman;
  const hasTomanDiscount =
    chinaToman != null &&
    discounted != null &&
    /^\d+(?:\.\d+)?$/.test(chinaToman) &&
    /^\d+(?:\.\d+)?$/.test(discounted) &&
    /[1-9]/.test(discounted);
  if (hasTomanDiscount) {
    const [currentWhole, currentFraction = ""] = chinaToman.split(".");
    const [discountWhole, discountFraction = ""] = discounted.split(".");
    const scale = Math.max(currentFraction.length, discountFraction.length);
    const current = BigInt(currentWhole + currentFraction.padEnd(scale, "0"));
    const discount = BigInt(
      discountWhole + discountFraction.padEnd(scale, "0"),
    );
    const original = current + discount;
    const digits = original.toString().padStart(scale + 1, "0");
    const originalToman = scale
      ? digits.slice(0, -scale) + "." + digits.slice(-scale)
      : digits;
    return {
      originalToman,
      originalCny: null,
      percentage: Number((discount * BigInt(1000) + original / BigInt(2)) / original) / 10,
    };
  }
  const originalCny =
    item.currency === "CNY" && item.product.price.currency === "CNY"
      ? item.product.price.originalAmount
      : null;
  const current = Number(item.product.price.amount);
  const original = Number(originalCny);
  return originalCny &&
    Number.isFinite(original) &&
    Number.isFinite(current) &&
    original > current &&
    current >= 0
    ? {
        originalToman: null,
        originalCny,
        percentage: Math.round(((original - current) / original) * 1000) / 10,
      }
    : null;
}
