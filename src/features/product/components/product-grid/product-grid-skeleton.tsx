import ProductLoadingIndicator from "../product-loading-indicator";

const ProductGridSkeleton = () => {
  return (
    <>
      <ProductLoadingIndicator />
      <section
        aria-label="در حال دریافت محصولات"
        className="grid grid-cols-1 gap-3 lg:hidden"
      >
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            aria-hidden="true"
            className="flex min-h-[102px] gap-3 rounded-lg bg-white p-2 motion-safe:animate-pulse"
          >
            <div className="size-[72px] shrink-0 rounded-md bg-gray-200" />
            <div className="flex flex-1 flex-col gap-2 py-1">
              <div className="h-3 w-full rounded bg-gray-200" />
              <div className="h-3 w-3/4 rounded bg-gray-200" />
              <div className="h-3 w-1/2 rounded bg-gray-200" />
            </div>
          </div>
        ))}
      </section>
      <section className="hidden w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid lg:grid-cols-4">
        {Array.from({ length: 24 }).map((_, index) => (
          <div
            key={index}
            className="flex h-full min-h-[420px] w-full animate-pulse flex-col overflow-hidden rounded-md bg-white p-4"
          >
            {/* Image */}
            <div className="aspect-square w-full rounded-md bg-gray-200" />

            {/* Content */}
            <div className="flex flex-1 flex-col pt-3">
              {/* Title */}
              <div className="space-y-2">
                <div className="h-4 w-full rounded bg-gray-200" />
                <div className="h-4 w-2/3 rounded bg-gray-200" />
              </div>

              {/* Price */}
              <div className="mt-4 flex flex-col items-end gap-2">
                <div className="h-3 w-1/3 rounded bg-gray-200" />
                <div className="h-5 w-1/2 rounded bg-gray-200" />
              </div>

              {/* Seller */}
              <div className="mt-4 flex items-center justify-end gap-2">
                <div className="h-4 w-20 rounded bg-gray-200" />
                <div className="h-5 w-5 rounded bg-gray-200" />
              </div>
            </div>

            {/* Button */}
            <div className="mt-3 h-10 w-full rounded-md bg-gray-200" />
          </div>
        ))}
      </section>
    </>
  );
};

export default ProductGridSkeleton;
