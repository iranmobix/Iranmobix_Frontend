"use client";

import { useEffect, useRef, type ReactNode } from "react";
import type { ProductDetailSeller } from "../../types/domain/product-detail-seller.types";
import ProductSellerCard from "./supplier/product-seller-card";

export default function ProductGalleryColumn({
  gallery,
  seller,
  sellerPlaceholder,
  mobileImportLayout = false,
}: {
  gallery: ReactNode;
  seller?: ProductDetailSeller | null;
  sellerPlaceholder?: ReactNode;
  mobileImportLayout?: boolean;
}) {
  const columnRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const column = columnRef.current;
    if (!column) return;
    const header = document.querySelector("header");
    const desktop = window.matchMedia("(min-width: 1024px)");
    let frame = 0;
    const update = () => {
      frame = 0;
      if (!desktop.matches) return;
      const stickyTop = Math.ceil(
        Math.max(0, header?.getBoundingClientRect().bottom ?? 157) + 16,
      );
      const pixels = `${stickyTop}px`;
      if (column.style.getPropertyValue("--gallery-sticky-top") !== pixels)
        column.style.setProperty("--gallery-sticky-top", pixels);
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    const observer = new ResizeObserver(schedule);
    if (header) observer.observe(header);
    if (header?.previousElementSibling)
      observer.observe(header.previousElementSibling);
    if (column.parentElement?.parentElement)
      observer.observe(column.parentElement.parentElement);
    window.addEventListener("resize", schedule);
    window.addEventListener("scroll", schedule, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", schedule);
      window.removeEventListener("scroll", schedule);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);
  return (
    <div
      ref={columnRef}
      className="min-w-0 lg:sticky lg:top-[var(--gallery-sticky-top,173px)] lg:col-start-1 lg:row-start-1 lg:self-start"
    >
      <div className="min-w-0">{gallery}</div>
      <div
        className={mobileImportLayout ? "hidden shrink-0 lg:block" : "shrink-0"}
      >
        {seller ? <ProductSellerCard seller={seller} /> : sellerPlaceholder}
      </div>
    </div>
  );
}
