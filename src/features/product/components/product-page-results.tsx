import { Button } from "@/components/ui/button";
import type { ProductPageModel } from "../hooks/use-product-page";
import type { ProductPageProps } from "../types/domain/product-page.types";
import ProductGrid from "./product-grid/product-grid";
import ProductGridSkeleton from "./product-grid/product-grid-skeleton";

export function ProductPageResults({
  model,
  options,
}: {
  model: ProductPageModel;
  options: ProductPageProps;
}) {
  const {
    isCatalog,
    isLoading,
    products,
    query,
    mobileCurrency,
    pagination,
    loadMoreRef,
  } = model;
  const {
    discoveryProducts,
    onProductDetailsClick,
    getProductDetailsLink,
    openingProductId,
    productDataIssues,
  } = options;
  // Keep the same skeleton mounted across the gaps between discovery page requests.
  const waitingForSuggestions = Boolean(discoveryProducts && (
    pagination.isWaitingForResults || pagination.isFetchingNextPage ||
    (discoveryProducts.suggested.length === 0 && pagination.hasNextPage && !pagination.isError)
  ));
  return (
    <>
      {(isCatalog && isLoading) ||
      (products.length === 0 && waitingForSuggestions) ? (
        <ProductGridSkeleton />
      ) : products.length === 0 ? (
        <div className="py-10 text-center text-sm text-neutral-700">
          {discoveryProducts &&
          !Object.values(query).some((value) => value && value !== "newest")
            ? "هنوز محصول پیشنهادی از سمت بک دریافت نشده است."
            : "محصولی با این فیلترها یافت نشد"}
        </div>
      ) : (
        <ProductGrid
          products={products}
          mobileCurrency={mobileCurrency}
          discoveryMobile={Boolean(discoveryProducts)}
          onProductDetailsClick={onProductDetailsClick}
          getProductDetailsLink={getProductDetailsLink}
          openingProductId={openingProductId}
          productDataIssues={productDataIssues}
        />
      )}
      <div ref={loadMoreRef} className="h-1" />
      {pagination.isFetchingNextPage && (
        <div
          role="status"
          className="py-4 text-center text-sm text-neutral-700"
        >
          در حال دریافت محصولات...
        </div>
      )}
      {pagination.isError && (
        <div
          role="alert"
          className="space-y-3 py-4 text-center text-sm text-neutral-700"
        >
          <p>صفحهٔ بعدی محصولات دریافت نشد.</p>
          <Button onClick={() => void pagination.fetchNextPage()}>
            تلاش دوباره
          </Button>
        </div>
      )}
    </>
  );
}
