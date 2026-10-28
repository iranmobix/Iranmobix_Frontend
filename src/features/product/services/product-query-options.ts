import {
  infiniteQueryOptions,
  queryOptions,
  type QueryClient,
  type QueryFilters,
} from "@tanstack/react-query";
import type { ProductListQuery } from "../types/api/product-list-query.types";
import { normalizeProductSlug } from "../utils/product-path";
import { retryProductDetail } from "../utils/product-request-policy";
import {
  productService,
  type ProductDataSource,
  type ProductService,
} from "./product.service";

export const PUBLIC_PRODUCT_CACHE_SCOPE = "public";

export const PRODUCT_CACHE_POLICY = {
  staleTime: 30_000,
  gcTime: 5 * 60_000,
} as const;

/** Keep loaded catalog pages fresh during a product-detail round trip. */
export const PRODUCT_LIST_CACHE_POLICY = {
  staleTime: 5 * 60_000,
  gcTime: 30 * 60_000,
} as const;
/** Match HTTP filter semantics without mutating input or including pagination in its identity. */
export function normalizeProductListQuery(
  query: ProductListQuery = {},
): ProductListQuery {
  const result: ProductListQuery = { sort: query.sort ?? "newest" };
  for (const key of ["search", "min_price", "max_price"] as const) {
    if (query[key] !== undefined && query[key] !== "") result[key] = query[key];
  }
  for (const key of ["category", "brands", "colors"] as const) {
    if (query[key]?.length)
      result[key] = [...new Set(query[key])].sort((a, b) => a - b);
  }
  if (query.sources?.length)
    result.sources = [...new Set(query.sources)].sort();
  if (query.seller_types?.length)
    result.seller_types = [...new Set(query.seller_types)].sort();
  if (query.guarantees?.length)
    result.guarantees = [...new Set(query.guarantees)].sort();
  if (query.in_iranmobix_inventory !== undefined)
    result.in_iranmobix_inventory = query.in_iranmobix_inventory;
  if (query.limit !== undefined) result.limit = query.limit;
  return result;
}

export const productQueryKeys = {
  all: ["products"] as const,
  lists: (source: ProductDataSource = "api") =>
    ["products", source, "list"] as const,
  list: (query?: ProductListQuery, source: ProductDataSource = "api") =>
    [
      ...productQueryKeys.lists(source),
      PUBLIC_PRODUCT_CACHE_SCOPE,
      normalizeProductListQuery(query),
    ] as const,
  details: (source: ProductDataSource = "api") =>
    ["products", source, "detail"] as const,
  detailsForSlug: (slug: string, source: ProductDataSource = "api") =>
    [...productQueryKeys.details(source), normalizeProductSlug(slug)] as const,
  detail: (slug: string, source: ProductDataSource = "api") =>
    [
      ...productQueryKeys.detailsForSlug(slug, source),
      PUBLIC_PRODUCT_CACHE_SCOPE,
    ] as const,
};

/** Shared by hooks and future prefetch/hydration consumers. */
export function productListQueryOptions(
  query?: ProductListQuery,
  source: ProductDataSource = "api",
  service: ProductService = productService,
) {
  const filters = normalizeProductListQuery(query);
  return infiniteQueryOptions({
    queryKey: productQueryKeys.list(filters, source),
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam, signal }) =>
      service.getProducts({ ...filters, cursor: pageParam }, source, signal),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    ...PRODUCT_LIST_CACHE_POLICY,
    retry: false,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}

export function productDetailQueryOptions(
  slug: string,
  source: ProductDataSource = "api",
  service: ProductService = productService,
) {
  const productSlug = normalizeProductSlug(slug);
  return queryOptions({
    queryKey: productQueryKeys.detail(productSlug, source),
    queryFn: ({ signal }) => service.getProductDetail(productSlug, source, signal),
    ...PRODUCT_CACHE_POLICY,
    retry: retryProductDetail,
    retryDelay: (attempt) => Math.min(500 * 2 ** attempt, 2000),
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}

/** A completed import changes real catalog data, never mock previews or other product details. */
export async function invalidateProductCache(
  client: QueryClient,
  slug: string,
) {
  const filters: QueryFilters[] = [
    { queryKey: productQueryKeys.lists() },
    { queryKey: productQueryKeys.detailsForSlug(slug) },
  ];
  // Discard any older in-flight results before marking cached snapshots stale.
  await Promise.all(filters.map((filter) => client.cancelQueries(filter)));
  await Promise.all(
    filters.map((filter) =>
      client.invalidateQueries({ ...filter, refetchType: "none" }),
    ),
  );
}
