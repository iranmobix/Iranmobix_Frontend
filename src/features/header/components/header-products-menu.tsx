"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Popover } from "radix-ui";
import {
  ArrowLeft,
  ChevronDown,
  ChevronLeft,
  LayoutGrid,
  Search,
  X,
} from "lucide-react";
import {
  productNavigationCategoriesOptions,
  type ProductCategoryNode,
} from "@/features/product/services/product-navigation-categories";
import { getProductCategoryHref } from "@/features/product/utils/product-category-path";

import { filterHeaderCategories } from "../utils/header-category-search";

const categoryHref = (category: ProductCategoryNode) =>
  getProductCategoryHref(category.name, category.id);
const linkStyle =
  "rounded-lg text-neutral-800 transition-colors hover:bg-primary-50 hover:text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300";

function CategoryBranch({
  categories,
  onNavigate,
}: {
  categories: ProductCategoryNode[];
  onNavigate: () => void;
}) {
  return (
    <ul className="space-y-1">
      {categories.map((category) => (
        <li key={category.id}>
          <Link target="_self"
            href={categoryHref(category)}
            prefetch={false}
            onClick={onNavigate}
            className={
              linkStyle +
              " text-mobile-body-s lg:text-desktop-body-s block px-3 py-2.5 leading-6"
            }
          >
            {category.name}
          </Link>
          {category.children.length > 0 && (
            <div className="mr-3 border-r border-neutral-200 pr-2">
              <CategoryBranch
                categories={category.children}
                onNavigate={onNavigate}
              />
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

export function HeaderProductsMenu({
  mobile = false,
  onNavigate,
}: {
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const contentRef = useRef<HTMLDivElement>(null);
  const openedByHover = useRef(false);

  const cancelHoverClose = () => {
    clearTimeout(closeTimer.current);
    closeTimer.current = undefined;
  };
  const openOnHover = (event: PointerEvent) => {
    if (event.pointerType !== "mouse") return;
    cancelHoverClose();
    if (!open) {
      openedByHover.current = true;
      setOpen(true);
    }
  };
  const closeAfterHover = (event: PointerEvent) => {
    if (event.pointerType !== "mouse") return;
    cancelHoverClose();
    // Bridge the spacing between the trigger and the portalled panel.
    closeTimer.current = setTimeout(() => {
      closeTimer.current = undefined;
      // Keep the category search usable while it has keyboard focus.
      if (contentRef.current?.contains(document.activeElement)) return;
      setOpen(false);
    }, 250);
  };

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  const query = useQuery({
    ...productNavigationCategoriesOptions(),
    enabled: open,
  });
  const allCategories = query.data ?? [];
  const categories = filterHeaderCategories(allCategories, search);
  const active = categories.find(({ id }) => id === activeId) ?? categories[0];
  const navigate = () => {
    cancelHoverClose();
    setOpen(false);
    setSearch("");
    onNavigate?.();
  };

  const searchControl = (
    <div className="focus-within:ring-primary-300 relative flex w-full items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 focus-within:ring-2 lg:max-w-[280px]">
      <Search
        size={16}
        className="shrink-0 text-neutral-700"
        aria-hidden="true"
      />
      <input
        type="search"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        aria-label="جست‌وجوی دسته‌بندی"
        placeholder="جست‌وجوی دسته‌بندی..."
        className="text-mobile-body-s lg:text-desktop-body-s h-9 w-full min-w-0 bg-transparent text-neutral-900 outline-none placeholder:text-neutral-600 [&::-webkit-search-cancel-button]:appearance-none"
      />
      {search && (
        <button
          type="button"
          onClick={() => setSearch("")}
          aria-label="پاک کردن جست‌وجوی دسته‌بندی"
          className="hover:text-primary-600 focus-visible:ring-primary-300 flex size-6 shrink-0 items-center justify-center rounded text-neutral-700 focus-visible:ring-2 focus-visible:outline-none"
        >
          <X size={14} aria-hidden="true" />
        </button>
      )}
    </div>
  );

  const status = query.isPending ? (
    <div role="status" className="space-y-3 p-4">
      <span className="sr-only">در حال دریافت دسته‌بندی محصولات</span>
      {Array.from({ length: 6 }, (_, index) => (
        <div
          key={index}
          className="h-9 rounded-lg bg-neutral-100 motion-safe:animate-pulse"
        />
      ))}
    </div>
  ) : query.isError ? (
    <div
      role="alert"
      className="text-mobile-body-s lg:text-desktop-body-s space-y-3 p-5 leading-7 text-neutral-800"
    >
      <p>دسته‌بندی‌ها فعلاً در دسترس نیستند.</p>
      <button
        type="button"
        onClick={() => void query.refetch()}
        className="border-primary-200 text-primary-600 focus-visible:ring-primary-300 rounded border px-3 py-2 focus-visible:ring-2"
      >
        تلاش دوباره
      </button>
    </div>
  ) : categories.length === 0 ? (
    <p
      role="status"
      className="text-mobile-body-s lg:text-desktop-body-s p-5 text-neutral-800"
    >
      {search.trim()
        ? "دسته‌بندی مطابق جست‌وجوی شما پیدا نشد."
        : "دسته‌بندی‌ای یافت نشد."}
    </p>
  ) : null;

  if (mobile)
    return (
      <div>
        <button
          type="button"
          aria-expanded={open}
          aria-controls="mobile-product-categories"
          onClick={() => setOpen(!open)}
          className="focus-visible:ring-primary-300 flex min-h-10 w-full items-center justify-between rounded text-sm text-neutral-800 focus-visible:ring-2 focus-visible:outline-none"
        >
          محصولات
          <ChevronDown
            size={14}
            aria-hidden="true"
            className={open ? "rotate-180" : ""}
          />
        </button>
        {open && (
          <div
            id="mobile-product-categories"
            className="mb-2 rounded-lg border border-neutral-200 bg-neutral-50 p-2"
          >
            <Link target="_self"
              href="/products"
              onClick={navigate}
              className={
                linkStyle + " text-mobile-label-m text-primary-600 block p-3"
              }
            >
              مشاهده همه محصولات
            </Link>
            <div className="mb-2">{searchControl}</div>
            {status ??
              categories.map((category) =>
                category.children.length ? (
                  <details
                    open={search.trim() ? true : undefined}
                    key={category.id}
                    className="border-t border-neutral-200"
                  >
                    <summary className="text-mobile-label-m cursor-pointer p-3 leading-6 text-neutral-900">
                      {category.name}
                    </summary>
                    <Link target="_self"
                      href={categoryHref(category)}
                      prefetch={false}
                      onClick={navigate}
                      className={
                        linkStyle +
                        " text-mobile-body-s text-primary-600 block px-3 py-2"
                      }
                    >
                      همه محصولات این دسته
                    </Link>
                    <CategoryBranch
                      categories={category.children}
                      onNavigate={navigate}
                    />
                  </details>
                ) : (
                  <CategoryBranch
                    key={category.id}
                    categories={[category]}
                    onNavigate={navigate}
                  />
                ),
              )}
          </div>
        )}
      </div>
    );

  return (
    <Popover.Root
      open={open}
      onOpenChange={(nextOpen) => {
        cancelHoverClose();
        if (nextOpen) openedByHover.current = false;
        setOpen(nextOpen);
      }}
    >
      <Popover.Trigger asChild>
        <button
          type="button"
          data-header-label
          onPointerEnter={openOnHover}
          onPointerLeave={closeAfterHover}
          className="text-neutral-900 focus-visible:ring-primary-300 flex items-center gap-1 rounded-md focus-visible:ring-2 focus-visible:outline-none"
        >
          <span className="text-desktop-body-m whitespace-nowrap">
            محصولات
          </span>
          <ChevronDown
            size={14}
            aria-hidden="true"
            className={"transition-transform " + (open ? "rotate-180" : "")}
          />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          ref={contentRef}
          onPointerEnter={cancelHoverClose}
          onPointerLeave={closeAfterHover}
          onOpenAutoFocus={(event) => {
            if (openedByHover.current) event.preventDefault();
          }}
          onCloseAutoFocus={(event) => {
            if (openedByHover.current) event.preventDefault();
          }}
          dir="rtl"
          align="start"
          sideOffset={16}
          collisionPadding={24}
          aria-label="دسته‌بندی محصولات"
          className="z-[60] hidden w-[min(1080px,calc(100vw-48px))] overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xl lg:block"
        >
          <div className="flex items-center justify-between gap-4 border-b border-neutral-200 px-6 py-4">
            <span className="text-desktop-label-l flex items-center gap-2 text-neutral-900">
              <LayoutGrid
                size={18}
                className="text-primary-500"
                aria-hidden="true"
              />
              دسته‌بندی محصولات
            </span>
            {searchControl}
            <Link target="_self"
              href="/products"
              onClick={navigate}
              className="text-desktop-body-s text-primary-600 focus-visible:ring-primary-300 flex items-center gap-2 rounded focus-visible:ring-2"
            >
              مشاهده همه محصولات
              <ArrowLeft size={16} aria-hidden="true" />
            </Link>
          </div>
          {status ?? (
            <div className="grid grid-cols-[260px_minmax(0,1fr)]">
              <nav
                aria-label="دسته‌های اصلی"
                className="max-h-[min(65dvh,520px)] space-y-1 overflow-y-auto border-l border-neutral-200 bg-neutral-50 p-3"
              >
                {categories.map((category) => (
                  <Link target="_self"
                    key={category.id}
                    href={categoryHref(category)}
                    prefetch={false}
                    onClick={navigate}
                    onMouseEnter={() => setActiveId(category.id)}
                    onFocus={() => setActiveId(category.id)}
                    className={
                      "text-desktop-body-s focus-visible:ring-primary-300 flex items-center justify-between gap-2 rounded-lg px-3 py-3 leading-6 transition-colors focus-visible:ring-2 focus-visible:outline-none " +
                      (active?.id === category.id
                        ? "text-primary-600 bg-white shadow-sm"
                        : "text-neutral-800 hover:bg-white")
                    }
                  >
                    {category.name}
                    <ChevronLeft
                      size={14}
                      className="shrink-0"
                      aria-hidden="true"
                    />
                  </Link>
                ))}
              </nav>
              <div className="max-h-[min(65dvh,520px)] overflow-y-auto p-6">
                {active && (
                  <>
                    <Link target="_self"
                      href={categoryHref(active)}
                      prefetch={false}
                      onClick={navigate}
                      className="text-desktop-label-l text-primary-600 focus-visible:ring-primary-300 mb-5 flex items-center gap-2 rounded leading-7 focus-visible:ring-2"
                    >
                      {active.name}
                      <ArrowLeft size={16} aria-hidden="true" />
                    </Link>
                    <nav aria-label={"زیر‌دسته‌های " + active.name}>
                      {active.children.length > 0 ? (
                        <div className="grid grid-cols-2 gap-x-5 gap-y-2">
                          {active.children.map((child) => (
                            <CategoryBranch
                              key={child.id}
                              categories={[child]}
                              onNavigate={navigate}
                            />
                          ))}
                        </div>
                      ) : (
                        <Link target="_self"
                          href={categoryHref(active)}
                          prefetch={false}
                          onClick={navigate}
                          className={
                            linkStyle +
                            " text-desktop-body-s block border border-neutral-200 p-4 leading-7"
                          }
                        >
                          مشاهده محصولات {active.name}
                        </Link>
                      )}
                    </nav>
                  </>
                )}
              </div>
            </div>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
