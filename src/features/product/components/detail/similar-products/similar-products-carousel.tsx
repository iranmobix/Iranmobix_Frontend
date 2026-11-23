"use client";

import { useCallback, useId, useSyncExternalStore } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import type { Product } from "@/features/product/types/domain/product.types";
import type { ProductRelatedProduct } from "../../../types/domain/product-detail.types";
import ProductCard from "../../product-card/product-card";
import { getProductDetailsHref } from "../../../utils/product-path";
import { singleProductImportPath } from "../../../../importer/utils/single-product-import-path";
import { importUrlSchema } from "../../../../importer/schemas/importer.schema";

type SimilarProductsCarouselProps = {
  products: readonly (Product | ProductRelatedProduct)[];
  title?: string;
  desktopTitleClassName?: string;
  compactMobile?: boolean;
  previewOnly?: boolean;
  wideLayout?: boolean;
};

function getCardDetailsHref(product: Product | ProductRelatedProduct) {
  if (product.slug.trim()) return getProductDetailsHref(product.slug);
  if (product.source.name !== "alibaba") return undefined;
  const source = importUrlSchema.safeParse(product.source.url);
  return source.success ? singleProductImportPath(source.data) : undefined;
}

// Reused from feature/product-details; shared by similar and recently viewed products.
const SimilarProductsCarousel = ({
  products,
  title = "کالاهای مشابه",
  desktopTitleClassName,
  compactMobile = false,
  previewOnly = false,
  wideLayout = false,
}: SimilarProductsCarouselProps) => {
  const id = useId();
  const [emblaRef, emblaApi] = useEmblaCarousel({
    direction: "rtl",
    align: "start",
    loop: false,
    dragFree: false,
    containScroll: "trimSnaps",
    slidesToScroll: 1,
    breakpoints: {
      "(min-width: 1024px)": {
        // Four full cards, with half of the adjacent card on either side.
        align: (viewSize, slideSize) => (viewSize - 4 * slideSize - 3 * 16) / 2,
        containScroll: "trimSnaps",
        startIndex: 0,
      },
    },
  });

  const subscribe = useCallback(
    (notify: () => void) => {
      if (!emblaApi) return () => {};
      emblaApi.on("select", notify);
      emblaApi.on("reInit", notify);
      return () => {
        emblaApi.off("select", notify);
        emblaApi.off("reInit", notify);
      };
    },
    [emblaApi],
  );

  // A primitive snapshot stays stable between Embla events and is safe for SSR.
  const getSnapshot = useCallback(
    () =>
      (emblaApi?.canScrollPrev() ? 1 : 0) | (emblaApi?.canScrollNext() ? 2 : 0),
    [emblaApi],
  );
  const scrollState = useSyncExternalStore(subscribe, getSnapshot, () => 0);

  const scroll = (direction: "previous" | "next") => {
    const canScroll =
      direction === "previous"
        ? emblaApi?.canScrollPrev()
        : emblaApi?.canScrollNext();
    if (!canScroll) return;
    const jump = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (direction === "previous") emblaApi?.scrollPrev(jump);
    else emblaApi?.scrollNext(jump);
  };

  if (products.length === 0) return null;

  return (
    <section className="w-full min-w-0" dir="rtl" aria-labelledby={id}>
      <h2
        id={id}
        className={
          compactMobile
            ? wideLayout
              ? `max-lg:text-mobile-h6 text-neutral-1000 mb-3 px-1 text-xs font-medium lg:text-desktop-label-l lg:text-neutral-900 lg:mb-6 lg:px-0 ${desktopTitleClassName ?? ""}`
              : `max-lg:text-mobile-h6 text-neutral-1000 mb-3 px-1 text-xs font-medium ${desktopTitleClassName ?? "lg:text-desktop-label-l lg:text-neutral-900 lg:mb-6 lg:px-0"}`
            : "text-mobile-h6 text-neutral-1000 mb-6 px-4 lg:text-desktop-label-l lg:text-neutral-900 lg:px-0"
        }
      >
        {title}
      </h2>

      <div className="relative">
        <div
          ref={emblaRef}
          id={`${id}-viewport`}
          role="region"
          aria-roledescription="اسلایدر"
          aria-label={title}
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.target !== event.currentTarget) return;
            if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
              event.preventDefault();
              scroll(event.key === "ArrowLeft" ? "next" : "previous");
            }
          }}
          className={`${compactMobile ? "px-0" : "px-4"} focus-visible:ring-primary-300 overflow-hidden focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset lg:px-0`}
        >
          <div
            className={
              compactMobile
                ? "flex touch-pan-y items-stretch gap-2 lg:gap-4"
                : "flex touch-pan-y items-stretch gap-4"
            }
          >
            {products.map((product) => {
              const detailsHref = previewOnly
                ? undefined
                : getCardDetailsHref(product);
              const detailsDisabled = !detailsHref;
              return (
                <div
                  key={`${product.source.name}:${product.slug || product.source.url}:${product.seller?.id ?? ""}`}
                  className={
                    compactMobile
                      ? wideLayout
                        ? "min-w-0 shrink-0 grow-0 basis-[calc((100%-8px)/2)] sm:basis-[40%] lg:basis-[calc((100%-80px)/5)]"
                        : "min-w-0 shrink-0 grow-0 basis-[calc((100%-8px)/2)] sm:basis-[40%] lg:basis-[calc((100%-80px)/5)]"
                      : "min-w-0 shrink-0 grow-0 basis-[min(260px,80%)] sm:basis-[calc((100%-16px)/2)] lg:basis-[calc((100%-80px)/5)]"
                  }
                >
                  <ProductCard
                    product={product}
                    variant="bordered"
                    detailsHref={detailsHref}
                    detailsDisabled={detailsDisabled}
                    onDetailsClick={detailsDisabled ? () => {} : undefined}
                    compactMobile={compactMobile}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {Boolean(scrollState & 1) && (
          <button
            type="button"
            onClick={() => scroll("previous")}
            disabled={!(scrollState & 1)}
            aria-label="محصولات قبلی"
            aria-controls={`${id}-viewport`}
            className={`${compactMobile ? "hidden lg:flex" : "flex"} bg-primary-500 hover:bg-primary-700 focus-visible:ring-primary-300 absolute top-1/2 right-4 z-10 ${wideLayout ? "size-8" : "size-12"} -translate-y-1/2 items-center justify-center rounded-full text-white transition-opacity focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-0`}
          >
            <ArrowRight size={wideLayout ? 18 : 24} aria-hidden="true" />
          </button>
        )}
        {Boolean(scrollState & 2) && (
          <button
            type="button"
            onClick={() => scroll("next")}
            disabled={!(scrollState & 2)}
            aria-label="محصولات بعدی"
            aria-controls={`${id}-viewport`}
            className={`${compactMobile ? "hidden lg:flex" : "flex"} bg-primary-500 hover:bg-primary-700 focus-visible:ring-primary-300 absolute top-1/2 left-4 z-10 ${wideLayout ? "size-8" : "size-12"} -translate-y-1/2 items-center justify-center rounded-full text-white transition-opacity focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-0`}
          >
            <ArrowLeft size={wideLayout ? 18 : 24} aria-hidden="true" />
          </button>
        )}
      </div>
    </section>
  );
};

export default SimilarProductsCarousel;
