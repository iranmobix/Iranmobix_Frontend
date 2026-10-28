"use client";
import { useQuery } from "@tanstack/react-query";
import { importerService } from "../services/importer.service";
import { isImportJobEnriching } from "../utils/import-job-state";
export function useImportJob(jobId?: string) {
  return useQuery({
    queryKey: ["import-job", jobId],
    queryFn: ({ signal }) => importerService.getJobStatus(jobId!, signal),
    enabled: Boolean(jobId),
    retry: false,
    refetchInterval: (query) => {
      if (query.state.status !== "success") return false;
      const job = query.state.data;
      if (!job || job.status === "failed" || (job.status === "done" && !isImportJobEnriching(job)))
        return false;
      return Math.max(1, job.next_poll_after_seconds) * 1000;
    },
    refetchIntervalInBackground: false,
    // Cache only a settled snapshot; done + enrichment_pending still needs status requests.
    staleTime: (query) => query.state.data?.status === "done" && !isImportJobEnriching(query.state.data) ? Infinity : 0,
    refetchOnWindowFocus: false,
  });
}
