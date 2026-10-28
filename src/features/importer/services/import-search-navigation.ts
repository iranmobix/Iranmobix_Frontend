import { ProductImportError } from "./importer.service";
import type { DiscoverSearchPayload } from "../types/importer.type";

type SearchNavigation = {
  request: () => Promise<{ job_id: number }>;
  openTab: () => Window | null;
  navigate: (path: string) => void;
  payload?: DiscoverSearchPayload;
  signal?: AbortSignal;
};

/** Invoke directly from a trusted click/submit, before awaiting the API (not file change/drop). */
export async function runImportSearch({
  request,
  openTab,
  navigate,
  payload,
  signal,
}: SearchNavigation) {
  if (signal?.aborted) return;
  const tab = openTab();
  if (!tab)
    throw new ProductImportError(
      "برای نمایش نتیجه، اجازه بازشدن تب جدید را بدهید.",
    );
  tab.opener = null;
  const closeTab = () => {
    if (!tab.closed) tab.close();
  };
  signal?.addEventListener("abort", closeTab, { once: true });
  try {
    const job = await request();
    if (signal?.aborted) return;
    if (!Number.isSafeInteger(job.job_id) || job.job_id <= 0)
      throw new ProductImportError(
        "شناسهٔ جستجو معتبر نیست؛ دوباره تلاش کنید.",
      );
    const search = payload
      ? new URLSearchParams(
          "query" in payload
            ? { query: payload.query }
            : { source_url: payload.source_url },
        )
      : null;
    const path = `/imports/${job.job_id}${search ? `?${search.toString()}` : ""}`;
    if (tab.closed) navigate(path);
    else tab.location.replace(path);
  } catch (error) {
    closeTab();
    throw error;
  } finally {
    signal?.removeEventListener("abort", closeTab);
  }
}
