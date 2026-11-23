"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import styles from "./header-surface.module.css";

export function HeaderSurface({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const [overHero, setOverHero] = useState(false);

  useEffect(() => {
    if (pathname !== "/") return;
    const hero = document.querySelector<HTMLElement>("[data-landing-hero]");
    const header = headerRef.current;
    if (!hero || !header) return;
    let frame = 0;
    let previous: boolean | undefined;
    let start = 0;
    let end = 0;
    const sync = () => {
      frame = 0;
      const next = window.scrollY >= start && window.scrollY < end;
      if (next === previous) return;
      previous = next;
      setOverHero(next);
    };
    const measure = () => {
      const bounds = hero.getBoundingClientRect();
      const headerHeight = header.getBoundingClientRect().height;
      // Switch earlier, when the hero reaches the middle of the sticky header.
      start = bounds.top + window.scrollY - headerHeight / 2;
      end = bounds.bottom + window.scrollY - headerHeight;
      sync();
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(sync);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(hero);
    observer.observe(header);
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    window.addEventListener("pageshow", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
      window.removeEventListener("pageshow", measure);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [pathname]);

  return (
    <header
      ref={headerRef}
      data-over-hero={pathname === "/" && overHero}
      className={`${styles.header} shadow-primary-900/5 sticky top-0 z-50 w-full bg-white/65 shadow-sm inset-shadow-[0_1px_0] inset-shadow-white/60 backdrop-blur-[15px] backdrop-saturate-150 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-neutral-200 supports-[backdrop-filter:blur(1px)]:bg-white/15`}
    >
      {children}
    </header>
  );
}
