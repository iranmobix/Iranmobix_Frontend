import type { LiveExchangeRates } from "../../header/services/live-exchange";

export type ProductDisplayCurrency = "source" | "USD" | "AED";

export const productCurrencyOptions = [
  { value: "source", label: "یوان CNY" },
  { value: "USD", label: "دلار USD" },
  { value: "AED", label: "درهم AED" },
] as const;

export function getDisplaySourcePrice(
  amount: number | null,
  currency: string,
  selected: ProductDisplayCurrency,
  rates?: LiveExchangeRates,
) {
  if (selected === "source" || currency !== "CNY") return { amount, currency };
  const targetRate = selected === "AED" ? rates?.aed_toman : rates?.usd_toman;
  const sourceRate = rates?.cny_toman;
  const valid =
    sourceRate !== undefined && Number.isFinite(sourceRate) && sourceRate > 0 &&
    targetRate !== undefined && Number.isFinite(targetRate) && targetRate > 0;
  const converted = valid && amount !== null ? amount * sourceRate / targetRate : null;
  return {
    amount: converted !== null && Number.isFinite(converted) ? converted : null,
    currency: selected,
  };
}

export function getDisplayTomanPrice(
  amount: number | null,
  currency: string,
  rates: LiveExchangeRates | undefined,
  fallback: number | null,
): number | null {
  if (currency !== "CNY") return fallback;
  const rate = rates?.cny_toman;
  const converted =
    amount !== null && rate !== undefined && Number.isFinite(rate) && rate > 0
      ? amount * rate
      : null;
  return converted !== null && Number.isFinite(converted) ? converted : null;
}
