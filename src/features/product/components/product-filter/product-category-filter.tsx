"use client";

import { useState } from "react";
import type { ProductCategoryFilterOption } from "../../types/domain";
import { Search } from "lucide-react";
import Image from "next/image";
import arrow from "../../assets/arrow.svg";
import { toggleFilterValue } from "../../utils";

type ProductCategoryFilterProps = {
  categories: ProductCategoryFilterOption[];
  value: number[];
  onChange: (categories: number[]) => void;

  isOpen: boolean;
  onToggle: () => void;
};

const ProductCategoryFilter = ({
  categories,
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
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="جستجوی دسته‌بندی"
              className="h-10 w-full rounded-lg border border-gray-200 pr-9 pl-3 text-sm outline-none focus:border-gray-400"
            />
          </div>

          {/* Categories */}
          <div className="max-h-60 overflow-y-auto">
            {filteredCategories.map((category) => {
              const isSelected = value.includes(category.id);

              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => handleCategoryToggle(category.id)}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-right text-sm hover:bg-gray-50"
                >
                  {/* Custom checkbox */}
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                      isSelected
                        ? "border-black bg-black"
                        : "border-gray-300 bg-white"
                    }`}
                  >
                    {isSelected && (
                      <svg
                        viewBox="0 0 12 12"
                        className="h-3 w-3 text-white"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          d="M2.5 6L5 8.5L9.5 3.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </span>

                  <span
                    className={
                      isSelected ? "font-medium text-black" : "text-gray-700"
                    }
                  >
                    {category.name}
                  </span>
                </button>
              );
            })}

            {filteredCategories.length === 0 && (
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
