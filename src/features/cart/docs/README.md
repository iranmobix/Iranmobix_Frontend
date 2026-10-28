# راهنمای فیچر سبد خرید

این مستند رفتار موجود در برنچ `feature/cart` را توضیح می‌دهد. معماری از [راهنمای مشترک توسعهٔ فیچر](https://github.com/nima-toghraee/iranmobix/blob/docs/feature-guide/docs/feature-development.md) پیروی می‌کند. نسخهٔ محلی راهنما در `.project-docs/docs/feature-development.md` قرار دارد؛ آن پوشه worktree مستقل است و با جابه‌جایی برنچ اصلی عوض نمی‌شود.

## مسیر مطالعه

1. [معماری و مسئولیت تک‌تک فایل‌ها](architecture.md): چه چیزی کجا نوشته می‌شود و چه چیزهایی قابل استفادهٔ مجدد هستند.
2. [قرارداد API](api-contract.md): ورودی، خروجی، mapping و ابهام‌های بک.
3. [جریان‌ها](flow.md): دریافت سبد، افزودن، session، ورود و انتقال، پیش‌نمایش پرداخت.
4. [تصمیم‌ها و توسعهٔ بعدی](decisions.md): علت مرزبندی، الگوی افزودن قابلیت و کارهای باقی‌مانده.
5. [گزارش بررسی](review.md): تغییرات این ریفکتور، تست‌ها و حدود تأیید.

## وضعیت قابلیت‌ها

| مسیر یا عملیات                      | وضعیت                                                                                       |
| ----------------------------------- | ------------------------------------------------------------------------------------------- |
| `/cart`                             | دریافت واقعی، loading/error/empty، مبلغ و تعداد از پاسخ بک                                  |
| دکمهٔ افزودن در دیتیل محصول         | اعتبارسنجی ورودی، دریافت session در صورت نیاز، POST و تازه‌سازی سبد                         |
| انتقال بعد از ورود                  | اتصال موجود در LoginForm همین برنچ؛ نیازمند تأیید قرارداد احراز هویت روی بک                 |
| نمایش دادهٔ نمونه بعد از خطای سبد   | انتخاب صریح کاربر؛ schema و mapper مشترک با API و کش مستقل                                  |
| تغییر تعداد و حذف در سبد واقعی      | PATCH/DELETE متصل؛ تازه‌سازی GET و نمایش pending/error                                      |
| ثبت اولیهٔ سفارش                    | POST واقعی با ریال بک، ورود، idempotency و نتیجهٔ ارسال؛ وضعیت سفارش/پرداخت نیازمند پاسخ بک |
| `/cart/checkout`                    | پیش‌نمایش طراحی با موک؛ ادامهٔ سبد واقعی نیست                                               |
| تأیید کارشناس، آدرس، تخفیف و پرداخت | رفتار محلی پیش‌نمایش؛ سفارش یا تراکنش واقعی ایجاد نمی‌کند                                   |

## استفاده از بیرون فیچر

ورودی عمومی [index.ts](../index.ts) فقط مصرف‌کننده‌های فعلی را ارائه می‌کند:

```tsx
import {
  CartPage,
  AddToCartButton,
  CartMergeAfterLogin,
  CheckoutPreviewPage,
} from "@/features/cart";

// در فرم محصول، مقادیر از انتخاب کاربر و شناسه‌های واقعی محصول می‌آیند:
<AddToCartButton
  slug={product.slug}
  payload={{ quantity, color: selectedColorId, guarantee: selectedGuaranteeId }}
  disabled={!canSubmit}
/>;
```

رنگ و گارانتی **شناسهٔ رشته‌ای** هستند. مدل کامل Product را به جای payload ارسال نکنید. محل استفادهٔ واقعی دکمه [product-purchase-form.tsx](../../product/components/detail/product-purchase-form.tsx) است. [LoginForm](../../auth/components/login-form.tsx) فقط بعد از موفقیت ورود، `CartMergeAfterLogin` را mount می‌کند.

[route سبد](<../../../app/(main)/cart/page.tsx>) و [route پیش‌نمایش پرداخت](<../../../app/(main)/cart/checkout/page.tsx>) فقط metadata و ترکیب صفحه دارند. برای API، mapper و storage داخل route کد ننویسید.

پیش‌نیاز اجرا: QueryClientProvider بالادست و مقدار درست `NEXT_PUBLIC_API_URL` برای shared HTTP client. endpointها در cart میزبان ثابت ندارند.

## مرز داده

پاسخ خام بک ابتدا runtime validation می‌شود، سپس mapper آن را به domain تبدیل می‌کند. کامپوننت سبد خام‌دادهٔ API یا localStorage را نمی‌خواند. مبلغ واقعی رشتهٔ ده‌دهی باقی می‌ماند؛ جمع و نرخ ارز در UI بازسازی نمی‌شود.

نام، تصویر، لینک، رنگ و مبالغ هر ردیف از پاسخ واقعی سبد مپ و نمایش داده می‌شوند؛ سایر ویژگی‌های انتخاب‌شده در domain محفوظ‌اند. رنگ SKU از selected_options.attributes و قیمت ردیف از pricing.final_total_price با currency سبد گرفته می‌شود. قرارداد نمونه‌های غیر null فروشنده، رنگ/گارانتی مستقل و related_products هنوز لازم است؛ [جزئیات قرارداد](api-contract.md).

## بررسی

از ریشهٔ پروژه و با ابزارهای نصب‌شده:

```sh
node --test src/features/cart/tests/cart.test.cjs src/features/cart/tests/cart-api.test.cjs
npx --no-install eslint src/features/cart "src/app/(main)/cart" src/features/auth/components/login-form.tsx src/features/product/components/detail/product-purchase-form.tsx
npx --no-install tsc --noEmit --incremental false
```

تست‌های رفتار جای تست بک زنده، احراز هویت یا بازبینی مرورگر را نمی‌گیرند. نتیجهٔ فعلی در [review.md](review.md) ثبت شده است.

## تطبیق نمایش سبد با طرح و کمبودهای داده

چیدمان و پیام‌های کنار فیلدها مطابق طرح سبد تنظیم شده‌اند. مسئولیت helper خالص `utils/cart-presentation.utils.ts` تشخیص وضعیت مقادیر نمایشی است؛ کنترل‌های واقعی تعداد/حذف متصل‌اند؛ ثبت اولیه متصل است؛ قرارداد وضعیت سفارش و پرداخت هنوز کامل نیست. قواعد تفاوت دادهٔ مفقود، ساختار نامشخص و «ندارد» در [قرارداد نمایش سبد](api-contract.md#تطبیق-نمایش-سبد-با-طرح-و-کمبودهای-داده) آمده‌اند.
