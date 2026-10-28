export type ProductSellerTypeApi = "verified" | "trusted" | "iranmobix";

export interface ProductSellerApi {
  id: number | null;
  name: string;
  badges: ProductSellerTypeApi[] | null;
}

export interface ProductSellerTypeFilterApi {
  value: ProductSellerTypeApi;
  label: string;
}
