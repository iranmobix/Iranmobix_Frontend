"use client";
import { useCallback } from "react";
import { useAccessToken } from "@/features/auth/hooks/use-access-token";
import CartSteps from "./cart-steps";
import CartUnavailable from "./cart-unavailable";
import { useCartItemActions } from "../hooks/use-cart-actions";
import { useCart } from "../hooks/use-cart";
import CartEmpty from "./cart-empty";
import CartList from "./cart-list";
import CartSummary from "./cart-summary";
import { useCartSubmitOrder } from "../hooks/use-cart-submit-order";
import CartOrderSubmitted from "./cart-order-submitted";
import { getCartFieldNote } from "../utils/cart-data-issues";

export default function CartPage() {
  const paymentSidebarRef = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    const header = document.querySelector("header");
    const updateOffset = () => {
      const height = header?.getBoundingClientRect().height ?? 0;
      node.style.setProperty("--cart-header-height", height + "px");
    };
    updateOffset();
    const observer = new ResizeObserver(updateOffset);
    if (header) observer.observe(header);
    return () => observer.disconnect();
  }, []);
  const accessToken = useAccessToken();
  const cartQuery = useCart();
  const actions = useCartItemActions();
  const cart = cartQuery.data;
  const showMock = cartQuery.isMock;
  const submitOrder = useCartSubmitOrder(
    cart,
    showMock,
    cartQuery.isFetching || cartQuery.isError,
  );
  if (submitOrder.accepted)
    return (
      <main dir="rtl" className="min-h-screen bg-neutral-50 px-4 py-8 lg:px-9">
        <CartSteps currentStep="review" />
        <CartOrderSubmitted
          summary={submitOrder.accepted}
          onBack={submitOrder.backToCart}
        />
      </main>
    );
  return (
    <main
      dir="rtl"
      className="min-h-screen bg-neutral-50 px-2 py-2 sm:px-4 sm:py-8 lg:px-9"
    >
      <div className="mx-auto max-w-[1440px] space-y-3 sm:space-y-5">
        <CartSteps currentStep={accessToken ? "cart" : "account"} />
        {cartQuery.isPending && !cart && (
          <div role="status" className="rounded-lg bg-white p-8">
            <span className="sr-only">در حال دریافت سبد خرید</span>
            <div
              aria-hidden="true"
              className="space-y-5 motion-safe:animate-pulse"
            >
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-28 rounded bg-neutral-100" />
              ))}
            </div>
          </div>
        )}
        {cartQuery.isError && <CartUnavailable />}
        {!showMock && actions.isError && (
          <p
            role="alert"
            className="text-error rounded-md bg-white p-3 text-sm"
          >
            تغییر سبد خرید تأیید نشد؛ وضعیت سبد دوباره از بک بررسی می‌شود.
          </p>
        )}
        {!showMock && actions.isPending && (
          <p role="status" className="text-primary-700 text-xs">
            در حال به‌روزرسانی سبد خرید…
          </p>
        )}
        {cart && !cartQuery.isError && (
          <>
            {cart.issues.length > 0 && (
              <ul
                aria-label="پیام‌های سبد خرید"
                className="space-y-2 rounded-lg bg-white p-4 text-sm text-neutral-800"
              >
                {cart.issues.map((issue, index) => (
                  <li key={index}>{issue}</li>
                ))}
              </ul>
            )}
            {cart.items.length === 0 ? (
              getCartFieldNote(cart.dataIssues, "items") ? (
                <CartUnavailable />
              ) : (
                <CartEmpty />
              )
            ) : (
              <div className="grid items-start gap-2 sm:gap-3 lg:grid-cols-[minmax(0,1fr)_30%]">
                <div className="min-w-0 space-y-2 sm:space-y-3">
                  <CartList
                    items={cart.items}
                    disabled={
                      actions.isBusy ||
                      cartQuery.isFetching ||
                      cartQuery.isError
                    }
                    onQuantityChange={
                      showMock ? undefined : actions.changeQuantity
                    }
                    onRemove={showMock ? undefined : actions.removeItem}
                  />
                </div>
                <div
                  ref={paymentSidebarRef}
                  className="min-w-0 space-y-3 lg:sticky lg:top-[calc(var(--cart-header-height,157px)+16px)] lg:self-start"
                >
                  <CartSummary
                    items={cart.items}
                    paymentDetails={cart.paymentDetails}
                    dataIssues={cart.dataIssues}
                    currency={cart.currency}
                    totals={{
                      quantity: cart.totalQuantity,
                      originalSubtotal: cart.subtotal,
                      discount: cart.discountTotal,
                      shipping: null,
                      total: cart.finalTotal,
                    }}
                    onContinue={submitOrder.submit}
                    disabled={submitOrder.disabled}
                    isSubmitting={submitOrder.isPending}
                    unavailableReason={
                      submitOrder.unavailableReason ?? undefined
                    }
                  />
                  {submitOrder.error && (
                    <p role="alert" className="text-error text-xs leading-6">
                      {submitOrder.error}
                    </p>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
