"use client";

import { useEffect, useRef, useState } from "react";
import { ProductSellerTypeApi } from "../../types/api";
import {
  ProductBrandFilterOption,
  ProductCategoryFilterOption,
  ProductColorFilterOption,
  ProductGuaranteeFilterOption,
  ProductGuaranteeType,
  ProductSellerTypeFilterOption,
  ProductSourceFilterOption,
} from "../../types/domain";

import ProductBrandFilter from "./product-brand-filter";
import ProductCategoryFilter from "./product-category-filter";
import ProductColorFilter from "./product-color-filter";
import ProductGuaranteeFilter from "./product-guarantee-filter";
import ProductInventoryFilter from "./product-inventory-filter";
import ProductPriceFilter from "./product-price-filter";
import ProductSellerTypeFilter from "./product-seller-type-filter";
import ProductSourceFilter from "./product-source-filter";
import { Button } from "@/components/ui/button";

type ProductFilterProps = {
  compact?: boolean;
  embedded?: boolean;
  sources: ProductSourceFilterOption[];
  selectedSources: string[];
  onSourcesChange: (sources: string[]) => void;

  categories: ProductCategoryFilterOption[];
  selectedCategories: number[];
  onCategoryChange: (categories: number[]) => void;

  minPrice: string;
  maxPrice: string;
  onPriceChange: (values: { minPrice?: string; maxPrice?: string }) => void;
  priceMin: number;
  priceMax: number;

  brands: ProductBrandFilterOption[];
  selectedBrands: number[];
  onBrandsChange: (brands: number[]) => void;

  colors: ProductColorFilterOption[];
  selectedColors: number[];
  onColorsChange: (colors: number[]) => void;

  sellerTypes: ProductSellerTypeFilterOption[];
  selectedSellerTypes: ProductSellerTypeApi[];
  onSellerTypesChange: (sellerTypes: ProductSellerTypeApi[]) => void;

  inIranMobixInventory: boolean;
  onInventoryChange: (value: boolean) => void;

  guarantees: ProductGuaranteeFilterOption[];
  selectedGuarantees: ProductGuaranteeType[];
  onGuaranteesChange: (guarantees: ProductGuaranteeType[]) => void;

  onApply: () => void;
  onReset: () => void;
};

const ProductFilter = ({
  compact = false,
  embedded = false,
  sources,
  selectedSources,
  onSourcesChange,

  categories,
  selectedCategories,
  onCategoryChange,

  minPrice,
  maxPrice,
  onPriceChange,

  priceMin,
  priceMax,

  brands,
  selectedBrands,
  onBrandsChange,

  colors,
  selectedColors,
  onColorsChange,

  sellerTypes,
  selectedSellerTypes,
  onSellerTypesChange,

  inIranMobixInventory,
  onInventoryChange,

  guarantees,
  selectedGuarantees,
  onGuaranteesChange,

  onApply,
  onReset,
}: ProductFilterProps) => {
  const [openFilter, setOpenFilter] = useState<string | null>(null);
  const sidebarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (compact || embedded) return;
    const sidebar = sidebarRef.current;
    const header = document.querySelector("header");
    if (!sidebar || !header) return;

    const updateOffset = () => {
      const top = Math.ceil(header.getBoundingClientRect().height) + 24;
      sidebar.style.setProperty("--product-filter-top", `${top}px`);
    };
    updateOffset();
    const observer = new ResizeObserver(updateOffset);
    observer.observe(header);
    window.addEventListener("resize", updateOffset);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateOffset);
    };
  }, [compact, embedded]);

  const handleToggleFilter = (filter: string) => {
    setOpenFilter((current) => (current === filter ? null : filter));
  };
  return (
    <aside
      ref={sidebarRef}
      className={
        compact
          ? "flex w-full flex-col bg-white"
          : embedded
            ? "flex w-full flex-col rounded-md bg-white p-5"
          : "sticky top-[var(--product-filter-top,181px)] flex max-h-[calc(100dvh-var(--product-filter-top,181px)-24px)] w-[18.06vw] shrink-0 flex-col self-start rounded-md bg-white p-5"
      }
    >
      {/* Header */}
      <h2 className="shrink-0 text-label-lg text-neutral-1000">فیلترها</h2>

      {/* Filters */}
      <div className="mt-6 min-h-0 flex-1 overflow-y-auto">
        <div className="flex flex-col">
          <ProductSourceFilter
            sources={sources}
            value={selectedSources}
            onChange={onSourcesChange}
            isOpen={openFilter === "source"}
            onToggle={() => handleToggleFilter("source")}
          />

          <ProductCategoryFilter
            categories={categories}
            value={selectedCategories}
            onChange={onCategoryChange}
            isOpen={openFilter === "category"}
            onToggle={() => handleToggleFilter("category")}
          />

          <ProductPriceFilter
            minPrice={minPrice}
            maxPrice={maxPrice}
            priceMin={priceMin}
            priceMax={priceMax}
            onChange={onPriceChange}
            isOpen={openFilter === "price"}
            onToggle={() => handleToggleFilter("price")}
          />

          <ProductBrandFilter
            brands={brands}
            value={selectedBrands}
            onChange={onBrandsChange}
            isOpen={openFilter === "brand"}
            onToggle={() => handleToggleFilter("brand")}
          />

          <ProductColorFilter
            colors={colors}
            value={selectedColors}
            onChange={onColorsChange}
            isOpen={openFilter === "color"}
            onToggle={() => handleToggleFilter("color")}
          />

          <ProductSellerTypeFilter
            sellerTypes={sellerTypes}
            value={selectedSellerTypes}
            onChange={onSellerTypesChange}
            isOpen={openFilter === "sellerType"}
            onToggle={() => handleToggleFilter("sellerType")}
          />

          <ProductInventoryFilter
            value={inIranMobixInventory}
            onChange={onInventoryChange}
          />

          <ProductGuaranteeFilter
            guarantees={guarantees}
            value={selectedGuarantees}
            onChange={onGuaranteesChange}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 shrink-0 flex flex-col gap-2">
        <Button
          type="button"
          onClick={onApply}
          className="w-full rounded-md px-4 py-3 text-sm font-medium"
        >
          اعمال فیلتر
        </Button>
        {compact && (
          <Button
            type="button"
            variant="secondary"
            onClick={onReset}
            className="w-full text-xs"
          >
            پاک کردن فیلترها
          </Button>
        )}
      </div>
    </aside>
  );
};

export default ProductFilter;
