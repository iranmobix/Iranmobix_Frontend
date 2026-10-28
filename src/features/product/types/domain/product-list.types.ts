import type { Product } from "./product.types";
import type { ProductFilters } from "./product-filter.types";

export interface ProductListResult {
  products: Product[];

  filters: ProductFilters;
  count: number;

  nextCursor: string | null;
  previousCursor: string | null;

  limit: number;
}
