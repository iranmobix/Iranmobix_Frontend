import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCustomerAddresses } from "@/features/cart/hooks/use-customer-addresses";
import { useDeleteCustomerAddress } from "@/features/cart/hooks/use-delete-customer-address";
import { USER_PANEL_QUERY_KEY } from "../constants/user-panel.constants";
import {
  applyPanelAccountChange,
  userPanelService,
} from "../services/user-panel.service";
import type {
  PanelAccountChange,
  UserPanelAccount,
} from "../types/user-panel.types";

export function useUserPanel() {
  const queryClient = useQueryClient();
  const addressQuery = useCustomerAddresses();
  const deleteAddressMutation = useDeleteCustomerAddress();
  const query = useQuery({
    queryKey: USER_PANEL_QUERY_KEY,
    queryFn: userPanelService.getAccount,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    retry: false,
  });
  const save = (change: PanelAccountChange) => {
    queryClient.setQueryData<UserPanelAccount>(
      USER_PANEL_QUERY_KEY,
      (account) =>
        account ? applyPanelAccountChange(account, change) : account,
    );
  };
  const updateProfile = async (change: PanelAccountChange) => {
    const profile = await userPanelService.updateProfile(change);
    if (profile) queryClient.setQueryData(USER_PANEL_QUERY_KEY, profile);
  };
  const deleteAddress = async (id: string) => {
    await deleteAddressMutation.mutateAsync(id);
  };
  const reset = () => {
    queryClient.clear();
  };
  return { ...query, addressQuery, save, updateProfile, deleteAddress, reset };
}
