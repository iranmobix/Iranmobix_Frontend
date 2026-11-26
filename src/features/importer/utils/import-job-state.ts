import type { ImportJobResponse } from "../types/importer.type";

/** Discovery may be done while its asynchronous enrichment is still running. */
export function isImportJobEnriching(job: ImportJobResponse | undefined): boolean {
  return job?.status !== "failed" && job?.discovery?.enrichment_pending === true;
}

export function isImportJobReadyForResults(job: ImportJobResponse | undefined): boolean {
  return Boolean(job && job.status !== "failed" && (
    ((job.import_type === "image" || job.listing_search === true) && (job.ready_for_frontend || job.status === "done")) ||
    (job.status === "done" && !isImportJobEnriching(job))
  ));
}
