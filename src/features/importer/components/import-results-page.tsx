"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getProductDetailsHref } from "@/features/product/utils/product-path";
import { openProductDetailsTab } from "@/features/product/utils/product-navigation";
import { Button } from "@/components/ui/button";
import ProductPage from "@/features/product/components/product-page";
import ProductSearchFailureAnimation from "@/features/product/components/product-search-failure-animation";
import ProductDetailLoadingIndicator from "@/features/product/components/detail/product-detail-loading-indicator";
import ProductDetailsError from "@/features/product/components/detail/product-details-error";
import ProductGridSkeleton from "@/features/product/components/product-grid/product-grid-skeleton";
import type { Product } from "@/features/product/types/domain/product.types";
import { isImportJobReadyForResults } from "../utils/import-job-state";
import { imageSearchProductPath } from "../utils/image-search-navigation";
import { useImportResults } from "../hooks/use-import-results";
import { importCandidateRequestSchema } from "../schemas/importer.schema";
import type { DiscoverProductPayload } from "../types/importer.type";

export default function ImportResultsPage({
  jobId,
  searchQuery,
  sourceUrl,
  imageSearch = false,
  discoverySearch = false,
}: {
  jobId: string;
  searchQuery?: string;
  sourceUrl?: string;
  imageSearch?: boolean;
  discoverySearch?: boolean;
}) {
  const router = useRouter();
  const discoverPayload = useMemo<DiscoverProductPayload | null>(
    () => searchQuery ? { input: searchQuery } : sourceUrl ? { input: sourceUrl } : null,
    [searchQuery, sourceUrl],
  );
  const { query, grouped, detailsPath, hasNextPage, fetchNextPage, isFetchingNextPage, isNextPageError, isWaitingForResults } = useImportResults(jobId, discoverPayload, { imageSearch, discoverySearch });
  useEffect(() => {
    if (detailsPath && !query.isError) router.replace(detailsPath);
  }, [detailsPath, query.isError, router]);
  const job = query.data;
  const candidateCount = grouped.requested.length + grouped.suggested.length;
  const [detailsError, setDetailsError] = useState("");
  const getProductDetailsLink = (product: Product): string | undefined => {
    if (imageSearch || discoverySearch || job?.import_type === "image") return imageSearchProductPath(product.source.url);
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
  const isImageSearch = imageSearch || job?.import_type === "image";
  const isListingSearch = isImageSearch || discoverySearch;
  const emptyImageResults = isListingSearch && isImportJobReadyForResults(job) && candidateCount === 0;
  if (isListingSearch && (query.isError || job?.status === "failed" || emptyImageResults)) {
    return (
      <ProductDetailsError
        label={isImageSearch ? "جست‌وجو با عکس" : "جست‌وجوی محصولات"}
        title={emptyImageResults ? "محصولی پیدا نشد" : isImageSearch ? "جست‌وجوی تصویری موفق نبود" : "جست‌وجوی محصولات موفق نبود"}
        message={job?.error_message || (emptyImageResults ? (isImageSearch ? "لطفاً با عکس واضح‌تری دوباره جست‌وجو کنید." : "لطفاً نام دقیق‌تر کالا یا لینک دیگری را جست‌وجو کنید.") : "دریافت نتایج جست‌وجو ممکن نشد. لطفاً دوباره تلاش کنید.")}
        onRetry={() => void query.refetch()}
        isRetrying={query.isFetching}
        onBack={() => router.push("/products")}
      />
    );
  }
  if (isListingSearch && (query.isPending || !job || !isImportJobReadyForResults(job))) {
    return (
      <main dir="rtl" role="status" aria-busy="true" className="flex min-h-[60vh] items-center justify-center bg-neutral-50 px-4 py-8">
        <ProductDetailLoadingIndicator
          title="در حال جست‌وجوی محصولات"
          description={isImageSearch ? "محصولات مشابه عکس شما در حال دریافت و آماده‌سازی هستند؛ لطفاً کمی صبر کنید." : "محصولات مرتبط با جست‌وجوی شما در حال دریافت و آماده‌سازی هستند؛ لطفاً کمی صبر کنید."}
        />
      </main>
    );
  }
  if (query.isPending || (detailsPath && !query.isError)) return <ProductGridSkeleton />;
  if ((job?.status === "done" || (isListingSearch && isImportJobReadyForResults(job))) && !query.isError && candidateCount > 0) {
    return (
      <ProductPage
        {...(isListingSearch
          ? { importedProducts: [...grouped.requested, ...grouped.suggested] }
          : { discoveryProducts: { requested: grouped.requested, suggested: grouped.suggested } })}
        onProductDetailsClick={openProductDetails}
        getProductDetailsLink={getProductDetailsLink}
        discoveryError={detailsError}
        discoveryPagination={{ hasNextPage, fetchNextPage, isFetchingNextPage, isError: isNextPageError, isWaitingForResults }}
      />
    );
  }

  if (!query.isError && job?.import_type === "image" && !isImportJobReadyForResults(job) && job.status !== "failed") return <ProductGridSkeleton />;

  return (
    <main dir="rtl" className="mx-auto min-h-[60vh] max-w-[1440px] space-y-6 bg-neutral-50 px-5 py-8">
      <h1 className="text-xl font-medium">محصولات دریافت‌شده</h1>
      {query.isPending && <p role="status">در حال دریافت وضعیت پردازش…</p>}
      {query.isError && (
        <div role="alert">
          <ProductSearchFailureAnimation />
          <p>دریافت وضعیت ناموفق بود. دوباره بررسی کنید.</p>
          <Button onClick={() => void query.refetch()} disabled={query.isFetching}>
            تلاش مجدد
          </Button>
        </div>
      )}
      {job?.status === "failed" && (
        <div role="alert"><ProductSearchFailureAnimation /><p>{job.error_message || "دریافت محصولات ناموفق بود."}</p></div>
      )}
      {job && !job.ready_for_frontend && job.status !== "failed" && job.status !== "done" && (
        <p role="status" className="text-mobile-body-s lg:text-desktop-body-s text-secondary-600">{job.status_label || "در حال دریافت و آماده‌سازی محصولات…"}</p>
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
