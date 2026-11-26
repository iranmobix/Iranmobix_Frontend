import type { ProductListQuery } from "../types/api/product-list-query.types";

export const PRODUCT_LIST_ENDPOINT = "/api/products/";
const sorts: Record<string, string> = { price_asc: "cheapest", price_desc: "expensive" };

export function productListRequestQuery(query: ProductListQuery = {}) {
  const { cursor, limit, page: requestedPage, page_size, sort, seller_types, ...filters } = query;
  const page = Number(cursor ?? requestedPage ?? 1);
  if (!Number.isSafeInteger(page) || page < 1) throw new Error("Invalid product page");
  const size = page_size ?? limit ?? 24;
  if (!Number.isSafeInteger(size) || size < 1) throw new Error("Invalid product page size");
  return { ...filters,
    ...(seller_types?.includes("verified") ? { alibaba_verified: true } : {}),
    ...(seller_types?.includes("trusted") ? { iranmobix_verified: true } : {}),
    sort: sorts[sort ?? "newest"] ?? sort ?? "newest", page, page_size: Math.min(60, size) };
}

// Never fetch the host in next/previous: gateways can return internal service URLs.
export function productPageFromLink(link: string | null): number | null {
  if (!link) return null;
  const value = new URL(link, "https://pagination.invalid").searchParams.get("page");
  const page = value === null ? 1 : Number(value);
  if (!Number.isSafeInteger(page) || page < 1) throw new Error("Invalid product pagination");
  return page;
}
