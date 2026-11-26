"use client";

import { usePathname } from "next/navigation";
import PageLoading from "./page-loading";

export default function RouteLoading() {
  const path = usePathname();
  const messages = path.startsWith("/products/")
    ? ["در حال آماده‌سازی جزئیات محصول", "تصاویر و اطلاعات محصول در حال دریافت هستند؛ لطفاً کمی صبر کنید."]
    : path.startsWith("/products") || path.startsWith("/imports")
      ? ["در حال دریافت محصولات", "نتایج جست‌وجو در حال آماده‌سازی هستند؛ لطفاً کمی صبر کنید."]
      : path.startsWith("/cart") || path.startsWith("/checkout")
        ? ["در حال دریافت اطلاعات خرید", "اطلاعات سبد خرید و سفارش شما در حال بررسی است؛ لطفاً کمی صبر کنید."]
        : path.startsWith("/panel")
          ? ["در حال دریافت اطلاعات حساب", "اطلاعات پنل شما در حال آماده‌سازی است؛ لطفاً کمی صبر کنید."]
          : path.startsWith("/blog")
            ? ["در حال دریافت مطالب", "مطالب مجله ایران موبیکس در حال آماده‌سازی هستند."]
            : path.startsWith("/faq")
              ? ["در حال دریافت پرسش‌های متداول", "پاسخ پرسش‌های شما در حال آماده‌سازی هستند."]
              : ["در حال آماده‌سازی صفحه", "لطفاً کمی صبر کنید."];
  return <PageLoading title={messages[0]} description={messages[1]} className="min-h-[60vh] bg-neutral-50 px-4" />;
}
