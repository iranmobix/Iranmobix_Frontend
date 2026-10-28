import { ProductGuaranteeTypeApi } from "./product-guarantee-api.types";
import { ProductSellerTypeApi } from "./product-seller-api.types";
import { ProductSortApi } from "./product-sort-api.types";

export interface ProductListQuery {
  search?: string;

  sources?: string[];

  category?: number[];

  min_price?: string;
  max_price?: string;

  brands?: number[];

  colors?: number[];

  seller_types?: ProductSellerTypeApi[];

  guarantees?: ProductGuaranteeTypeApi[];

  in_iranmobix_inventory?: boolean;

  sort?: ProductSortApi;

  limit?: number;

  cursor?: string;
}
