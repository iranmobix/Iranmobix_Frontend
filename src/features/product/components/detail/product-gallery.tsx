"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
  type TouchEvent,
} from "react";
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown } from "lucide-react";
import type { ProductDetail } from "../../types/domain/product-detail.types";
import ProductGalleryModal from "./product-gallery-modal";
import { attachThumbnailHoverScroll } from "../../utils/thumbnail-hover-scroll";
import {
  updateGalleryHoverZoom,
  clearGalleryHoverZoom,
} from "../../utils/gallery-hover-zoom";

type ProductGalleryProps = {
  product: Pick<ProductDetail, "gallery" | "source" | "officialUrl">;
  mobileImportLayout?: boolean;
  mobileControls?: ReactNode;
};
export default function ProductGallery({
  product: { gallery },
  mobileControls,
}: ProductGalleryProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const thumbnailsRef = useRef<HTMLDivElement>(null);
  const swipeStart = useRef<{ x: number; y: number } | null>(null);
  const selectedIndex = Math.max(
    0,
    gallery.findIndex((image) =>
      selectedId === null ? image.isPrimary : image.id === selectedId,
    ),
  );

  useEffect(() => {
    const container = thumbnailsRef.current;
    if (!container) return;
    const ensureVisible = () => {
      const selected = container.children.item(
        selectedIndex,
      ) as HTMLElement | null;
      if (!selected || !container.clientHeight) return;
      if (!window.matchMedia("(min-width: 1024px)").matches) {
        const image = selected.getBoundingClientRect();
        const track = container.getBoundingClientRect();
        const delta = image.left < track.left ? image.left - track.left : image.right > track.right ? image.right - track.right : 0;
        if (delta) container.scrollBy({ left: delta, behavior: "auto" });
        return;
      }
      const top = selected.offsetTop;
      const bottom = top + selected.offsetHeight;
      if (top < container.scrollTop) container.scrollTop = top;
      else if (bottom > container.scrollTop + container.clientHeight)
        container.scrollTop = bottom - container.clientHeight;
    };
    ensureVisible();
    const observer = new ResizeObserver(ensureVisible);
    observer.observe(container);
    return () => observer.disconnect();
  }, [selectedIndex, gallery.length]);

  useEffect(() => {
    const container = thumbnailsRef.current;
    if (!container || gallery.length <= 4) return;
    return attachThumbnailHoverScroll(container);
  }, [gallery.length]);

  const handleThumbnailScroll = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      const direction =
        event.currentTarget.dataset.scrollDirection === "-1" ? -1 : 1;
      const container = thumbnailsRef.current;
      if (!container) return;
      const height =
        container.firstElementChild?.getBoundingClientRect().height ?? 56;
      container.scrollBy({
        top: direction * (height + 12),
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
      });
    },
    [],
  );
  const changeImage = (direction: -1 | 1) =>
    setSelectedId(
      gallery[(selectedIndex + direction + gallery.length) % gallery.length].id,
    );
  const handleTouchEnd = (event: TouchEvent<HTMLButtonElement>) => {
    const start = swipeStart.current;
    swipeStart.current = null;
    if (!start || event.touches.length !== 0 || gallery.length < 2) return;

    const touch = event.changedTouches[0];
    if (!touch) return;
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    if (Math.abs(dx) < 40 || Math.abs(dx) <= Math.abs(dy)) return;

    event.preventDefault();
    changeImage(dx < 0 ? 1 : -1);
  };
  if (!gallery.length)
    return (
      <div className="flex aspect-square items-center justify-center rounded-md bg-white text-xs text-neutral-500 ">
        تصاویر محصول: —
      </div>
    );
  const selectedImage = gallery[selectedIndex];
  return (
    <div
      dir="rtl"
      className="flex min-w-0 flex-col [--gallery-thumb-gap:12px] [--gallery-thumb-size:56px] lg:grid lg:min-h-0 lg:grid-cols-[var(--gallery-thumb-size)_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)] lg:items-stretch lg:gap-[var(--gallery-thumb-gap)] xl:[--gallery-thumb-size:60px]"
    >
      <div
        className="relative aspect-square w-full min-w-0 overflow-hidden rounded-md bg-[#efeeec] lg:col-start-2 lg:row-start-1"
      >
        <button
          type="button"
          key={selectedImage.id}
          onPointerEnter={updateGalleryHoverZoom}
          onPointerMove={updateGalleryHoverZoom}
          onPointerLeave={clearGalleryHoverZoom}
          onPointerCancel={clearGalleryHoverZoom}
          onBlur={clearGalleryHoverZoom}
          onTouchStart={(event) => {
            const touch = event.touches[0];
            swipeStart.current =
              gallery.length > 1 && event.touches.length === 1
                ? { x: touch.clientX, y: touch.clientY }
                : null;
          }}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={() => {
            swipeStart.current = null;
          }}
          onClick={() => setIsModalOpen(true)}
          aria-label="نمایش بزرگ تصویر محصول"
          aria-haspopup="dialog"
          className="group/zoom focus-visible:ring-primary-400 absolute inset-0 cursor-zoom-in touch-pan-y touch-pinch-zoom overflow-hidden focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset"
        >
          <Image
            src={selectedImage.url}
            alt=""
            fill
            sizes="(max-width:1023px) calc(100vw - 20px), (max-width:1400px) 25vw, 440px"
            className="[transform-origin:var(--zoom-x,50%)_var(--zoom-y,50%)] object-contain transition-transform duration-150 group-data-[zoom=true]/zoom:scale-[2.25] motion-reduce:transition-none"
          />
        </button>
        {gallery.length > 1 &&
          ([-1, 1] as const).map((direction) => (
            <button
              key={direction}
              type="button"
              onClick={() => changeImage(direction)}
              aria-label={direction === -1 ? "تصویر قبلی" : "تصویر بعدی"}
              className={`focus-visible:ring-primary-400 absolute top-1/2 z-10 flex size-7 -translate-y-1/2 items-center justify-center rounded-full border border-white/60 bg-white/45 text-neutral-900 shadow-[0_2px_8px_rgba(0,0,0,0.12)] backdrop-blur-[2px] transition-colors hover:bg-white/60 focus-visible:ring-2 ${direction === -1 ? "left-2" : "right-2"}`}
            >
              {direction === -1 ? (
                <ArrowLeft size={18} aria-hidden="true" />
              ) : (
                <ArrowRight size={18} aria-hidden="true" />
              )}
            </button>
          ))}
        {mobileControls}
      </div>
      <div className="relative mt-3 min-w-0 lg:col-start-1 lg:row-start-1 lg:mt-0 lg:block lg:min-h-0">
        <div
          ref={thumbnailsRef}
          role="group"
          aria-label="تصاویر محصول؛ برای مشاهده تصاویر بیشتر اسکرول کنید"
          tabIndex={0}
          className="relative flex min-h-0 min-w-0 touch-pan-x touch-pinch-zoom flex-row gap-[var(--gallery-thumb-gap)] overflow-x-auto overflow-y-hidden overscroll-x-contain [scrollbar-width:none] lg:absolute lg:inset-0 lg:touch-pan-y lg:flex-col lg:overflow-x-hidden lg:overflow-y-auto lg:overscroll-contain [&::-webkit-scrollbar]:hidden"
        >
          {gallery.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setSelectedId(image.id)}
              aria-label={`نمایش تصویر ${index + 1}`}
              aria-pressed={selectedIndex === index}
              className={`focus-visible:ring-primary-400 relative aspect-square w-[calc((100%-36px)/4)] shrink-0 overflow-hidden rounded-xl border bg-[#efeeec] lg:w-full lg:rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-inset ${selectedIndex === index ? "border-primary-500 lg:border-primary-400" : "border-neutral-200 hover:border-primary-200 lg:border-transparent"}`}
            >
              <Image
                src={image.url}
                alt=""
                fill
                sizes="(max-width: 1023px) calc((100vw - 56px) / 4), 60px"
                className="object-contain"
              />
            </button>
          ))}
        </div>
        {gallery.length > 4 &&
          ([-1, 1] as const).map((direction) => (
            <button
              key={direction}
              type="button"
              data-scroll-direction={direction}
              onClick={handleThumbnailScroll}
              aria-label={
                direction === -1
                  ? "اسکرول تصاویر کوچک به بالا"
                  : "اسکرول تصاویر کوچک به پایین"
              }
              className={`focus-visible:ring-primary-400 absolute left-1/2 z-20 hidden size-[22px] lg:flex -translate-x-1/2 items-center justify-center rounded-full border border-white/70 bg-white/30 bg-[linear-gradient(135deg,rgba(255,255,255,0.75),rgba(255,255,255,0.1)_55%,rgba(255,255,255,0.4))] text-[#141121] shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),0_1px_4px_rgba(0,0,0,0.16)] backdrop-blur-[1px] transition-colors hover:bg-white/50 focus-visible:ring-2 focus-visible:outline-none ${direction === -1 ? "top-1" : "bottom-1"}`}
            >
              {direction === -1 ? (
                <ArrowUp size={14} strokeWidth={3} aria-hidden="true" />
              ) : (
                <ArrowDown size={14} strokeWidth={3} aria-hidden="true" />
              )}
            </button>
          ))}
        {gallery.length > 4 && (
          <div className="pointer-events-none absolute inset-0 lg:hidden">
            {([-1, 1] as const).map((direction) => (
              <button key={direction} type="button"
                onClick={() => changeImage(direction)}
                aria-label={direction === -1 ? "تصاویر کوچک قبلی" : "تصاویر کوچک بعدی"}
                disabled={direction === -1 ? selectedIndex === 0 : selectedIndex === gallery.length - 1}
                className={`pointer-events-auto absolute top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full border border-white/80 bg-white/40 text-neutral-1000 shadow-sm backdrop-blur-[20px] disabled:invisible ${direction === -1 ? "right-1" : "left-1"}`}>
                {direction === -1 ? <ArrowRight size={20} aria-hidden="true" /> : <ArrowLeft size={20} aria-hidden="true" />}
              </button>
            ))}
          </div>
        )}
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
}
