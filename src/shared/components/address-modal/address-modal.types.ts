export interface AddressInput {
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
export interface AddressLocationList {
  data?: AddressLocationOption[];
  isPending: boolean;
  isError: boolean;
  isFetching?: boolean;
  refetch: () => unknown;
}
export interface AddressModalProps {
  title?: string;
  initialValues?: Partial<AddressInput>;
  onDismiss: () => void;
  onSave: (input: AddressInput) => Promise<void> | void;
  onProvinceChange: (id: number) => void;
  locations: {
    provinces: AddressLocationList;
    cities: AddressLocationList;
    selectedProvince?: AddressLocationOption;
  };
}
