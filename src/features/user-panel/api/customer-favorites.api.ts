import { httpDelete, httpGet, httpPost } from "@/shared/api/http";
import type { ProductListItemApi } from "@/features/product/types/api/product-list-api.types";

export interface CustomerFavoritesApiResponse {
  count: number;
  results: ProductListItemApi[];
}

export interface CustomerFavoriteChangeApiResponse {
  slug: string;
  added: boolean;
  removed: boolean;
}

export const customerFavoritesApi = {
  list() {
    return httpGet<CustomerFavoritesApiResponse>(
      "/api/customer/favorites/profile/",
    );
  },
  remove(slug: string) {
    return httpDelete<void>(
      `/api/customer/favorites/profile/${encodeURIComponent(slug)}/`,
    );
  },
  add(slug: string) {
    return httpPost<CustomerFavoriteChangeApiResponse>(
      `/api/customer/favorites/profile/${encodeURIComponent(slug)}/`,
    );
  },
};
