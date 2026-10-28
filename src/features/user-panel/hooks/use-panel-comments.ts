import { useQuery } from "@tanstack/react-query";
import { PANEL_COMMENTS_QUERY_KEY } from "../constants/user-panel.constants";
import { userPanelService } from "../services/user-panel.service";
export function usePanelComments() {
  return useQuery({
    queryKey: PANEL_COMMENTS_QUERY_KEY,
    queryFn: userPanelService.getComments,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    retry: false,
  });
}
