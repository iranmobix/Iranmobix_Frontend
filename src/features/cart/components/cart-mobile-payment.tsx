"use client";

import { useEffect, useRef, useState } from "react";
import { Dialog } from "radix-ui";
import { ChevronLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCartMoney } from "../utils/cart.utils";
import CartSummary, { type CartSummaryProps } from "./cart-summary";
import styles from "./cart-mobile-payment.module.css";

type Props = CartSummaryProps & { error?: string | null };

export default function CartMobilePayment(props: Props) {
  const [open, setOpen] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = () => {
      if (desktop.matches) setOpen(false);
    };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    const root = document.documentElement;
    const property = "--cart-mobile-payment-height";
    const previous = root.style.getPropertyValue(property);
    const update = () => {
      const height = bar.getBoundingClientRect().height;
      if (height > 0) root.style.setProperty(property, height + "px");
    };
    const observer = new ResizeObserver(update);
    observer.observe(bar);
    update();
    return () => {
      observer.disconnect();
      if (previous) root.style.setProperty(property, previous);
      else root.style.removeProperty(property);
    };
  }, []);

  const total = props.paymentDetails?.iranTotalToman ?? props.totals.total;
  const totalText = total === "" || total == null
    ? "در انتظار تأیید"
    : formatCartMoney(total, props.currency === "TOMAN" ? "تومان" : props.currency);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <div
        ref={barRef}
        dir="rtl"
        className={styles.bar + " fixed inset-x-2 bottom-0 z-50 mx-auto flex max-w-xl flex-col gap-4 rounded-t-xl border border-white bg-white/40 px-4 pt-3 pb-[calc(12px+env(safe-area-inset-bottom))] shadow-lg lg:hidden"}
      >
        <div className="flex justify-end">
          <Dialog.Trigger asChild>
            <button type="button" className="text-mobile-label-m text-primary-600 focus-visible:ring-primary-300 inline-flex items-center gap-1 rounded px-1 py-1 focus-visible:ring-2 focus-visible:outline-none">
              جزئیات پرداخت
              <ChevronLeft aria-hidden="true" className="size-4" />
            </button>
          </Dialog.Trigger>
        </div>
        <p className="text-mobile-body-m text-neutral-900 flex flex-wrap items-baseline gap-1">
          <span>مجموع سبد خرید:</span>
          <bdi className="text-mobile-label-l">{totalText}</bdi>
        </p>
        <Button
          type="button"
          onClick={props.onContinue}
          disabled={props.disabled || props.isSubmitting || !props.onContinue || props.totals.quantity === 0}
          aria-busy={props.isSubmitting}
          aria-describedby={props.unavailableReason ? "cart-mobile-payment-unavailable" : undefined}
          className="text-mobile-label-l bg-primary-600 h-12 w-full rounded-lg text-white!"
        >
          {props.isSubmitting ? "در حال ثبت اولیه…" : "ثبت اولیه"}
        </Button>
        {props.unavailableReason && (
          <p id="cart-mobile-payment-unavailable" className="text-mobile-caption text-secondary-600 leading-6">{props.unavailableReason}</p>
        )}
        {props.error && <p role="alert" className="text-mobile-caption text-error leading-6">{props.error}</p>}

      </div>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-backdrop fixed inset-0 z-[80] lg:hidden" />
        <Dialog.Content
          dir="rtl"
          className={styles.sheet + " fixed inset-x-0 bottom-0 z-[81] mx-auto flex max-h-[calc(100dvh-12px)] w-full max-w-xl flex-col rounded-t-2xl border border-white bg-white/40 pt-2 pb-[env(safe-area-inset-bottom)] shadow-xl outline-none lg:hidden"}
        >
          <div aria-hidden="true" className="mx-auto mb-2 h-1 w-9 shrink-0 rounded-full bg-neutral-400" />
          <div className="flex items-center justify-between px-4 py-2">
            <Dialog.Title className="sr-only">جزئیات پرداخت سبد خرید</Dialog.Title>
            <Dialog.Description className="sr-only">ریز هزینه‌های سبد خرید و ثبت اولیه سفارش</Dialog.Description>
            <Dialog.Close asChild>
              <button type="button" aria-label="بستن جزئیات پرداخت" className="text-primary-600 focus-visible:ring-primary-300 mr-auto flex size-8 items-center justify-center rounded-lg focus-visible:ring-2 focus-visible:outline-none">
                <X size={18} aria-hidden="true" />
              </button>
            </Dialog.Close>
          </div>
          <div className="min-h-0 overflow-y-auto overscroll-y-contain [&_aside]:bg-transparent">
            <CartSummary {...props} idPrefix="cart-mobile-sheet" />
            {props.error && <p role="alert" className="text-mobile-caption text-error px-4 pb-4 leading-6">{props.error}</p>}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
