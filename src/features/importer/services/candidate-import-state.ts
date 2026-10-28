import { getProductDetailsHref } from "../../product/utils/product-path";
import type {
  CandidateImportStatus,
  ImportCandidatePayload,
} from "../types/importer.type";

const failureStates = new Set([
  "failed",
  "import_failed",
  "timeout",
  "timed_out",
]);
const readyStates = new Set(["imported", "ready", "done", "completed"]);

function productPath(
  slug?: string | null,
  detailUrl?: string | null,
): string | null {
  if (slug?.trim()) return getProductDetailsHref(slug);
  if (!detailUrl) return null;
  try {
    const url = new URL(detailUrl, "https://iranmobix.local");
    if (
      ["http:", "https:"].includes(url.protocol) &&
      /^\/products\/[^/]+\/?$/.test(url.pathname)
    )
      return getProductDetailsHref(url.pathname.replace(/\/$/, "").slice("/products/".length))
        + (url.pathname.endsWith("/") ? "/" : "");
  } catch {
    /* Wait for a valid product redirect instead of following an arbitrary URL. */
  }
  return null;
}

export function getCandidateImportState(
  response: CandidateImportStatus,
  selection: ImportCandidatePayload,
) {
  const candidate = response.candidates.find((item) => {
    if (
      selection.candidate_id !== undefined &&
      item.candidate_id !== selection.candidate_id
    )
      return false;

    if (
      selection.source_url &&
      item.source_url &&
      item.source_url !== selection.source_url
    )
      return false;

    return (
      selection.candidate_id !== undefined ||
      item.source_url === selection.source_url
    );
  });

  const candidateReady = Boolean(
    candidate?.status && readyStates.has(candidate.status),
  );

  const candidatePath = candidate
    ? productPath(candidate.slug, candidate.detail_url)
    : null;

  const responsePath = productPath(
    response.selected_product_slug,
    response.product_detail_url,
  );

  const debug = {
    jobId: response.job_id,
    responseStatus: response.status,
    redirectReady: response.redirect_ready,
    selection: {
      candidateId: selection.candidate_id,
      sourceUrl: selection.source_url,
    },
    matchedCandidate: candidate
      ? {
          candidateId: candidate.candidate_id,
          sourceUrl: candidate.source_url,
          status: candidate.status,
          slug: candidate.slug,
          detailUrl: candidate.detail_url,
          importTimeout: candidate.import_timeout,
        }
      : null,
    candidateCount: response.candidates.length,
    candidateReady,
    candidatePath,
    selectedProductSlug: response.selected_product_slug,
    productDetailUrl: response.product_detail_url,
    responsePath,
  };

  const result = (
    path: string | null,
    error: string | null,
    reason: string,
  ) => {
    console.debug("[IMPORT_PRODUCT_DETAILS]", {
      ...debug,
      decision: reason,
      path,
      error,
    });

    return { path, error };
  };

  if (candidate?.import_timeout) {
    return result(
      null,
      "آماده‌سازی این محصول بیش از حد طول کشید. دوباره تلاش کنید.",
      "candidate_timeout",
    );
  }

  if (
    response.status === "failed" ||
    (candidate?.status && failureStates.has(candidate.status))
  ) {
    return result(
      null,
      "آماده‌سازی جزئیات این محصول ناموفق بود. دوباره تلاش کنید.",
      "import_failed",
    );
  }

  if (!response.redirect_ready) {
    return result(null, null, "redirect_not_ready");
  }

  if (candidatePath && (candidateReady || candidatePath === responsePath)) {
    return result(candidatePath, null, "candidate_path_ready");
  }

  if (response.candidates.length && !candidate) {
    return result(null, null, "candidate_not_matched");
  }

  if (candidate && !candidateReady) {
    return result(null, null, "candidate_not_ready");
  }

  return result(responsePath, null, "response_path_fallback");
}
