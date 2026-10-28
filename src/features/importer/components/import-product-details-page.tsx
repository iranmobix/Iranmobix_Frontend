"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import ProductDetailsError from "@/features/product/components/detail/product-details-error";
import ProductDetailSkeleton from "@/features/product/components/detail/product-detail-skeleton";
import { importProductDetailsQueryOptions } from "../services/import-product-details-query";
import type { ImportCandidatePayload } from "../types/importer.type";
import { ProductImportError } from "../services/importer.service";

export default function ImportProductDetailsPage({ jobId, selection }: { jobId: string; selection: ImportCandidatePayload }) {
  const router = useRouter();
  const client = useQueryClient();
  const query = useQuery(importProductDetailsQueryOptions(client, jobId, selection));

  useEffect(() => {
    if (query.data) router.replace(query.data);
  }, [query.data, router]);

  if (query.isError) {
    return (
      <ProductDetailsError
        message={query.error instanceof ProductImportError ? query.error.message : "دریافت جزئیات محصول ناموفق بود. لطفاً دوباره تلاش کنید."}
        onRetry={() => void query.refetch()}
        onBack={() => {
          if (window.history.length > 1) router.back();
          else router.replace(`/imports/${jobId}`);
        }}
        isRetrying={query.isFetching}
      />
    );
  }
  return <ProductDetailSkeleton />;
}
