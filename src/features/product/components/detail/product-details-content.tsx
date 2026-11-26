import type { ReactNode } from "react";
import { Star } from "lucide-react";
import Image from "next/image";
import translationStar from "../../assets/star.svg";
import ProductKeySpecifications from "./product-key-specifications";
import type { ProductDetailSeller } from "../../types/domain/product-detail-seller.types";

export default function ProductDetailsContent({
  title,
  productCode,
  missingProductCodeText = "از بک دریافت نشده",
  translatedByAi = false,
  subtitle,
  seller,
  source,
  pricing,
  options,
  specifications,
  mobileImportLayout = false,
  pending = false,
}: {
  title: string;
  productCode?: string;
  missingProductCodeText?: string;
  translatedByAi?: boolean;
  subtitle?: string;
  seller: ProductDetailSeller | null;
  source?: ReactNode;
  pricing: ReactNode;
  options?: ReactNode;
  specifications: Record<string, string>;
  mobileImportLayout?: boolean;
  pending?: boolean;
}) {
  const rating = seller?.rating;
  const hasRating =
    rating != null && Number.isFinite(rating) && rating >= 0 && rating <= 5;
  return (
    <section
      dir="rtl"
      className="min-w-0 rounded-md bg-white px-2 py-4 lg:p-3.5"
    >
      {translatedByAi && (
        <p className="text-mobile-caption lg:text-desktop-caption mt-1 mb-3 flex items-center gap-1 text-right font-sans">
          <Image
            src={translationStar}
            alt=""
            width={11}
            height={11}
            className="size-[11px] shrink-0"
            aria-hidden="true"
          />
          <span className="from-secondary-600 to-primary-500 bg-linear-to-r bg-clip-text py-1 leading-6 text-transparent">
            ترجمه شده توسط هوش مصنوعی
          </span>
        </p>
      )}
      {pending && !title ? (
        <div
          aria-hidden="true"
          className="h-6 w-4/5 rounded bg-neutral-200 motion-safe:animate-pulse"
        />
      ) : (
        <h1
          dir="auto"
          className="text-mobile-h6 lg:text-desktop-h6 text-neutral-1000 text-start leading-relaxed"
        >
          {title || "اطلاعات عنوان از بک دریافت نشده است"}
        </h1>
      )}
      {subtitle && subtitle !== title && (
        <p
          dir="auto"
          className={`text-mobile-body-s lg:text-desktop-body-s line-clamp-4 text-justify leading-relaxed text-neutral-800 ${mobileImportLayout ? "mt-3 lg:mt-2" : "mt-2"}`}
        >
          {subtitle}
        </p>
      )}
      <div
        className={`text-mobile-caption lg:text-desktop-body-s mt-4 min-w-0 items-center justify-between gap-x-2 lg:gap-x-3 border-b border-neutral-200 pb-4 text-neutral-800 grid grid-cols-[minmax(0,1fr)_auto] gap-y-2 lg:flex lg:flex-wrap lg:gap-y-2`}
      >
        <p
          className="flex min-w-0 items-center gap-1 max-lg:justify-self-start max-lg:rounded-lg max-lg:border max-lg:border-secondary-100 max-lg:px-2 max-lg:py-1"
        >
          <span className="max-lg:text-mobile-body-s shrink-0">کد محصول:</span>
          <bdi className="max-lg:text-mobile-label-m min-w-0 break-words text-neutral-900 max-lg:truncate max-lg:whitespace-nowrap max-lg:break-normal lg:font-medium">
            {productCode?.trim() || missingProductCodeText}
          </bdi>
        </p>
        {hasRating ? (
          <div
            className="flex shrink-0 items-center gap-1.5 max-lg:justify-self-end max-lg:rounded-lg max-lg:border max-lg:border-secondary-100 max-lg:px-2 max-lg:py-1"
            aria-label={`امتیاز فروشنده: ${rating} از ۵`}
          >
            <span>{rating.toLocaleString("fa-IR")}</span>
            <span dir="ltr" aria-hidden="true" className="flex gap-0.5">
              {Array.from({ length: 5 }, (_, index) => (
                <span
                  key={index}
                  className={`relative ${mobileImportLayout ? "size-3.5 lg:size-3" : "size-3"}`}
                >
                  <Star
                    size={12}
                    className={`fill-neutral-200 text-neutral-200 ${mobileImportLayout ? "size-3.5 lg:size-3" : ""}`}
                  />
                  <span
                    className="absolute inset-y-0 left-0 overflow-hidden"
                    style={{
                      width: `${Math.max(0, Math.min(1, rating - index)) * 100}%`,
                    }}
                  >
                    <Star
                      size={12}
                      className={`fill-secondary-500 text-secondary-500 ${mobileImportLayout ? "size-3.5 lg:size-3" : ""}`}
                    />
                  </span>
                </span>
              ))}
            </span>
          </div>
        ) : pending ? (
          <span
            aria-hidden="true"
            className="h-3 w-20 rounded bg-neutral-200 motion-safe:animate-pulse"
          />
        ) : null}
        {mobileImportLayout ? (
          <div className="order-3 hidden lg:contents">{source}</div>
        ) : (
          <div className="hidden lg:contents">{source}</div>
        )}
      </div>
      <div className="py-4">{pricing}</div>
      {options && (
        <div className="space-y-4 border-t border-neutral-200 py-4">
          {options}
        </div>
      )}
      <div className="hidden border-t border-neutral-200 pt-4 lg:block">
        <h2 className="mb-3 text-xs font-medium text-neutral-800">
          مشخصات اصلی
        </h2>
        <ProductKeySpecifications
          specifications={specifications}
          pending={pending}
        />
      </div>
    </section>
  );
}
