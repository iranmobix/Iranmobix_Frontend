import "server-only";
import type { ProductListQuery } from "../types/api/product-list-query.types";
import { getProductDetailApiPath } from "../utils/product-path";

async function getPublicProduct(
  path: string,
  query?: ProductListQuery,
  signal?: AbortSignal,
): Promise<unknown> {
  signal?.throwIfAborted();
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) throw new Error("Product API base URL is not configured");
  const url = new URL(path, base);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === undefined || value === null || value === "") continue;
    if (Array.isArray(value)) {
      if (value.length) url.searchParams.set(key, value.join(","));
    } else url.searchParams.set(key, String(value));
  }
  const timeout = AbortSignal.timeout(10_000);
  const response = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
    credentials: "omit",
    cache: "no-store",
    redirect: "error",
    signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
  });
  if (!response.ok)
    throw new Error(`Product API returned HTTP ${response.status}`);
  return response.json();
}

/** Public reads only: no cookies, incoming headers or browser auth interceptors. */
export const productServerApi = {
  getProducts: (query?: ProductListQuery, signal?: AbortSignal) =>
    getPublicProduct("/api/catalog/products/", query, signal),
  getProductDetail: (slug: string, signal?: AbortSignal) =>
    getPublicProduct(
      getProductDetailApiPath(slug),
      undefined,
      signal,
    ),
};
