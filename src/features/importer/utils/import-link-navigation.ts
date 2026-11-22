import { getProductDetailsHref } from "../../product/utils/product-path";
import type { DiscoverProductPayload, ImportJobResponse } from "../types/importer.type";

/** Only URL submissions bypass the results list; text and image searches keep it. */
export function getImportLinkDetailsPath(
  job: ImportJobResponse | undefined,
  payload: DiscoverProductPayload | null,
): string | null {
  if (!payload || !("source_url" in payload) || !job ||
      job.status !== "done" || !job.ready_for_frontend) return null;

  const product = job.product ?? job.main_product;
  if (!product || product.metadata_pending === true) return null;
  // Do not send a URL submission to an unrelated recommended product.
  if (typeof product.source_url === "string" && product.source_url) {
    try {
      const requested = new URL(payload.source_url);
      const actual = new URL(product.source_url);
      requested.hash = actual.hash = "";
      if (requested.href !== actual.href) return null;
    } catch {
      return null;
    }
  }
  const card = product.catalog_card;
  const slug = typeof product.slug === "string" && product.slug.trim()
    ? product.slug
    : card && typeof card === "object" && "slug" in card && typeof card.slug === "string"
      ? card.slug : null;
  // The ready main product can have a slug even when job.redirect_ready is false.
  return slug?.trim() ? getProductDetailsHref(slug) : null;
}