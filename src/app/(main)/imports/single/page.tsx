import { notFound } from "next/navigation";
import SingleProductImportPage from "@/features/importer/components/single-product-import-page";
import { importUrlSchema } from "@/features/importer/schemas/importer.schema";

export const metadata = { robots: { index: false, follow: false } };

export default async function Page({ searchParams }: {
  searchParams: Promise<{ url?: string | string[]; job_id?: string | string[] }>;
}) {
  const search = await searchParams;
  const rawUrl = Array.isArray(search.url) ? search.url[0] : search.url;
  const rawId = Array.isArray(search.job_id) ? search.job_id[0] : search.job_id;
  const parsedUrl = importUrlSchema.safeParse(rawUrl);
  const jobId = rawId && /^[1-9]\d*$/.test(rawId) ? Number(rawId) : undefined;
  if ((rawId && (!jobId || !Number.isSafeInteger(jobId))) || (!parsedUrl.success && !jobId)) notFound();
  return <SingleProductImportPage url={parsedUrl.success ? parsedUrl.data : undefined} jobId={jobId} />;
}