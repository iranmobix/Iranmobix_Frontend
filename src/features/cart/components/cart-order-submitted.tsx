"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCartMoney } from "../utils/cart.utils";

export default function CartOrderSubmitted({
  summary,
  onBack,
}: {
  summary: {
    quantity: number;
    total: string;
    currency: string;
    trackingCode: string | null;
  };
  onBack: () => void;
}) {
  const router = useRouter();
  const trackingCode = summary.trackingCode;
  useEffect(() => {
    if (trackingCode)
      router.replace("/cart/" + encodeURIComponent(trackingCode));
  }, [router, trackingCode]);
  return (
    <section
      dir="rtl"
      className="mx-auto max-w-3xl rounded-lg bg-white px-6 py-12 text-center"
    >
      <ClipboardCheck
        size={48}
        className="text-primary-500 mx-auto mb-5"
        aria-hidden="true"
      />
      <h1 className="text-xl font-medium">ثبت اولیه انجام شد</h1>
      <p role="status" className="mt-4 text-sm leading-7">
        {trackingCode
          ? "در حال دریافت وضعیت فعلی سفارش…"
          : "کد پیگیری این ثبت در مرورگر موجود نیست؛ لینک سفارش را از پیامک یا پشتیبانی دریافت کنید."}
      </p>
      <p className="mt-4 text-sm">
        {summary.quantity.toLocaleString("fa-IR")} کالا؛ جمع سبد ارسالی:{" "}
        <bdi>{formatCartMoney(summary.total, summary.currency)}</bdi>
      </p>
      {summary.trackingCode && (
        <p className="mt-4 text-sm">
          کد پیگیری: <bdi>{summary.trackingCode}</bdi>
        </p>
      )}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {summary.trackingCode && (
          <Button asChild>
            <Link href={"/cart/" + encodeURIComponent(summary.trackingCode)}>
              بررسی تأیید کارشناس و ادامه خرید
            </Link>
          </Button>
        )}
        <Button type="button" variant="secondary" onClick={onBack}>
          مشاهده سبد خرید
        </Button>
        <Button asChild variant="ghost">
          <Link href="/products">مشاهده محصولات</Link>
        </Button>
      </div>
    </section>
  );
}
