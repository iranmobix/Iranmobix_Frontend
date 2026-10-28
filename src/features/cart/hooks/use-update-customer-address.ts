"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCustomerAddress } from "../services/customer-address.service";
import { invalidateCustomerAddressQueries } from "./use-create-customer-address";

export function useUpdateCustomerAddress() {
  const client = useQueryClient();
  return useMutation({
    mutationKey: ["cart", "update-address"],
    mutationFn: updateCustomerAddress,
    retry: false,
    onSuccess: () => invalidateCustomerAddressQueries(client),
  });
}
