import { notFound } from "next/navigation";
import ImportProductDetailsPage from "@/features/importer/components/import-product-details-page";
import { importCandidateRequestSchema } from "@/features/importer/schemas/importer.schema";

export default async function Page({ params, searchParams }: {
  params: Promise<{ jobId: string }>;
  searchParams: Promise<{ source_url?: string | string[]; candidate_id?: string | string[] }>;
}) {
  const [{ jobId }, search] = await Promise.all([params, searchParams]);
  const source = Array.isArray(search.source_url) ? search.source_url[0] : search.source_url;
  const candidateId = Array.isArray(search.candidate_id) ? search.candidate_id[0] : search.candidate_id;
  const parsed = importCandidateRequestSchema.safeParse({
    ...(source ? { source_url: source } : {}),
    ...(candidateId ? { candidate_id: Number(candidateId) } : {}),
  });
  if (!/^[1-9]\d*$/.test(jobId) || !parsed.success) notFound();
  return <ImportProductDetailsPage jobId={jobId} selection={parsed.data} />;
}
