import Image from "next/image";
import { MapPin } from "lucide-react";
import SellerBadges from "../../seller-badges";
import type { ProductDetailSeller } from "../../../types/domain/product-detail-seller.types";
import {
  getSupplierServiceValues,
  getSupplierStats,
  getSupplierMarkets,
} from "./productSupplierDetail.constants";

const serviceLabels: Record<string, string> = {
  "minor customization": "سفارشی‌سازی جزئی",
  "full customization": "سفارشی‌سازی کامل",
  "finished product inspection": "بازرسی محصول نهایی",
};

export default function ProductSellerCard({
  seller,
  mobileDetail = false,
}: {
  seller?: ProductDetailSeller | null;
  mobileDetail?: boolean;
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
  const markets = mobileDetail ? getSupplierMarkets(seller) : [];
  if (
    !name &&
    !seller.logo &&
    !seller.location &&
    !stats.length &&
    !services.length &&
    !markets.length
  )
    return null;
  if (mobileDetail) {
    const mobileStats = stats.filter(({ label }) => label !== "سال تأسیس");
    const yearFounded = overview?.yearFounded?.trim();
    const hasDetails =
      mobileStats.length > 0 || markets.length > 0 || services.length > 0;
    return (
      <section
        dir="rtl"
        aria-label="اطلاعات فروشنده"
        className="min-w-0 rounded-xl bg-white px-2 py-4 font-sans tracking-normal"
      >
        {seller.logo && (
          <div className="relative size-16 overflow-hidden rounded-lg border border-neutral-200">
            <Image
              src={seller.logo}
              alt={name || "لوگوی فروشنده"}
              fill
              sizes="64px"
              className="object-contain p-1"
            />
          </div>
        )}
        {(name || seller.trust.verified || seller.trust.trusted) && (
          <div className="text-mobile-label-m mt-4 flex min-w-0 items-center gap-1.5 text-neutral-900">
            <span className="shrink-0">فروشنده:</span>
            {name && (
              <h2
                dir="auto"
                title={name}
                className="text-primary-600 min-w-0 truncate"
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
        )}
        {(seller.location || yearFounded) && (
          <div className="text-mobile-caption mt-3 flex items-start justify-between gap-3 leading-5 text-neutral-800">
            {seller.location && (
              <p
                dir="ltr"
                title={seller.location}
                className="flex min-w-0 items-center gap-1"
              >
                <MapPin size={14} className="shrink-0" aria-hidden="true" />
                <span className="min-w-0 break-words">{seller.location}</span>
              </p>
            )}
            {yearFounded && (
              <p className="mr-auto shrink-0">
                <span>سال تأسیس: </span>
                <bdi>{yearFounded}</bdi>
              </p>
            )}
          </div>
        )}
        {hasDetails && (
          <div className="mt-3 rounded-lg border border-neutral-200 p-2.5">
            {mobileStats.length > 0 && (
              <dl className="grid grid-cols-[repeat(auto-fit,minmax(60px,1fr))] gap-2">
                {mobileStats.map(({ label, value }) => (
                  <div key={label} className="min-w-0 text-center">
                    <dd
                      dir="auto"
                      className="text-mobile-label-m mb-3 leading-5 text-neutral-900"
                    >
                      {value}
                    </dd>
                    <dt className="text-mobile-caption leading-6 text-neutral-800">
                      {label}
                    </dt>
                  </div>
                ))}
              </dl>
            )}
            {(markets.length > 0 || services.length > 0) && (
              <p
                className={`text-mobile-caption leading-6 text-neutral-900 ${mobileStats.length ? "mt-3 border-t border-neutral-200 pt-3" : ""}`}
              >
                <span className="text-neutral-800">
                  {markets.length ? "بازارهای اصلی: " : "خدمات و کنترل کیفیت: "}
                </span>
                {markets.length
                  ? markets.map(({ name }) => name).join("، ")
                  : services.join("، ")}
              </p>
            )}
          </div>
        )}
      </section>
    );
  }
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
