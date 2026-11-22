import { ProductSellerTypeApi } from "./product-seller-api.types";
import { ProductSortApi } from "./product-sort-api.types";

export interface ProductListQuery {
  search?: string;

  sources?: string[];

  category?: number[];

  min_price?: string;
  max_price?: string;

  brands?: number[];

  seller_types?: ProductSellerTypeApi[];

  in_iranmobix_inventory?: boolean;

  sort?: ProductSortApi;

  limit?: number;

  cursor?: string;
}
