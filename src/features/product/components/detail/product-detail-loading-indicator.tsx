"use client";

import { useEffect, useRef, useState } from "react";
import type { AnimationItem } from "lottie-web";
import animationData from "../../assets/product-details-waiting.json";
import ProductLoadingIndicator from "../product-loading-indicator";

export default function ProductDetailLoadingIndicator() {
  const container = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let disposed = false;
    let animation: AnimationItem | undefined;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => {
      if (reducedMotion.matches) animation?.goToAndStop(30, true);
      else animation?.play();
    };
    reducedMotion.addEventListener("change", syncMotion);
    void import("lottie-web").then(({ default: lottie }) => {
      if (disposed || !container.current) return;
      animation = lottie.loadAnimation({
        container: container.current,
        renderer: "svg",
        loop: true,
        autoplay: !reducedMotion.matches,
        animationData: structuredClone(animationData),
        rendererSettings: { preserveAspectRatio: "xMidYMid meet" },
      });
      animation.addEventListener("data_failed", () => {
        if (!disposed) setFailed(true);
      });
      syncMotion();
    }).catch(() => {
      if (!disposed) setFailed(true);
    });
    return () => {
      disposed = true;
      reducedMotion.removeEventListener("change", syncMotion);
      animation?.destroy();
    };
  }, []);

  if (failed) return <ProductLoadingIndicator variant="details" announce={false} />;

  return (
    <div dir="rtl" className="flex flex-col items-center justify-center gap-3 py-6 text-center sm:py-8">
      <div ref={container} aria-hidden="true" className="size-[112px] text-primary-500 sm:size-[134.4px] [&_svg_path]:stroke-primary-500" />
      <p className="text-mobile-label-l text-neutral-900 lg:text-desktop-label-l">
        در حال آماده‌سازی جزئیات محصول
      </p>
      <p className="text-mobile-body-s max-w-sm px-3 leading-6 text-neutral-800 lg:text-desktop-body-s">
        اطلاعات محصول در حال دریافت و آماده‌سازی است؛ لطفاً کمی صبر کنید.
      </p>
    </div>
  );
}
