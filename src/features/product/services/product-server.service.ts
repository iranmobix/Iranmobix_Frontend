import "server-only";
import type { ProductService } from "./product.service";
import { productServerApi } from "../api/product-server.api";
import { mapProductListResult } from "../mappers/product-list-result.mapper";
import { mapProductDetail } from "../mappers/product-detail.mapper";

export const productServerService: ProductService = {
  async getProducts(query, source = "api", signal) {
    if (source !== "api")
      throw new Error("Server product reads require the public API");
    const response = await productServerApi.getProducts(query, signal);
    signal?.throwIfAborted();
    return mapProductListResult(response);
  },
  async getProductDetail(slug, source = "api", signal) {
    if (source !== "api")
      throw new Error("Server product reads require the public API");
    const response = await productServerApi.getProductDetail(slug, signal);
    signal?.throwIfAborted();
    return mapProductDetail(response);
  },
};
