import ImportResultsPage from "@/features/importer/components/import-results-page";
import { notFound } from "next/navigation";
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ jobId: string }>;
  searchParams: Promise<{ query?: string | string[]; source_url?: string | string[] }>;
}) {
  const [{ jobId }, search] = await Promise.all([params, searchParams]);
  if (!/^[1-9]\d*$/.test(jobId)) notFound();
  const query = Array.isArray(search.query) ? search.query[0] : search.query;
  const sourceUrl = Array.isArray(search.source_url) ? search.source_url[0] : search.source_url;
  return <ImportResultsPage jobId={jobId} searchQuery={query} sourceUrl={sourceUrl} />;
}
