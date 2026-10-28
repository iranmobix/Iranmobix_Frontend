/** Address form values; province/city IDs must come from the backend location lists. */
export interface CustomerAddressInput {
  title: string;
  addressTitle: string;
  provinceId: number;
  cityId: number;
  postalCode: string;
  address: string;
  no: string;
  unit: string;
  fullName: string;
  mobile: string;
}
export interface AddressLocationOption {
  id: number;
  name: string;
}
