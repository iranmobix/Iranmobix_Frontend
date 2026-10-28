"use client";

import { useEffect, useRef } from "react";
import type { ProductDetail } from "../../types/domain/product-detail.types";

type ProductGalleryModalProps = {
  images: ProductDetail["gallery"];
  selectedIndex: number;
  onNavigate: (direction: -1 | 1) => void;
  onClose: () => void;
};

const ProductGalleryModal = ({
  images,
  selectedIndex,
  onNavigate,
  onClose,
}: ProductGalleryModalProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const selectedImage = images[selectedIndex];

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";

    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) {
        previousFocus.focus({ preventScroll: true });
      }
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-label="گالری تصاویر محصول"
      aria-modal="true"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      onKeyDown={(event) => {
        if (images.length < 2 || event.altKey || event.ctrlKey || event.metaKey)
          return;
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          event.preventDefault();
          onNavigate(event.key === "ArrowLeft" ? -1 : 1);
        }
      }}
      className="fixed inset-0 m-auto h-[100dvh] max-h-none w-screen max-w-none overflow-hidden border-0 bg-transparent p-0 text-white outline-none backdrop:bg-black/85"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="بستن گالری تصاویر"
        className="absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-black/60 hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="m6 6 12 12M18 6 6 18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <div className="pointer-events-none flex h-full w-full items-center justify-center px-14 py-20 sm:px-20">
        {selectedImage && (
          // A native image preserves intrinsic dimensions without upscaling.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={selectedImage.id}
            src={selectedImage.url}
            alt={`تصویر ${selectedIndex + 1} محصول`}
            className="pointer-events-auto block h-auto max-h-full w-auto max-w-full object-contain"
          />
        )}
      </div>

      {images.length > 1 &&
        ([-1, 1] as const).map((direction) => (
          <button
            key={direction}
            type="button"
            onClick={() => onNavigate(direction)}
            aria-label={direction === -1 ? "تصویر قبلی" : "تصویر بعدی"}
            className={`absolute top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${direction === -1 ? "left-2 sm:left-4" : "right-2 sm:right-4"}`}
          >
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d={direction === -1 ? "m15 18-6-6 6-6" : "m9 6 6 6-6 6"}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        ))}

      <p
        dir="ltr"
        aria-live="polite"
        aria-atomic="true"
        className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-4 py-1 text-sm"
      >
        <span className="sr-only">تصویر </span>
        {selectedIndex + 1} / {images.length}
      </p>
    </dialog>
  );
};

export default ProductGalleryModal;
