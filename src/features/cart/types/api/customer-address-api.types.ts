/** Exact create-address request supplied by the backend, including the trailing space. */
export interface CustomerAddressPayload {
  title: string;
  address_title: string;
  province: number;
  city: number;
  postal_code: string;
  address: string;
  no: string;
  unit: string;
  "fullname ": string;
  mobile: string;
}

/** PATCH contract uses `fullname` without the trailing space in the create contract. */
export type CustomerAddressPatchPayload = Omit<
  CustomerAddressPayload,
  "fullname "
> & { fullname: string };

/** GET address fields validated by the response schema; fullname has no trailing space. */
export type CustomerAddressResponse = import("zod").z.infer<
  typeof import("../../schemas/customer-address.schema").customerAddressResponseSchema
>;
export type CustomerAddressListResponse = CustomerAddressResponse[];

export type CustomerProvinceResponse = import("zod").z.infer<
  typeof import("../../schemas/customer-address.schema").customerProvinceListSchema
>[number];

export type CustomerCityResponse = import("zod").z.infer<
  typeof import("../../schemas/customer-address.schema").customerCityListSchema
>[number];
