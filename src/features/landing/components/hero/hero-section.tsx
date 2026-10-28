"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import shipping from "../../assets/shipping.png";
import { HeroContent } from "./hero-content";
export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // Subtract the space occupied by both the ticker and the actual header.
    const updateViewport = () => {
      const top = Math.ceil(
        section.getBoundingClientRect().top + window.scrollY,
      );
      section.style.setProperty("--hero-top", `${top}px`);
    };

    updateViewport();
    const observer = new ResizeObserver(updateViewport);
    const header = document.querySelector("header");
    if (header) {
      observer.observe(header);
      if (header.previousElementSibling)
        observer.observe(header.previousElementSibling);
    }
    window.addEventListener("resize", updateViewport);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateViewport);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      dir="rtl"
      aria-labelledby="landing-hero-title"
      className="w-full bg-[#F6F5F3] px-6 pt-10 pb-4 sm:px-10 sm:pt-14 sm:pb-6 lg:h-[calc(100svh-var(--hero-top,176px))] lg:pt-[clamp(12px,4svh,64px)] lg:pb-4"
    >
      <div className="mx-auto flex w-full max-w-[1184px] flex-col items-center gap-6 sm:gap-8 lg:h-full lg:min-h-0 lg:gap-4">
        <HeroContent />
        <div className="flex w-full justify-center lg:relative lg:min-h-0 lg:flex-1">
          <Image
            src={shipping}
            alt="شبکه حمل‌ونقل و واردات کالا شامل کشتی، هواپیما، انبار و کامیون"
            priority
            sizes="(min-width: 1184px) 826px, (min-width: 640px) 70vw, calc(100vw - 48px)"
            className="h-auto w-full max-w-[826px] object-contain mix-blend-multiply sm:w-[70%] lg:absolute lg:inset-0 lg:h-full lg:w-full lg:max-w-none"
          />
        </div>
      </div>
    </section>
  );
}
