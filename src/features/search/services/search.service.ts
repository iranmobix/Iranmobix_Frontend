import { searchApi } from "../api/search.api";
import { mapSearchProduct } from "../mappers/search-product.mapper";

export const searchService = {
  async search(query: string) {
    const response = await searchApi.search(query);

    const results = Array.isArray(response)
      ? response
      : response.results;

    return results.map(mapSearchProduct);
  },
};