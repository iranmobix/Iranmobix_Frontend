import Image from "next/image";
import { MapPin } from "lucide-react";
import SellerBadges from "../../seller-badges";
import type { ProductDetailSeller } from "../../../types/domain/product-detail-seller.types";
import {
  getSupplierServiceValues,
  getSupplierStats,
} from "./productSupplierDetail.constants";

const serviceLabels: Record<string, string> = {
  "minor customization": "سفارشی‌سازی جزئی",
  "full customization": "سفارشی‌سازی کامل",
  "finished product inspection": "بازرسی محصول نهایی",
};

export default function ProductSellerCard({
  seller,
}: {
  seller?: ProductDetailSeller | null;
}) {
  if (!seller) return null;
  const name = seller.name.trim();
  const overview = seller.companyOverview;
  const rating =
    seller.rating !== null &&
    Number.isFinite(seller.rating) &&
    seller.rating >= 0 &&
    seller.rating <= 5
      ? seller.rating
      : null;
  const preferred = ["مدت زمان پاسخگویی", "نرخ ارسال به موقع", "سال تأسیس"];
  const available = getSupplierStats(overview);
  const stats = [
    ...(rating !== null
      ? [
          {
            label: "امتیاز فروشنده",
            value: `${rating.toLocaleString("fa-IR")} / ۵`,
          },
        ]
      : []),
    ...preferred.flatMap((label) =>
      available.filter((item) => item.label === label),
    ),
  ];
  const services = getSupplierServiceValues(seller).map(
    (service) => serviceLabels[service.trim().toLowerCase()] || service,
  );
  if (
    !name &&
    !seller.logo &&
    !seller.location &&
    !stats.length &&
    !services.length
  )
    return null;
  return (
    <section
      dir="rtl"
      aria-label="خلاصه اطلاعات فروشنده"
      className="mt-3 min-w-0 rounded-md border border-neutral-200 bg-white p-2.5 font-sans tracking-normal"
    >
      <div className="flex min-w-0 items-center gap-2">
        <div className="min-w-0 flex-1">
          <div className="text-label-md flex min-w-0 items-center gap-1">
            <span className="text-label-md shrink-0 text-neutral-900">
              فروشنده:
            </span>
            {name && (
              <h2
                dir="auto"
                className="text-label-md text-primary-600 min-w-0 truncate"
                title={name}
              >
                {seller.officialUrl ? (
                  <a
                    href={seller.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {name}
                  </a>
                ) : (
                  name
                )}
              </h2>
            )}
            <SellerBadges
              verified={seller.trust.verified}
              selected={seller.trust.trusted}
            />
          </div>
          {seller.location && (
            <p
              dir="ltr"
              className="text-caption mt-1 flex items-center justify-end gap-1 text-neutral-500"
            >
              <MapPin size={11} className="shrink-0" aria-hidden="true" />
              <span className="truncate">{seller.location}</span>
            </p>
          )}
        </div>
        {seller.logo && (
          <div className="relative size-11 shrink-0 overflow-hidden rounded-md border border-neutral-200">
            <Image
              src={seller.logo}
              alt={name || "لوگوی فروشنده"}
              fill
              sizes="44px"
              className="object-contain p-1"
            />
          </div>
        )}
      </div>
      {stats.length > 0 && (
        <dl className="mt-2 grid grid-cols-[repeat(auto-fit,minmax(60px,1fr))] gap-1 rounded-md border border-neutral-200 px-1 py-2">
          {stats.map(({ label, value }) => (
            <div key={label} className="text-caption min-w-0 text-center">
              <dd dir="auto" className="text-label-md mb-1 text-neutral-900">
                {value}
              </dd>
              <dt className="text-neutral-500">{label}</dt>
            </div>
          ))}
        </dl>
      )}
      {services.length > 0 && (
        <p className="text-caption mt-2 border-t border-neutral-200 pt-2 text-neutral-600">
          <span className="text-neutral-800">خدمات و کنترل کیفیت: </span>
          {services.join("، ")}
        </p>
      )}
    </section>
  );
}
