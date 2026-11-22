"use client";

import { useQuery } from "@tanstack/react-query";
import { productTomanPricingOptions } from "../services/product-toman-pricing";

export function useProductTomanPricing(
  slug: string,
  revision = "",
  enabled = true,
  pending = false,
  reuseSuccessful = false,
) {
  return useQuery({
    ...productTomanPricingOptions(slug, revision, enabled),
    ...(reuseSuccessful && { staleTime: Infinity, refetchOnReconnect: false }),
    // A slug can arrive before its pricing record is ready during import.
    refetchInterval: (query) => (pending && !query.state.data ? 2000 : false),
  });
}
