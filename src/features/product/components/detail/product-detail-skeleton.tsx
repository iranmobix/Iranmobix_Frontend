import ProductLoadingIndicator from "../product-loading-indicator";

const ProductDetailSkeleton = () => (
  <div
    role="status"
    aria-busy="true"
    className="w-full bg-neutral-50 px-4 pt-8 pb-20 md:px-10"
  >
    <ProductLoadingIndicator variant="details" announce={false} />
    <div aria-hidden="true" className="space-y-4 motion-safe:animate-pulse">
      <div className="mb-4 flex items-center justify-between">
        <div className="h-5 w-60 max-w-[65%] rounded bg-neutral-200" />
        <div className="h-10 w-24 rounded bg-neutral-200" />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex min-h-[560px] flex-col gap-6 rounded-lg bg-white p-6 md:row-span-2">
          <div className="h-7 w-4/5 rounded bg-neutral-200" />
          <div className="h-5 w-3/5 rounded bg-neutral-100" />
          <div className="h-px bg-neutral-200" />
          <div className="h-8 w-2/3 rounded bg-neutral-200" />
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 3 }, (_, index) => (
              <div key={index} className="h-24 rounded-lg bg-neutral-100" />
            ))}
          </div>
          <div className="h-10 rounded-lg bg-neutral-100" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-10 rounded-lg bg-neutral-100" />
            <div className="h-10 rounded-lg bg-neutral-100" />
          </div>
          <div className="mt-auto h-11 rounded-lg bg-neutral-200" />
        </div>
        <div className="space-y-4">
          <div className="aspect-square max-h-[480px] rounded-lg bg-neutral-200" />
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }, (_, index) => (
              <div
                key={index}
                className="aspect-square rounded-lg bg-neutral-200"
              />
            ))}
          </div>
        </div>
        <div className="space-y-5 rounded-lg bg-white p-6">
          <div className="h-6 w-1/3 rounded bg-neutral-200" />
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="h-5 rounded bg-neutral-100" />
          ))}
        </div>
        <div className="space-y-5 rounded-lg bg-white p-6 md:col-span-2">
          <div className="h-6 w-36 rounded bg-neutral-200" />
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
            {Array.from({ length: 6 }, (_, index) => (
              <div key={index} className="h-16 rounded bg-neutral-100" />
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);
export default ProductDetailSkeleton;
