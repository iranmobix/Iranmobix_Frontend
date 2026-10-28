import { z } from "zod";
import { importerApi } from "../api/importer.api";
import {
  discoverAcceptedSchema,
  importAcceptedSchema,
  importJobSchema,
  importUrlSchema,
  importCandidateRequestSchema,
  candidateImportStatusSchema,
} from "../schemas/importer.schema";
import type {
  ImportProductPayload,
  ImportSellerPayload,
  ImportImagePayload,
  DiscoverProductPayload,
  DiscoverSearchPayload,
  ImportCandidatePayload,
  CandidateImportStatus,
} from "../types/importer.type";
import { getCandidateImportState } from "./candidate-import-state";
import { isImportJobEnriching } from "../utils/import-job-state";

export const isDiscoverUrlInput = (input: string) =>
  /^(?:[a-z][a-z\d+.-]*:\/\/|www\.)/i.test(input) ||
  /^(?:(?:[a-z\d](?:[a-z\d-]*[a-z\d])?\.)+[a-z]{2,}|localhost|\d{1,3}(?:\.\d{1,3}){3})(?::\d+)?(?:[/?#][^\s]*)?$/i.test(
    input,
  );

export class ProductImportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProductImportError";
  }
}

export const MAX_IMPORT_IMAGE_SIZE = 5 * 1024 * 1024;

export function validateImportImage(image: File) {
  if (!image.type.startsWith("image/"))
    throw new ProductImportError("لطفاً یک فایل عکس انتخاب کنید.");
  if (!image.size)
    throw new ProductImportError("فایل عکس خالی است؛ عکس دیگری انتخاب کنید.");
  if (image.size > MAX_IMPORT_IMAGE_SIZE)
    throw new ProductImportError("حجم عکس باید حداکثر ۵ مگابایت باشد.");
}

export function createDiscoverPayload(input: string): DiscoverSearchPayload {
  const value = input.trim();
  if (!value) throw new Error("عبارت جستجو را وارد کنید.");

  if (isDiscoverUrlInput(value)) {
    const withProtocol =
      /^www\./i.test(value) || !/^[a-z][a-z\d+.-]*:\/\//i.test(value)
        ? `https://${value}`
        : value;
    return { source_url: importUrlSchema.parse(withProtocol) };
  }

  return { query: z.string().trim().min(1).max(300).parse(value) };
}

const waitForNextPoll = (seconds: number, signal: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    if (signal.aborted) {
      reject(new Error("درخواست لغو شد."));
      return;
    }
    const onAbort = () => {
      clearTimeout(timer);
      reject(new Error("درخواست لغو شد."));
    };
    const timer = setTimeout(
      () => {
        signal.removeEventListener("abort", onAbort);
        resolve();
      },
      Math.max(1, seconds) * 1000,
    );
    signal.addEventListener("abort", onAbort, { once: true });
  });

export const importerService = {
  async discover(payload: DiscoverProductPayload, signal?: AbortSignal) {
    const request =
      "query" in payload
        ? {
            query: z.string().trim().min(1).max(300).parse(payload.query),
            ...(payload.cursor ? { cursor: payload.cursor } : {}),
          }
        : "source_url" in payload
          ? {
              source_url: importUrlSchema.parse(payload.source_url),
              ...(payload.cursor ? { cursor: payload.cursor } : {}),
            }
          : { cursor: z.string().min(1).max(2000).parse(payload.cursor) };
    return discoverAcceptedSchema.parse(
      await importerApi.discover(request, signal),
    );
  },
  async getNextDiscoveryPage(
    payload: DiscoverProductPayload | null,
    cursor: string,
    signal: AbortSignal,
  ) {
    const accepted = await importerService.discover(
      payload ? { ...payload, cursor } : { cursor },
      signal,
    );
    while (!signal.aborted) {
      const job = await importerService.getJobStatus(
        String(accepted.job_id),
        signal,
      );
      if (job.status === "failed")
        throw new Error(
          job.error_message || "دریافت صفحهٔ بعدی جستجو ناموفق بود.",
        );
      if (job.status === "done" && !isImportJobEnriching(job)) return job;
      await waitForNextPoll(job.next_poll_after_seconds, signal);
    }
    throw new Error("درخواست لغو شد.");
  },
  async importProduct(payload: ImportProductPayload) {
    return importAcceptedSchema.parse(
      await importerApi.importProduct({
        url: importUrlSchema.parse(payload.url),
      }),
    );
  },
  async importSeller(payload: ImportSellerPayload) {
    return importerService.importProduct({ url: payload.seller_url });
  },
  async importImage(payload: ImportImagePayload, signal?: AbortSignal) {
    validateImportImage(payload.image);
    return discoverAcceptedSchema.parse(
      await importerApi.importImage(payload, signal),
    );
  },
  async getJobStatus(id: string, signal?: AbortSignal) {
    if (!/^[1-9]\d*$/.test(id)) throw new Error("شناسه درخواست معتبر نیست.");
    const result = importJobSchema.parse(
      await importerApi.getJobStatus(id, signal),
    );
    if (String(result.id) !== id)
      throw new Error("شناسه پاسخ با درخواست یکسان نیست.");
    return result;
  },
  async importCandidate(jobId: string, payload: ImportCandidatePayload) {
    if (!/^[1-9]\d*$/.test(jobId)) throw new Error("شناسه درخواست معتبر نیست.");
    return candidateImportStatusSchema.parse(
      await importerApi.importCandidate(
        jobId,
        importCandidateRequestSchema.parse(payload),
      ),
    );
  },
  async getCandidateImportStatus(jobId: string, signal?: AbortSignal) {
    if (!/^[1-9]\d*$/.test(jobId)) throw new Error("شناسه درخواست معتبر نیست.");
    const response = candidateImportStatusSchema.parse(
      await importerApi.getCandidateImportStatus(jobId, signal),
    );
    if (String(response.job_id) !== jobId)
      throw new Error("شناسه پاسخ با درخواست یکسان نیست.");
    return response;
  },
  async waitForCandidateDetails(
    initial: CandidateImportStatus,
    selection: ImportCandidatePayload,
    signal: AbortSignal,
  ) {
    console.log("[IMPORT_DEBUG] waitForCandidateDetails called", {
      jobId: initial.job_id,
      selection,
      initialResponse: initial,
    });

    let response = initial;
    const deadline = Date.now() + 5 * 60 * 1000;
    while (!signal.aborted) {
      const state = getCandidateImportState(response, selection);
      if (state.error) throw new ProductImportError(state.error);
      if (state.path) return state.path;
      if (Date.now() >= deadline)
        throw new Error(
          "دریافت جزئیات طول کشیده است. برای ادامه دوباره تلاش کنید.",
        );
      await waitForNextPoll(response.next_poll_after_seconds, signal);
      response = await importerService.getCandidateImportStatus(
        String(initial.job_id),
        signal,
      );
    }
    throw new Error("درخواست لغو شد.");
  },
};
