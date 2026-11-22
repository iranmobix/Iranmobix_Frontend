"use client";
import { useState, type ReactNode } from "react";
import type { ProductDetail } from "../../types/domain/product-detail.types";
import { AddToCartButton } from "@/features/cart";
import type { AddToCartShippingMethod } from "@/features/cart/types/api/cart-payload.types";
import ProductWarranty from "./product-warranty";
import ProductQuantity from "./product-quantity";
import ProductColor from "./product-color";
import ProductSkuAttributes from "./product-sku-attributes";
import {
  resolveProductSkuSelection,
  isProductColorAttribute,
} from "../../utils/product-sku-selection";
type Props = {
  product: ProductDetail;
  isMock?: boolean;
  shippingMethod?: AddToCartShippingMethod;
  children?: ReactNode;
  compact?: boolean;
  mobileStack?: boolean;
  renderLayout?: (slots: {
    quantityValue: number;
    quantityEditing: boolean;
    options: ReactNode;
    quantity: ReactNode;
    submit: ReactNode;
    notices: ReactNode;
  }) => ReactNode;
};
export default function ProductPurchaseForm({
  product,
  isMock = false,
  shippingMethod = "ground",
  children,
  compact = false,
  mobileStack = false,
  renderLayout,
}: Props) {
  const [quantity, setQuantity] = useState(1);
  const [colorId, setColorId] = useState("");
  const [guaranteeId, setGuaranteeId] = useState("");
  const [skuSelection, setSkuSelection] = useState<Record<string, string>>({});
  const [quantityEditing, setQuantityEditing] = useState(false);
  const sku = resolveProductSkuSelection(
    product.price.attributes,
    skuSelection,
  );
  // The SKU color occupies the Figma color slot when there is no separate color ID.
  const skuColor =
    product.colors.length === 0
      ? product.price.attributes.find(isProductColorAttribute)
      : undefined;
  const selectSku = (name: string, value: string) =>
    setSkuSelection((previous) => ({ ...previous, [name]: value }));
  const maximum = product.inventory.trackingEnabled
    ? Math.max(0, Math.floor(product.inventory.marketableNumber))
    : Number.MAX_SAFE_INTEGER;
  const unavailable = !product.marketable || maximum < 1;
  const selectedQuantity = unavailable
    ? 0
    : Math.min(Math.max(quantity, 1), maximum);
  const color =
    product.colors.find((color) => String(color.id) === colorId) ??
    product.colors[0];
  const guarantee = product.guarantees.find(
    (item) => String(item.id) === guaranteeId,
  );
  const missingGuarantee = product.guarantees.length > 0 && !guarantee;
  const imported = product.source !== "iranmobix";
  const missingSku = !imported && !sku.isComplete;
  const selectedSku = Object.fromEntries(
    Object.entries(sku.attributes).filter(([name]) =>
      Object.hasOwn(skuSelection, name),
    ),
  );
  const payload = {
    quantity: selectedQuantity,
    ...(imported ? { shipping_method: shippingMethod } : {}),
    ...(imported && Object.keys(selectedSku).length > 0
      ? { sku_attributes: selectedSku }
      : {}),
    ...(color ? { color: String(color.id) } : {}),
    ...(guarantee ? { guarantee: String(guarantee.id) } : {}),
  };

  if (renderLayout) {
    return (
      <>
        {renderLayout({
          quantityValue: selectedQuantity || 1,
          quantityEditing,
          options: (
            <>
              <ProductWarranty
                product={product}
                value={guarantee ? String(guarantee.id) : ""}
                onChange={setGuaranteeId}
              />
              {skuColor ? (
                <ProductSkuAttributes
                  attributes={[skuColor]}
                  value={skuSelection}
                  onChange={selectSku}
                  disabled={unavailable}
                />
              ) : (
                <ProductColor
                  product={product}
                  value={color ? String(color.id) : ""}
                  onChange={setColorId}
                />
              )}
            </>
          ),
          quantity: (
            <ProductQuantity
              value={selectedQuantity}
              onChange={setQuantity}
              onEditingChange={setQuantityEditing}
              maximum={maximum}
              disabled={unavailable}
              stock={
                product.inventory.trackingEnabled
                  ? product.inventory.marketableNumber
                  : null
              }
            />
          ),
          notices: (
            <>
              {isMock && (
                <p className="mt-3 text-xs text-neutral-700">
                  محصول نمونه به سبد واقعی اضافه نمی‌شود.
                </p>
              )}
              {!isMock && missingGuarantee && (
                <p className="mt-3 text-xs text-neutral-700">
                  گارانتی را انتخاب کنید.
                </p>
              )}
              {!isMock && missingSku && (
                <p className="mt-3 text-xs text-neutral-700">
                  اطلاعات لازم برای افزودن این محصول کامل نیست.
                </p>
              )}
            </>
          ),
          submit: (
            <AddToCartButton
              key={JSON.stringify([product.slug, payload])}
              slug={product.slug}
              payload={payload}
              disabled={
                isMock ||
                unavailable ||
                missingGuarantee ||
                missingSku ||
                quantityEditing
              }
              className="h-10 w-full shrink-0"
            />
          ),
        })}
      </>
    );
  }
  return (
    <div className="flex min-w-0 flex-col">
      <div className="min-w-0">
        {children}
        <div className="flex flex-col gap-3">
          <ProductWarranty
            product={product}
            value={guarantee ? String(guarantee.id) : ""}
            onChange={setGuaranteeId}
          />
          <div
            className={
              compact
                ? "grid grid-cols-1 items-start gap-3"
                : mobileStack
                  ? "grid grid-cols-1 items-start gap-5 lg:grid-cols-2 lg:gap-3"
                  : "grid grid-cols-2 items-start gap-3"
            }
          >
            <ProductQuantity
              value={selectedQuantity}
              onChange={setQuantity}
              onEditingChange={setQuantityEditing}
              maximum={maximum}
              disabled={unavailable}
              stock={
                product.inventory.trackingEnabled
                  ? product.inventory.marketableNumber
                  : null
              }
            />
            {skuColor ? (
              <ProductSkuAttributes
                attributes={[skuColor]}
                value={skuSelection}
                onChange={selectSku}
                disabled={unavailable}
              />
            ) : (
              <ProductColor
                product={product}
                value={color ? String(color.id) : ""}
                onChange={setColorId}
              />
            )}
          </div>
        </div>
      </div>
      {isMock && (
        <p className="mt-3 text-xs text-neutral-700">
          محصول نمونه به سبد واقعی اضافه نمی‌شود.
        </p>
      )}
      {!isMock && missingGuarantee && (
        <p className="mt-3 text-xs text-neutral-700">گارانتی را انتخاب کنید.</p>
      )}
      {!isMock && missingSku && (
        <p className="mt-3 text-xs text-neutral-700">
          اطلاعات لازم برای افزودن این محصول کامل نیست.
        </p>
      )}
      <AddToCartButton
        key={JSON.stringify([product.slug, payload])}
        slug={product.slug}
        payload={payload}
        disabled={
          isMock ||
          unavailable ||
          missingGuarantee ||
          missingSku ||
          quantityEditing
        }
        className="mt-5 shrink-0"
      />
    </div>
  );
}
