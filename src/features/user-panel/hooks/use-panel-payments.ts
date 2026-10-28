import { useQuery } from "@tanstack/react-query";
import { PANEL_PAYMENTS_QUERY_KEY } from "../constants/user-panel.constants";
import { userPanelService } from "../services/user-panel.service";
export function usePanelPayments() {
  return useQuery({
    queryKey: PANEL_PAYMENTS_QUERY_KEY,
    queryFn: userPanelService.getPayments,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    retry: false,
  });
}
