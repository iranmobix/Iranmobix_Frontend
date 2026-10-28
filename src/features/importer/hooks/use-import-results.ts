"use client";

import { useCallback, useEffect, useMemo } from "react";
import { infiniteQueryOptions, useInfiniteQuery } from "@tanstack/react-query";
import { useImportJob } from "./use-import-job";
import { isImportJobEnriching } from "../utils/import-job-state";
import { importerService } from "../services/importer.service";
import { mapImportJobPages } from "../mappers/map-import-job-results";
import type { DiscoverProductPayload } from "../types/importer.type";

export function discoveryPagesQueryOptions(jobId: string, payload: DiscoverProductPayload | null, initialCursor: string) {
  return infiniteQueryOptions({
    queryKey: ["import-discovery-pages", jobId, payload],
    initialPageParam: initialCursor,
    queryFn: ({ pageParam, signal }) => {
      if (!pageParam) throw new Error("اطلاعات صفحهٔ بعدی جستجو موجود نیست.");
      return importerService.getNextDiscoveryPage(payload, pageParam, signal);
    },
    getNextPageParam: (lastPage, _allPages, _lastParam, allParams) => {
      const pagination = lastPage.discovery?.pagination;
      const cursor = pagination?.next_cursor;
      return pagination?.has_more && cursor && !allParams.includes(cursor) ? cursor : undefined;
    },
    enabled: false,
    staleTime: Infinity,
    gcTime: 30 * 60 * 1000,
    retry: false,
  });
}

export function useImportResults(jobId: string, payload: DiscoverProductPayload | null) {
  const query = useImportJob(jobId);
  const initialCursor = query.data?.discovery?.pagination?.next_cursor ?? "";
  const nextPages = useInfiniteQuery(discoveryPagesQueryOptions(jobId, payload, initialCursor));
  const pages = useMemo(() => query.data ? [query.data, ...(nextPages.data?.pages ?? [])] : [], [query.data, nextPages.data]);
  const grouped = useMemo(() => mapImportJobPages(pages), [pages]);
  const latest = pages[pages.length - 1];
  const pagination = latest?.discovery?.pagination;
  const hasNextPage = Boolean(
    query.data?.status === "done" && !isImportJobEnriching(query.data) && pagination?.has_more && pagination.next_cursor &&
    (!nextPages.data || nextPages.hasNextPage),
  );
  const { fetchNextPage: fetchPage, isFetching, isError } = nextPages;
  const fetchNextPage = useCallback(async () => {
    if (!hasNextPage || isFetching) return;
    return fetchPage();
  }, [hasNextPage, isFetching, fetchPage]);
  const hasNoSuggestions = grouped.suggested.length === 0;
  useEffect(() => {
    // A requested product can arrive before suggestions. Continue without relying on the scroll sentinel.
    if (hasNoSuggestions && hasNextPage && !isFetching && !isError) void fetchNextPage();
  }, [hasNoSuggestions, hasNextPage, isFetching, isError, fetchNextPage]);

  const isWaitingForResults = !query.isError && hasNoSuggestions && isImportJobEnriching(query.data);
  return { query, grouped, hasNextPage, fetchNextPage, isFetchingNextPage: isFetching, isNextPageError: isError, isWaitingForResults };
}
