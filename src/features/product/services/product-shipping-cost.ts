import { z } from "zod";
import { queryOptions } from "@tanstack/react-query";
import { httpGet } from "@/shared/api";
import { productTomanAmountSchema as money } from "./product-toman-pricing";
import {
  getProductDetailApiPath,
  normalizeProductSlug,
} from "../utils/product-path";

const breakdown = z.object({
  clearance_toman: money,
  iranmobix_services_toman: money,
  insurance_toman: money,
  china_total_yuan: money,
  china_total_toman: money,
  international_shipping_toman: money,
  total_toman: money,
});
const salesExpert = z.object({
  id: z.number().int().optional(),
  name: z.string().nullish(),
  mobile: z.string().nullish(),
  email: z.string().nullish(),
  whatsapp_url: z.string().nullish().catch(null),
  telegram_url: z.string().nullish().catch(null),
});
const shippingSchema = z.object({
  currency: z.literal("TOMAN"),
  product_type: z.string().nullish(),
  land: breakdown.nullish(),
  sea: breakdown.nullish(),
  air: z
    .object({
      // Keep the previous contract readable while the backend rollout completes.
      assigned_sales_expert: salesExpert.nullish(),
      express: z
        .object({ assigned_sales_expert: salesExpert.nullish() })
        .nullish(),
      commercial: z.object({ total_toman: money }).nullish(),
    })
    .nullish(),
});
export type ProductShippingCost = z.infer<typeof shippingSchema>;
export function productShippingCostOptions(
  slug: string,
  quantity: number,
  revision = "",
) {
  const normalized = normalizeProductSlug(slug);
  return queryOptions({
    queryKey: [
      "products",
      "api",
      "shipping-cost",
      normalized,
      quantity,
      revision,
    ],
    enabled:
      Boolean(normalized) && Number.isSafeInteger(quantity) && quantity >= 1,
    queryFn: async ({ signal }) =>
      shippingSchema.parse(
        await httpGet<unknown>(
          `${getProductDetailApiPath(normalized)}shipping-cost/`,
          {
            params: { quantity },
            signal,
            headers: { Authorization: false },
            withCredentials: false,
          },
        ),
      ),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
