import { buildMainSpecifications } from "../utils/build-main-specifications";
import type { ProductDetailSeller } from "../types/domain/product-detail-seller.types";
import type { Product } from "../types/domain/product.types";
import type { ProductCommentPreview } from "../types/domain/product-detail-comments.types";
import type { ProductImage } from "../types/domain/product-detail.types";

const importText = (value: unknown): string =>
  typeof value === "string"
    ? value.trim()
    : typeof value === "number" && Number.isFinite(value)
      ? String(value)
      : "";
const importNumber = (value: unknown): number | null => {
  if (
    typeof value !== "number" &&
    (typeof value !== "string" || !/^\d+(?:\.\d+)?$/.test(value.trim()))
  )
    return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : null;
};
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
const httpUrl = (value: unknown) => {
  if (typeof value !== "string") return "";
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
};
const textList = (value: unknown) =>
  Array.isArray(value)
    ? value.map(importText).filter(Boolean).join("، ")
    : importText(value);

function mapSeller(value: unknown): ProductDetailSeller | null {
  const seller = record(value);
  if (!Object.keys(seller).length) return null;
  const rating = importNumber(seller.rating);
  return {
    id: null,
    name: importText(seller.name),
    officialUrl: httpUrl(seller.seller_url) || undefined,
    logo: httpUrl(seller.image) || null,
    location: importText(seller.location) || null,
    rating: rating !== null && rating <= 5 ? rating : null,
    badges: [
      seller.verified === true ? "verified" : null,
      seller.is_iranmobix_selected === true ? "iranmobix" : null,
    ].filter((item): item is "verified" | "iranmobix" => item !== null),
    // Required by the shared seller model; no numerical trust score is displayed from these defaults.
    trust: {
      score: 0,
      level: "",
      label: "",
      verified: seller.verified === true,
      trusted: seller.is_iranmobix_selected === true,
    },
    market: seller.main_markets,
    services: seller.service_quality_control,
    companyOverview: {
      yearFounded: importText(seller.year_founded) || null,
      floorspace: importText(seller.floorspace) || null,
      responseTime: importText(seller.response_time) || null,
      onTimeDispatchRate: importText(seller.on_time_dispatch_rate) || null,
      onlineRevenue: importText(seller.online_revenue) || null,
      employees: importText(seller.employees) || null,
      mainMarkets: textList(seller.main_markets) || null,
      serviceQualityControl: textList(seller.service_quality_control) || null,
    },
  };
}

function mapProductCards(value: unknown): Product[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  return value.flatMap((item, index) => {
    const raw = record(item);
    const slug = importText(raw.slug);
    const officialUrl = httpUrl(raw.source_url);
    const identity = slug || officialUrl;
    if (!identity || seen.has(identity)) return [];
    seen.add(identity);
    const sellerName = importText(raw.seller_name);
    const amountToman = importNumber(raw.price_toman);
    const amountIrr = amountToman === null ? null : amountToman * 10;
    const badges: NonNullable<NonNullable<Product["seller"]>["badges"]> = [];
    if (raw.alibaba_verified === true) badges.push("verified");
    if (raw.iranmobix_verified === true) badges.push("iranmobix");
    return [
      {
        id: index + 1,
        slug,
        title: importText(raw.fa_title),
        image: httpUrl(raw.primary_image),
        officialUrl,
        source: { name: "alibaba", label: "علی‌بابا", url: officialUrl },
        seller:
          sellerName || badges.length
            ? { id: null, name: sellerName, badges }
            : null,
        price: {
          amount: importNumber(raw.price_cny),
          amountIrr:
            amountIrr !== null && Number.isFinite(amountIrr) ? amountIrr : null,
          currency: "CNY",
          hasDiscount: false,
          originalAmount: null,
          discountAmount: null,
          discountPercentage: null,
        },
        colors: [],
        brand: null,
        guarantee: null,
        marketable: false,
        inIranMobixInventory: false,
      },
    ];
  });
}

function mapSourceComments(value: unknown): ProductCommentPreview[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item, index) => {
    const raw = record(item);
    const text = importText(raw.translated_text) || importText(raw.text);
    if (!text) return [];
    return [
      {
        id: String(index),
        author: importText(raw.author_name),
        date: importText(raw.published_at_jalali),
        text,
      },
    ];
  });
}

export function mapMarketplaceProductDetails(
  raw: Record<string, unknown>,
  settled = true,
) {
  const specs = Object.fromEntries(
    Object.entries(record(raw.specifications))
      .map(([key, value]) => [key.trim(), importText(value)])
      .filter(([key, value]) => key && value),
  );
  const mainSpecifications = buildMainSpecifications(
    raw.weight_kg,
    raw.key_attributes,
  );
  const otherSellers = mapProductCards(raw.other_sellers);
  const relatedProducts = mapProductCards(raw.related_products);
  const comments = mapSourceComments(raw.comments);
  const urls = Array.isArray(raw.gallery)
    ? [...new Set(raw.gallery.map(httpUrl).filter(Boolean))]
    : [];
  const gallery: ProductImage[] = urls.map((url, index) => ({
    id: index + 1,
    url,
    isPrimary: index === 0,
  }));
  const seller = mapSeller(raw.seller);
  const amount = importNumber(raw.price_cny);
  const original = importNumber(raw.original_price_cny);
  const percentage = importNumber(raw.percentage);
  const tiers = (
    Array.isArray(raw.ladder_price) ? raw.ladder_price : []
  ).flatMap((entry) => {
    const tier = record(entry);
    const price = importNumber(tier.price),
      minimum = importNumber(tier.min_quantity),
      maximum = importNumber(tier.max_quantity);
    if (price === null) return [];
    const original = importNumber(tier.original_price);
    return [
      {
        price,
        minimum,
        maximum,
        currency: importText(tier.currency) || "CNY",
        original: original !== null && original > price ? original : null,
      },
    ];
  });
  const title = importText(raw.title_fa) || importText(raw.title_en);
  const code = importText(raw.product_code);
  const officialUrl = httpUrl(raw.source_url);
  return {
    kind: "marketplace" as const,
    title,
    persianTitle: importText(raw.title_fa),
    translatedByAi: raw.translated_by_ai === true,
    categoryId: importNumber(record(raw.category).id ?? raw.category_id),
    categoryName:
      (typeof raw.category === "string" ? raw.category.trim() : "") ||
      importText(record(raw.category).name) ||
      importText(raw.category_name) ||
      importText(record(raw.key_attributes).Category) ||
      importText(record(raw.specifications).Category),
    englishTitle: importText(raw.title_en),
    slug: importText(raw.slug),
    code,
    source: "alibaba",
    officialUrl,
    gallery,
    seller,
    translatedSpecifications: specs,
    mainSpecifications,
    otherSellers,
    relatedProducts,
    comments,
    amount,
    original:
      amount !== null && original !== null && original > amount
        ? original
        : null,
    percentage: percentage !== null && percentage <= 100 ? percentage : null,
    tiers,
    settled,
    hasData: Boolean(
      title ||
      gallery.length > 0 ||
      amount !== null ||
      tiers.length > 0 ||
      Object.keys(specs).length > 0 ||
      Object.keys(mainSpecifications).length > 0 ||
      otherSellers.length ||
      relatedProducts.length ||
      comments.length ||
      seller ||
      code ||
      officialUrl,
    ),
  };
}
export type MarketplaceProductDetails = ReturnType<
  typeof mapMarketplaceProductDetails
>;
