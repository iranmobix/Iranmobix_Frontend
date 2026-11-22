import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Trash2 } from "lucide-react";
import alibaba from "@/features/product/assets/alibaba.svg";
import type { ServerCartItem } from "../types/domain/cart.types";
import type { CartItem as CartItemData } from "../types/domain/cart-preview.types";
import { formatCartMoney } from "../utils/cart.utils";
import { getCartOptionName } from "../utils/cart-presentation.utils";
import { getCartFieldNote } from "../utils/cart-data-issues";
import {
  cartShippingLabels,
  cartTomanFromRial,
  getCartChinaPrice,
  getCartDiscountPresentation,
} from "../utils/cart-item-presentation";
import { getProductDetailsHref } from "@/features/product/utils/product-path";
import CartQuantity from "./cart-quantity";

type CartItemProps = {
  disabled?: boolean;
  item: CartItemData | ServerCartItem;
  onQuantityChange?: (quantity: number) => void;
  onRemove?: () => void;
};

const priceText = (value: string | number | null) =>
  value == null || value === ""
    ? "از بک نمی‌آید"
    : formatCartMoney(value, "").trim();

export default function CartItem({
  item,
  onQuantityChange,
  onRemove,
  disabled = false,
}: CartItemProps) {
  const serverItem = "catalogId" in item ? item : null;
  const previewItem = "catalogId" in item ? null : item;
  const product = item.product;
  const title = serverItem?.product.shortTitle?.trim() || product.title?.trim();
  const accessibleTitle = title || "کالای بدون نام";
  const seller = product.seller;
  const sellerName = getCartOptionName(seller);
  const sellerVerified = Boolean(
    seller &&
    typeof seller === "object" &&
    "badges" in seller &&
    Array.isArray(seller.badges) &&
    seller.badges.includes("verified"),
  );
  const chinaCny = serverItem
    ? getCartChinaPrice(serverItem)
    : product.price.currency === "CNY"
      ? product.price.amount
      : null;
  const chinaToman = serverItem
    ? (serverItem.chinaPriceToman ??
      cartTomanFromRial(
        serverItem.pricing.finalUnitPriceIrr ??
          serverItem.product.price.amountIrr,
      ))
    : null;
  const discount = serverItem
    ? getCartDiscountPresentation(serverItem, chinaToman)
    : null;
  const deliveryToman = serverItem?.deliveryPriceToman ?? null;
  const shippingLabel = serverItem?.shippingMethod
    ? cartShippingLabels[serverItem.shippingMethod]
    : null;
  const canEdit = Boolean(
    onQuantityChange &&
    onRemove &&
    (!serverItem ||
      (!getCartFieldNote(serverItem.dataIssues, "id") &&
        Number.isSafeInteger(item.quantity))),
  );
  const guarantee =
    (serverItem
      ? getCartOptionName(serverItem.selectedOptions.guarantee)
      : null) ||
    (product.guarantee?.available ? product.guarantee.label?.trim() : null);
  const color = item.selectedColor?.name.trim();
  const controlsNoteId = "cart-controls-" + (serverItem?.displayId ?? item.id);
  const sourceUrl =
    product.source.url || ("officialUrl" in product ? product.officialUrl : "");

  return (
    <article className="grid min-w-0 gap-4 py-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,34%)] lg:gap-x-6 lg:py-4">
      <div className="flex min-w-0 items-start gap-3 lg:gap-4">
        <div className="relative aspect-square w-20 shrink-0 overflow-hidden rounded-lg bg-neutral-100 lg:w-[164px]">
          {product.image ? (
            <Image
              src={product.image}
              alt={accessibleTitle}
              fill
              sizes="(min-width: 1024px) 164px, 80px"
              className="object-cover"
            />
          ) : (
            <span className="text-mobile-caption flex h-full items-center justify-center text-neutral-700">
              از بک نمی‌آید
            </span>
          )}
          {product.source.name === "alibaba" && sourceUrl && (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="مشاهده در علی‌بابا"
              className="absolute top-1 left-1 flex size-7 items-center justify-center rounded-lg border border-white/60 bg-white/45 backdrop-blur-sm lg:size-8"
            >
              <Image
                src={alibaba}
                alt=""
                width={24}
                height={24}
                className="size-5 lg:size-6"
              />
            </a>
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-3 pt-1 lg:min-h-[164px] lg:max-w-[360px] lg:justify-between lg:gap-3 lg:pt-0">
          {title && product.slug ? (
            <Link
              href={getProductDetailsHref(product.slug)}
              className="text-mobile-label-m lg:text-desktop-label-l lg:text-neutral-1000 hover:text-primary-500 text-right leading-relaxed text-neutral-900"
            >
              {title}
            </Link>
          ) : (
            <p className="text-mobile-label-m lg:text-desktop-label-l lg:text-neutral-1000 text-right leading-relaxed text-neutral-900">
              {title || "از بک نمی‌آید"}
            </p>
          )}
          <p className="text-mobile-body-s lg:text-desktop-body-s flex min-w-0 items-center gap-1 text-neutral-900 [&>span]:shrink-0">
            <span>فروشنده:</span>
            <bdi
              title={sellerName || undefined}
              className="text-primary-500 min-w-0 truncate"
            >
              {sellerName || "از بک نمی‌آید"}
            </bdi>
            {sellerVerified && (
              <BadgeCheck
                size={20}
                className="fill-success shrink-0 text-white"
                aria-label="فروشنده تأییدشده"
                role="img"
              />
            )}
          </p>
          {(color || guarantee) && (
            <p className="text-mobile-caption flex flex-wrap gap-x-3 text-neutral-800">
              {color && <span>رنگ: {color}</span>}
              {guarantee && <span>گارانتی: {guarantee}</span>}
            </p>
          )}
          {shippingLabel && (
            <p className="text-mobile-body-s lg:text-desktop-body-s mt-auto text-neutral-800 lg:mt-0 lg:text-neutral-900">
              روش حمل: {shippingLabel}
            </p>
          )}
          {serverItem &&
            !getCartFieldNote(
              serverItem.dataIssues,
              "availability.is_available",
            ) &&
            !serverItem.availability.isAvailable && (
              <p className="text-mobile-caption text-error">
                این کالا در حال حاضر قابل خرید نیست.
              </p>
            )}
        </div>
      </div>
      <div className="flex min-w-0 flex-col items-start justify-between gap-5 lg:min-h-[164px] lg:items-end lg:py-0.5">
        <dl className={`text-mobile-body-s lg:text-desktop-body-s flex w-full flex-col gap-4 text-neutral-800 ${discount ? "lg:gap-8" : "lg:gap-12"}`}>
          <div className="flex flex-col gap-3">
            {discount && (
              <div dir="ltr" className="flex items-center gap-2">
                <span className="bg-primary-100 text-neutral-1000 text-mobile-body-s lg:text-desktop-body-s shrink-0 rounded-md px-1 py-1">
                  {discount.percentage}%
                </span>
                <del className="text-mobile-caption lg:text-desktop-caption text-neutral-700 decoration-neutral-700">
                  {discount.originalToman !== null && (
                    <span>{priceText(discount.originalToman)} تومان</span>
                  )}
                  {discount.originalCny !== null && (
                    <bdi dir="ltr">{"¥" + priceText(discount.originalCny)}</bdi>
                  )}
                </del>
              </div>
            )}
            <div className="flex flex-wrap items-baseline gap-1 lg:justify-end">
              <dt>قیمت در چین:</dt>
              <dd className="text-mobile-label-m lg:text-desktop-label-l inline-flex flex-wrap items-baseline gap-1 text-neutral-800">
                {chinaToman !== null && (
                  <span>{priceText(chinaToman)} تومان</span>
                )}
                {chinaToman !== null && chinaCny !== null && <span>≈</span>}
                <bdi dir="ltr">
                  {chinaCny === null
                    ? "از بک نمی‌آید"
                    : "¥" + priceText(chinaCny)}
                </bdi>
              </dd>
            </div>
          </div>
          <div className="flex flex-wrap items-baseline gap-1 lg:justify-end">
            <dt>قیمت تحویل در ایران:</dt>
            <dd className="text-mobile-label-l lg:text-desktop-h6 text-neutral-900">
              {priceText(deliveryToman)}
              {deliveryToman !== null && " تومان"}
            </dd>
          </div>
        </dl>
        <div className="self-end">
          <div
            dir="ltr"
            className="flex items-center gap-4 lg:gap-3 lg:[&_input]:h-[34px] lg:[&_input]:w-14"
          >
            <button
              type="button"
              onClick={canEdit ? onRemove : undefined}
              disabled={!canEdit || disabled}
              aria-describedby={!canEdit ? controlsNoteId : undefined}
              aria-label={"حذف " + accessibleTitle}
              className="text-error hover:bg-error/5 focus-visible:ring-error flex size-8 shrink-0 items-center justify-center rounded-md focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 size={20} aria-hidden="true" />
            </button>
            <CartQuantity
              value={item.quantity}
              min={previewItem?.minQuantity ?? 1}
              max={
                previewItem?.maxQuantity ??
                (serverItem?.pricing.inventoryTrackingEnabled
                  ? (serverItem.availability.availableQuantity ??
                    Number.MAX_SAFE_INTEGER)
                  : Number.MAX_SAFE_INTEGER)
              }
              productTitle={accessibleTitle}
              onChange={canEdit ? onQuantityChange : undefined}
              disabled={!canEdit || disabled}
              describedBy={!canEdit ? controlsNoteId : undefined}
            />
          </div>
          {!canEdit && (
            <p
              id={controlsNoteId}
              className="text-mobile-caption mt-1 max-w-56 leading-relaxed text-neutral-700"
            >
              {serverItem &&
              (!Number.isSafeInteger(item.quantity) ||
                getCartFieldNote(serverItem.dataIssues, "id"))
                ? "اطلاعات لازم برای ویرایش این ردیف دریافت نشده است."
                : "ویرایش در حالت نمایش نمونه فعال نیست"}
            </p>
          )}
        </div>
      </div>
      {serverItem && serverItem.issues.length > 0 && (
        <ul className="text-mobile-caption text-error space-y-1 leading-relaxed lg:col-span-2">
          {serverItem.issues.map((issue, index) => (
            <li key={index}>{issue}</li>
          ))}
        </ul>
      )}
    </article>
  );
}
