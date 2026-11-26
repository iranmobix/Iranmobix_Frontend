import PageLoading from "@/shared/components/page-loading";

export default function ProductGridSkeleton() {
  return <PageLoading title="در حال دریافت محصولات" description="محصولات در حال دریافت و آماده‌سازی هستند؛ لطفاً کمی صبر کنید." className="min-h-[40vh]" />;
}
