import { mapStorefrontFilters } from "./storefront-filter.mapper";
import { productListEnvelopeSchema } from "../schemas/product-response.schema";
import type { ProductListResult } from "../types/domain";
import type { ProductListQuery } from "../types/api/product-list-query.types";
import { mapProductListResponse } from "./product-list.mapper";
import { mapProductFilters } from "./product-filter.mapper";
import { mapStorefrontCard, storefrontListSchema } from "./storefront-card.mapper";
import { getImportedProductFilters } from "../utils/imported-products.utils";
import { productPageFromLink } from "../utils/product-list-request";

export const mapProductListResult = (input: unknown, query?: ProductListQuery): ProductListResult => {
  const compact = storefrontListSchema.safeParse(input);
  if (compact.success) {
    const response = compact.data;
    const products = response.results.map(mapStorefrontCard);
    const currentPage = Number(query?.cursor ?? query?.page ?? 1);
    const nextPage = productPageFromLink(response.next);
    const previousPage = productPageFromLink(response.previous);
    return {
      products, count: response.count,
      filters: response.filters ? mapStorefrontFilters(response.filters) : getImportedProductFilters(products),
      nextCursor: nextPage !== null && nextPage > currentPage ? String(nextPage) : null,
      previousCursor: previousPage !== null && previousPage < currentPage ? String(previousPage) : null,
      limit: Math.min(60, query?.page_size ?? query?.limit ?? 24),
    };
  }
  // Native favorites and explicitly selected mock previews still use the catalog contract.
  const response = productListEnvelopeSchema.parse(input);
  return {
    products: mapProductListResponse(response), count: response.count,
    filters: mapProductFilters(response.filters),
    nextCursor: response.next_cursor, previousCursor: response.previous_cursor, limit: response.limit,
  };
};
