import { ProductSellerTypeApi } from "./product-seller-api.types";
import { ProductSortApi } from "./product-sort-api.types";

export interface ProductListQuery {
  search?: string;

  sources?: string[];

  category?: number[];

  min_price?: string;
  max_price?: string;

  brands?: (string | number)[];

  seller_types?: ProductSellerTypeApi[];

  in_iranmobix_inventory?: boolean;

  sort?: ProductSortApi;

  limit?: number;

  cursor?: string;
  page?: number;
  page_size?: number;
  currency?: string;
  display_currency?: "CNY" | "AED" | "IRR";
  has_battery?: boolean;
  has_magnet?: boolean;
  ready_only?: boolean;
  alibaba_verified?: boolean;
  iranmobix_verified?: boolean;
  ordering?: string;
  rating?: string;
  min_rating?: string;
  ids?: string;
  exclude_ids?: string;
  slug?: string;
  source?: string;
  source_url?: string;
  title?: string;
}
