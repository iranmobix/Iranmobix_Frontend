import { httpGet, httpPost } from "@/shared/api";
import type {
  ImportProductPayload,
  ImportImagePayload,
  DiscoverProductPayload,
  ImportCandidatePayload,
} from "../types/importer.type";
export const importerApi = {
  discover: (payload: DiscoverProductPayload, signal?: AbortSignal) =>
    httpPost<unknown>("/api/products/discover/", payload, { signal }),
  importProduct: (payload: ImportProductPayload) =>
    httpPost<unknown>("/api/products/import/", payload),
  importCandidate: (jobId: string, payload: ImportCandidatePayload) =>
    httpPost<unknown>(`/api/products/jobs/${encodeURIComponent(jobId)}/candidates/import/`, payload),
  getCandidateImportStatus: (jobId: string, signal?: AbortSignal) =>
    httpGet<unknown>(`/api/products/jobs/${encodeURIComponent(jobId)}/`, {
      params: { compact: true },
      signal,
    }),
  importImage: (payload: ImportImagePayload, signal?: AbortSignal) => {
    const form = new FormData();
    form.append("image", payload.image);
    return httpPost<unknown>("/api/products/import/image/", form, {
      // Override the client's JSON default; the browser supplies the multipart boundary.
      headers: { "Content-Type": undefined },
      timeout: 60_000,
      signal,
    });
  },
  getJobStatus: (id: string, signal?: AbortSignal) =>
    httpGet<unknown>("/api/products/jobs/" + encodeURIComponent(id) + "/", {
      signal,
    }),
};
