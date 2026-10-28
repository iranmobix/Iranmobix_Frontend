export type ImportJobStatus = "pending" | "processing" | "done" | "failed";
/** Legacy mock adapter only. Real transport uses schema-derived response types. */
export interface ImportJob {
  job_id: string;
  status: ImportJobStatus;
}
export interface ImportProductPayload {
  url: string;
}
export type ImportCandidatePayload = import("zod").z.infer<
  typeof import("../schemas/importer.schema").importCandidateRequestSchema
>;
export type CandidateImportStatus = import("zod").z.infer<
  typeof import("../schemas/importer.schema").candidateImportStatusSchema
>;
export type DiscoverSearchPayload =
  | { query: string; cursor?: string }
  | { source_url: string; cursor?: string };
export type DiscoverProductPayload = DiscoverSearchPayload | { cursor: string };
export interface ImportSellerPayload {
  seller_url: string;
}
export interface ImportImagePayload {
  image: File;
}
export type ImportAccepted = import("zod").z.infer<
  typeof import("../schemas/importer.schema").importAcceptedSchema
>;
export type DiscoverAccepted = import("zod").z.infer<
  typeof import("../schemas/importer.schema").discoverAcceptedSchema
>;
export type ImportJobResponse = import("zod").z.infer<
  typeof import("../schemas/importer.schema").importJobSchema
>;
