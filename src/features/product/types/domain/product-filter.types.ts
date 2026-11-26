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
  id: string | number;
  name: string;
  logo: string | null;
}

export type ProductSellerType = "verified" | "trusted" | "iranmobix";

export interface ProductSellerTypeFilterOption {
  value: ProductSellerType;
  label: string;
}

export interface ProductFilters {
  sources: ProductSourceFilterOption[];
  categories: ProductCategoryFilterOption[];
  brands: ProductBrandFilterOption[];
  sellerTypes: ProductSellerTypeFilterOption[];
}
