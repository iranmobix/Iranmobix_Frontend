import type { ProductFilters } from "../types/domain";
import type { ProductFiltersApi } from "../types/api/product-filter-api.types";

export const mapProductFilters = (
  filters: ProductFiltersApi,
): ProductFilters => {
  return {
    sources: filters.sources.map((source) => ({
      value: source.value,
      label: source.label,
    })),

    categories: [],

    brands: filters.brands.map((brand) => ({
      id: brand.id,
      name: brand.name,
      logo: brand.logo,
    })),

    sellerTypes: filters.seller_types.map((seller) => ({
      value: seller.value,
      label: seller.label,
    })),
  };
};
