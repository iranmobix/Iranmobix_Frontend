"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCartMergeFlow } from "../hooks/use-cart-merge-flow";

export default function CartMergeAfterLogin() {
  const { isPending, isError, issues, hasIssues } = useCartMergeFlow();
  if (isError || hasIssues)
    return (
      <div className="space-y-4 text-sm leading-7" dir="rtl">
        <p role="status">
          ورود انجام شد، اما انتقال کامل سبد مهمان تأیید نشد. اطلاعات سبد مهمان
          حفظ شده است.
        </p>
        {hasIssues && (
          <ul>
            {issues.map((issue, index) => (
              <li key={index}>{issue}</li>
            ))}
          </ul>
        )}
        <Button asChild variant="secondary">
          <Link href="/cart">بررسی سبد خرید</Link>
        </Button>
      </div>
    );
  return (
    <p role="status" className="text-center text-sm">
      {isPending ? "در حال انتقال سبد خرید…" : "در حال ورود به حساب…"}
    </p>
  );
}
