import { useQuery } from "@tanstack/react-query";
import { PANEL_ORDERS_QUERY_KEY } from "../constants/user-panel.constants";
import { userPanelService } from "../services/user-panel.service";
export function usePanelOrders() {
  return useQuery({
    queryKey: PANEL_ORDERS_QUERY_KEY,
    queryFn: userPanelService.getOrders,
    staleTime: Infinity,
    retry: false,
    refetchOnWindowFocus: false,
  });
}
