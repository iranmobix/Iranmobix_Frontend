export * from "./product.types";
export * from "./product-filter.types";
export * from "./product-list.types";

// Detail exports use distinct color and guarantee names to avoid catalog collisions.
export type {
  ProductDetail,
  ProductRelatedProduct,
  ProductCategory,
  ProductInventory,
  ProductImage,
  ProductDetailColor,
  ProductDetailGuarantee,
  ProductDescription,
} from "./product-detail.types";
export type * from "./product-detail-price.types";
export type * from "./product-detail-seller.types";
export type * from "./product-detail-comments.types";
