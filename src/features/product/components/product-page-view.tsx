import { ChevronDown } from "lucide-react";
import { productCurrencyOptions } from "../utils/product-display-price";
import type { ProductPageModel } from "../hooks/use-product-page";
import type { ProductPageProps } from "../types/domain/product-page.types";
import type { ProductMobileCurrency } from "./product-card/product-mobile-card";
import Breadcrumb from "@/shared/components/breadcrumb/breadcrumb";
import ProductSort from "./product-sort";
import ProductCatalogUnavailable from "./product-catalog-unavailable";
import ProductCard from "./product-card/product-card";
import { ProductPageFilters } from "./product-page-filters";
import { ProductPageResults } from "./product-page-results";
import { ProductMobileFilters } from "./product-mobile-filters";

/** Layout and presentation only. Data and effects are owned by useProductPage. */
export default function ProductPageView({
  model,
  options,
}: {
  model: ProductPageModel;
  options: ProductPageProps;
}) {
  const {
    isCatalog,
    isError,
    query,
    productCount,
    mobileCurrency,
    setMobileCurrency,
    setFiltersOpen,
    hasExplicitSort,
    setSort,
    breadcrumbItems,
    filtersOpen,
  } = model;
  const {
    discoveryProducts,
    onProductDetailsClick,
    getProductDetailsLink,
    openingProductId,
    discoveryError,
    productDataIssues,
  } = options;
  const sortControls = (
    <ProductSort
      value={query.sort ?? "newest"}
      count={productCount}
      onChange={setSort}
      mobileCurrency={mobileCurrency}
      onCurrencyChange={setMobileCurrency}
      onOpenFilters={() => setFiltersOpen(true)}
      discovery={Boolean(discoveryProducts)}
      isRelevanceSort={Boolean(discoveryProducts) && !hasExplicitSort}
      onRelevanceSort={() => setSort(undefined)}
    />
  );
  const resultsContent = <ProductPageResults model={model} options={options} />;
  if (isError && isCatalog) {
    return (
      <main className="w-full bg-neutral-50 px-2.5 py-4 lg:px-10 lg:py-6">
        <ProductCatalogUnavailable />
      </main>
    );
  }

  return (
    <main className="w-full bg-neutral-50 px-2.5 py-4 lg:px-10 lg:py-9">
      <div className="flex items-center justify-between gap-4">
        <div className="[&_nav]:flex-wrap [&_nav]:gap-1 lg:[&_nav]:flex-nowrap lg:[&_nav]:gap-2">
          <Breadcrumb items={breadcrumbItems} />
        </div>
        {(
          <label className="text-desktop-label-l hidden items-center gap-2 text-neutral-900 lg:flex">
            <span>واحد پول:</span>
            <span className="relative inline-flex items-center">
              <select
                value={mobileCurrency}
                onChange={(event) =>
                  setMobileCurrency(event.target.value as ProductMobileCurrency)
                }
                className="text-mobile-label-l border-primary-100 text-primary-600 focus-visible:ring-primary-300 appearance-none rounded-md border bg-white py-2 pr-2 pl-8 focus-visible:ring-2 focus-visible:outline-none"
              >
                {productCurrencyOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <ChevronDown size={16} aria-hidden="true" className="text-primary-600 pointer-events-none absolute left-2 top-1/2 -translate-y-1/2" />
            </span>
          </label>
        )}
      </div>

      {discoveryProducts && (
        <div className="mt-6 lg:hidden">{sortControls}</div>
      )}

      {discoveryProducts ? (
        <section
          dir="rtl"
          className="grid grid-cols-1 gap-5 pt-4 lg:grid-cols-5 lg:gap-4 lg:pt-10"
        >
          <div className="min-w-0 lg:col-span-1">
            <h1 className="text-secondary-600 mb-4 text-sm font-medium lg:flex lg:h-6 lg:items-center">
              محصول موردنظر شما
            </h1>
            <div className="space-y-4">
              {discoveryProducts.requested.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  detailsHref={getProductDetailsLink?.(product)}
                  variant="featured"
                  mobileLayout
                  discoveryMobile
                  mobileCurrency={mobileCurrency}
                  onDetailsClick={
                    onProductDetailsClick
                      ? () => onProductDetailsClick(product)
                      : undefined
                  }
                  detailsPending={openingProductId === product.id}
                  detailsDisabled={openingProductId != null}
                  dataIssues={productDataIssues?.get(product.id)}
                />
              ))}
            </div>
            <div className="mt-4 hidden lg:block">
              <ProductPageFilters model={model} embedded />
            </div>
          </div>
          <section className="min-w-0 lg:col-span-4">
            <div className="mb-4 lg:flex lg:min-h-6 lg:items-center lg:justify-between lg:gap-4">
              <h2 className="text-neutral-1000 mb-3 shrink-0 text-sm font-medium lg:mb-0">
                محصولات پیشنهادی ما
              </h2>
              <div className="hidden lg:block">{sortControls}</div>
            </div>
            {resultsContent}
          </section>
        </section>
      ) : (
        <section className="flex w-full gap-4 pt-6 lg:pt-11">
          <div className="hidden flex-col gap-6 lg:flex">
            <p>محصولات</p>
            <ProductPageFilters model={model} />
          </div>
          <div className="min-w-0 flex-1">
            {sortControls}
            {resultsContent}
          </div>
        </section>
      )}
      {discoveryError && (
        <p role="alert" className="mt-4 text-sm text-red-600">
          {discoveryError}
        </p>
      )}
      <ProductMobileFilters open={filtersOpen} onOpenChange={setFiltersOpen}>
        <ProductPageFilters model={model} compact />
      </ProductMobileFilters>
    </main>
  );
}
