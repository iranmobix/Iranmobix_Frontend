import { useQuery } from "@tanstack/react-query";

import { navigationService } from "../services/navigation.service";

import { NAVIGATION_QUERY_KEYS } from "../constants/navigation.keys";


export function useNavigation() {

  return useQuery({
    queryKey: NAVIGATION_QUERY_KEYS.menus(),

    queryFn: () => navigationService.getNavigation(),

    staleTime: 1000 * 60 * 10,
  });

}