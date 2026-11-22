"use client";

import { useState } from "react";
import { CloudOff, PackageOpen, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import styles from "./product-catalog-unavailable.module.css";

export default function ProductCatalogUnavailable() {
  const [refreshing, setRefreshing] = useState(false);
  const refresh = () => {
    if (refreshing) return;
    setRefreshing(true);
    window.location.reload();
  };

  return (
    <section
      role="alert"
      aria-labelledby="catalog-unavailable-title"
      dir="rtl"
      className="border-primary-100 relative mx-auto my-4 grid min-h-[min(72svh,600px)] w-full max-w-6xl items-center gap-6 overflow-hidden rounded-3xl border bg-white px-5 py-10 sm:px-10 md:grid-cols-2 md:gap-10 md:px-14 md:py-16"
    >
      <div className="relative z-10 order-2 text-center md:order-1 md:text-right">
        <span className="border-primary-100 bg-primary-50 text-mobile-caption text-primary-600 lg:text-desktop-caption mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-2">
          <span
            aria-hidden="true"
            className="bg-primary-400 size-1.5 rounded-full"
          />
          فهرست محصولات
        </span>
        <h1
          id="catalog-unavailable-title"
          className="text-mobile-h4 text-neutral-1000 lg:text-desktop-h3 leading-10 lg:leading-[1.6]"
        >
          یک وقفه کوتاه،
          <br />
          <span className="text-primary-600">تا دیدن محصولات</span>
        </h1>
        <p className="text-mobile-body-s lg:text-desktop-body-m mx-auto mt-4 max-w-sm leading-7 text-neutral-800 md:mx-0 lg:leading-8">
          فهرست محصولات فعلاً در دسترس نیست. صفحه را تازه‌سازی کنید تا دوباره
          محصولات را دریافت کنیم.
        </p>
        <Button
          type="button"
          onClick={refresh}
          disabled={refreshing}
          aria-busy={refreshing}
          className="text-mobile-label-m lg:text-desktop-label-m mt-7 h-12 w-full gap-2 rounded-xl px-6 text-white! sm:w-auto"
        >
          <RefreshCw
            size={18}
            aria-hidden="true"
            className={refreshing ? "motion-safe:animate-spin" : undefined}
          />
          {refreshing ? "در حال تازه‌سازی…" : "تازه‌سازی صفحه"}
        </Button>
      </div>
      <div className={styles.scene + " order-1 md:order-2"} aria-hidden="true">
        <div className={styles.halo} />
        <div className={styles.orbit} />
        <div className={styles.rearCard + " " + styles.rearRight}>
          <div />
          <div />
          <div />
        </div>
        <div className={styles.rearCard + " " + styles.rearLeft}>
          <div />
          <div />
          <div />
        </div>
        <div className={styles.frontCard}>
          <div className={styles.product}>
            <PackageOpen size={54} strokeWidth={1.2} />
          </div>
          <span className={styles.line} />
          <span className={styles.shortLine} />
          <div className={styles.cardFooter}>
            <span />
            <span />
          </div>
        </div>
        <span className={styles.status}>
          <CloudOff size={28} strokeWidth={1.4} />
        </span>
        <span className={styles.spark + " " + styles.sparkOne} />
        <span className={styles.spark + " " + styles.sparkTwo} />
      </div>
    </section>
  );
}
