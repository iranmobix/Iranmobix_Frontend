import { DEFAULT_PRODUCT_SORT } from "./product-query";
import type { ProductCategoryFilterApi } from "../types/api/product-category-api.types";

const normalizeCategoryName = (name: string) =>
  name.normalize("NFKC").replace(/\u064a/g, "\u06cc").replace(/\u0643/g, "\u06a9")
    .replace(/[\s\u200c\u200d\u200e\u200f-]+/g, "").toLocaleLowerCase();

export function findProductCategory(categories: readonly ProductCategoryFilterApi[], name: string) {
  const expected = normalizeCategoryName(name);
  if (!expected) return undefined;
  const matches = categories.filter((category) =>
    normalizeCategoryName(category.name) === expected || normalizeCategoryName(category.slug) === expected,
  );
  return matches.length === 1 ? matches[0] : undefined;
}

export function getProductCategoryHref(name: string, id?: number | null) {
  const params = new URLSearchParams();
  if (id != null && Number.isSafeInteger(id) && id >= 0) {
    params.set("category", String(id));
  } else {
    params.set("category_name", name.trim());
  }
  params.set("sort", DEFAULT_PRODUCT_SORT ?? "newest");
  return "/products?" + params.toString();
}
