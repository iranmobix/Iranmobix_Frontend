"use client";
import ProductFilterCheckbox from "./product-filter-checkbox";

import { useState } from "react";
import type { ProductCategoryFilterOption } from "../../types/domain";
import { Search } from "lucide-react";
import Image from "next/image";
import arrow from "../../assets/arrow.svg";
import { toggleFilterValue } from "../../utils";

type ProductCategoryFilterProps = {
  categories: ProductCategoryFilterOption[];
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
  value: number[];
  onChange: (categories: number[]) => void;

  isOpen: boolean;
  onToggle: () => void;
};

const ProductCategoryFilter = ({
  categories,
  loading = false,
  error = false,
  onRetry,
  value,
  onChange,
  isOpen,
  onToggle,
}: ProductCategoryFilterProps) => {
  const [search, setSearch] = useState("");

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleCategoryToggle = (categoryId: number) => {
    onChange(toggleFilterValue(value, categoryId));
  };

  return (
    <div className="border-b border-gray-200">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-label="باز کردن دسته بندی"
        onClick={onToggle}
        className="flex min-h-12 w-full items-center justify-between"
      >
        <span className="text-label-md text-neutral-900">دسته بندی</span>

        <span
          className={`transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          <Image src={arrow} alt="" width={16} height={16} />
        </span>
      </button>

      {isOpen && (
        <div className="pb-3">
          {/* Search */}
          <div className="relative mb-2">
            <Search
              size={16}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="جستجوی دسته‌بندی"
              className="h-10 w-full rounded-lg border border-gray-200 pr-9 pl-3 text-sm outline-none focus:border-gray-400"
            />
          </div>

          {loading && (
            <div role="status" className="space-y-2 py-2">
              <span className="sr-only">در حال دریافت دسته‌بندی‌ها</span>
              {[0, 1, 2].map((key) => (
                <div
                  key={key}
                  className="h-8 rounded bg-neutral-100 motion-safe:animate-pulse"
                />
              ))}
            </div>
          )}
          {error && (
            <div
              role="alert"
              className="text-mobile-body-s space-y-2 py-2 leading-6 text-neutral-800"
            >
              <p>دسته‌بندی‌ها فعلاً در دسترس نیستند.</p>
              <button
                type="button"
                onClick={onRetry}
                className="text-primary-600 focus-visible:ring-primary-300 rounded px-2 py-1 focus-visible:ring-2"
              >
                تلاش دوباره
              </button>
            </div>
          )}
          {/* Categories */}
          <div className="max-h-60 overflow-y-auto">
            {filteredCategories.map((category) => {
              const isSelected = value.includes(category.id);

              return (
                <label
                  key={category.id}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-right text-sm hover:bg-gray-50"
                >
                  <ProductFilterCheckbox checked={isSelected} onChange={() => handleCategoryToggle(category.id)} />

                  <span
                    className={
                      isSelected ? "font-medium text-black" : "text-gray-700"
                    }
                  >
                    {category.name}
                  </span>
                </label>
              );
            })}

            {!loading && !error && filteredCategories.length === 0 && (
              <p className="py-2 text-sm text-gray-500">
                دسته‌بندی‌ای پیدا نشد.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductCategoryFilter;
