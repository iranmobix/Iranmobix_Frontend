import type { Product, ProductDataIssue } from "@/features/product/types/domain/product.types";
import { importProductSchema, type DiscoveredCandidate, type ImportedProduct } from "../schemas/importer.schema";
import type { ImportJobResponse } from "../types/importer.type";
import { mapImportedProduct } from "./import-product.mapper";
import { getImportCardDataIssues } from "./import-card-data-issues";

type JobItem = ImportedProduct | DiscoveredCandidate;

const isImportedProduct = (item: unknown): item is ImportedProduct =>
  importProductSchema.safeParse(item).success;

const sourceUrl = (item: JobItem) => {
  const catalog = item.catalog_card && typeof item.catalog_card === "object"
    ? item.catalog_card as Record<string, unknown>
    : {};
  return item.source_url || (item as DiscoveredCandidate).import_payload?.url ||
    (typeof catalog.source_url === "string" ? catalog.source_url : "");
};

const sourceName = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
};

export function mapImportJobResults(job: ImportJobResponse): {
  requested: Product[];
  suggested: Product[];
  candidatesByProductId: Map<number, DiscoveredCandidate>;
  dataIssuesByProductId: Map<number, ProductDataIssue[]>;
} {
  const actual = [job.product, ...job.results].filter(isImportedProduct);
  const actualByUrl = new Map(actual.filter((item) => sourceUrl(item)).map((item) => [sourceUrl(item), item]));
  const primary = job.product ?? job.main_product ?? job.results[0] ?? job.other_products?.[0] ?? job.discovery?.candidates?.[0];
  const ordered = [primary, ...job.results, ...actual, ...(job.other_products ?? []), ...(job.discovery?.candidates ?? [])].filter(
    (item): item is JobItem => item != null,
  );
  const requested: Product[] = [];
  const suggested: Product[] = [];
  const candidatesByProductId = new Map<number, DiscoveredCandidate>();
  const dataIssuesByProductId = new Map<number, ProductDataIssue[]>();
  const seen = new Set<string>();
  const anonymousItems = new Set<JobItem>();

  for (const item of ordered) {
    const url = sourceUrl(item);
    const actualMatch = url ? actualByUrl.get(url) : undefined;
    const selected = actualMatch ?? item;
    const parsed = importProductSchema.safeParse(selected);
    const candidate = !actualMatch && !(typeof item.slug === "string" && item.slug.trim())
      ? item as DiscoveredCandidate
      : undefined;
    const candidateId = typeof item.candidate_id === "number" && item.candidate_id > 0 ? item.candidate_id : null;
    if (!url && !parsed.success && candidateId === null) {
      if (anonymousItems.has(item)) continue;
      anonymousItems.add(item);
    }
    const key = url ? `url:${url}` : parsed.success ? `id:${parsed.data.id}` : candidateId !== null ? `candidate:${candidateId}` : `anonymous:${anonymousItems.size}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const fallbackId = -(requested.length + suggested.length + 1);
    const raw = selected as Record<string, unknown>;
    const catalogCard = raw.catalog_card && typeof raw.catalog_card === "object"
      ? raw.catalog_card as Record<string, unknown>
      : {};
    const combined = { ...catalogCard, ...raw };
    const safeFields = Object.fromEntries(Object.entries(importProductSchema.shape).map(([key, schema]) => {
      const field = schema.safeParse(combined[key]);
      return [key, field.success ? field.data : undefined];
    }));
    const rawImages = [...(Array.isArray(raw.images) ? raw.images : []), ...(Array.isArray(catalogCard.images) ? catalogCard.images : [])];
    const normalizedImages = rawImages.flatMap((image, index) => {
      if (typeof image === "string" && image.trim()) return [{ image_url: image, is_primary: index === 0 }];
      if (image && typeof image === "object" && typeof (image as Record<string, unknown>).image_url === "string" && ((image as Record<string, unknown>).image_url as string).trim())
        return [{ image_url: (image as Record<string, unknown>).image_url as string, is_primary: (image as Record<string, unknown>).is_primary === true }];
      return [];
    });
    const imageUrl = [raw.image_url, raw.main_image, catalogCard.images && Array.isArray(catalogCard.images) ? (catalogCard.images[0] as Record<string, unknown> | undefined)?.image_url : null]
      .find((value): value is string => typeof value === "string" && value.length > 0);
    if (!normalizedImages.length && imageUrl) normalizedImages.push({ image_url: imageUrl, is_primary: true });
    const supplier = Array.isArray(combined.suppliers) && combined.suppliers[0] && typeof combined.suppliers[0] === "object"
      ? combined.suppliers[0] as Record<string, unknown>
      : {};
    const offer = combined.best_offer && typeof combined.best_offer === "object"
      ? combined.best_offer as Record<string, unknown>
      : supplier;
    const snapshot = raw.price_snapshot && typeof raw.price_snapshot === "object"
      ? raw.price_snapshot as Record<string, unknown>
      : {};
    const minimumPrice = [raw.min_price, raw.price_cny, offer.price_cny, catalogCard.min_price]
      .find((value) => (typeof value === "number" || (typeof value === "string" && value.trim())) && Number.isFinite(Number(value)) && Number(value) >= 0);
    const candidateData = {
      ...combined,
      ...safeFields,
      id: parsed.success ? parsed.data.id : fallbackId,
      slug: [raw.slug, catalogCard.slug].find((value): value is string => typeof value === "string" && Boolean(value.trim())) ?? `discovered-${job.id}-${-fallbackId}`,
      title: typeof combined.title === "string" ? combined.title : "",
      source_url: url,
      source: typeof combined.source === "string" && combined.source ? combined.source : sourceName(url),
      currency: typeof combined.currency === "string" ? combined.currency : typeof snapshot.currency === "string" ? snapshot.currency : "",
      min_price: minimumPrice == null ? null : String(minimumPrice),
      images: normalizedImages,
      best_offer: offer,
      seller_name: typeof combined.seller_name === "string" && combined.seller_name.trim() ? combined.seller_name : supplier.supplier_name,
    };
    const product = mapImportedProduct(importProductSchema.parse(candidateData));

    if (requested.length === 0) requested.push(product);
    else suggested.push(product);
    if (candidate) candidatesByProductId.set(product.id, candidate);
    dataIssuesByProductId.set(product.id, getImportCardDataIssues(raw, product));
  }

  return { requested, suggested, candidatesByProductId, dataIssuesByProductId };
}

export function mapImportJobPages(jobs: ImportJobResponse[]) {
  const entries: { product: Product; candidate?: DiscoveredCandidate; jobId: string }[] = [];
  const indexes = new Map<string, number>();
  const usedIds = new Set<number>();
  let nextId = -1;
  for (const job of jobs) {
    const page = mapImportJobResults(job);
    for (const product of [...page.requested, ...page.suggested]) {
      const candidate = page.candidatesByProductId.get(product.id);
      const key = product.source.url || (!candidate ? `slug:${product.slug}` : `job:${job.id}:card:${product.id}`);
      const index = indexes.get(key);
      let id = index === undefined ? product.id : entries[index].product.id;
      if (index === undefined) {
        if (usedIds.has(id)) {
          while (usedIds.has(nextId)) nextId--;
          id = nextId--;
        }
        usedIds.add(id);
      }
      const entry = { product: { ...product, id }, candidate, jobId: String(job.id) };
      if (index !== undefined) entries[index] = entry;
      else { indexes.set(key, entries.length); entries.push(entry); }
    }
  }
  return {
    requested: entries.slice(0, 1).map((entry) => entry.product),
    suggested: entries.slice(1).map((entry) => entry.product),
    candidatesByProductId: new Map(entries.filter((entry) => entry.candidate).map((entry) => [entry.product.id, entry.candidate!])),
    candidateJobIdsByProductId: new Map(entries.map((entry) => [entry.product.id, entry.jobId])),
  };
}
