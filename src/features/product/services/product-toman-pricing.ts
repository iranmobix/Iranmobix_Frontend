import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";
import { httpGet } from "@/shared/api";
import {
  getProductDetailApiPath,
  normalizeProductSlug,
} from "../utils/product-path";

const money = z
  .union([
    z
      .string()
      .trim()
      .regex(/^\d+(?:\.\d+)?$/)
      .transform(Number),
    z.number(),
  ])
  .pipe(z.number().finite().nonnegative().max(Number.MAX_SAFE_INTEGER))
  .nullish()
  .transform((value) => value ?? null);
const quantity = z
  .number()
  .int()
  .nonnegative()
  .nullish()
  .transform((value) => value ?? null);
const schema = z.object({
  slug: z.string().min(1),
  currency: z.literal("TOMAN"),
  price: z.object({
    amount_toman: money,
    original_amount_toman: money,
    final_amount_toman: money,
    discount_amount_toman: money,
    ladder_price: z
      .array(
        z.object({
          min_quantity: quantity,
          max_quantity: quantity,
          amount_toman: money,
          original_amount_toman: money,
          discount_amount_toman: money,
        }),
      )
      .default([]),
  }),
});
export type ProductTomanPricing = z.infer<typeof schema>["price"];

export function findTomanPriceTier(
  pricing: ProductTomanPricing | undefined,
  minimum: number | null,
  maximum: number | null,
) {
  if (minimum === null) return undefined;
  return pricing?.ladder_price.find(
    (tier) => tier.min_quantity === minimum && tier.max_quantity === maximum,
  );
}

export function productTomanPricingOptions(
  slug: string,
  revision = "",
  enabled = true,
) {
  const normalized = normalizeProductSlug(slug);
  return queryOptions({
    queryKey: ["products", "api", "toman-pricing", normalized, revision],
    enabled: Boolean(normalized) && enabled,
    queryFn: async ({ signal }) => {
      const response = schema.parse(
        await httpGet<unknown>(
          `${getProductDetailApiPath(normalized)}pricing/`,
          { signal, headers: { Authorization: false }, withCredentials: false },
        ),
      );
      if (normalizeProductSlug(response.slug) !== normalized)
        throw new Error("شناسه پاسخ قیمت با محصول یکسان نیست.");
      return response.price;
    },
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export { money as productTomanAmountSchema };
