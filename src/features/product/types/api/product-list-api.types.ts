import { ProductSortApi } from "./product-sort-api.types";
import {
  ProductAppliedFiltersApi,
  ProductFiltersApi,
} from "./product-filter-api.types";
import { ProductPaginationApi } from "./product-pagination-api.types";
import { ProductSourceApi } from "./product-source-api.types";
import { ProductColorApi } from "./product-color-api.types";
import { ProductPriceApi } from "./product-price-api.types";
import { ProductBrandApi } from "./product-brand-api.types";
import { ProductSellerApi } from "./product-seller-api.types";
import { ProductGuaranteeApi } from "./product-guarantee-api.types";

export interface ProductListApiResponse {
  count: number;
  sort: ProductSortApi;

  applied_filters: ProductAppliedFiltersApi;
  filters: ProductFiltersApi;

  results: ProductListItemApi[];

  limit: number;

  next_cursor: string | null;
  previous_cursor: string | null;

  pagination: ProductPaginationApi;
}

export interface ProductListItemApi {
  id: number;
  slug: string;
  title: string;
  short_title: string;
  short_description: string;
  image: string;
  source: ProductSourceApi;
  colors: ProductColorApi[];
  price: ProductPriceApi;
  brand: ProductBrandApi | null;
  seller: ProductSellerApi | null;
  guarantee: ProductGuaranteeApi | null;
  in_iranmobix_inventory: boolean;
  official_url: string;
  marketable: boolean;
}
