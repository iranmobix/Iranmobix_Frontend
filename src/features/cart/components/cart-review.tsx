import { ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CartTotals } from "../types/domain/cart-preview.types";
import { formatCartMoney } from "../utils/cart.utils";

const CartReview = ({
  totals,
  currency,
  onBack,
  onApproved,
}: {
  totals: CartTotals;
  currency: string;
  onBack: () => void;
  onApproved?: () => void;
}) => (
  <section
    aria-labelledby="cart-review-title"
    className="mx-auto w-full max-w-3xl rounded-lg bg-white px-6 py-12 text-center"
  >
    <ClipboardCheck
      size={56}
      className="mx-auto mb-5 text-primary-500"
      aria-hidden="true"
    />
    <h1
      id="cart-review-title"
      className="text-xl font-medium text-neutral-1000"
    >
      تأیید کارشناسی
    </h1>
    <p className="mt-4 leading-8 text-neutral-800">
      سبد شما با {totals.quantity.toLocaleString("fa-IR")} کالا برای مرحلهٔ
      بررسی آماده است.
    </p>
    <p className="mt-3 text-lg text-primary-700">
      جمع موقت: <bdi>{formatCartMoney(totals.total, currency)}</bdi>
    </p>
    <p
      role="status"
      className="mx-auto mb-8 mt-5 max-w-lg rounded-lg bg-primary-50 p-4 text-sm leading-7 text-neutral-800"
    >
      این مرحله پیش‌نمایش آزمایشی است. هنوز درخواستی برای کارشناس ارسال نشده و
      سفارش یا پرداختی ثبت نشده است.
    </p>
    {onApproved && (
      <div className="mb-3">
        <Button type="button" onClick={onApproved}>
          پیش‌نمایش سبد تأییدشده
        </Button>
      </div>
    )}
    <Button type="button" variant="secondary" onClick={onBack}>
      بازگشت به سبد و ویرایش کالاها
    </Button>
  </section>
);

export default CartReview;
