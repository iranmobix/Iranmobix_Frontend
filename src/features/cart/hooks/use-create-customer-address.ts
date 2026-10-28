"use client";
import { useMutation, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { createCustomerAddress } from "../services/customer-address.service";
export function invalidateCustomerAddressQueries(client: QueryClient) {
  void client.invalidateQueries({ queryKey: ["cart", "payment"] });
  void client.invalidateQueries({ queryKey: ["cart", "addresses"] });
}
export function useCreateCustomerAddress() {
  const client = useQueryClient();
  return useMutation({
    mutationKey: ["cart", "create-address"],
    mutationFn: createCustomerAddress,
    retry: false,
    onSuccess: () => invalidateCustomerAddressQueries(client),
  });
}
