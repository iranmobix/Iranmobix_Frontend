import { Star } from "lucide-react";
import Image from "next/image";
import type { ProductDetailSeller } from "../../../types/domain/product-detail-seller.types";
import { LocationIcon, VerifiedBadgeIcon } from "./SupplierIcons";

type SupplierIdentityProps = { seller: ProductDetailSeller | null };

const SupplierIdentity = ({ seller }: SupplierIdentityProps) => {
  if (!seller) return null;
  const name = seller.name?.trim();
  const logo = seller.logo?.trim();
  const location = seller.location?.trim();
  const rating = typeof seller.rating === "number" && Number.isFinite(seller.rating)
    && seller.rating >= 0 && seller.rating <= 5 ? seller.rating : null;
  if (!name && !logo && !location && rating === null) return null;

  return (
    <div dir="ltr" className="flex min-w-0 flex-col items-start gap-2 lg:flex-row lg:items-center lg:gap-3">
      {logo && (
        <div className="relative size-14 shrink-0 overflow-hidden rounded-md border border-[#ded9d0] bg-white lg:size-20">
          <Image src={logo} alt={name || "لوگوی فروشنده"} fill sizes="(min-width: 1024px) 80px, 56px" className="object-contain p-1.5" />
        </div>
      )}
      <div className="flex min-w-0 flex-col items-start gap-1.5 lg:gap-2">
        {name && (
          <div className="flex min-w-0 items-center gap-1.5 lg:gap-2">
            <h3 className="min-w-0 break-words text-[11px] leading-5 font-medium text-neutral-900 lg:text-sm">{name}</h3>
            {seller.trust.verified && <span className="[&_svg]:size-3.5 lg:[&_svg]:size-5"><VerifiedBadgeIcon /></span>}
          </div>
        )}
        {location && (
          <p className="flex items-center gap-1 text-[10px] text-neutral-500 lg:text-xs [&_svg]:size-3 lg:[&_svg]:size-3.5">
            <LocationIcon /><span>{location}</span>
          </p>
        )}
        {rating !== null && (
          <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-neutral-500 lg:text-xs">
            <span aria-hidden="true" className="flex gap-0.5">
              {Array.from({ length: 5 }, (_, index) => (
                <span key={index} className="relative size-3 lg:size-3.5">
                  <Star className="size-3 fill-neutral-200 text-neutral-200 lg:size-3.5" />
                  <span className="absolute inset-y-0 left-0 overflow-hidden" style={{width: `${Math.max(0, Math.min(1, rating - index)) * 100}%`}}>
                    <Star className="size-3 fill-[#d3ad26] text-[#d3ad26] lg:size-3.5" />
                  </span>
                </span>
              ))}
            </span>
            <span dir="rtl">امتیاز فروشنده: {rating.toLocaleString("fa-IR")}</span>
          </div>
        )}
      </div>
    </div>
  );
};
export default SupplierIdentity;
