import type { ProductPageModel } from "../hooks/use-product-page";
import ProductFilter from "./product-filter/product-filter";

export function ProductPageFilters({
  model,
  compact = false,
  embedded = false,
}: {
  model: Pick<
    ProductPageModel,
    | "filters"
    | "categoriesLoading"
    | "categoriesError"
    | "retryCategories"
    | "draftQuery"
    | "updateQuery"
    | "priceMin"
    | "priceMax"
    | "applyFilters"
    | "resetDraftQuery"
  >;
  compact?: boolean;
  embedded?: boolean;
}) {
  const {
    filters,
    draftQuery,
    updateQuery,
    priceMin,
    priceMax,
    applyFilters,
    resetDraftQuery,
  } = model;
  return (
    <ProductFilter
      compact={compact}
      embedded={embedded}
      sources={filters?.sources ?? []}
      selectedSources={draftQuery.sources ?? []}
      onSourcesChange={(value) => updateQuery("sources", value)}
      categories={filters?.categories ?? []}
      categoriesLoading={model.categoriesLoading}
      categoriesError={model.categoriesError}
      onRetryCategories={model.retryCategories}
      selectedCategories={draftQuery.category ?? []}
      onCategoryChange={(value) => updateQuery("category", value)}
      minPrice={draftQuery.min_price ?? ""}
      maxPrice={draftQuery.max_price ?? ""}
      priceMin={priceMin}
      priceMax={priceMax}
      onPriceChange={({ minPrice, maxPrice }) => {
        updateQuery("min_price", minPrice);
        updateQuery("max_price", maxPrice);
      }}
      brands={filters?.brands ?? []}
      selectedBrands={draftQuery.brands ?? []}
      onBrandsChange={(value) => updateQuery("brands", value)}
      sellerTypes={filters?.sellerTypes ?? []}
      selectedSellerTypes={draftQuery.seller_types ?? []}
      onSellerTypesChange={(value) => updateQuery("seller_types", value)}
      inIranMobixInventory={draftQuery.in_iranmobix_inventory ?? false}
      onInventoryChange={(value) =>
        updateQuery("in_iranmobix_inventory", value)
      }
      onApply={applyFilters}
      onReset={resetDraftQuery}
    />
  );
}
