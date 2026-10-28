import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PANEL_FAVORITES_QUERY_KEY } from "../constants/user-panel.constants";
import { userPanelService } from "../services/user-panel.service";
import type { PanelFavorite } from "../types/panel-favorite.types";
export function usePanelFavorites() {
  const client = useQueryClient();
  const query = useQuery({
    queryKey: PANEL_FAVORITES_QUERY_KEY,
    queryFn: userPanelService.getFavorites,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    retry: false,
  });
  const removeMutation = useMutation({
    mutationFn: userPanelService.removeFavorite,
    onSuccess: (_response, slug) => {
      client.setQueryData<PanelFavorite[]>(PANEL_FAVORITES_QUERY_KEY, (current) =>
        current?.filter((item) => item.slug !== slug),
      );
    },
  });
  const addMutation = useMutation({
    mutationFn: userPanelService.addFavorite,
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: PANEL_FAVORITES_QUERY_KEY });
    },
  });
  return {
    ...query,
    remove: removeMutation.mutateAsync,
    add: addMutation.mutateAsync,
    isRemoving: removeMutation.isPending,
    isAdding: addMutation.isPending,
  };
}
