import { httpGet } from "@/shared/api";

import type { ProductListQuery } from "../types/api/product-list-query.types";
import { getProductDetailApiPath } from "../utils/product-path";
import { PRODUCT_DETAIL_TIMEOUT } from "../utils/product-request-policy";

class ProductApi {
  async getProducts(
    query?: ProductListQuery,
    signal?: AbortSignal,
  ): Promise<unknown> {
    const response = await httpGet<unknown>("/api/catalog/products/", {
      params: query,
      signal,
      headers: { Authorization: false },
      withCredentials: false,
    });

    return response;
  }

  async getProductDetail(slug: string, signal?: AbortSignal): Promise<unknown> {
    const response = await httpGet<unknown>(
      getProductDetailApiPath(slug),
      { signal, timeout: PRODUCT_DETAIL_TIMEOUT, headers: { Authorization: false }, withCredentials: false },
    );

    return response;
  }
}

export const productApi = new ProductApi();
