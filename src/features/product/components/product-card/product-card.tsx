import ProductMobileCard, {
  type ProductMobileCurrency,
} from "./product-mobile-card";
import Image from "next/image";
import type { Product } from "../../types/domain";
import type { ProductRelatedProduct } from "../../types/domain/product-detail.types";
import ProductCardMedia from "./product-card-media";
import factory from "../../assets/factory.svg";
import arrowLeft from "../../assets/arrowLeft.svg";
import Link from "next/link";
import ProductCardDataIssues from "./product-card-data-issues";
import type { ProductDataIssue } from "../../types/domain/product.types";
import { openCardDetails } from "./open-card-details";
import { getProductDetailsHref } from "../../utils/product-path";
import { openProductDetailsTab } from "../../utils/product-navigation";

type ProductCardVariant = "default" | "bordered" | "featured";

type ProductCardProps = {
  product: Product | ProductRelatedProduct;
  variant?: ProductCardVariant;
  mobileLayout?: boolean;
  discoveryMobile?: boolean;
  mobileCurrency?: ProductMobileCurrency;
  compactMobile?: boolean;
  onDetailsClick?: () => void;
  detailsHref?: string;
  detailsPending?: boolean;
  detailsDisabled?: boolean;
  dataIssues?: ProductDataIssue[];
};

const ProductCard = ({
  product,
  variant = "default",
  mobileLayout = false,
  discoveryMobile = false,
  mobileCurrency = "source",
  compactMobile = false,
  onDetailsClick,
  detailsHref,
  detailsPending = false,
  detailsDisabled = false,
  dataIssues,
}: ProductCardProps) => {
  const href = detailsHref ?? getProductDetailsHref(product.slug);
  const openDetails = onDetailsClick ?? (() => openProductDetailsTab(href));
  const { price, seller } = product;
  const isDetailPrice = "finalAmountToman" in price;
  const amount = isDetailPrice ? price.finalAmount : price.amount;
  const amountToman = isDetailPrice
    ? price.finalAmountToman
    : price.amountIrr === null
      ? null
      : price.amountIrr / 10;

  return (
    <>
      {mobileLayout && "id" in product && (
        <ProductMobileCard
          product={product}
          discoveryMobile={discoveryMobile}
          currency={mobileCurrency}
          onDetailsClick={onDetailsClick}
          detailsHref={detailsHref}
          detailsPending={detailsPending}
          detailsDisabled={detailsDisabled}
          featured={variant === "featured"}
          dataIssues={dataIssues}
        />
      )}
      <article
        onClick={(event) => openCardDetails(event, openDetails, detailsDisabled)}
        className={`${mobileLayout ? "hidden lg:flex" : "flex"} cursor-pointer h-full w-full flex-col overflow-hidden rounded-md bg-white ${compactMobile ? "p-1.5 lg:p-4" : "p-4"} transition-shadow duration-300 hover:shadow-[0px_2px_8px_4px_rgba(0,0,0,0.08)] ${
          variant === "featured"
            ? "border border-[#d7b848]"
            : variant === "bordered"
              ? "border-primary-100 border"
              : ""
        }`}
      >
        <ProductCardMedia product={product} compactMobile={compactMobile} />

        {/* Content */}
        <Link
          href={onDetailsClick && !detailsHref ? "#" : href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onDetailsClick ? (event) => {
            if (!detailsHref || detailsDisabled) {
              event.preventDefault();
              if (!detailsDisabled) onDetailsClick();
            }
          } : undefined}
          aria-busy={detailsPending || undefined}
          aria-disabled={detailsDisabled || undefined}
          className="flex flex-1 flex-col pt-2"
        >
          {/* Title */}
          <h3
            className={
              compactMobile
                ? "lg:text-body-md line-clamp-2 min-h-8 text-[9px] leading-4 lg:min-h-[48px]"
                : "text-body-md line-clamp-2 min-h-[48px]"
            }
          >
            {product.title || "—"}
          </h3>

          {/* Price */}
          {/* Price */}
          <div
            className={
              compactMobile
                ? "mt-1 flex min-h-8 flex-col items-end lg:mt-2 lg:min-h-[52px]"
                : "mt-2 flex min-h-[52px] flex-col items-end"
            }
          >
            <div
              className={`flex items-center gap-2 ${
                !price.hasDiscount
                  ? compactMobile
                    ? "hidden lg:invisible lg:flex"
                    : "invisible"
                  : ""
              }`}
            >
              <span className="text-caption bg-primary-400 rounded-md px-1 text-white">
                {price.discountPercentage?.toLocaleString("fa-IR") ?? "—"}٪
              </span>

              <span className="text-caption flex items-center text-neutral-700 line-through">
                <span>
                  {price.originalAmount?.toLocaleString("fa-IR") ?? "—"}
                </span>{" "}
                {price.currency || "—"}
              </span>
            </div>

            <div
              className={
                compactMobile
                  ? "flex flex-wrap items-center gap-1 lg:flex-nowrap lg:gap-2"
                  : "flex items-center gap-2"
              }
            >
              {/* قیمت به تومان */}
              <div
                className={
                  compactMobile
                    ? "lg:text-body-md flex items-center gap-0.5 text-[8px] text-neutral-600 lg:gap-1"
                    : "text-body-md flex items-center gap-1 text-neutral-600"
                }
              >
                <span>{amountToman?.toLocaleString("fa-IR") ?? "—"}</span>
                <span>تومان</span>
                <span>≈</span>
              </div>

              {/* قیمت به یوان */}
              <div className="flex items-center">
                <p
                  className={
                    compactMobile
                      ? "text-neutral-1000 lg:text-body-lg text-[10px]"
                      : "text-body-lg text-neutral-1000"
                  }
                >
                  {amount?.toLocaleString("fa-IR") ?? "—"}
                </p>
                <span
                  className={
                    compactMobile
                      ? "text-neutral-1000 lg:text-body-lg text-[10px]"
                      : "text-body-lg text-neutral-1000"
                  }
                >
                  {price.currency || "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Seller */}
          {seller && (
            <div
              className={
                compactMobile
                  ? "my-1.5 flex min-h-5 w-full items-center justify-end gap-0.5 lg:my-3 lg:min-h-[32px] lg:gap-1"
                  : "my-3 flex min-h-[32px] w-full items-center justify-end gap-1"
              }
            >
              <div className="shrink-0">
                <span
                  className={
                    compactMobile
                      ? "rounded-md bg-gray-100 px-1 py-0.5 text-[8px] text-gray-600 lg:px-2 lg:py-1 lg:text-[10px]"
                      : "rounded-md bg-gray-100 px-2 py-1 text-[10px] text-gray-600"
                  }
                >
                  {seller.badges?.join("، ") || "—"}
                </span>
              </div>

              <span
                className={
                  compactMobile
                    ? "min-w-0 flex-1 truncate text-left text-[9px] text-gray-500 lg:text-sm"
                    : "min-w-0 flex-1 truncate text-left text-sm text-gray-500"
                }
              >
                {seller.name || "—"}
              </span>

              <Image
                src={factory}
                alt="factory"
                width={20}
                height={20}
                className={
                  compactMobile ? "size-3 shrink-0 lg:size-5" : "shrink-0"
                }
              />
            </div>
          )}

          {!seller && (
            <p
              className={
                compactMobile
                  ? "my-1.5 text-[9px] text-neutral-500 lg:my-3 lg:text-sm"
                  : "my-3 text-sm text-neutral-500"
              }
            >
              فروشنده: —
            </p>
          )}
          {/* Details */}
          <div
            className={
              compactMobile
                ? "text-primary-700 hover:border-primary-300 hover:text-primary-300 lg:text-label-md mt-auto flex items-center justify-end gap-1 rounded-md px-1 py-1 text-[10px] transition-colors duration-200 lg:px-2 lg:py-2"
                : "text-label-md text-primary-700 hover:border-primary-300 hover:text-primary-300 mt-auto flex items-center justify-end gap-1 rounded-md px-2 py-2 transition-colors duration-200"
            }
          >
            {detailsPending ? "در حال دریافت…" : "جزئیات"}
            <Image
              src={arrowLeft}
              alt=""
              width={20}
              height={20}
              className={
                compactMobile ? "size-3 shrink-0 lg:size-5" : "shrink-0"
              }
            />
          </div>
        </Link>
        <ProductCardDataIssues issues={dataIssues} />
      </article>
    </>
  );
};

export default ProductCard;
