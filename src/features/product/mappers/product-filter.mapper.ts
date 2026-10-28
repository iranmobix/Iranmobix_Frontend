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

    categories: filters.categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
    })),

    brands: filters.brands.map((brand) => ({
      id: brand.id,
      name: brand.name,
      logo: brand.logo,
    })),

    colors: filters.colors.map((color) => ({
      id: color.id,
      name: color.name,
      value: color.value,
    })),

    sellerTypes: filters.seller_types.map((seller) => ({
      value: seller.value,
      label: seller.label,
    })),

    guarantees: filters.guarantees.map((guarantee) => ({
      value: guarantee.value,
      label: guarantee.label,
    })),
  };
};
