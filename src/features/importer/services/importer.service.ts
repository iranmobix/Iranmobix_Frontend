import { isCompleteImageResult, MAX_IMAGE_SEARCH_RETRIES } from "../utils/image-result-validation";
import { readImageSearchRequest, saveImageSearchRequest } from "./image-search-request.storage";
import { z } from "zod";
import { importerApi } from "../api/importer.api";
import {
  discoverAcceptedSchema,
  importJobSchema,
  importUrlSchema,
  importCandidateRequestSchema,
  candidateImportStatusSchema,
} from "../schemas/importer.schema";
import type {
  ImportImagePayload,
  DiscoverProductPayload,
  ImportCandidatePayload,
  CandidateImportStatus,
} from "../types/importer.type";
import { getCandidateImportState } from "./candidate-import-state";
import { isImportJobReadyForResults } from "../utils/import-job-state";

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

export function createDiscoverPayload(input: string): { input: string } {
  const value = input.trim();
  if (isDiscoverUrlInput(value)) {
    const withProtocol = /^[a-z][a-z\d+.-]*:\/\//i.test(value) ? value : `https://${value}`;
    return { input: importUrlSchema.parse(withProtocol) };
  }
  return { input: z.string().trim().min(1).max(300).parse(value) };
}

/** Only Alibaba's canonical product-detail path starts a direct product import. */
export function isDirectProductUrl(input: string): boolean {
  try {
    const url = new URL(input);
    const host = url.hostname.toLowerCase();
    return ["http:", "https:"].includes(url.protocol) &&
      (host === "alibaba.com" || host.endsWith(".alibaba.com")) &&
      /^\/product-detail\/[^/]+\.html\/?$/i.test(url.pathname);
  } catch {
    return false;
  }
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
    const value = "input" in payload ? payload.input : "query" in payload ? payload.query : "source_url" in payload ? payload.source_url : null;
    const cursor = payload.cursor ? z.string().min(1).max(2000).parse(payload.cursor) : undefined;
    const request = value !== null
      ? { ...createDiscoverPayload(value), ...(cursor ? { cursor } : {}) }
      : { cursor: z.string().min(1).max(2000).parse(cursor) };
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
        accepted.import_type === "image" ? "image" : "search",
      );
      if (job.status === "failed")
        throw new Error(
          job.error_message || "دریافت صفحهٔ بعدی جستجو ناموفق بود.",
        );
      if (isImportJobReadyForResults(job)) return job;
      await waitForNextPoll(job.next_poll_after_seconds, signal);
    }
    throw new Error("درخواست لغو شد.");
  },
  async importImage(payload: ImportImagePayload, signal?: AbortSignal) {
    const request = "image" in payload
      ? (validateImportImage(payload.image), payload)
      : { image_url: importUrlSchema.parse(payload.image_url) };
    const accepted = discoverAcceptedSchema.parse(await importerApi.importImage(request, signal));
    await saveImageSearchRequest(String(accepted.job_id), {
      payload: request, activeJobId: String(accepted.job_id), retries: 0,
    }).catch(() => undefined);
    return accepted;
  },
  async getJobStatus(id: string, signal?: AbortSignal, expectedType?: "image" | "search") {
    if (!/^[1-9]\d*$/.test(id)) throw new Error("شناسه درخواست معتبر نیست.");
    const savedRequest = await readImageSearchRequest(id).catch(() => null);
    const requestId = savedRequest?.activeJobId ?? id;
    const raw = z.record(z.string(), z.unknown()).parse(
      await importerApi.getJobStatus(requestId, signal),
    );
    const hasImageCards = Array.isArray(raw.results) && raw.results.some(
      (card) => card && typeof card === "object" && "price_in_china_cny" in card,
    );
    const result = importJobSchema.parse({
      id: Number(requestId),
      import_type: expectedType ?? (savedRequest || raw.source === "image-search" || hasImageCards ? "image" : "search"),
      result_mode: "list",
      ...raw,
      ...(expectedType === "search" ? { listing_search: true } : {}),
    });
    if (String(result.id) !== requestId)
      throw new Error("شناسه پاسخ با درخواست یکسان نیست.");
    const incompleteImageResults = result.import_type === "image" &&
      isImportJobReadyForResults(result) && result.results.some((card) => !isCompleteImageResult(card));
    if (incompleteImageResults && savedRequest && savedRequest.retries < MAX_IMAGE_SEARCH_RETRIES) {
      signal?.throwIfAborted();
      const accepted = discoverAcceptedSchema.parse(await importerApi.importImage(savedRequest.payload, signal));
      await saveImageSearchRequest(id, {
        payload: savedRequest.payload,
        activeJobId: String(accepted.job_id),
        retries: savedRequest.retries + 1,
      });
      return {
        ...result, status: "processing" as const, ready_for_frontend: false,
        next_poll_after_seconds: Math.max(1, accepted.next_poll_after_seconds),
      };
    }
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
