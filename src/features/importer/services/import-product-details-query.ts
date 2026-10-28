import { queryOptions, type QueryClient } from "@tanstack/react-query";
import { importerService, ProductImportError } from "./importer.service";
import type { ImportCandidatePayload } from "../types/importer.type";
import { invalidateProductCache } from "../../product/services/product-query-options";
import { normalizeProductSlug } from "../../product/utils/product-path";

export function importProductDetailsQueryOptions(client: QueryClient, searchJobId: string, selection: ImportCandidatePayload) {
  const identity = [searchJobId, selection.candidate_id ?? null, selection.source_url ?? null, selection.force_refresh ?? true];
  const startKey = ["selected-candidate-start", ...identity];
  return queryOptions({
    queryKey: ["selected-candidate-details", ...identity],
    queryFn: async ({ signal }) => {
      // Cache the accepted job independently so a route transition only resumes polling.
      const accepted = await client.fetchQuery({
        queryKey: startKey,
        queryFn: () => importerService.importCandidate(searchJobId, selection),
        staleTime: Infinity,
        gcTime: 30 * 60 * 1000,
        retry: false,
      });
      try {
        const path = await importerService.waitForCandidateDetails(accepted, selection, signal);
        const slug = normalizeProductSlug(path.replace(/\/$/, "").slice("/products/".length));
        await invalidateProductCache(client, slug);
        return path;
      } catch (error) {
        if (error instanceof ProductImportError) client.removeQueries({ queryKey: startKey, exact: true });
        throw error;
      }
    },
    staleTime: Infinity,
    gcTime: 30 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
  });
}
