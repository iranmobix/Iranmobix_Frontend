import type { ImportJobResponse } from "../types/importer.type";

/** Discovery may be done while its asynchronous enrichment is still running. */
export function isImportJobEnriching(job: ImportJobResponse | undefined): boolean {
  return job?.status !== "failed" && job?.discovery?.enrichment_pending === true;
}
