"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  getSingleProductImportError,
  isSingleProductImportProhibited,
  canRetrySingleProductImport,
  singleProductImportPath,
  singleProductImportStartOptions,
  singleProductImportStatusOptions,
} from "../services/single-product-import";
import { mapImportProductView } from "../mappers/import-product-view";

export function useSingleProductImport(url?: string, jobId?: number) {
  const router = useRouter();
  const start = useQuery({
    ...singleProductImportStartOptions(url),
    enabled: !jobId && Boolean(url),
  });
  const acceptedJobId = jobId ?? start.data?.job_id;
  const status = useQuery({
    ...singleProductImportStatusOptions(acceptedJobId, start.data),
    enabled: Boolean(acceptedJobId) && !getSingleProductImportError(start.data),
  });
  const response = status.data;
  const terminalError = getSingleProductImportError(response);
  const requestFailed = acceptedJobId ? status.isError : start.isError;
  const product = mapImportProductView(response);

  useEffect(() => {
    // This URL remains the destination even after all product sections are ready.
    if (!jobId && acceptedJobId)
      router.replace(singleProductImportPath(url, acceptedJobId));
  }, [jobId, acceptedJobId, router, url]);

  const canRetry = canRetrySingleProductImport(response);
  const retry = () => {
    if (!canRetry) return;
    if (terminalError && url) {
      void start.refetch().then((result) => {
        if (result.data && !result.isError)
          router.replace(singleProductImportPath(url, result.data.job_id));
      });
    } else if (acceptedJobId) void status.refetch();
    else void start.refetch();
  };
  return {
    product,
    canRetry,
    isProhibited: isSingleProductImportProhibited(response),
    response,
    retry,
    isRetrying: start.isFetching || status.isFetching,
    error:
      terminalError ||
      (requestFailed
        ? "ارتباط با سرور ناموفق بود. اطلاعات دریافت‌شده حفظ شده است؛ دوباره تلاش کنید."
        : null),
  };
}
