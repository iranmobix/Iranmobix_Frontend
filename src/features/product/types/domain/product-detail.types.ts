import type {
  ProductBrand,
  ProductColor as BaseProductColor,
  ProductSource,
} from "./product.types";
import type { ProductDetailPrice } from "./product-detail-price.types";
import type { ProductDetailSeller } from "./product-detail-seller.types";
import type { ProductComments } from "./product-detail-comments.types";

// Preserve existing direct imports while the implementation migrates to the new domain.
export type { ProductDetailPrice } from "./product-detail-price.types";
export type {
  ProductDetailColor as ProductColor,
  ProductDetailGuarantee as ProductGuarantee,
};

export interface ProductDetail {
  slug: string;
  source: string;
  title: string;
  shortDescription: string;
  price: ProductDetailPrice;
  brand: ProductBrand | null;
  category: ProductCategory | null;
  seller: ProductDetailSeller | null;
  officialUrl: string;
  marketable: boolean;
  inventory: ProductInventory;
  primaryImage: string;
  gallery: ProductImage[];
  colors: ProductDetailColor[];
  guarantees: ProductDetailGuarantee[];
  description: ProductDescription;
  translatedSpecifications: Record<string, string>;
  relatedProducts: ProductRelatedProduct[];
  otherSellers: ProductRelatedProduct[];
  commentSummary: string | null;
  comments: ProductComments;
}

// Related products and other seller offers have the same compact response shape.
// They do not contain all fields required by the catalog's Product model.
export interface ProductRelatedProduct {
  slug: string;
  title: string;
  shortDescription: string;
  image: string;
  price: ProductDetailPrice;
  seller: ProductDetailSeller | null;
  source: ProductSource;
}

export interface ProductCategory {
  id: number;
  name: string;
  description: string | null;
  slug: string;
  image: string | null;
  status: number | null;
  showInMenu: number | null;
  tags: string | null;
  parent: number | null;
  parentName: string | null;
  childrenCount: number | null;
  isDelete: boolean | null;
}

export interface ProductInventory {
  marketableNumber: number;
  frozenNumber: number;
  soldNumber: number;
  trackingEnabled: boolean;
}

export interface ProductImage {
  id: number;
  url: string;
  isPrimary: boolean;
}

export interface ProductDetailColor extends BaseProductColor {
  priceIncrease: number;
  status: number;
  soldNumber: number;
  frozenNumber: number;
  marketableNumber: number;
}

export interface ProductDetailGuarantee {
  id: number;
  name: string;
  priceIncrease: number;
  status: number;
}

export interface ProductDescription {
  summary: string | null;
  review: string | null;
  hasSummary: boolean;
  hasReview: boolean;
}
