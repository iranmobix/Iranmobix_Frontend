import { z } from "zod";
import { queryOptions } from "@tanstack/react-query";
import { httpGet, httpPost } from "@/shared/api";
import { importUrlSchema } from "../schemas/importer.schema";

const endpoint = "/api/product/import/";
export const singleProductImportSchema = z.object({
  job_id: z.number().int().positive(),
  status: z.string().min(1),
  next_poll_after_seconds: z.number().finite().nonnegative(),
  // A partial product may arrive before it has a slug, price or gallery.
  product: z.record(z.string(), z.unknown()).nullish(),
  error: z
    .union([
      z.string(),
      z.object({
        code: z.string().optional(),
        message: z.string().optional(),
        reason_code: z.string().nullish(),
        retryable: z.boolean().optional(),
      }),
    ])
    .nullish(),
});
export type SingleProductImport = z.infer<typeof singleProductImportSchema>;
export const isSingleProductImportSettled = (response?: SingleProductImport) =>
  Boolean(response && response.next_poll_after_seconds === 0);

export { singleProductImportPath } from "../utils/single-product-import-path";

export function isSingleProductImportProhibited(
  response?: SingleProductImport,
) {
  return Boolean(
    response?.error &&
    typeof response.error === "object" &&
    response.error.code === "prohibited_product",
  );
}

export function canRetrySingleProductImport(response?: SingleProductImport) {
  if (isSingleProductImportProhibited(response)) return false;
  return !(
    response?.error &&
    typeof response.error === "object" &&
    response.error.retryable === false
  );
}

export function getSingleProductImportError(response?: SingleProductImport) {
  if (!response) return null;
  const message =
    typeof response.error === "string"
      ? response.error.trim()
      : response.error?.message?.trim();
  if (isSingleProductImportProhibited(response))
    return `امکان واردکردن و نمایش این محصول در سایت ایران‌موبیکس وجود ندارد.${message ? ` ${message}` : " این محصول در فهرست کالاهای ممنوع قرار دارد."}`;
  if (message) return message;
  if (
    ["failed", "error", "cancelled"].includes(response.status) ||
    (response.error && typeof response.error === "object")
  )
    return "دریافت محصول ناموفق بود.";
  if (isSingleProductImportSettled(response) && !response.product)
    return "پردازش تمام شد، اما اطلاعات محصول از بک دریافت نشد.";
  return null;
}
const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value && typeof value === "object" && !Array.isArray(value));

function mergeSnapshot(
  previous: unknown,
  next: unknown,
  pending: boolean,
): unknown {
  if (
    pending &&
    (next === null ||
      (typeof next === "string" && !next.trim()) ||
      (Array.isArray(next) && next.length === 0))
  )
    return previous ?? next;
  if (!isRecord(previous) || !isRecord(next)) return next;
  const result = { ...previous };
  for (const key of Object.keys(next)) {
    if (["__proto__", "prototype", "constructor"].includes(key)) continue;
    result[key] = mergeSnapshot(previous[key], next[key], pending);
  }
  return result;
}

/** Retain known sections while this job is processing; never mix different jobs. */
export function reconcileSingleProductImport(
  previous: unknown,
  next: SingleProductImport,
): SingleProductImport {
  if (isSingleProductImportProhibited(next)) return { ...next, product: null };
  const parsed = singleProductImportSchema.safeParse(previous);
  if (!parsed.success || parsed.data.job_id !== next.job_id) return next;
  const pending =
    next.next_poll_after_seconds > 0 ||
    Boolean(getSingleProductImportError(next)) ||
    ["failed", "error", "cancelled"].includes(next.status);
  return {
    ...next,
    product:
      next.product === undefined
        ? parsed.data.product
        : (mergeSnapshot(
            parsed.data.product,
            next.product,
            pending,
          ) as SingleProductImport["product"]),
  };
}

export function singleProductImportStartOptions(url?: string) {
  return queryOptions({
    queryKey: ["single-product-import-start", url],
    queryFn: async () =>
      singleProductImportSchema.parse(
        // An accepted POST must not be cancelled/retried by a route remount.
        await httpPost<unknown>(endpoint, { url: importUrlSchema.parse(url) }),
      ),
    staleTime: Infinity,
    gcTime: 30 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

export function singleProductImportStatusOptions(
  jobId?: number,
  initial?: SingleProductImport,
) {
  return queryOptions({
    queryKey: ["single-product-import-status", jobId],
    queryFn: async ({ signal }) => {
      const response = singleProductImportSchema.parse(
        await httpGet<unknown>(endpoint, { params: { job_id: jobId }, signal }),
      );
      if (response.job_id !== jobId)
        throw new Error("شناسه پاسخ با درخواست یکسان نیست.");
      return response;
    },
    initialData: initial?.job_id === jobId ? initial : undefined,
    structuralSharing: (previous, next) =>
      reconcileSingleProductImport(
        previous,
        singleProductImportSchema.parse(next),
      ),
    refetchInterval: (query) => {
      const response = query.state.data;
      if (
        query.state.status !== "success" ||
        !response ||
        getSingleProductImportError(response) ||
        isSingleProductImportSettled(response)
      )
        return false;
      return Math.max(1, response.next_poll_after_seconds) * 1000;
    },
    staleTime: Infinity,
    gcTime: 30 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchIntervalInBackground: false,
  });
}
