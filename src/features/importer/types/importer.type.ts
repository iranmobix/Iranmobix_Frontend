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
export interface ImportImagePayload {
  image: File;
}
export type DiscoverAccepted = import("zod").z.infer<
  typeof import("../schemas/importer.schema").discoverAcceptedSchema
>;
export type ImportJobResponse = import("zod").z.infer<
  typeof import("../schemas/importer.schema").importJobSchema
>;
