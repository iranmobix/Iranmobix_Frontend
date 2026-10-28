import "server-only";
import { QueryClient, dehydrate } from "@tanstack/react-query";
import type { ProductListQuery } from "../types/api/product-list-query.types";
import {
  productListQueryOptions,
  productDetailQueryOptions,
} from "./product-query-options";
import { productServerService } from "./product-server.service";

/** Each request owns its cache; only successful validated data crosses the server boundary. */
export async function loadProductListState(query: ProductListQuery) {
  const client = new QueryClient();
  try {
    await client.prefetchInfiniteQuery({
      ...productListQueryOptions(query, "api", productServerService),
      gcTime: Infinity,
    });
    return dehydrate(client);
  } finally {
    client.clear();
  }
}

export async function loadProductDetailState(slug: string) {
  const client = new QueryClient();
  try {
    await client.prefetchQuery({
      ...productDetailQueryOptions(slug, "api", productServerService),
      // Keep SSR bounded; the browser can recover transient failures automatically.
      retry: false,
      gcTime: Infinity,
    });
    return dehydrate(client);
  } finally {
    client.clear();
  }
}
