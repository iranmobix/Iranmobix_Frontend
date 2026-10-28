import { productApi } from "../api/product.api";
import { mockProductApi } from "../api/product.api.mock";
import { mapProductDetail } from "../mappers/product-detail.mapper";
import { mapProductListResult } from "../mappers/product-list-result.mapper";
import type { ProductListQuery } from "../types/api/product-list-query.types";
import type { ProductListResult } from "../types/domain";
import type { ProductDetail } from "../types/domain/product-detail.types";

export type ProductDataSource = "api" | "mock";

export interface ProductService {
  getProducts(
    query?: ProductListQuery,
    source?: ProductDataSource,
    signal?: AbortSignal,
  ): Promise<ProductListResult>;
  getProductDetail(
    slug: string,
    source?: ProductDataSource,
    signal?: AbortSignal,
  ): Promise<ProductDetail>;
}

export const productService: ProductService = {
  async getProducts(query, source = "api", signal) {
    signal?.throwIfAborted();
    const response = await (
      source === "mock" ? mockProductApi : productApi
    ).getProducts(query, signal);
    signal?.throwIfAborted();
    return mapProductListResult(response);
  },
  async getProductDetail(slug, source = "api", signal) {
    signal?.throwIfAborted();
    const response = await (
      source === "mock" ? mockProductApi : productApi
    ).getProductDetail(slug, signal);
    signal?.throwIfAborted();
    return mapProductDetail(response);
  },
};
