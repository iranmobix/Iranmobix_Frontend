"use client";
import { useState, type ReactNode } from "react";
import type { ProductDetail } from "../../types/domain/product-detail.types";
import { AddToCartButton } from "@/features/cart";
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
  children?: ReactNode;
  compact?: boolean;
  mobileStack?: boolean;
};
export default function ProductPurchaseForm({
  product,
  isMock = false,
  children,
  compact = false,
  mobileStack = false,
}: Props) {
  const [quantity, setQuantity] = useState(1);
  const [colorId, setColorId] = useState("");
  const [guaranteeId, setGuaranteeId] = useState("");
  const [skuSelection, setSkuSelection] = useState<Record<string, string>>({});
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
  const payload = {
    quantity: selectedQuantity,
    ...(product.price.attributes.length > 0
      ? { sku_attributes: sku.attributes }
      : {}),
    ...(color ? { color: String(color.id) } : {}),
    ...(guarantee ? { guarantee: String(guarantee.id) } : {}),
  };

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
                value={sku.attributes}
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
      {!isMock && !sku.isComplete && (
        <p className="mt-3 text-xs text-neutral-700">
          اطلاعات لازم برای افزودن این محصول کامل نیست.
        </p>
      )}
      <AddToCartButton
        key={JSON.stringify([product.slug, payload])}
        slug={product.slug}
        payload={payload}
        disabled={isMock || unavailable || missingGuarantee || !sku.isComplete}
        className="mt-5 shrink-0"
      />
    </div>
  );
}
