"use client";

import type { Product } from "@/features/product/types/domain/product.types";
import type {
  CartSnapshot,
  CartStep,
} from "../types/domain/cart-preview.types";
import type { CheckoutConfiguration } from "../types/domain/checkout.types";
import CartCheckout from "./checkout/cart-checkout";
import { useCartPreview } from "../hooks/use-cart-preview";
import { EMPTY_CART_SNAPSHOT } from "../constants/cart.constants";
import CartEmpty from "./cart-empty";
import CartRecentlyViewed from "./cart-recently-viewed";
import CartList from "./cart-list";
import CartSummary from "./cart-summary";
import CartSteps from "./cart-steps";
import CartReview from "./cart-review";

type CartPreviewPageProps = {
  initialCart?: CartSnapshot;
  initialStep?: CartStep;
  checkoutConfiguration?: CheckoutConfiguration;
  recentlyViewedProducts?: readonly Product[];
  suggestedProducts?: readonly Product[];
};

const CartPreviewPage = ({
  initialCart = EMPTY_CART_SNAPSHOT,
  initialStep = "cart",
  checkoutConfiguration,
  recentlyViewedProducts = [],
  suggestedProducts = [],
}: CartPreviewPageProps) => {
  const cart = useCartPreview(
    initialCart,
    checkoutConfiguration ? initialStep : "cart",
  );
  const isEmpty = cart.items.length === 0;
  const isReview = cart.step === "review";
  const isPayment = cart.step === "payment";
  return (
    <div dir="rtl" className="min-h-screen bg-neutral-50">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-4 py-6 sm:px-6 lg:px-9 lg:py-8">
        {!isEmpty && <CartSteps currentStep={cart.step} />}
        <div
          role="status"
          aria-live="polite"
          className={
            cart.notice
              ? "flex flex-wrap items-center gap-3 text-sm text-primary-700"
              : "sr-only"
          }
        >
          {cart.notice}
          {cart.removedItem && (
            <button
              type="button"
              onClick={cart.undoRemove}
              className="rounded px-2 py-1 underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
            >
              برگرداندن کالا
            </button>
          )}
        </div>
        {isEmpty ? (
          <CartEmpty />
        ) : isPayment && checkoutConfiguration ? (
          <CartCheckout
            cart={cart}
            configuration={checkoutConfiguration}
            onCancelOrder={cart.cancelOrder}
          />
        ) : isReview ? (
          <CartReview
            totals={cart.totals}
            currency={cart.currency}
            onBack={cart.backToCart}
            onApproved={checkoutConfiguration ? cart.approveReview : undefined}
          />
        ) : (
          <div className="grid items-start gap-3 lg:grid-cols-[minmax(0,1fr)_30%]">
            <CartList
              items={cart.items}
              onQuantityChange={cart.changeQuantity}
              onRemove={cart.removeItem}
            />
            <CartSummary
              totals={cart.totals}
              currency={cart.currency}
              onContinue={cart.continueToReview}
            />
          </div>
        )}
        {!isReview && !isPayment && (
          <CartRecentlyViewed
            products={isEmpty ? recentlyViewedProducts : suggestedProducts}
            title={
              isEmpty ? "اخیراً بازدید شده" : "کالاهای مشابه با سبد خرید شما"
            }
          />
        )}
      </div>
    </div>
  );
};

export default CartPreviewPage;
