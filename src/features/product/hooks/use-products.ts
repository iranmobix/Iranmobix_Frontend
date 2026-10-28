import { useState } from "react";
import {
  hashKey,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  productListQueryOptions,
  productQueryKeys,
} from "../services/product-query-options";
import type { ProductListQuery } from "../types/api/product-list-query.types";

export const useProducts = (query?: ProductListQuery, enabled = true) => {
  const client = useQueryClient();
  const [mockQuery, setMockQuery] = useState<string | null>(null);
  const queryIdentity = hashKey(productQueryKeys.list(query, "api"));
  const isMock = mockQuery === queryIdentity;
  const source = isMock ? "mock" : "api";
  const result = useInfiniteQuery({
    ...productListQueryOptions(query, source),
    enabled,
  });

  return {
    ...result,
    isMock,
    useMockData: () => setMockQuery(queryIdentity),
    useApiData: () => {
      if (isMock)
        void client.invalidateQueries({
          queryKey: productQueryKeys.list(query, "api"),
          exact: true,
          refetchType: "none",
        });
      setMockQuery(null);
      if (!isMock) void result.refetch();
    },
  };
};
