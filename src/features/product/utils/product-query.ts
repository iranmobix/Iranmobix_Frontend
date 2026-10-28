import type { ProductListQuery } from "../types/api/product-list-query.types";
import type {
  ProductGuaranteeTypeApi,
  ProductSellerTypeApi,
} from "../types/api";

export const DEFAULT_PRODUCT_SORT: ProductListQuery["sort"] = "newest";

export type ProductRouteSearchParams = Record<
  string,
  string | string[] | undefined
>;

export function parseProductRouteQuery(
  params: ProductRouteSearchParams,
): ProductListQuery {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    const first = Array.isArray(value) ? value[0] : value;
    if (first !== undefined) search.set(key, first);
  }
  return parseProductQuery(search);
}

const parseNumberArray = (value: string | null): number[] | undefined => {
  if (!value) return undefined;

  const result = value.split(",").map(Number).filter(Number.isFinite);

  return result.length > 0 ? result : undefined;
};

const parseStringArray = (value: string | null): string[] | undefined => {
  if (!value) return undefined;

  const result = value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return result.length > 0 ? result : undefined;
};

const parseBoolean = (value: string | null): boolean | undefined => {
  if (value === "true") return true;
  if (value === "false") return false;

  return undefined;
};

const parseSort = (value: string | null): ProductListQuery["sort"] => {
  if (
    value === "newest" ||
    value === "oldest" ||
    value === "price_asc" ||
    value === "price_desc" ||
    value === "popular"
  ) {
    return value;
  }

  return DEFAULT_PRODUCT_SORT;
};

export const parseProductQuery = (
  searchParams: Pick<URLSearchParams, "get">,
): ProductListQuery => {
  return {
    search: searchParams.get("search") ?? undefined,

    sources: parseStringArray(searchParams.get("sources")),

    category: parseNumberArray(searchParams.get("category")),

    min_price: searchParams.get("min_price") ?? undefined,

    max_price: searchParams.get("max_price") ?? undefined,

    brands: parseNumberArray(searchParams.get("brands")),

    colors: parseNumberArray(searchParams.get("colors")),

    seller_types: parseStringArray(searchParams.get("seller_types")) as
      ProductSellerTypeApi[] | undefined,

    guarantees: parseStringArray(searchParams.get("guarantees")) as
      ProductGuaranteeTypeApi[] | undefined,

    in_iranmobix_inventory: parseBoolean(
      searchParams.get("in_iranmobix_inventory"),
    ),

    sort: parseSort(searchParams.get("sort")),
  };
};
