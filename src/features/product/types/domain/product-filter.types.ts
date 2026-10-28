import { ProductGuaranteeType } from "./product.types";

export interface ProductSourceFilterOption {
  value: string;
  label: string;
}

export interface ProductCategoryFilterOption {
  id: number;
  name: string;
  slug: string;
}

export interface ProductBrandFilterOption {
  id: number;
  name: string;
  logo: string | null;
}

export interface ProductColorFilterOption {
  id: number;
  name: string;
  value: string;
}

export type ProductSellerType = "verified" | "trusted" | "iranmobix";

export interface ProductSellerTypeFilterOption {
  value: ProductSellerType;
  label: string;
}

export interface ProductGuaranteeFilterOption {
  value: ProductGuaranteeType;
  label: string;
}

export interface ProductFilters {
  sources: ProductSourceFilterOption[];
  categories: ProductCategoryFilterOption[];
  brands: ProductBrandFilterOption[];
  colors: ProductColorFilterOption[];
  sellerTypes: ProductSellerTypeFilterOption[];
  guarantees: ProductGuaranteeFilterOption[];
}
