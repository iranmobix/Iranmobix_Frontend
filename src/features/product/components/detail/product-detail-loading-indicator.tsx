import PageLoading, { type PageLoadingProps } from "@/shared/components/page-loading";

export default function ProductDetailLoadingIndicator({
  title = "در حال آماده‌سازی جزئیات محصول",
  description = "اطلاعات محصول در حال دریافت و آماده‌سازی است؛ لطفاً کمی صبر کنید.",
}: PageLoadingProps = {}) {
  return <PageLoading title={title} description={description} />;
}
