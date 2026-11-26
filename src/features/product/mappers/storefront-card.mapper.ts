import { storefrontFiltersSchema } from "./storefront-filter.mapper";
import { z } from "zod";
import type { Product } from "../types/domain/product.types";
import { optionalProductAmountSchema, parseOptionalProductAmount } from "../schemas/product-money.schema";
import { getProductCardTitle } from "../utils/product-card-title";

const text = z.string().nullish().transform((value) => value?.trim() ?? "");
export const storefrontCardSchema = z.object({
  slug: z.string().trim().min(1),
  primary_image: text,
  source_url: text,
  en_title: text,
  fa_title: text,
  seller_name: text,
  seller_url: text,
  alibaba_verified: z.boolean().default(false),
  iranmobix_verified: z.boolean().default(false),
  price_in_china_cny: optionalProductAmountSchema.catch(null),
  price_in_china_toman: optionalProductAmountSchema.catch(null),
  final_price_iran: optionalProductAmountSchema.catch(null),
});

export const storefrontListSchema = z.object({
  count: z.number().int().nonnegative(),
  next: z.string().nullable(),
  previous: z.string().nullable(),
  results: z.array(z.unknown()),
  filters: storefrontFiltersSchema.optional().catch(undefined),
});

// Compact cards have no numeric ID. A stable negative 53-bit hash keeps their
// React identity independent of page position and separate from native IDs.
function cardId(slug: string) {
  let first = 0xdeadbeef, second = 0x41c6ce57;
  for (let index = 0; index < slug.length; index++) {
    const code = slug.charCodeAt(index);
    first = Math.imul(first ^ code, 2654435761);
    second = Math.imul(second ^ code, 1597334677);
  }
  first = Math.imul(first ^ (first >>> 16), 2246822507) ^ Math.imul(second ^ (second >>> 13), 3266489909);
  second = Math.imul(second ^ (second >>> 16), 2246822507) ^ Math.imul(first ^ (first >>> 13), 3266489909);
  return -(4294967296 * (second & 2097151) + (first >>> 0) || 1);
}

function source(url: string) {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    const name = ["alibaba", "aliexpress", "1688"].find((market) =>
      hostname === market + ".com" || hostname.endsWith("." + market + ".com"),
    ) ?? hostname.replace(/^www\./, "");
    const labels: Record<string, string> = { alibaba: "علی‌بابا", aliexpress: "علی‌اکسپرس", "1688": "1688" };
    return { name, label: labels[name] ?? name, url };
  } catch {
    return { name: "", label: "", url };
  }
}

export function mapStorefrontCard(input: unknown): Product {
  const card = storefrontCardSchema.parse(input);
  const amount = parseOptionalProductAmount(card.price_in_china_cny, "price_in_china_cny");
  const toman = parseOptionalProductAmount(card.price_in_china_toman, "price_in_china_toman");
  const badges: NonNullable<NonNullable<Product["seller"]>["badges"]> = [
    ...(card.alibaba_verified ? ["verified" as const] : []),
    ...(card.iranmobix_verified ? ["trusted" as const] : []),
  ];
  return {
    id: cardId(card.slug),
    slug: card.slug,
    title: getProductCardTitle(card),
    image: card.primary_image,
    source: source(card.source_url),
    price: {
      amount, currency: "CNY",
      amountIrr: toman === null || !Number.isFinite(toman * 10) ? null : toman * 10,
      finalPriceIranToman: parseOptionalProductAmount(card.final_price_iran, "final_price_iran"),
      hasDiscount: false, originalAmount: null, discountAmount: null, discountPercentage: null,
    },
    seller: card.seller_name || badges.length ? { id: null, name: card.seller_name, badges } : null,
    colors: [], brand: null, guarantee: null,
    inIranMobixInventory: false, officialUrl: card.source_url, marketable: true,
  };
}
