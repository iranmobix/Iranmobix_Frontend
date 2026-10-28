"use client";

import { ChevronDown } from "lucide-react";
import type { ProductMobileCurrency } from "./product-card/product-mobile-card";
import Image from "next/image";
import type { ProductSortApi } from "../types/api/product-sort-api.types";
import sort from "../assets/sort.svg";

type ProductSortProps = {
  value: ProductSortApi;
  onChange: (value: ProductSortApi) => void;
  count: number;
  mobileCurrency: ProductMobileCurrency;
  sourceCurrencyLabel: string;
  onCurrencyChange: (value: ProductMobileCurrency) => void;
  onOpenFilters: () => void;
  discovery?: boolean;
  isRelevanceSort?: boolean;
  onRelevanceSort?: () => void;
};

const sortOptions: {
  value: ProductSortApi;
  label: string;
}[] = [
  { value: "newest", label: "جدیدترین" },
  { value: "oldest", label: "قدیمی‌ترین" },
  { value: "price_asc", label: "ارزان‌ترین" },
  { value: "price_desc", label: "گران‌ترین" },
  { value: "popular", label: "محبوب‌ترین" },
];

const ProductSort = ({
  value,
  onChange,
  count,
  mobileCurrency,
  sourceCurrencyLabel,
  onCurrencyChange,
  onOpenFilters,
  discovery = false,
  isRelevanceSort = false,
  onRelevanceSort,
}: ProductSortProps) => {
  const options = discovery
    ? [sortOptions[2], sortOptions[3], sortOptions[0], sortOptions[1], sortOptions[4]]
    : sortOptions;
  return (
    <>
      <div className="mb-3 grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] items-end gap-1.5 lg:hidden">
        <label className="min-w-0 text-[10px] text-neutral-600">
          <span className="mb-1 block">مرتب‌سازی براساس:</span>
          <span className="relative block">
            <select
              value={discovery && isRelevanceSort ? "relevance" : value}
              onChange={(event) =>
                event.target.value === "relevance"
                  ? onRelevanceSort?.()
                  : onChange(event.target.value as ProductSortApi)
              }
              className="h-7 w-full appearance-none rounded-md border border-primary-300 bg-transparent pr-2 pl-5 text-[11px] text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
            >
              {discovery && <option value="relevance">مرتبط‌ترین</option>}
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={12}
              className="pointer-events-none absolute top-2 left-1.5"
            />
          </span>
        </label>
        <label className="min-w-0 text-[10px] text-neutral-600">
          <span className="mb-1 block">واحد پول:</span>
          <span className="relative block">
            <select
              value={mobileCurrency}
              onChange={(event) =>
                onCurrencyChange(event.target.value as ProductMobileCurrency)
              }
              className="h-7 w-full appearance-none rounded-md border border-primary-300 bg-transparent pr-2 pl-5 text-[11px] text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
            >
              <option value="source">{sourceCurrencyLabel}</option>
              <option value="IRT">تومان</option>
              <option value="IRR">ریال</option>
            </select>
            <ChevronDown
              size={12}
              className="pointer-events-none absolute top-2 left-1.5"
            />
          </span>
        </label>
        <button
          type="button"
          onClick={onOpenFilters}
          className="h-7 rounded-md bg-primary-700 px-2 text-[11px] text-white focus-visible:ring-2 focus-visible:ring-primary-300"
        >
          فیلترها
        </button>
      </div>
      <section className={discovery ? "hidden min-w-0 items-center gap-3 lg:flex xl:gap-5" : "mb-6 hidden items-center gap-6 lg:flex"}>
        <div className="flex items-center gap-2">
          <Image src={sort} alt="" width={24} height={24} className={discovery ? "size-4 shrink-0" : undefined} />
          <span className={discovery ? "shrink-0 text-xs text-neutral-800" : "shrink-0 text-sm font-medium text-neutral-1000"}>
            مرتب‌سازی:
          </span>
        </div>
        <div className={discovery ? "flex items-center gap-3 xl:gap-5" : "flex items-center gap-6"}>
          {discovery && (
            <button type="button" onClick={onRelevanceSort} className={`whitespace-nowrap text-xs ${isRelevanceSort ? "text-primary-500" : "text-neutral-800 hover:text-primary-500"}`}>
              مرتبط‌ترین
            </button>
          )}
          {options.map((option) => {
            const isSelected = value === option.value && !isRelevanceSort;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange(option.value)}
                className={`${discovery ? "whitespace-nowrap text-xs" : "text-sm"} transition-colors duration-200 ${
                  isSelected
                    ? "font-semibold text-primary-700"
                    : "text-neutral-600 hover:text-primary-700"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
        {!discovery && <span className="mr-auto text-sm text-neutral-500">
          {count.toLocaleString("fa-IR")} محصول
        </span>}
      </section>
    </>
  );
};

export default ProductSort;
