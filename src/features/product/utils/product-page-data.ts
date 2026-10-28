import type { ProductListResult } from "../types/domain/product-list.types";
import type { ProductPageProps } from "../types/domain/product-page.types";
import type { ProductListQuery } from "../types/api/product-list-query.types";
import { buildProductBreadcrumb } from "./build-breadcrumb";
import {
  filterImportedProducts,
  getImportedProductFilters,
} from "./imported-products.utils";

type Input = Pick<
  ProductPageProps,
  "importedProducts" | "discoveryProducts"
> & {
  pages: ProductListResult[];
  query: ProductListQuery;
};

/** Pure data preparation: no React, routing, network or browser dependencies. */
export function getProductPageData({
  pages,
  query,
  importedProducts,
  discoveryProducts,
}: Input) {
  const sourceProducts = discoveryProducts
    ? [...discoveryProducts.requested, ...discoveryProducts.suggested]
    : importedProducts;
  const isCatalog = sourceProducts === undefined;
  const products = isCatalog
    ? Array.from(
        new Map(
          pages.flatMap((page) => page.products).map((product) => [product.id, product]),
        ).values(),
      )
    : filterImportedProducts(
        discoveryProducts?.suggested ?? sourceProducts,
        query,
      );
  const filters = isCatalog
    ? pages[0]?.filters
    : getImportedProductFilters(sourceProducts);
  const amounts = products
    .map((product) => product.price.amountIrr)
    .filter(
      (value): value is number => value !== null && Number.isFinite(value),
    );

  return {
    isCatalog,
    products,
    productCount: isCatalog ? (pages[0]?.count ?? 0) : products.length,
    filters,
    priceMin: amounts.length ? Math.min(...amounts) : 0,
    priceMax: amounts.length ? Math.max(...amounts) : 0,
    breadcrumbItems: buildProductBreadcrumb(
      filters?.categories ?? [],
      query.category,
    ),
    sourceCurrencyLabel: products.every(
      (product) => !product.price.currency || product.price.currency === "CNY",
    )
      ? "یوان"
      : "ارز کالا",
  };
}
