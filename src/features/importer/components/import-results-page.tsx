"use client";

import { useMemo, useState } from "react";
import { getProductDetailsHref } from "@/features/product/utils/product-path";
import { openProductDetailsTab } from "@/features/product/utils/product-navigation";
import { Button } from "@/components/ui/button";
import ProductPage from "@/features/product/components/product-page";
import ProductGridSkeleton from "@/features/product/components/product-grid/product-grid-skeleton";
import type { Product } from "@/features/product/types/domain/product.types";
import { useImportResults } from "../hooks/use-import-results";
import { importCandidateRequestSchema } from "../schemas/importer.schema";
import type { DiscoverProductPayload } from "../types/importer.type";

export default function ImportResultsPage({
  jobId,
  searchQuery,
  sourceUrl,
}: {
  jobId: string;
  searchQuery?: string;
  sourceUrl?: string;
}) {
  const discoverPayload = useMemo<DiscoverProductPayload | null>(
    () => searchQuery ? { query: searchQuery } : sourceUrl ? { source_url: sourceUrl } : null,
    [searchQuery, sourceUrl],
  );
  const { query, grouped, hasNextPage, fetchNextPage, isFetchingNextPage, isNextPageError, isWaitingForResults } = useImportResults(jobId, discoverPayload);
  const job = query.data;
  const candidateCount = grouped.requested.length + grouped.suggested.length;
  const [detailsError, setDetailsError] = useState("");
  const getProductDetailsLink = (product: Product): string | undefined => {
    const candidate = grouped.candidatesByProductId.get(product.id);
    if (!candidate) return getProductDetailsHref(product.slug);
    const url = candidate.source_url || product.source.url || candidate.import_payload?.url;
    const selection = importCandidateRequestSchema.safeParse({
      ...(candidate.candidate_id ? { candidate_id: candidate.candidate_id } : {}),
      ...(url ? { source_url: url } : {}),
    });
    if (!selection.success) return undefined;
    const params = new URLSearchParams();
    if (selection.data.candidate_id) params.set("candidate_id", String(selection.data.candidate_id));
    if (selection.data.source_url) params.set("source_url", selection.data.source_url);
    const ownerJobId = grouped.candidateJobIdsByProductId.get(product.id) ?? jobId;
    return `/imports/${ownerJobId}/product?${params.toString()}`;
  };
  const openProductDetails = (product: Product) => {
    const href = getProductDetailsLink(product);
    if (!href) {
      setDetailsError("اطلاعات لازم برای بازکردن این محصول دریافت نشده است.");
      return;
    }
    setDetailsError("");
    openProductDetailsTab(href);
  };
  if (job?.status === "done" && !query.isError && candidateCount > 0) {
    return (
      <ProductPage
        discoveryProducts={{ requested: grouped.requested, suggested: grouped.suggested }}
        onProductDetailsClick={openProductDetails}
        getProductDetailsLink={getProductDetailsLink}
        discoveryError={detailsError}
        discoveryPagination={{ hasNextPage, fetchNextPage, isFetchingNextPage, isError: isNextPageError, isWaitingForResults }}
      />
    );
  }

  return (
    <main dir="rtl" className="mx-auto min-h-[60vh] max-w-[1440px] space-y-6 bg-neutral-50 px-5 py-8">
      <h1 className="text-xl font-medium">محصولات دریافت‌شده</h1>
      {query.isPending && <p role="status">در حال دریافت وضعیت پردازش…</p>}
      {query.isError && (
        <div role="alert">
          <p>دریافت وضعیت ناموفق بود. دوباره بررسی کنید.</p>
          <Button onClick={() => void query.refetch()} disabled={query.isFetching}>
            تلاش مجدد
          </Button>
        </div>
      )}
      {job?.status === "failed" && (
        <p role="alert">{job.error_message || "دریافت محصولات ناموفق بود."}</p>
      )}
      {job && !job.ready_for_frontend && job.status !== "failed" && job.status !== "done" && (
        <p role="status">{job.status_label || "در حال دریافت و آماده‌سازی محصولات…"}</p>
      )}
      {job?.status === "done" && candidateCount === 0 && !isFetchingNextPage && !isWaitingForResults && (
        <div role="alert" className="space-y-3">
          <p>{isNextPageError ? "صفحهٔ بعدی محصولات دریافت نشد." : "محصولی از سمت بک‌اند دریافت نشد."}</p>
          {isNextPageError && (
            <Button onClick={() => void fetchNextPage()}>
              تلاش دوباره
            </Button>
          )}
        </div>
      )}
      {isFetchingNextPage && <p role="status">در حال دریافت صفحهٔ بعدی محصولات…</p>}
      {!query.isError && job?.status !== "failed" && (job?.status !== "done" || isFetchingNextPage || isWaitingForResults) && <ProductGridSkeleton />}
    </main>
  );
}
