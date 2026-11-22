import Image from "next/image";
import SellerBadges from "../seller-badges";
import type { ProductDetailSeller } from "../../types/domain/product-detail-seller.types";

export default function ProductPurchasePreview({
  title,
  image,
  seller,
}: {
  title: string;
  image?: string;
  seller?: ProductDetailSeller | null;
}) {
  return (
    <div className="space-y-4 py-3">
      <div dir="ltr" className="flex items-start gap-3">
        {image && (
          <div className="relative size-12 shrink-0 overflow-hidden rounded-md bg-neutral-100">
            <Image
              src={image}
              alt={title}
              fill
              sizes="48px"
              className="object-contain"
            />
          </div>
        )}
        <p dir="auto" className="min-w-0 text-xs leading-6 text-neutral-900">
          {title}
        </p>
      </div>
      {seller && (
        <div className="flex flex-wrap items-center gap-1 text-[10px] leading-5 text-neutral-500">
          <span className="lg:text-label-md shrink-0 font-sans tracking-normal lg:text-neutral-900">
            فروشنده:
          </span>
          <span dir="auto" className="text-primary-700 min-w-0 break-words">
            {seller.name}
          </span>
          <SellerBadges
            verified={seller.badges?.includes("verified")}
            selected={seller.badges?.includes("iranmobix")}
          />
        </div>
      )}
    </div>
  );
}
