import { importUrlSchema } from "../schemas/importer.schema";

export function singleProductImportPath(url?: string, jobId?: number) {
  const params = new URLSearchParams();
  if (url) params.set("url", importUrlSchema.parse(url));
  if (jobId) params.set("job_id", String(jobId));
  return `/imports/single?${params.toString()}`;
}
