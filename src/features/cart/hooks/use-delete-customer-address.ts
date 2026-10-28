"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteCustomerAddress } from "../services/customer-address.service";
import { invalidateCustomerAddressQueries } from "./use-create-customer-address";

export function useDeleteCustomerAddress() {
  const client = useQueryClient();
  return useMutation({
    mutationKey: ["cart", "delete-address"],
    mutationFn: deleteCustomerAddress,
    retry: false,
    onSuccess: () => invalidateCustomerAddressQueries(client),
  });
}
