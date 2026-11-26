import ProductDetailLoadingIndicator from "./product-detail-loading-indicator";

export default function ProductDetailSkeleton() {
  return <div className="flex min-h-[60vh] w-full items-center justify-center bg-neutral-50 px-4 py-8"><ProductDetailLoadingIndicator /></div>;
}
