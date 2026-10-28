"use client";
import { useId } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAddToCart } from "../hooks/use-cart-actions";
import type { AddToCartInput } from "../types/api/cart-payload.types";

type Props = AddToCartInput & { disabled?: boolean; className?: string };
export default function AddToCartButton({
  slug,
  payload,
  disabled,
  className,
}: Props) {
  const action = useAddToCart();
  const messageId = useId();
  return (
    <div className={className}>
      <Button
        type="button"
        disabled={disabled || action.isBusy}
        onClick={() => {
          if (!disabled) action.add({ slug, payload });
        }}
        aria-busy={action.isPending}
        aria-describedby={messageId}
        className="h-11 w-full rounded-lg"
      >
        {action.isPending ? "در حال افزودن…" : "افزودن به سبد خرید"}
      </Button>
      <div id={messageId} className="mt-2 text-xs leading-6">
        {action.isError && (
          <p role="alert" className="text-error">
            افزودن کالا تأیید نشد. اتصال و انتخاب‌های محصول را بررسی کنید؛ پیش
            از تلاش دوباره،{" "}
            <Link href="/cart" className="underline">
              سبد خرید
            </Link>{" "}
            را ببینید.
          </p>
        )}
        {action.isSuccess && (
          <p role="status" className="text-success">
            کالا به سبد اضافه شد.{" "}
            <Link href="/cart" className="underline">
              مشاهده سبد خرید
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
