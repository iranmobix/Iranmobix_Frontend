import Image from "next/image";
import { getProductDetailsHref } from "../../utils/product-path";
import { openProductDetailsTab } from "../../utils/product-navigation";
import Link from "next/link";
import { ArrowLeft, BadgeCheck, Package, Plus } from "lucide-react";
import type { Product } from "../../types/domain";
import factory from "../../assets/factory.svg";
import sourceLink from "../../assets/link.svg";
import type { MouseEvent } from "react";
import type { ProductDataIssue } from "../../types/domain/product.types";
import ProductCardDataIssues from "./product-card-data-issues";
import { openCardDetails } from "./open-card-details";
export type ProductMobileCurrency = "source" | "IRT" | "IRR";
const money = (value: number | null) =>
  value !== null && Number.isFinite(value)
    ? value.toLocaleString("fa-IR")
    : "—";
export default function ProductMobileCard({
  product,
  currency = "source",
  onDetailsClick,
  detailsHref: customDetailsHref,
  detailsPending = false,
  detailsDisabled = false,
  featured = false,
  discoveryMobile = false,
  dataIssues,
}: {
  product: Product;
  currency?: ProductMobileCurrency;
  onDetailsClick?: () => void;
  detailsHref?: string;
  detailsPending?: boolean;
  detailsDisabled?: boolean;
  featured?: boolean;
  discoveryMobile?: boolean;
  dataIssues?: ProductDataIssue[];
}) {
  const price = product.price;
  const sourceAmount =
    (price.currency === "CNY" ? "¥" : "") +
    money(price.amount) +
    (price.currency && price.currency !== "CNY" ? " " + price.currency : "");
  const toman = price.amountIrr === null ? null : price.amountIrr / 10;
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
      className={`grid w-full gap-3 rounded-lg bg-white p-2 lg:hidden cursor-pointer ${discoveryMobile ? "grid-cols-[96px_minmax(0,1fr)] sm:grid-cols-[112px_minmax(0,1fr)]" : "grid-cols-[72px_minmax(0,1fr)] sm:grid-cols-[96px_minmax(0,1fr)]"} ${featured ? "border border-[#d7b848]" : ""}`}
    >
      <div className="min-w-0">
        <div className="relative aspect-square overflow-hidden rounded-md bg-neutral-100">
          <Link
            href={detailsHref}
          target="_blank"
          rel="noopener noreferrer"
            onClick={openDetails}
            aria-disabled={detailsDisabled || undefined}
            aria-label={"مشاهده " + product.title}
          >
            {product.image ? (
              <Image
                src={product.image}
                alt={product.title}
                fill
                sizes={discoveryMobile ? "(min-width: 640px) 112px, 96px" : "(min-width: 640px) 96px, 72px"}
                className="object-cover"
              />
            ) : (
              <span className="absolute inset-0 flex items-center justify-center">
                <Package size={26} className="text-neutral-400" />
              </span>
            )}
          </Link>
          {product.source.url && (
            <a
              href={product.source.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={
                "سایت مرجع " + (product.source.label || product.source.name)
              }
              className="absolute top-1 right-1 rounded bg-white/70 p-0.5 focus-visible:ring-2 focus-visible:ring-primary-300"
            >
              <Image src={sourceLink} alt="" width={12} height={12} />
            </a>
          )}
        </div>
        {product.colors.length > 0 && (
          <ul
            aria-label="رنگ‌های محصول"
            className="mt-1.5 flex items-center gap-1"
          >
            {product.colors.slice(0, 3).map((color) => (
              <li
                key={color.id}
                aria-label={color.name}
                title={color.name}
                className="size-1.5 rounded-full border border-black/10"
                style={{ backgroundColor: color.value }}
              />
            ))}
            {product.colors.length > 3 && (
              <li aria-label={product.colors.length - 3 + " رنگ دیگر"}>
                <Plus size={10} className="text-neutral-500" />
              </li>
            )}
          </ul>
        )}
      </div>
      <div dir="ltr" className="flex min-w-0 flex-col text-left">
        <Link
          href={detailsHref}
          target="_blank"
          rel="noopener noreferrer"
          onClick={openDetails}
          aria-disabled={detailsDisabled || undefined}
          className="line-clamp-2 text-[10px] leading-4 text-neutral-800 sm:text-xs sm:leading-5"
        >
          {product.title || "—"}
        </Link>
        <p className="mt-1.5 flex flex-wrap items-baseline gap-1 text-[10px] leading-4 text-neutral-900">
          <bdi className="font-semibold">
            {currency === "source"
              ? sourceAmount
              : currency === "IRT"
                ? money(toman) + " تومان"
                : money(price.amountIrr) + " ریال"}
          </bdi>
          {currency === "source" && toman !== null && (
            <bdi dir="rtl" className="text-[9px] text-neutral-700">
              {money(toman)} تومان ≈
            </bdi>
          )}
        </p>
        {product.seller && (
          <p className="mt-1.5 flex items-center gap-1 text-[9px] text-neutral-600">
            <Image src={factory} alt="" width={10} height={10} />
            <bdi className="truncate">{product.seller.name}</bdi>
            {product.seller.badges?.includes("verified") && (
              <BadgeCheck
                size={11}
                className="shrink-0 text-teal-600"
                aria-label="فروشنده تأییدشده"
              />
            )}
          </p>
        )}
        <Link
          href={detailsHref}
          target="_blank"
          rel="noopener noreferrer"
          onClick={openDetails}
          aria-busy={detailsPending || undefined}
          aria-disabled={detailsDisabled || undefined}
          className="mt-auto flex w-fit items-center gap-1 pt-2 text-[10px] text-primary-500"
        >
          <ArrowLeft size={12} aria-hidden="true" />
          {detailsPending ? "در حال دریافت…" : "جزئیات"}
        </Link>
      </div>
      {dataIssues?.length ? (
        <div className="col-span-full min-w-0">
          <ProductCardDataIssues issues={dataIssues} />
        </div>
      ) : null}
    </article>
  );
}
