"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { ProductListQuery } from "../types/api/product-list-query.types";

import {
  DEFAULT_PRODUCT_SORT,
  parseProductQuery,
} from "../utils/product-query";

const setQueryParam = (
  params: URLSearchParams,
  key: string,
  value: unknown,
) => {
  if (value === undefined || value === null || value === "") {
    params.delete(key);
    return;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      params.delete(key);
      return;
    }

    params.set(key, value.join(","));
    return;
  }

  params.set(key, String(value));
};

export const useProductQuery = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const query = useMemo<ProductListQuery>(
    () => parseProductQuery(searchParams),
    [searchParams],
  );

  const [draftQuery, setDraftQuery] = useState<ProductListQuery>(query);

  /**
   * آخرین URL اعمال‌شده.
   *
   * برای تشخیص تغییر واقعی URL استفاده می‌شود.
   */
  const appliedQueryRef = useRef(query);

  /**
   * Sync Draft with URL
   *
   * فقط زمانی Draft را Sync می‌کنیم که
   * URL واقعاً از بیرون تغییر کرده باشد.
   */
  useEffect(() => {
    if (appliedQueryRef.current === query) {
      return;
    }

    appliedQueryRef.current = query;
    setDraftQuery(query);
  }, [query]);

  /**
   * Update Draft
   *
   * فقط فیلترهای انتخاب‌شده را تغییر می‌دهد.
   * هیچ Requestای ارسال نمی‌شود.
   */
  const updateQuery = useCallback(
    <K extends keyof ProductListQuery>(key: K, value: ProductListQuery[K]) => {
      setDraftQuery((previous) => ({
        ...previous,
        [key]: value,
      }));
    },
    [],
  );

  /**
   * Apply Draft Filters
   */
  const applyQuery = useCallback(() => {
    const params = new URLSearchParams();

    Object.entries(draftQuery).forEach(([key, value]) => {
      setQueryParam(params, key, value);
    });

    const nextUrl = params.toString()
      ? `${pathname}?${params.toString()}`
      : pathname;

    appliedQueryRef.current = draftQuery;

    router.replace(nextUrl, {
      scroll: false,
    });
  }, [draftQuery, pathname, router]);

  /**
   * Sort
   *
   * Sort باید بلافاصله اعمال شود.
   */
  const setSort = useCallback(
    (sort: ProductListQuery["sort"]) => {
      const params = new URLSearchParams(searchParams.toString());

      setQueryParam(params, "sort", sort);

      router.replace(
        params.toString() ? `${pathname}?${params.toString()}` : pathname,
        {
          scroll: false,
        },
      );
    },
    [pathname, router, searchParams],
  );

  /**
   * Reset Draft
   *
   * فقط انتخاب‌های فعلی کاربر را پاک می‌کند.
   */
  const resetDraftQuery = useCallback(() => {
    setDraftQuery({
      sort: query.sort ?? DEFAULT_PRODUCT_SORT,
    });
  }, [query.sort]);

  /**
   * Reset Applied Query
   */
  const resetQuery = useCallback(() => {
    router.replace(pathname, {
      scroll: false,
    });
  }, [pathname, router]);

  return {
    query,
    draftQuery,
    hasExplicitSort: searchParams.has("sort"),

    updateQuery,
    applyQuery,

    setSort,

    resetDraftQuery,
    resetQuery,
  };
};
