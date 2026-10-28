"use client";

import Image from "next/image";
import { useState } from "react";

import ProductDetailSource from "./product-detail-source";
import type { ProductDetail } from "../../types/domain/product-detail.types";
import ProductGalleryModal from "./product-gallery-modal";

type ProductGalleryProps = {
  product: ProductDetail;
};

const ProductGallery = ({ product }: ProductGalleryProps) => {
  const { gallery, source, officialUrl } = product;
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectedId, setSelectedId] = useState<
    ProductDetail["gallery"][number]["id"] | null
  >(null);

  if (!gallery.length)
    return (
      <div className="flex min-h-64 items-center justify-center rounded-md bg-white">
        <span className="text-neutral-500">تصاویر محصول: —</span>
      </div>
    );

  const selectedIndex = Math.max(
    0,
    gallery.findIndex((image) =>
      selectedId === null ? image.isPrimary : image.id === selectedId,
    ),
  );

  const selectedImage = gallery[selectedIndex];

  const thumbnailStart = Math.min(
    Math.floor(selectedIndex / 4) * 4,
    Math.max(0, gallery.length - 4),
  );

  const visibleThumbnails = gallery.slice(thumbnailStart, thumbnailStart + 4);

  const changeImage = (direction: -1 | 1) => {
    const nextIndex =
      (selectedIndex + direction + gallery.length) % gallery.length;

    setSelectedId(gallery[nextIndex].id);
  };

  return (
    <div
      className="flex h-auto min-h-0 w-full flex-col gap-0 lg:h-[calc(100dvh-var(--header-height))] lg:gap-4"
      style={{ "--header-height": "157px" } as React.CSSProperties}
    >
      {/* Main image */}
      <div className="relative aspect-[6/5] min-h-0 w-full flex-1 overflow-hidden rounded-md bg-[#f5f5f5] lg:aspect-auto">
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          aria-label="نمایش بزرگ تصویر محصول"
          aria-haspopup="dialog"
          className="absolute inset-0 cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#5945b0]"
        >
          <Image
            src={selectedImage.url}
            alt=""
            fill
            sizes="(max-width: 1023px) calc(100vw - 20px), 672px"
            className="object-cover"
          />
        </button>
        {/* Source */}
        <div className="absolute bottom-0 left-4 z-10 hidden lg:block">
          <ProductDetailSource source={source} url={officialUrl} />
        </div>
        {/* Pagination dots */}
        {gallery.length > 1 && (
          <div
            dir="ltr"
            role="group"
            aria-label="انتخاب تصویر محصول"
            className="absolute bottom-0.5 lg:bottom-4 left-1/2 z-20 flex max-w-[50%] -translate-x-1/2 flex-wrap justify-center rounded-full bg-white/70 px-1"
          >
            {gallery.map((image, index) => (
              <button
                key={image.id}
                type="button"
                onClick={() => setSelectedId(image.id)}
                aria-label={`نمایش تصویر ${index + 1}`}
                aria-pressed={selectedIndex === index}
                className="flex h-6 w-3 lg:w-5 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5945b0]"
              >
                <span
                  className={`h-1 w-1 lg:h-3 lg:w-3 rounded-full transition-colors ${
                    selectedIndex === index ? "bg-[#5945b0]" : "bg-[#d4d1c7]"
                  }`}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      <div dir="ltr" className="relative hidden shrink-0 lg:block">
        <div className="grid grid-cols-4 gap-4">
          {visibleThumbnails.map((image, index) => {
            const imageIndex = thumbnailStart + index;
            const isSelected = selectedIndex === imageIndex;

            return (
              <button
                key={image.id}
                type="button"
                onClick={() => setSelectedId(image.id)}
                aria-label={`نمایش تصویر ${imageIndex + 1}`}
                aria-pressed={isSelected}
                className={`relative aspect-square min-w-0 overflow-hidden rounded-lg border bg-[#f5f5f5] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5945b0] focus-visible:ring-offset-2 ${
                  isSelected
                    ? "border-[#7963d2]"
                    : "border-[#e7e5e4] hover:border-[#b5a8e2]"
                }`}
              >
                <Image
                  src={image.url}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 25vw, 156px"
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>

        {/* Navigation arrows */}
        {gallery.length > 1 &&
          ([-1, 1] as const).map((direction) => (
            <button
              key={direction}
              type="button"
              onClick={() => changeImage(direction)}
              aria-label={direction === -1 ? "تصویر قبلی" : "تصویر بعدی"}
              className={`absolute top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/65 text-[#171426] backdrop-blur-sm transition-colors hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5945b0] ${
                direction === -1 ? "left-2" : "right-2"
              }`}
            >
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d={
                    direction === -1
                      ? "M19 12H5m7-7-7 7 7 7"
                      : "M5 12h14m-7-7 7 7-7 7"
                  }
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          ))}
      </div>
      {isModalOpen && (
        <ProductGalleryModal
          images={gallery}
          selectedIndex={selectedIndex}
          onNavigate={changeImage}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default ProductGallery;
