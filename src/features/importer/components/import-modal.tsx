"use client";

import { useState } from "react";
import { useImportProduct } from "../hooks/use-import-product";
import { useImportJob } from "../hooks/use-import-job";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function ImportModal({ open, onClose }: Props) {
  const [url, setUrl] = useState("");
  const [jobId, setJobId] = useState<string | null>(null);

  // step 1: create import job
  const importProduct = useImportProduct();

  // step 2: track job status
  const jobState = useImportJob(jobId ?? undefined);

  const handleImport = async () => {
    try {
      const job = await importProduct.mutateAsync({ url });

      setJobId(String(job.job_id));
    } catch (err) {
      console.error(err);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-[500px] space-y-4 rounded-xl bg-white p-5">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Import Product</h2>

          <button onClick={onClose}>✕</button>
        </div>

        {/* STEP 1: INPUT */}
        {!jobId && (
          <div className="space-y-3">
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter product URL..."
              className="w-full rounded border p-2"
            />

            <button
              onClick={handleImport}
              disabled={importProduct.isPending || !url}
              className="rounded bg-blue-500 px-4 py-2 text-white"
            >
              {importProduct.isPending ? "Starting..." : "Start Import"}
            </button>
          </div>
        )}

        {/* STEP 2: PROGRESS */}
        {jobId && (
          <div className="space-y-3">
            {/* LOADING */}
            {jobState.isLoading && (
              <p className="text-blue-500">Import in progress...</p>
            )}

            {/* SUCCESS */}
            {jobState.data?.status === "done" && (
              <div className="text-green-600">
                <p>Import completed ✔</p>
              </div>
            )}

            {/* ERROR */}
            {jobState.error && (
              <div className="text-red-500">Failed to import ❌</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
