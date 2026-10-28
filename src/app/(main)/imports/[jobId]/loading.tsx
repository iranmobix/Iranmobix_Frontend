import ProductGridSkeleton from "@/features/product/components/product-grid/product-grid-skeleton";

export default function Loading() {
  return (
    <main dir="rtl" className="mx-auto min-h-[60vh] max-w-[1440px] space-y-6 bg-neutral-50 px-5 py-8">
      <ProductGridSkeleton />
    </main>
  );
}
