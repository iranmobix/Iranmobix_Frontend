import type { Product, ProductDataIssue } from "@/features/product/types/domain/product.types";

const isText = (value: unknown) => typeof value === "string" && value.trim().length > 0;
const isAmount = (value: unknown) =>
  (typeof value === "number" || isText(value)) && Number.isFinite(Number(value)) && Number(value) >= 0;
const isEmpty = (value: unknown): boolean =>
  value == null || (typeof value === "string" && !value.trim()) ||
  (Array.isArray(value) && value.length === 0) ||
  (typeof value === "object" && !Array.isArray(value) && Object.keys(value ?? {}).length === 0);

function readPath(raw: Record<string, unknown>, path: string) {
  let value: unknown = raw;
  const visited: string[] = [];
  for (const segment of path.split(".")) {
    if (value == null || (Array.isArray(value) && !value.length))
      return { exists: true, value, path: visited.join(".") };
    if (typeof value !== "object" || !Object.prototype.hasOwnProperty.call(value, segment))
      return { exists: false, value: undefined, path };
    visited.push(segment);
    value = (value as Record<string, unknown>)[segment];
  }
  return { exists: true, value, path };
}

export function getImportCardDataIssues(raw: Record<string, unknown>, product: Product): ProductDataIssue[] {
  const fields: { label: string; paths: string[]; valid: (value: unknown) => boolean; available?: boolean }[] = [
    { label: "عنوان", paths: ["short_title", "title", "catalog_card.short_title", "catalog_card.title"], valid: isText },
    { label: "تصویر", paths: ["images", "image_url", "main_image", "catalog_card.images"], valid: (value) => isText(value) || (Array.isArray(value) && value.some((image) => isText(image) || (image && typeof image === "object" && isText(image.image_url)))) },
    { label: "قیمت مبدا", paths: ["min_price", "price_cny", "best_offer.price_cny", "catalog_card.min_price"], valid: isAmount },
    { label: "واحد پول", paths: ["currency", "price_snapshot.currency", "catalog_card.currency"], valid: isText },
    { label: "قیمت تومان", paths: ["price_toman"], valid: isAmount, available: product.price.amountIrr !== null },
    { label: "فروشنده", paths: ["seller_name", "best_offer.supplier_name", "suppliers.0.supplier_name", "catalog_card.best_offer.supplier_name"], valid: isText },
    { label: "تأیید فروشنده", paths: ["best_offer.verified", "suppliers.0.verified", "catalog_card.best_offer.verified"], valid: (value) => typeof value === "boolean" },
    { label: "رنگ‌ها", paths: ["colors", "catalog_card.colors"], valid: (value) => Array.isArray(value) && value.some((color) => color && typeof color === "object" && typeof color.id === "number" && isText(color.color_name) && isText(color.color)) },
    { label: "منبع", paths: ["source", "catalog_card.source"], valid: isText },
    { label: "لینک منبع", paths: ["source_url", "import_payload.url", "catalog_card.source_url"], valid: isText },
    { label: "شناسهٔ محصول", paths: ["id", "catalog_card.id"], valid: (value) => typeof value === "number" && Number.isFinite(value) },
    { label: "مسیر جزئیات", paths: ["slug", "catalog_card.slug"], valid: isText },
  ];
  return fields.flatMap(({ label, paths, valid, available }) => {
    if (available) return [];
    const values = paths.map((path) => readPath(raw, path));
    if (values.some(({ exists, value }) => exists && valid(value))) return [];
    const present = values.filter(({ exists }) => exists);
    return [{
      label,
      keys: [...new Set(present.length ? present.map(({ path }) => path) : paths)],
      status: !present.length ? "missing" : present.every(({ value }) => isEmpty(value)) ? "empty" : "invalid",
    } satisfies ProductDataIssue];
  });
}
