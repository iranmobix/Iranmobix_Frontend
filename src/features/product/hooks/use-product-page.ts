"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  ProductPageProps,
  ProductPagePagination,
} from "../types/domain/product-page.types";
import type { ProductMobileCurrency } from "../components/product-card/product-mobile-card";
import { getProductPageData } from "../utils/product-page-data";
import { useProductQuery } from "./use-product-query";
import { useProducts } from "./use-products";
import { useInfiniteProductScroll } from "./use-infinite-product-scroll";

/** Connect URL state, the selected data source, pagination and local UI controls. */
export function useProductPage(options: ProductPageProps) {
  const { importedProducts, discoveryProducts, discoveryPagination } = options;
  const queryState = useProductQuery();
  const catalog = useProducts(
    queryState.query,
    importedProducts === undefined && discoveryProducts === undefined,
  );
  const data = useMemo(
    () =>
      getProductPageData({
        pages: catalog.data?.pages ?? [],
        query: queryState.query,
        importedProducts,
        discoveryProducts,
      }),
    [catalog.data, queryState.query, importedProducts, discoveryProducts],
  );
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [mobileCurrency, setMobileCurrency] =
    useState<ProductMobileCurrency>("source");

  useEffect(() => {
    const viewport = window.matchMedia("(min-width:1024px)");
    const close = () => {
      if (viewport.matches) setFiltersOpen(false);
    };
    viewport.addEventListener("change", close);
    return () => viewport.removeEventListener("change", close);
  }, []);

  const pagination: ProductPagePagination = discoveryPagination ?? {
    hasNextPage: catalog.hasNextPage ?? false,
    isFetchingNextPage: catalog.isFetchingNextPage,
    fetchNextPage: catalog.fetchNextPage,
    isError: catalog.isFetchNextPageError ?? false,
  };
  const { loadMoreRef } = useInfiniteProductScroll({
    ...pagination,
    hasNextPage: pagination.hasNextPage && !pagination.isError,
  });

  return {
    ...data,
    ...queryState,
    isLoading: catalog.isLoading,
    isError: catalog.isError && !catalog.data?.pages.length,
    isMock: catalog.isMock,
    isFetching: catalog.isFetching,
    useMockData: catalog.useMockData,
    useApiData: catalog.useApiData,
    pagination,
    loadMoreRef,
    filtersOpen,
    setFiltersOpen,
    mobileCurrency,
    setMobileCurrency,
    applyFilters: () => {
      queryState.applyQuery();
      setFiltersOpen(false);
    },
  };
}

export type ProductPageModel = ReturnType<typeof useProductPage>;
