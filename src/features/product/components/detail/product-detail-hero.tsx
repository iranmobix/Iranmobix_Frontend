import type { ReactNode } from "react";
import type { ProductDetailSeller } from "../../types/domain/product-detail-seller.types";
import ProductGalleryColumn from "./product-gallery-column";

export default function ProductDetailHero({
  gallery,
  seller,
  sellerPlaceholder,
  overview,
  purchase,
  mobileOverview = false,
}: {
  gallery: ReactNode;
  seller?: ProductDetailSeller | null;
  sellerPlaceholder?: ReactNode;
  overview: ReactNode;
  purchase: ReactNode;
  mobileOverview?: boolean;
}) {
  return (
    <div
      dir="rtl"
      className="grid grid-cols-1 items-start gap-3 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.15fr)_minmax(280px,1fr)]"
    >
      <ProductGalleryColumn
        gallery={gallery}
        seller={seller}
        sellerPlaceholder={sellerPlaceholder}
      />
      <div
        className={`${mobileOverview ? "block" : "hidden"} min-w-0 lg:col-start-2 lg:row-start-1 lg:block`}
      >
        {overview}
      </div>
      <div className="min-w-0 max-lg:contents lg:sticky lg:top-[calc(var(--header-height,157px)+20px)] lg:col-start-3 lg:row-start-1">
        {purchase}
      </div>
    </div>
  );
}
