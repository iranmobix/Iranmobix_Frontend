import type { NavigationApiResponse } from "../types/navigation.api.types";

import { httpGet } from "@/shared/api";


class NavigationApi {


  async getMenus(): Promise<NavigationApiResponse[]> {

    return httpGet<NavigationApiResponse[]>(
      "/api/menus/"
    );

  }


}


export const navigationApi = new NavigationApi();