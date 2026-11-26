import { z } from "zod";
import type { ProductFilters, ProductSellerType } from "../types/domain/product-filter.types";

const option = z.object({ value: z.string().trim().min(1), label: z.string() });
export const storefrontFiltersSchema = z.object({
  sources: z.array(option).default([]),
  brands: z.array(option).default([]),
  seller_types: z.array(option).default([]),
});

const sellerTypes: Record<string, ProductSellerType> = {
  alibaba_verified: "verified",
  iranmobix_verified: "trusted",
  verified: "verified",
  trusted: "trusted",
  iranmobix: "iranmobix",
};

export function mapStorefrontFilters(filters: z.infer<typeof storefrontFiltersSchema>): ProductFilters {
  return {
    sources: filters.sources,
    brands: filters.brands.map((brand) => ({ id: brand.value, name: brand.label, logo: null })),
    categories: [],
    sellerTypes: filters.seller_types.flatMap((seller) =>
      sellerTypes[seller.value] ? [{ value: sellerTypes[seller.value], label: seller.label }] : [],
    ),
  };
}
