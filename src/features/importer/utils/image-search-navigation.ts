import { importUrlSchema } from "../schemas/importer.schema";
import { singleProductImportPath } from "./single-product-import-path";

export const imageSearchResultsPath = (jobId: number) => "/products?image_job=" + jobId;

export function imageSearchProductPath(sourceUrl: string): string | undefined {
  const parsed = importUrlSchema.safeParse(sourceUrl);
  return parsed.success ? singleProductImportPath(parsed.data) : undefined;
}
