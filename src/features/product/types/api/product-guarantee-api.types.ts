export type ProductGuaranteeTypeApi = "iranmobix";

export interface ProductGuaranteeApi {
  available: boolean;
  type: ProductGuaranteeTypeApi | null;
  label: string | null;
}

export interface ProductGuaranteeFilterApi {
  value: ProductGuaranteeTypeApi;
  label: string;
}
