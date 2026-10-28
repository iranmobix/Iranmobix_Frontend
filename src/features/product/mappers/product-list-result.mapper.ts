import { productListEnvelopeSchema } from "../schemas/product-response.schema";

import type { ProductListResult } from "../types/domain";

import { mapProductListResponse } from "./product-list.mapper";
import { mapProductFilters } from "./product-filter.mapper";

export const mapProductListResult = (input: unknown): ProductListResult => {
  const response = productListEnvelopeSchema.parse(input);
  return {
    products: mapProductListResponse(response),
    count: response.count,

    filters: mapProductFilters(response.filters),

    nextCursor: response.next_cursor,
    previousCursor: response.previous_cursor,

    limit: response.limit,
  };
};
