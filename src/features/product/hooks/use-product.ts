import { useState } from "react";
import { normalizeProductSlug } from "../utils/product-path";
import { hashKey, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  productDetailQueryOptions,
  productQueryKeys,
} from "../services/product-query-options";

export const useProduct = (slug: string) => {
  const productSlug = normalizeProductSlug(slug);
  const client = useQueryClient();
  const [mockIdentity, setMockIdentity] = useState<string | null>(null);
  const identity = hashKey(productQueryKeys.detail(productSlug, "api"));
  const isMock = mockIdentity === identity;
  const source = isMock ? "mock" : "api";
  const result = useQuery({
    ...productDetailQueryOptions(productSlug, source),
    enabled: Boolean(productSlug),
  });

  return {
    ...result,
    isError: result.isError && !result.data,
    isMock,
    useMockData: () => setMockIdentity(identity),
    useApiData: () => {
      if (isMock)
        void client.invalidateQueries({
          queryKey: productQueryKeys.detail(productSlug, "api"),
          exact: true,
          refetchType: "none",
        });
      setMockIdentity(null);
      if (!isMock) void result.refetch();
    },
  };
};
