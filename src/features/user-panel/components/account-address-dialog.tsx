"use client";
import { useState } from "react";
import { AddressModal } from "@/shared/components/address-modal";
import type { PanelAddress, UserPanelAccount } from "../types/user-panel.types";
import { useAddressLocations } from "@/features/cart/hooks/use-address-locations";
import { useCreateCustomerAddress } from "@/features/cart/hooks/use-create-customer-address";
import { useUpdateCustomerAddress } from "@/features/cart/hooks/use-update-customer-address";
import { getAddressError } from "@/features/cart/services/customer-address.service";
export default function AccountAddressDialog({
  address,
  account,
  onClose,
}: {
  address?: PanelAddress;
  account: UserPanelAccount;
  onClose: () => void;
}) {
  const [provinceId, setProvinceId] = useState(address?.provinceId ?? 0);
  const locations = useAddressLocations(provinceId);
  const createAddress = useCreateCustomerAddress();
  const updateAddress = useUpdateCustomerAddress();
  return (
    <AddressModal
      title={address ? "ویرایش آدرس" : "افزودن آدرس"}
      onDismiss={onClose}
      onProvinceChange={setProvinceId}
      initialValues={{
        title: address?.title ?? "",
        addressTitle: address?.title ?? "",
        provinceId: address?.provinceId ?? 0,
        cityId: address?.cityId ?? 0,
        address: address?.street ?? "",
        postalCode: address?.postalCode ?? "",
        no: address?.no ?? "",
        unit: address?.unit ?? "",
        fullName:
          address?.receiverName ?? account.firstName + " " + account.lastName,
        mobile: address?.receiverMobile ?? account.mobile ?? "",
      }}
      locations={locations}
      onSave={async (input) => {
        try {
          if (address)
            await updateAddress.mutateAsync({ id: address.id, input });
          else await createAddress.mutateAsync(input);
          onClose();
        } catch (error) {
          throw new Error(getAddressError(error));
        }
      }}
    />
  );
}
