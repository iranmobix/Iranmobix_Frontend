export type ImportCandidatePayload = import("zod").z.infer<
  typeof import("../schemas/importer.schema").importCandidateRequestSchema
>;
export type CandidateImportStatus = import("zod").z.infer<
  typeof import("../schemas/importer.schema").candidateImportStatusSchema
>;
export type DiscoverSearchPayload =
  | { input: string; cursor?: string }
  | { query: string; cursor?: string }
  | { source_url: string; cursor?: string };
export type DiscoverProductPayload = DiscoverSearchPayload | { cursor: string };
export type ImportImagePayload = { image: File } | { image_url: string };
export type DiscoverAccepted = import("zod").z.infer<
  typeof import("../schemas/importer.schema").discoverAcceptedSchema
>;
export type ImportJobResponse = import("zod").z.infer<
  typeof import("../schemas/importer.schema").importJobSchema
>;
