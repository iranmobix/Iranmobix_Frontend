"use client";

import { useRouter } from "next/navigation";
import ProductDetailSkeleton from "@/features/product/components/detail/product-detail-skeleton";
import ProductDetailsError from "@/features/product/components/detail/product-details-error";
import MarketplaceProductDetailsView from "../../product/components/detail/marketplace-product-details-view";
import { useSingleProductImport } from "../hooks/use-single-product-import";

export default function SingleProductImportPage({
  url,
  jobId,
}: {
  url?: string;
  jobId?: number;
}) {
  const router = useRouter();
  const state = useSingleProductImport(url, jobId);
  if (
    state.isProhibited ||
    (!state.product.hasData && (state.error || state.product.settled))
  )
    return (
      <ProductDetailsError
        title={state.isProhibited ? "این محصول قابل نمایش نیست" : undefined}
        message={
          state.error ||
          "پردازش پایان یافته، اما اطلاعاتی برای نمایش محصول دریافت نشد."
        }
        onRetry={state.canRetry === false ? undefined : state.retry}
        isRetrying={state.isRetrying}
        onBack={() => router.replace("/products")}
      />
    );
  if (!state.product.hasData && !state.product.settled)
    return <ProductDetailSkeleton />;
  return (
    <MarketplaceProductDetailsView
      product={state.product}
      notice={state.error}
      onRetry={state.canRetry === false ? undefined : state.retry}
      isRetrying={state.isRetrying}
    />
  );
}
