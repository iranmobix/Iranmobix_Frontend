import { useQuery } from "@tanstack/react-query";
import { PANEL_WALLET_QUERY_KEY } from "../constants/user-panel.constants";
import { userPanelService } from "../services/user-panel.service";
export function usePanelWallet() {
  return useQuery({
    queryKey: PANEL_WALLET_QUERY_KEY,
    queryFn: userPanelService.getWallet,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    retry: false,
  });
}
