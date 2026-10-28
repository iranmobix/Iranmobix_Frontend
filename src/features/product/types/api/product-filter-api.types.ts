import { ProductSourceFilterApi } from "./product-source-api.types";
import { ProductBrandFilterApi } from "./product-brand-api.types";
import { ProductColorFilterApi } from "./product-color-api.types";
import {
  ProductSellerTypeApi,
  ProductSellerTypeFilterApi,
} from "./product-seller-api.types";
import {
  ProductGuaranteeFilterApi,
  ProductGuaranteeTypeApi,
} from "./product-guarantee-api.types";
import { ProductCategoryFilterApi } from "./product-category-api.types";

export interface ProductAppliedFiltersApi {
  search: string | null;

  sources: string[];

  category: number | null;

  min_price: string | null;
  max_price: string | null;

  brands: number[];

  colors: number[];

  seller_types: ProductSellerTypeApi[];

  guarantees: ProductGuaranteeTypeApi[];

  in_iranmobix_inventory: boolean | null;
}

export interface ProductFiltersApi {
  sources: ProductSourceFilterApi[];

  categories: ProductCategoryFilterApi[];

  brands: ProductBrandFilterApi[];

  colors: ProductColorFilterApi[];

  seller_types: ProductSellerTypeFilterApi[];

  guarantees: ProductGuaranteeFilterApi[];
}
