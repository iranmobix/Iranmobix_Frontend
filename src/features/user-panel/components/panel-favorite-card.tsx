import ProductCard from "@/features/product/components/product-card/product-card";
import type { Product } from "@/features/product/types/domain/product.types";
import Image from "next/image";
import {
  ArrowLeft,
  BadgeCheck,
  ExternalLink,
  Package,
  Store,
  Trash2,
} from "lucide-react";
import type { PanelFavorite } from "../types/panel-favorite.types";
import { formatPanelMoney } from "../utils/panel-display.utils";
export default function PanelFavoriteCard({
  product,
  onRemove,
  onDetails,
}: {
  product: PanelFavorite;
  onRemove: () => void;
  onDetails: () => void;
}) {
  const number = (value: string | null): number | null => {
    if (value === null || !value.trim()) return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
  };
  const toman = number(product.priceToman);
  const cardProduct: Product = {
    id: Number(product.id) || 0,
    slug: product.slug,
    title: product.title,
    image: product.image || "",
    source: {
      name: product.sourceUrl.includes("alibaba.com") ? "alibaba" : "source",
      label: "سایت مرجع",
      url: product.sourceUrl,
    },
    colors: product.colors.map((color, index) => ({ ...color, id: index + 1 })),
    price: {
      amount: number(product.priceCny),
      amountIrr: toman === null ? null : toman * 10,
      currency: "CNY",
      hasDiscount: false,
      originalAmount: null,
      discountAmount: null,
      discountPercentage: null,
    },
    seller: {
      id: null,
      name: product.sellerName,
      badges: product.sellerVerified ? ["verified"] : [],
    },
    brand: null,
    guarantee: null,
    inIranMobixInventory: false,
    officialUrl: product.sourceUrl,
    marketable: false,
  };
  return (
    <>
      <div className="relative hidden h-full lg:block">
        <ProductCard
          product={cardProduct}
          variant="bordered"
          onDetailsClick={onDetails}
        />
        <button
          type="button"
          onClick={onRemove}
          aria-label={"حذف " + product.title + " از مورد علاقه‌ها"}
          className="absolute right-2 bottom-2 rounded bg-white p-1 text-red-500 focus-visible:ring-2 focus-visible:ring-red-300"
        >
          <Trash2 size={15} aria-hidden="true" />
        </button>
      </div>
      <article
        className="border-primary-100 flex h-full min-w-0 flex-col rounded-md border p-3 lg:hidden"
        aria-labelledby={"favorite-" + product.id}
      >
        <div className="relative overflow-hidden rounded bg-neutral-100">
          <button
            type="button"
            onClick={onDetails}
            aria-label={"مشاهده جزئیات " + product.title}
            className="focus-visible:ring-primary-500 block aspect-square w-full focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset"
          >
            {product.image ? (
              <Image
                src={product.image}
                alt={product.title}
                width={300}
                height={300}
                className="size-full object-cover"
                unoptimized
              />
            ) : (
              <span className="flex size-full items-center justify-center">
                <span className="flex flex-col items-center gap-1 text-neutral-400">
                  <Package size={40} aria-hidden="true" />
                  <span className="text-[9px]">بدون تصویر از سمت بک‌اند</span>
                </span>
              </span>
            )}
          </button>
          <a
            href={product.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="focus-visible:ring-primary-500 absolute top-2 left-2 flex items-center gap-1 rounded bg-white/90 px-1.5 py-1 text-[10px] text-neutral-800 focus-visible:ring-2"
            aria-label={"سایت مرجع " + product.title}
          >
            <span
              className="font-semibold text-orange-500 italic"
              aria-hidden="true"
            >
              a
            </span>
            سایت مرجع
            <ExternalLink size={10} aria-hidden="true" />
          </a>
          {product.colors.length > 0 && (
            <ul
              aria-label="رنگ‌های محصول"
              className="absolute top-2 right-2 flex flex-col gap-1"
            >
              {product.colors.map((color) => (
                <li
                  key={color.name}
                  title={color.name}
                  aria-label={color.name}
                  className="size-2.5 rounded-full border border-neutral-300"
                  style={{ backgroundColor: color.value }}
                />
              ))}
            </ul>
          )}
        </div>
        <h2
          id={"favorite-" + product.id}
          dir="ltr"
          className="mt-3 min-h-10 text-left text-xs leading-5 font-normal text-neutral-900"
        >
          <button
            type="button"
            onClick={onDetails}
            className="focus-visible:ring-primary-300 text-left focus-visible:ring-2"
          >
            {product.title}
          </button>
        </h2>
        <p
          dir="ltr"
          className="mt-2 flex flex-wrap items-baseline gap-1 text-left text-xs leading-5 text-neutral-900"
        >
          <bdi className="font-semibold">
            {product.priceCny
              ? `¥${formatPanelMoney(product.priceCny, "")}`
              : "بدون مقدار از سمت بک‌اند"}
          </bdi>
          {product.priceToman !== null && (
            <bdi dir="rtl" className="text-[10px] text-neutral-600">
              ≈ {formatPanelMoney(product.priceToman, "IRT")}
            </bdi>
          )}
        </p>
        <p
          dir="ltr"
          className="mt-1 flex items-center gap-1 text-[10px] leading-5 text-neutral-600"
        >
          <Store size={12} aria-hidden="true" />
          <bdi className="truncate">{product.sellerName}</bdi>
          {product.sellerVerified && (
            <BadgeCheck
              size={14}
              className="shrink-0 text-teal-600"
              aria-label="فروشنده تأییدشده"
            />
          )}
        </p>
        <div
          dir="ltr"
          className="mt-auto flex items-center justify-between pt-3"
        >
          <button
            type="button"
            onClick={onDetails}
            className="text-primary-500 focus-visible:ring-primary-300 flex items-center gap-1 rounded text-xs focus-visible:ring-2"
          >
            <ArrowLeft size={14} aria-hidden="true" />
            جزئیات
          </button>
          <button
            type="button"
            onClick={onRemove}
            aria-label={"حذف " + product.title + " از مورد علاقه‌ها"}
            className="rounded p-1 text-red-500 focus-visible:ring-2 focus-visible:ring-red-300"
          >
            <Trash2 size={15} aria-hidden="true" />
          </button>
        </div>
      </article>
    </>
  );
}
