"use client";

import { useEffect, useRef, type ReactNode } from "react";
import styles from "./services-reveal.module.css";

/** Progressive enhancement: service content stays visible without JavaScript or motion support. */
export function ServicesReveal({ children }: { children: ReactNode }) {
  const sectionRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !("IntersectionObserver" in window)) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motion.matches) return;
    const items = section.querySelectorAll<HTMLElement>(
      "[data-service-reveal]",
    );
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          (entry.target as HTMLElement).dataset.reveal = "visible";
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px 48px 0px", threshold: 0.08 },
    );

    items.forEach((item) => {
      // Do not hide content already on screen (restored scroll position or an anchor link).
      if (item.getBoundingClientRect().top < window.innerHeight) return;
      item.dataset.reveal = "pending";
      observer.observe(item);
    });
    const showAll = () => {
      if (!motion.matches) return;
      items.forEach((item) => {
        item.dataset.reveal = "visible";
      });
      observer.disconnect();
    };
    motion.addEventListener("change", showAll);
    return () => {
      observer.disconnect();
      motion.removeEventListener("change", showAll);
      items.forEach((item) => {
        delete item.dataset.reveal;
      });
    };
  }, []);

  return (
    <section id="services" ref={sectionRef} className={styles.section}>
      {children}
    </section>
  );
}
