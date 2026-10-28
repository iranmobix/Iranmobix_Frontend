import Link from "next/link";
import { BadgeCheck, Trash2 } from "lucide-react";
import ProductCardMedia from "@/features/product/components/product-card/product-card-media";
import type { ServerCartItem } from "../types/domain/cart.types";
import type { CartItem as CartItemData } from "../types/domain/cart-preview.types";
import { formatCartMoney, getCartItemTotals } from "../utils/cart.utils";
import { getCartItemDataNotes, getCartOptionName } from "../utils/cart-presentation.utils";
import CartQuantity from "./cart-quantity";
import { getCartFieldNote } from "../utils/cart-data-issues";
import { getProductDetailsHref } from "@/features/product/utils/product-path";

type CartItemProps = {
  disabled?: boolean;
  item: CartItemData | ServerCartItem;
  onQuantityChange?: (quantity: number) => void;
  onRemove?: () => void;
};

const CartItem = ({
  item,
  onQuantityChange,
  onRemove,
  disabled = false,
}: CartItemProps) => {
  const serverItem = "catalogId" in item ? item : null;
  const previewItem = "catalogId" in item ? null : item;
  const notes = serverItem ? getCartItemDataNotes(serverItem) : null;
  const product = item.product;
  const title = notes ? notes.title : product.title;
  const accessibleTitle = title || "کالای بدون نام";
  const seller = previewItem?.product.seller;
  const totals = previewItem ? getCartItemTotals(previewItem) : null;
  const currency = serverItem?.currency ?? product.price.currency;
  const total = serverItem?.pricing.finalTotalPrice ?? totals?.subtotal ?? null;
  const hasServerDiscount =
    serverItem && /[1-9]/.test(serverItem.pricing.totalDiscountAmount);
  const canEdit = Boolean(onQuantityChange && onRemove && (!serverItem || (!getCartFieldNote(serverItem.dataIssues,"id") && Number.isSafeInteger(item.quantity))));
  const totalNote = getCartFieldNote(serverItem?.dataIssues,"pricing.final_total_price");
  const color = item.selectedColor?.name.trim() || null;
  const guaranteeLabel = (serverItem ? getCartOptionName(serverItem.selectedOptions.guarantee) : null)
    || (product.guarantee?.available ? product.guarantee.label?.trim() || null : null);
  const controlsNoteId = `cart-controls-${serverItem?.displayId ?? item.id}`;

  return (
    <article className="grid min-w-0 gap-x-2 gap-y-1 py-3 sm:grid-cols-[minmax(0,1fr)_170px] sm:gap-x-4 sm:gap-y-3 sm:py-5">
      <div className="flex min-w-0 items-start gap-3">
        <div className="w-[68px] shrink-0 sm:w-[110px]">
          {product.image ? (
            <ProductCardMedia
              product={{
                image: product.image,
                title: accessibleTitle,
                source: product.source,
              }}
              showColors={false}
              sizes="110px"
            />
          ) : (
            <p className="flex aspect-square items-center justify-center rounded-md bg-neutral-50 p-2 text-center text-[10px] leading-5 text-amber-800">
              از بک نمی‌آید
            </p>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-1 pt-0.5 sm:space-y-1.5 sm:pt-1">
          {title && product.slug ? (
            <Link
              href={getProductDetailsHref(product.slug)}
              className="text-neutral-1000 hover:text-primary-500 block text-[10px] leading-4 font-medium sm:text-xs sm:leading-5"
            >
              <bdi>{title}</bdi>
            </Link>
          ) : (
            <p
              className={
                title
                  ? "text-neutral-1000 text-[10px] leading-4 font-medium sm:text-xs sm:leading-5"
                  : "text-[10px] leading-4 text-amber-800 sm:text-xs sm:leading-5"
              }
            >
              {title || "از بک نمی‌آید"}
            </p>
          )}
          <div className="text-[10px] leading-4 text-neutral-700 sm:text-[11px] sm:leading-5">
            {color && (
              <p className="flex flex-wrap items-center gap-x-1.5">
                {item.selectedColor?.value && (
                  <span
                    aria-hidden="true"
                    style={{ backgroundColor: item.selectedColor.value }}
                    className="size-3 rounded-full border border-neutral-300 sm:size-3.5"
                  />
                )}
                <span>رنگ:</span>
                <bdi>{color}</bdi>
              </p>
            )}
            {guaranteeLabel && (
              <p>
                گارانتی: <span>{guaranteeLabel}</span>
              </p>
            )}
            <p className="flex flex-wrap items-center gap-x-1.5">
              <span>فروشنده:</span>
              <bdi className={!seller ? "text-amber-800" : undefined}>
                {seller?.name || (serverItem ? getCartOptionName(serverItem.product.seller) : null) || "از بک نمی‌آید"}
              </bdi>
              {seller?.badges?.includes("verified") && (
                <BadgeCheck
                  size={16}
                  className="size-3.5 fill-[#009681] text-white sm:size-4"
                  role="img"
                  aria-label="فروشنده تأییدشده"
                />
              )}
            </p>
          </div>
          {serverItem && !getCartFieldNote(serverItem.dataIssues,"availability.is_available") && !serverItem.availability.isAvailable && (
            <p className="text-error text-[11px]">
              این کالا در حال حاضر قابل خرید نیست.
            </p>
          )}
          <div
            className="text-neutral-1000 flex flex-wrap items-center gap-x-1.5 text-[10px] sm:hidden"
            dir="ltr"
          >
            <bdi className="font-semibold">
              {totalNote || formatCartMoney(total, currency)}
            </bdi>
            {totals && totals.discountPercentage > 0 && (
              <>
                <span className="bg-primary-100 text-primary-800 rounded px-1 py-0.5 text-[9px]">
                  {totals.discountPercentage.toLocaleString("fa-IR")}٪
                </span>
                <del className="text-[9px] text-neutral-600">
                  <bdi>
                    {formatCartMoney(totals.originalSubtotal, currency)}
                  </bdi>
                </del>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-row items-center justify-between gap-2 sm:flex-col sm:items-end sm:gap-3">
        <div className="hidden space-y-1 sm:block">
          <div className="flex flex-wrap items-center gap-2" dir="ltr">
            <bdi className="text-neutral-1000 text-base font-semibold">
              {totalNote || formatCartMoney(total, currency)}
            </bdi>
            {totals && totals.discountPercentage > 0 && (
              <>
                <span className="bg-primary-100 text-primary-800 rounded px-1 py-0.5 text-[10px]">
                  {totals.discountPercentage.toLocaleString("fa-IR")}٪
                </span>
                <del className="text-[10px] text-neutral-600">
                  <bdi>
                    {formatCartMoney(totals.originalSubtotal, currency)}
                  </bdi>
                </del>
              </>
            )}
          </div>
          {serverItem &&
            (hasServerDiscount ? (
              <>
                <p className="text-primary-700 text-[10px]">
                  تخفیف:{" "}
                  <bdi>
                    {formatCartMoney(
                      serverItem.pricing.totalDiscountAmount,
                      currency,
                    )}
                  </bdi>
                </p>
              </>
            ) : (
              <p className="text-[10px] text-neutral-600">{getCartFieldNote(serverItem.dataIssues,"pricing.total_discount_amount") || "بدون تخفیف"}</p>
            ))}
          {serverItem && item.quantity > 1 && (
            <p className="text-[10px] text-neutral-700">
              قیمت واحد:{" "}
              <bdi>
                {getCartFieldNote(serverItem.dataIssues,"pricing.final_unit_price") || formatCartMoney(serverItem.pricing.finalUnitPrice, currency)}
              </bdi>
            </p>
          )}
        </div>
        <div className="space-y-1">
          <div dir="ltr" className="flex items-center gap-1.5 sm:gap-3">
            <button
              type="button"
              onClick={canEdit ? onRemove : undefined}
              disabled={!canEdit || disabled}
              aria-describedby={!canEdit ? controlsNoteId : undefined}
              aria-label={`حذف ${accessibleTitle}`}
              className="flex size-6 shrink-0 items-center justify-center rounded-md text-red-500 hover:bg-red-50 focus-visible:ring-2 focus-visible:ring-red-300 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:size-8"
            >
              <Trash2
                size={18}
                aria-hidden="true"
                className="size-4 sm:size-[18px]"
              />
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
              compactMobile
            />
          </div>
          {!canEdit && (
            <p
              id={controlsNoteId}
              className="max-w-44 text-[9px] leading-4 text-amber-800 sm:text-[10px]"
            >
              {serverItem && (!Number.isSafeInteger(item.quantity) || getCartFieldNote(serverItem.dataIssues,"id"))
                ? "شناسه یا تعداد کالا از بک کامل دریافت نشده است" : "ویرایش در حالت نمایش نمونه فعال نیست"}
            </p>
          )}
        </div>
      </div>
      {serverItem && serverItem.issues.length > 0 && (
        <ul className="text-error text-xs leading-6 sm:col-span-2">
          {serverItem.issues.map((issue, index) => (
            <li key={index}>{issue}</li>
          ))}
        </ul>
      )}
    </article>
  );
};
export default CartItem;
