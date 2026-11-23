import type { ProductDetailSeller } from "../../types/domain/product-detail-seller.types";
import ProductSellerCard from "./supplier/product-seller-card";

export default function ProductMobileSeller({
  seller,
  pending = false,
}: {
  seller?: ProductDetailSeller | null;
  pending?: boolean;
}) {
  if (!seller && !pending) return null;
  return (
    <div className="min-w-0 lg:hidden">
      {seller ? (
        <ProductSellerCard seller={seller} mobileDetail />
      ) : (
        <section
          aria-label="اطلاعات فروشنده"
          aria-busy="true"
          className="space-y-4 rounded-xl bg-white px-2 py-4"
        >
          <span className="sr-only">در حال دریافت اطلاعات فروشنده…</span>
          <div
            aria-hidden="true"
            className="space-y-4 motion-safe:animate-pulse"
          >
            <div className="size-16 rounded-lg bg-neutral-100" />
            <div className="h-4 w-4/5 rounded bg-neutral-200" />
            <div className="h-20 rounded-lg bg-neutral-100" />
          </div>
        </section>
      )}
    </div>
  );
}
