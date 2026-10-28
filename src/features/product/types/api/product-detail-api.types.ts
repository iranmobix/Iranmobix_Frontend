import type { ProductBrandApi } from "./product-brand-api.types";
import type { ProductSellerApi } from "./product-seller-api.types";
import type { ProductSourceApi } from "./product-source-api.types";

export interface ProductDetailApiResponse {
  product: ProductDetailApi;
  primary_image: string;
  gallery: ProductImageApi[];
  colors: ProductColorApi[];
  guarantees: ProductGuaranteeApi[];
  description: ProductDescriptionApi;
  translated_specifications: Record<string, string>;
  related_products: ProductRelatedProductApi[];
  other_sellers: ProductRelatedProductApi[];
  comment_summary: string | null;
  comments: ProductCommentsApi;
}

/* ----------------------------- */
/* Product */
/* ----------------------------- */

export interface ProductDetailApi {
  slug: string;
  source: string;
  title: string;
  short_description: string;
  price: ProductPriceDetailApi;
  brand: ProductBrandApi | null;
  category: ProductCategoryApi | null; // ✅
  seller: ProductSellerDetailApi | null;
  official_url: string;
  marketable: boolean;
  inventory: ProductInventoryApi;
}

/* ----------------------------- */
/* Price */
/* ----------------------------- */

// Monetary values are decimal strings in the API, including converted amounts.
export interface ProductPriceAmountApi {
  amount: string;
  currency: string;
  amount_toman: string;
  amount_usd: string | null;
}

export interface ProductPriceDetailApi extends ProductPriceAmountApi {
  minimum: string;
  maximum: string;
  original_amount: string | null;
  final_amount: string;
  has_discount: boolean;
  discount_amount: string | null;
  final_amount_toman: string;
  final_amount_usd: string | null;
  discount_percentage: number;
  // These fields are omitted on some products in the response.
  ladder_price?: ProductLadderPriceApi[];
  attributes?: ProductPriceAttributeApi[];
  range?: ProductPriceRangeDetailApi;
}

export interface ProductLadderPriceApi extends ProductPriceAmountApi {
  min_quantity: number | null;
  max_quantity: number | null;
  quantity_text: string;
  label: string;
  raw_price_text: string;
}

export interface ProductPriceAttributeApi {
  name: string;
  values: ProductPriceAttributeValueApi[];
}

export interface ProductPriceAttributeValueApi extends ProductPriceAmountApi {
  value: string;
  raw_sku_id: string;
  raw_price_text: string;
}

export interface ProductPriceRangeDetailApi {
  minimum: string;
  maximum: string;
  currency: string;
  minimum_toman: string;
  minimum_usd: string | null;
  maximum_toman: string;
  maximum_usd: string | null;
}

/* ----------------------------- */
/* Related products */
/* ----------------------------- */

export interface ProductRelatedProductApi {
  slug: string;
  title: string;
  short_description: string;
  image: string;
  price: ProductRelatedPriceApi;
  seller: ProductSellerDetailApi | null;
  source: ProductSourceApi;
}

export type ProductRelatedPriceApi = ProductPriceDetailApi;

export interface ProductSellerCompanyOverviewApi {
  location?: string | null;
  logo?: string | null;
  year_founded?: string | null;
  floorspace?: string | null;
  online_revenue?: string | null;
  // Field names are confirmed; value schemas still need non-empty API examples.
  response_time?: string | null;
  on_time_dispatch_rate?: string | null;
  employees?: string | null;
  main_markets?: string | null;
  service_quality_control?: string | null;
}

export interface ProductSellerDetailApi extends ProductSellerApi {
  location?: string | null;
  logo?: string | null;
  rating?: number | null;
  // Only null examples are available; retain payloads until their schemas are confirmed.
  market?: unknown;
  services?: unknown;
  company_overview?: ProductSellerCompanyOverviewApi | null;
  trust: {
    score: number;
    // The sample does not enumerate every possible trust level.
    level: string;
    label: string;
    verified: boolean;
    trusted: boolean;
  };
}

/* ----------------------------- */
/* Category */
/* ----------------------------- */

export interface ProductCategoryApi {
  id: number;

  name: string;

  description?: string | null;

  slug: string;

  image?: string | null;

  status?: number | null;

  show_in_menu?: number | null;

  tags?: string | null;

  parent?: number | null;

  parent_name?: string | null;

  children_count?: number | null;

  is_delete?: boolean | null;
}

/* ----------------------------- */
/* Inventory */
/* ----------------------------- */

export interface ProductInventoryApi {
  marketable_number: number;

  frozen_number: number;

  sold_number: number;

  tracking_enabled: boolean;
}

/* ----------------------------- */
/* Image */
/* ----------------------------- */

export interface ProductImageApi {
  id: number;
  url: string;
  is_primary: boolean;
}

/* ----------------------------- */
/* Description */
/* ----------------------------- */

export interface ProductDescriptionApi {
  summary: string | null;

  review: string | null;

  has_summary: boolean;

  has_review: boolean;
}

/* ----------------------------- */
/* Comments */
/* ----------------------------- */

// Item schemas remain unknown until a non-empty response is available.
export interface ProductCommentCollectionApi {
  count: number;
  results: unknown[];
}

export interface ProductCommentsApi extends ProductCommentCollectionApi {
  main_comments: ProductCommentCollectionApi;
  source_comments: {
    count: number;
    product_reviews: unknown[];
    store_reviews: unknown[];
  };
}

export interface ProductColorApi {
  id: number;
  color_name: string;
  color: string;
  price_increase: string;
  status: number;
  sold_number: number;
  frozen_number: number;
  marketable_number: number;
}

export interface ProductGuaranteeApi {
  id: number;
  name: string;
  price_increase: string;
  status: number;
}
