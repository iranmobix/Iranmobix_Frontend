"use client";
import { useAccessToken } from "@/features/auth/hooks/use-access-token";
import CartSteps from "./cart-steps";
import { Button } from "@/components/ui/button";
import { useCartItemActions } from "../hooks/use-cart-actions";
import { useCart } from "../hooks/use-cart";
import CartEmpty from "./cart-empty";
import CartList from "./cart-list";
import CartShippingMethods from "./cart-shipping-methods";
import CartSummary from "./cart-summary";
import { useCartSubmitOrder } from "../hooks/use-cart-submit-order";
import CartOrderSubmitted from "./cart-order-submitted";
import { getCartFieldNote } from "../utils/cart-data-issues";

export default function CartPage() {
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
        {showMock && (
          <div
            role="status"
            className="bg-primary-50 flex flex-wrap items-center justify-between gap-3 rounded-lg p-4 text-sm"
          >
            پیش‌نمایش دادهٔ نمونه
            <Button
              variant="ghost"
              onClick={cartQuery.showApiData}
              disabled={actions.isBusy}
            >
              دریافت سبد واقعی
            </Button>
          </div>
        )}
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
        {cartQuery.isError && (
          <div role="alert" className="space-y-4 rounded-lg bg-white p-6">
            <p>
              {showMock
                ? "نمایش دادهٔ نمونه ناموفق بود."
                : "دریافت اطلاعات سبد خرید ناموفق بود."}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => void cartQuery.refetch()}
                disabled={cartQuery.isFetching || actions.isBusy}
              >
                تلاش دوباره
              </Button>
              {!showMock && (
                <Button
                  variant="secondary"
                  onClick={cartQuery.showMockData}
                  disabled={actions.isBusy}
                >
                  نمایش دادهٔ نمونه
                </Button>
              )}
            </div>
          </div>
        )}
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
        {cart && (
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
            {cart.items.length === 0 && !getCartFieldNote(cart.dataIssues,"items") ? (
              <CartEmpty />
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
                  <CartShippingMethods
                    value={submitOrder.shippingMethod}
                    onChange={submitOrder.setShippingMethod}
                    disabled={actions.isBusy || submitOrder.isPending}
                  />
                </div>
                <div className="space-y-3">
                  <CartSummary
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
