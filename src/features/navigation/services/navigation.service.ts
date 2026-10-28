import { navigationApi } from "../api/navigation.api";

import { mapNavigationTree } from "../mappers/navigation.mapper";

import type { NavigationItem } from "../types/navigation.types";


class NavigationService {


  async getNavigation(): Promise<NavigationItem[]> {

    const response = await navigationApi.getMenus();


    return mapNavigationTree(response);

  }


}


export const navigationService = new NavigationService();