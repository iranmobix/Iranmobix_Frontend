import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Package } from "lucide-react";
import type { MouseEvent } from "react";
import { useProductDisplayCurrency } from "../product-display-currency";
import { getDisplaySourcePrice, getDisplayTomanPrice, type ProductDisplayCurrency } from "../../utils/product-display-price";
import { getProductDetailsHref } from "../../utils/product-path";
import { openProductDetailsTab } from "../../utils/product-navigation";
import type { Product } from "../../types/domain";
import type { ProductRelatedProduct } from "../../types/domain/product-detail.types";
import type { ProductDataIssue } from "../../types/domain/product.types";
import factory from "../../assets/factory.svg";
import verified from "../../assets/seller-verified.svg";
import sourceLink from "../../assets/link.svg";
import alibaba from "../../assets/alibaba.svg";
import iranFlag from "../../assets/iran.svg";
import chinaFlag from "../../assets/china.svg";
import { isAlibabaSource } from "../../utils/is-alibaba-source";
import ProductCardDataIssues from "./product-card-data-issues";
import { openCardDetails } from "./open-card-details";

export type ProductMobileCurrency = ProductDisplayCurrency;
const money = (value: number) => value.toLocaleString("fa-IR", { maximumFractionDigits: 0 });
const sourceMoney = (value: number | null, currency: string) => {
  if (value === null) return "—";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency", currency, currencyDisplay: "narrowSymbol", maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return value.toLocaleString("en-US") + " " + currency;
  }
};

export default function ProductMobileCard({
  product,
  currency = "source",
  onDetailsClick,
  detailsHref: customDetailsHref,
  detailsPending = false,
  detailsDisabled = false,
  featured = false,
  bordered = false,
  dataIssues,
}: {
  product: Product | ProductRelatedProduct;
  currency?: ProductMobileCurrency;
  onDetailsClick?: () => void;
  detailsHref?: string;
  detailsPending?: boolean;
  detailsDisabled?: boolean;
  featured?: boolean;
  bordered?: boolean;
  discoveryMobile?: boolean;
  dataIssues?: ProductDataIssue[];
}) {
  const rawPrice = product.price;
  const price = "finalAmountToman" in rawPrice ? {
    amount: rawPrice.finalAmount,
    currency: rawPrice.currency,
    amountIrr: rawPrice.finalAmountToman * 10,
    finalPriceIranToman: null,
    hasDiscount: rawPrice.hasDiscount,
    discountPercentage: rawPrice.discountPercentage,
  } : rawPrice;
  const { rates, liveConversion } = useProductDisplayCurrency();
  const displayPrice = getDisplaySourcePrice(price.amount, price.currency, currency, rates);
  const backendToman = price.amountIrr === null ? null : price.amountIrr / 10;
  const toman = liveConversion ? getDisplayTomanPrice(price.amount, price.currency, rates, backendToman) : backendToman;
  const iranPrice = price.finalPriceIranToman;
  const hasIranPrice = iranPrice != null && Number.isFinite(iranPrice) && iranPrice >= 0;
  const hasDiscount = price.hasDiscount && price.discountPercentage != null && price.discountPercentage > 0;
  const detailsHref = customDetailsHref ?? (onDetailsClick ? "#" : getProductDetailsHref(product.slug));
  const openCard = onDetailsClick ?? (() => openProductDetailsTab(detailsHref));
  const openDetails = onDetailsClick ? (event: MouseEvent<HTMLAnchorElement>) => {
    if (!customDetailsHref || detailsDisabled) {
      event.preventDefault();
      if (!detailsDisabled) onDetailsClick();
    }
  } : undefined;

  return (
    <article
      dir="rtl"
      onClick={(event) => openCardDetails(event, openCard, detailsDisabled)}
      className={`flex h-full w-full min-w-0 cursor-pointer flex-col justify-between gap-2 rounded-lg bg-white p-2 lg:hidden ${featured ? "border border-secondary-500" : bordered ? "border border-primary-50" : ""}`}
    >
      <div className="relative aspect-square w-full shrink-0 overflow-hidden rounded-md bg-neutral-100">
        <Link href={detailsHref} target="_blank" rel="noopener noreferrer" onClick={openDetails} className="absolute inset-0" aria-disabled={detailsDisabled || undefined} aria-label={"مشاهده " + product.title}>
          {product.image ? (
            <Image src={product.image} alt={product.title} fill sizes="(min-width: 1024px) 240px, (min-width: 640px) 45vw, 46vw" className="object-cover" />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center"><Package size={32} className="text-neutral-400" /></span>
          )}
        </Link>
        <div dir="ltr" className="absolute top-1.5 left-1.5 flex max-w-[calc(100%-12px)] items-center gap-1">
          {product.source.url && (
            <a href={product.source.url} target="_blank" rel="noopener noreferrer" aria-label={"سایت مرجع " + (product.source.label || product.source.name)} className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-white/80 focus-visible:ring-2 focus-visible:ring-primary-300">
              <Image src={isAlibabaSource(product.source.name, product.source.url) ? alibaba : sourceLink} alt="" width={20} height={20} className="size-5 object-contain" />
            </a>
          )}
          {hasDiscount && (
            <span dir="rtl" className="text-mobile-caption rounded-lg bg-secondary-300 px-1.5 py-1.5 text-white">
              {price.discountPercentage?.toLocaleString("fa-IR")}٪ تخفیف
            </span>
          )}
        </div>
      </div>

      <Link href={detailsHref} target="_blank" rel="noopener noreferrer" onClick={openDetails} aria-disabled={detailsDisabled || undefined} className="text-mobile-caption line-clamp-2 text-right leading-5 text-neutral-900">
        {product.title || "—"}
      </Link>

      <div className="flex min-w-0 flex-col gap-2">
        <p dir="ltr" className="text-[10px] flex min-w-0 flex-wrap items-center gap-1 leading-5 text-neutral-800">
          <Image src={chinaFlag} alt="چین" width={14} height={14} className="size-3.5 shrink-0 rounded-full object-cover" />
          <bdi>{sourceMoney(displayPrice.amount, displayPrice.currency)}</bdi>
          {toman !== null && <><span>≈</span><bdi dir="rtl">{money(toman)} تومان</bdi></>}
        </p>
        {hasIranPrice && (
          <p dir="ltr" className="text-mobile-label-m flex min-w-0 flex-wrap items-center gap-1 leading-6 text-neutral-1000">
            <Image src={iranFlag} alt="قیمت در ایران" width={14} height={14} className="size-3.5 shrink-0 rounded-full object-cover" />
            <bdi dir="rtl">{money(iranPrice)} تومان</bdi>
          </p>
        )}
        {product.seller?.name && (
          <p dir="ltr" className="text-mobile-caption flex min-w-0 items-center gap-1 leading-5 text-neutral-800">
            <Image src={factory} alt="" width={12} height={12} className="shrink-0" />
            <bdi title={product.seller.name} className="min-w-0 truncate">{product.seller.name}</bdi>
            {product.seller.badges?.includes("verified") && <Image src={verified} alt="فروشنده تأییدشده" width={16} height={16} className="size-4 shrink-0" />}
          </p>
        )}
      </div>

      <Link href={detailsHref} target="_blank" rel="noopener noreferrer" onClick={openDetails} aria-busy={detailsPending || undefined} aria-disabled={detailsDisabled || undefined} dir="ltr" className="text-mobile-caption flex w-fit items-center gap-1 self-end text-primary-600">
        <ArrowLeft size={12} className="shrink-0 text-primary-600" aria-hidden="true" />
        {detailsPending ? "در حال دریافت…" : "جزئیات"}
      </Link>
      {dataIssues?.length ? <ProductCardDataIssues issues={dataIssues} /> : null}
    </article>
  );
}
