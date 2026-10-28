import type { ImportedProduct } from "../schemas/importer.schema";
import type { Product } from "@/features/product/types/domain/product.types";
const number = (value: unknown): number | null => {
  if (typeof value !== "string" && typeof value !== "number") return null;
  const n = Number(value);
  return (typeof value !== "string" || value.trim() !== "") && Number.isFinite(n) && n >= 0 ? n : null;
};
export function mapImportedProduct(
  p: ImportedProduct,
): Product {
  const offer =
    p.best_offer && typeof p.best_offer === "object"
      ? (p.best_offer as Record<string, unknown>)
      : null;
  const priceToman = number(p.price_toman);
  return {
    id: p.id,
    slug: p.slug,
    title: p.short_title || p.title,
    image:
      p.images?.find((i) => i.is_primary)?.image_url ??
      p.images?.[0]?.image_url ??
      "",
    source: {
      name: p.source ?? "",
      label: p.source ?? "",
      url: p.source_url ?? "",
    },
    colors: (p.colors ?? []).map((c) => ({
      id: c.id,
      name: c.color_name,
      value: c.color,
    })),
    price: {
      amount: number(p.min_price),
      currency: p.currency ?? "",
      amountIrr: p.currency === "IRR"
        ? number(p.min_price)
        : priceToman === null
          ? null
          : priceToman * 10,
      hasDiscount: false,
      originalAmount: null,
      discountAmount: null,
      discountPercentage: null,
    },
    brand:
      p.brand && p.brand.id !== null
        ? {
            id: p.brand.id,
            name: p.brand.persian_name,
            originalName: p.brand.original_name,
            logo: p.brand.logo ?? null,
          }
        : null,
    seller: offer && typeof offer.supplier_name === "string"
      ? {
          id: typeof offer.id === "number" ? offer.id : 0,
          name: offer.supplier_name,
          badges: offer.verified === true ? ["verified"] : null,
        }
      : typeof p.seller_name === "string"
        ? { id: 0, name: p.seller_name, badges: null }
        : null,
    guarantee: null,
    inIranMobixInventory: false,
    officialUrl: p.source_url ?? "",
    marketable: false,
  };
}
