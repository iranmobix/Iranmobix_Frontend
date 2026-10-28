import type { ProductPageModel } from "../hooks/use-product-page";
import type { ProductPageProps } from "../types/domain/product-page.types";
import type { ProductMobileCurrency } from "./product-card/product-mobile-card";
import Breadcrumb from "@/shared/components/breadcrumb/breadcrumb";
import ProductSort from "./product-sort";
import ProductDataFeedback from "./product-data-feedback";
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
    isMock,
    isFetching,
    useMockData,
    useApiData,
    query,
    productCount,
    mobileCurrency,
    setMobileCurrency,
    setFiltersOpen,
    hasExplicitSort,
    setSort,
    sourceCurrencyLabel,
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
  const feedback = (
    <ProductDataFeedback
      isError={isCatalog && isError}
      isMock={isMock}
      isFetching={isFetching}
      onUseMock={useMockData}
      onUseApi={useApiData}
    />
  );
  const sortControls = (
    <ProductSort
      value={query.sort ?? "newest"}
      count={productCount}
      onChange={setSort}
      mobileCurrency={mobileCurrency}
      sourceCurrencyLabel={sourceCurrencyLabel}
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
        {feedback}
      </main>
    );
  }

  return (
    <main className="w-full bg-neutral-50 px-2.5 py-4 lg:px-10 lg:py-9">
      {isCatalog && feedback}
      <div className="flex items-center justify-between gap-4">
        <div className="[&_a]:text-[10px] lg:[&_a]:text-sm [&_nav]:flex-wrap [&_nav]:gap-1 lg:[&_nav]:flex-nowrap lg:[&_nav]:gap-2 [&_span]:text-[10px] lg:[&_span]:text-sm">
          <Breadcrumb items={breadcrumbItems} />
        </div>
        {discoveryProducts && (
          <label className="hidden items-center gap-2 text-xs text-neutral-700 lg:flex">
            <span>واحد پول:</span>
            <select
              value={mobileCurrency}
              onChange={(event) =>
                setMobileCurrency(event.target.value as ProductMobileCurrency)
              }
              className="text-primary-700 h-8 rounded-md border border-neutral-300 bg-white px-2 text-xs"
            >
              <option value="source">یوان CNY</option>
              <option value="IRT">تومان</option>
              <option value="IRR">ریال</option>
            </select>
          </label>
        )}
      </div>

      {discoveryProducts && (
        <div className="mt-3 lg:hidden">{sortControls}</div>
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
        <section className="flex w-full gap-4 pt-4 lg:pt-11">
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
