"use client";

import { ChevronUp } from "lucide-react";

const BackToTop = () => {
  const handleBackToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  };

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-10 mx-auto h-0 max-w-[1248px]">
      <div className="absolute top-0 left-1/2 w-24 -translate-x-1/2 lg:left-12 xl:left-8">
        <svg
          viewBox="0 -2 96 36"
          width="96"
          height="36"
          aria-hidden="true"
          className="relative -top-0.5 block fill-neutral-100"
        >
          <path d="M0-2H96V0C84 0 81 6 75.713 16A32 32 0 0 1 20.287 16C15 6 12 0 0 0Z" />
        </svg>
      <button
        type="button"
        onClick={handleBackToTop}
        className="pointer-events-auto absolute -top-5 left-1/2 z-10 flex size-10 -translate-x-1/2 items-center justify-center rounded-full border-0 bg-secondary-500 text-neutral-50 shadow-[0_0_0_8px_var(--neutral-100)] transition-colors hover:bg-secondary-600 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary-500"
        aria-label="بازگشت به بالا"
      >
        <ChevronUp size={18} strokeWidth={1.5} aria-hidden="true" />
      </button>
      </div>
    </div>
  );
};

export default BackToTop;
