"use client";

import { useEffect, useRef, useState } from "react";
import type { AnimationItem } from "lottie-web";
import animationData from "@/shared/assets/page-loading.json";

export type PageLoadingProps = {
  title?: string;
  description?: string;
  className?: string;
};

export default function PageLoading({
  title = "در حال آماده‌سازی صفحه",
  description = "لطفاً کمی صبر کنید.",
  className = "",
}: PageLoadingProps) {
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

  return (
    <div dir="rtl" role="status" aria-live="polite" aria-busy="true" className={"flex w-full flex-col items-center justify-center gap-3 py-6 text-center sm:py-8 " + className}>
      <div ref={container} aria-hidden="true" className={failed ? "hidden" : "size-[112px] text-primary-500 sm:size-[134.4px] [&_svg_path]:stroke-primary-500"} />
      {failed && <span aria-hidden="true" className="my-8 size-12 rounded-full border-2 border-primary-100 border-t-primary-500 motion-safe:animate-spin" />}
      <p className="text-mobile-label-l text-neutral-900 lg:text-desktop-label-l">{title}</p>
      <p className="text-mobile-body-s max-w-sm px-3 leading-6 text-neutral-800 lg:text-desktop-body-s">{description}</p>
    </div>
  );
}
