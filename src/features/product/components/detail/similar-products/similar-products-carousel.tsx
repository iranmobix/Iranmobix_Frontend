"use client";

import { useCallback, useId, useSyncExternalStore } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import type { Product } from "@/features/product/types/domain/product.types";
import type { ProductRelatedProduct } from "../../../types/domain/product-detail.types";
import ProductCard from "../../product-card/product-card";

type SimilarProductsCarouselProps = {
  products: readonly (Product | ProductRelatedProduct)[];
  title?: string;
  compactMobile?: boolean;
};

const MIN_ITEMS_FOR_LOOP = 7;

// Reused from feature/product-details; shared by similar and recently viewed products.
const SimilarProductsCarousel = ({
  products,
  title = "کالاهای مشابه",
  compactMobile = false,
}: SimilarProductsCarouselProps) => {
  const id = useId();
  const hasEnoughProducts = products.length >= MIN_ITEMS_FOR_LOOP;
  const [emblaRef, emblaApi] = useEmblaCarousel({
    direction: "rtl",
    align: "start",
    loop: hasEnoughProducts,
    dragFree: false,
    containScroll: hasEnoughProducts ? false : "trimSnaps",
    slidesToScroll: 1,
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
            ? "text-neutral-1000 lg:text-body-lg-medium mb-3 px-1 text-xs font-medium lg:mb-6 lg:px-6"
            : "text-body-lg-medium text-neutral-1000 mb-6 px-4 lg:px-6"
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
          className={`${compactMobile ? "px-0" : "px-4"} focus-visible:ring-primary-300 overflow-hidden focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset lg:px-32`}
        >
          <div
            className={
              compactMobile
                ? "flex touch-pan-y items-stretch gap-2 lg:gap-4"
                : "flex touch-pan-y items-stretch gap-4"
            }
          >
            {products.map((product) => (
              <div
                key={`${product.source.name}:${product.slug}:${product.seller?.id ?? ""}`}
                className={
                  compactMobile
                    ? "min-w-0 shrink-0 grow-0 basis-[calc((100%-8px)/2)] sm:basis-[40%] lg:basis-[calc((100%-48px)/4)]"
                    : "min-w-0 shrink-0 grow-0 basis-[min(260px,80%)] sm:basis-[calc((100%-16px)/2)] lg:basis-[calc((100%-48px)/4)]"
                }
              >
                <ProductCard
                  product={product}
                  variant="bordered"
                  compactMobile={compactMobile}
                />
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => scroll("previous")}
          disabled={!(scrollState & 1)}
          aria-label="محصولات قبلی"
          aria-controls={`${id}-viewport`}
          className={`${compactMobile ? "hidden lg:flex" : "flex"} bg-primary-500 hover:bg-primary-700 focus-visible:ring-primary-300 absolute top-1/2 right-4 z-10 size-12 -translate-y-1/2 items-center justify-center rounded-full text-white transition-opacity focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-0`}
        >
          <ArrowRight size={24} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => scroll("next")}
          disabled={!(scrollState & 2)}
          aria-label="محصولات بعدی"
          aria-controls={`${id}-viewport`}
          className={`${compactMobile ? "hidden lg:flex" : "flex"} bg-primary-500 hover:bg-primary-700 focus-visible:ring-primary-300 absolute top-1/2 left-4 z-10 size-12 -translate-y-1/2 items-center justify-center rounded-full text-white transition-opacity focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-0`}
        >
          <ArrowLeft size={24} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
};

export default SimilarProductsCarousel;
