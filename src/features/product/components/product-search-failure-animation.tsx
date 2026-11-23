"use client";
import { useEffect, useRef } from "react";
import type { AnimationItem } from "lottie-web";
import animationData from "../assets/search-failed.json";

export default function ProductSearchFailureAnimation() {
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let disposed = false;
    let animation: AnimationItem | undefined;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => {
      if (motion.matches) animation?.goToAndStop(60, true);
      else animation?.play();
    };
    motion.addEventListener("change", syncMotion);
    void import("lottie-web").then(({ default: lottie }) => {
      if (disposed || !container.current) return;
      animation = lottie.loadAnimation({
        container: container.current,
        renderer: "svg",
        loop: true,
        autoplay: !motion.matches,
        animationData: structuredClone(animationData),
        rendererSettings: { preserveAspectRatio: "xMidYMid meet" },
      });
      syncMotion();
    }).catch(() => {
      // The error message and retry controls remain available without animation.
    });
    return () => {
      disposed = true;
      motion.removeEventListener("change", syncMotion);
      animation?.destroy();
    };
  }, []);
  return <div ref={container} aria-hidden="true" className="mx-auto size-40 text-primary-500 sm:size-48 [&_svg_path]:fill-primary-500" />;
}
