import { ProductListQuery } from "../types/api/product-list-query.types";
import { ProductListApiResponse } from "../types/api/product-list-api.types";
import { ProductDetailApiResponse } from "../types/api/product-detail-api.types";
import { productListMock } from "../mock/product-list.mock";
import { getProductDetailMock } from "../mock/product-detail.mock";

function waitForMockResponse(signal?: AbortSignal) {
  signal?.throwIfAborted();
  return new Promise<void>((resolve, reject) => {
    const onAbort = () => {
      clearTimeout(timer);
      reject(signal?.reason);
    };
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, 300);
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

export const mockProductApi = {
  async getProducts(
    query?: ProductListQuery,
    signal?: AbortSignal,
  ): Promise<ProductListApiResponse> {
    void query;

    await waitForMockResponse(signal);

    return structuredClone(productListMock);
  },

  async getProductDetail(
    slug: string,
    signal?: AbortSignal,
  ): Promise<ProductDetailApiResponse> {
    await waitForMockResponse(signal);

    return getProductDetailMock(slug);
  },
};
