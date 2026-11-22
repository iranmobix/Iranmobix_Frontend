"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { productShippingCostOptions } from "../services/product-shipping-cost";

export function useProductShippingCost(
  slug: string,
  quantity: number,
  editing = false,
  revision = "",
  enabled = true,
  pending = false,
  reuseSuccessful = false,
) {
  const [lastQuote, setLastQuote] = useState<{
    slug: string;
    quantity: number;
  } | null>(null);
  const [settled, setSettled] = useState({ slug, quantity, revision });
  useEffect(() => {
    if (editing || !slug || !Number.isSafeInteger(quantity) || quantity < 1)
      return;
    if (
      settled.slug === slug &&
      settled.quantity === quantity &&
      settled.revision === revision
    )
      return;
    const timer = window.setTimeout(
      () => setSettled({ slug, quantity, revision }),
      1500,
    );
    return () => window.clearTimeout(timer);
  }, [slug, quantity, editing, revision, settled]);
  const ready =
    !editing &&
    settled.slug === slug &&
    settled.quantity === quantity &&
    settled.revision === revision;
  const options = productShippingCostOptions(slug, quantity, revision);
  const query = useQuery({
    ...options,
    ...(reuseSuccessful && { staleTime: Infinity, refetchOnReconnect: false }),
    enabled: options.enabled && enabled && ready,
    refetchInterval: (state) => (pending && !state.state.data ? 2000 : false),
  });
  const data = ready && enabled ? query.data : undefined;
  if (data && (lastQuote?.slug !== slug || lastQuote.quantity !== quantity)) {
    setLastQuote({ slug, quantity });
  }
  return {
    ...query,
    data,
    isRecalculatingQuantity:
      lastQuote?.slug === slug && lastQuote.quantity !== quantity,
    isUpdating: enabled && (!ready || query.isPending || query.isFetching),
  };
}
