import CartPreviewPage from "../cart-preview-page";
import { cartMock } from "../../mock/cart.mock";
import { checkoutMock } from "../../mock/checkout.mock";

/** Composition entry for the design preview, separate from the live cart. */
export default function CheckoutPreviewPage() {
  return (
    <>
      <p
        role="status"
        dir="rtl"
        className="bg-primary-50 p-4 text-center text-sm"
      >
        پیش‌نمایش طراحی پرداخت با دادهٔ نمونه؛ به سبد واقعی متصل نیست.
      </p>
      <CartPreviewPage
        initialCart={cartMock}
        initialStep="payment"
        checkoutConfiguration={checkoutMock}
      />
    </>
  );
}
