export interface ProductDataIssue {
  label: string;
  keys: string[];
  status: "missing" | "empty" | "invalid";
}

export interface Product {
  id: number;
  slug: string;

  title: string;

  image: string;

  source: ProductSource;

  colors: ProductColor[];

  price: ProductPrice;

  brand: ProductBrand | null;

  seller: ProductSeller | null;

  guarantee: ProductGuarantee | null;

  inIranMobixInventory: boolean;

  officialUrl: string;

  marketable: boolean;
}

/* ----------------------------- */
/* Source */
/* ----------------------------- */

export interface ProductSource {
  name: string;
  label: string;
  url: string;
}

/* ----------------------------- */
/* Color */
/* ----------------------------- */

export interface ProductColor {
  id: number;
  name: string;
  value: string;
}

/* ----------------------------- */
/* Price */
/* ----------------------------- */

export interface ProductPrice {
  amount: number | null;
  currency: string;
  amountIrr: number | null;

  hasDiscount: boolean;

  originalAmount: number | null;
  discountAmount: number | null;
  discountPercentage: number | null;
}

/* ----------------------------- */
/* Brand */
/* ----------------------------- */

export interface ProductBrand {
  id: number;
  name: string;
  originalName: string;
  logo: string | null;
}

/* ----------------------------- */
/* Seller */
/* ----------------------------- */

export interface ProductSeller {
  id: number | null;
  name: string;
  badges: ProductSellerBadge[] | null;
}

export type ProductSellerBadge = "verified" | "trusted" | "iranmobix";

/* ----------------------------- */
/* Guarantee */
/* ----------------------------- */

export interface ProductGuarantee {
  available: boolean;
  type: ProductGuaranteeType | null;
  label: string | null;
}

export type ProductGuaranteeType = "iranmobix";
