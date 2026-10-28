# معماری Cart و راهنمای فایل‌ها

این فیچر از مرزبندی لایه‌های Auth و راهنمای مشترک استفاده می‌کند. نام فایل‌ها مطابق قرارداد موجود cart به صورت kebab-case باقی مانده‌اند. پوشهٔ store نیاز عملی نداشت؛ فایل خالی آن و cart-link خالی حذف شدند. برای هر بخش ظاهری کوچک فایل تازه نسازید.

## جهت وابستگی

```text
route / feature consumer
          ↓ public index
component → hook → service → API → shared HTTP
                       ↘ schema → mapper → domain
                       ↘ storage (session only)

preview component → preview hook → pure preview service
```

types وابسته به React، Axios یا component نیستند. schema بررسی runtime دارد. mapper تبدیل خالص است. service هماهنگ‌کنندهٔ عملیات است. hook وضعیت درخواست، cache یا مرحلهٔ UI را مدیریت می‌کند. state کوتاه فرم، باز بودن مودال و Clipboard نزدیک UI باقی می‌مانند.

API با unknown پاسخ می‌دهد تا صحت JSON با generic فرض نشود. schemaها با satisfies به DTO مربوط متصل‌اند؛ تغییر type بدون تغییر سازگار schema باید در TypeScript دیده شود. این کنترل یک‌طرفهٔ سازگاری type است؛ تست پاسخ واقعی و بررسی فیلدهای جدید همچنان لازم است.

## قرارداد، تبدیل و دادهٔ نمونه

همهٔ مسیرهای جدول نسبت به ریشهٔ همین فیچر هستند.

| فایل                                                                        | مسئولیت و روش تغییر                                                                                                                                     |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [types/api/cart-api.types.ts](../types/api/cart-api.types.ts)               | پاسخ‌های session، cart، item و merge با snake_case؛ product، selected_options، pricing و availability تایپ‌شده؛ فقط بخش‌های بدون نمونهٔ غیرخالی unknown |
| [types/api/cart-payload.types.ts](../types/api/cart-payload.types.ts)       | ورودی add/update/remove شامل شناسه و payload؛ required/optional را فقط با قرارداد تغییر دهید                                                            |
| [types/domain/cart.types.ts](../types/domain/cart.types.ts)                 | مدل واقعی ServerCart، ServerCartItem، GuestCartSession، CartMergeResult و CartDataSource؛ camelCase، پول رشته‌ای                                        |
| [types/domain/cart-preview.types.ts](../types/domain/cart-preview.types.ts) | CartItem، Snapshot، Totals، State و Action مخصوص پیش‌نمایش؛ Product موجود را reuse می‌کند                                                               |
| [types/domain/checkout.types.ts](../types/domain/checkout.types.ts)         | قرارداد محلی آدرس، پرداخت، کوپن، حساب بانکی و جمع‌های پیش‌نمایش؛ DTO بک نیست                                                                            |
| [schemas/cart.schema.ts](../schemas/cart.schema.ts)                         | اعتبار ورودی add/update/remove و پاسخ‌های session/cart/merge؛ عدد امن، مبلغ ده‌دهی، تاریخ و یکتایی id ردیف                                              |
| [schemas/checkout.schema.ts](../schemas/checkout.schema.ts)                 | قواعد مشترک فرم آدرس پیش‌نمایش؛ React Hook Form و هوک از همین schema استفاده می‌کنند                                                                    |
| [mappers/cart.mapper.ts](../mappers/cart.mapper.ts)                         | mapCart، mapCartMerge و mapGuestCartSession؛ تبدیل اسامی/id، استخراج رنگ SKU، حفظ قیمت ردیف و currency سبد؛ بدون fetch/storage                          |
| [mock/cart-api.mock.ts](../mock/cart-api.mock.ts)                           | fixture مطابق DTO شبکه برای نمایش نمونهٔ /cart و تست؛ پاسخ واقعی پنج‌ردیفی شامل محصول، انتخاب و قیمت                                                    |
| [mock/cart.mock.ts](../mock/cart.mock.ts)                                   | snapshot دامنهٔ پیش‌نمایش با کالاهای طراحی؛ پاسخ ساختگی بک معرفی نشود                                                                                   |
| [mock/checkout.mock.ts](../mock/checkout.mock.ts)                           | تنظیمات، آدرس، قیمت‌های ریالی، کوپن و حساب بانکی نمونهٔ پیش‌نمایش                                                                                       |

مدل قدیمی پیش‌نمایش از cart.types.ts به cart-preview.types.ts منتقل شده و مدل واقعی جای cart-response.types.ts در cart.types.ts قرار گرفته است. این جداسازی مانع استفادهٔ ناخواسته از محاسبات نمونه برای سبد واقعی می‌شود.

## API، service و ابزارها

| فایل                                                                    | مسئولیت و قاعدهٔ نوشتن                                                                                                                         |
| ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| [api/cart.api.ts](../api/cart.api.ts)                                   | شش درخواست HTTP؛ path، signal، credentials و هدر اختصاصی همین‌جا؛ بدون JSX، cache یا fallback                                                  |
| [api/cart.api.mock.ts](../api/cart.api.mock.ts)                         | adapter فقط خواندنی؛ clone مستقل fixture و Promise<unknown>؛ add/merge جعلی ندارد                                                              |
| [services/cart.service.ts](../services/cart.service.ts)                 | انتخاب adapter دریافت، parse/map، هماهنگی add/update/remove و merge؛ خروجی آمادهٔ مصرف هوک، بدون navigation                                    |
| [services/cart-session.service.ts](../services/cart-session.service.ts) | چرخهٔ مستقل دریافت/استفادهٔ session، انقضا و اشتراک Promise در همان تب                                                                         |
| [services/cart-preview.service.ts](../services/cart-preview.service.ts) | createCartState و reducer خالص پیش‌نمایش؛ معتبر کردن snapshot و انتقال مرحله‌ها                                                                |
| [services/checkout.service.ts](../services/checkout.service.ts)         | محاسبات و قواعد خالص پیش‌نمایش ریالی، کوپن و مجاز بودن پرداخت؛ شبکه ندارد                                                                      |
| [utils/cart-session.storage.ts](../utils/cart-session.storage.ts)       | تنها مالک persistence مهمان؛ guard مرورگر، اعتبار داده، fallback حافظه و حذف شرطی                                                              |
| [utils/cart.utils.ts](../utils/cart.utils.ts)                           | فرمت مبلغ واقعی/پیش‌نمایش و formatCheckoutMoney، نرمال‌سازی رقم و اعتبار تعداد، محاسبهٔ مبالغ پیش‌نمایش و گردآوری مسائل merge؛ بدون React/HTTP |
| [utils/cart-presentation.utils.ts](../utils/cart-presentation.utils.ts) | متن وضعیت دادهٔ ناقص در UI از domain؛ بدون جعل دادهٔ محصول                                                                                     |
| [constants/cart-query-keys.ts](../constants/cart-query-keys.ts)         | کلید مشترک query واقعی/موک و mutation افزودن/انتقال/ویرایش؛ کلیدها را در مصرف‌کننده دوباره ننویسید                                             |
| [constants/cart.constants.ts](../constants/cart.constants.ts)           | snapshot خالی پیش‌نمایش؛ پیش‌فرض سبد واقعی از این فایل تأمین نمی‌شود                                                                           |

کامپوننت‌ها formatter را از utils می‌گیرند؛ سرویس checkout فقط قوانین و محاسبات را برای هوک اجرا می‌کند. فایل مستقل برای هر فرمت‌کننده یا پیام کوچک ایجاد نشده است.

## هوک‌ها

| فایل                                                            | مالک چه چیزی است؟                                                                                                                          |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| [hooks/use-cart.ts](../hooks/use-cart.ts)                       | source صریح API/موک، query خواندن، loading/error/data و callback انتخاب منبع؛ state منبع محلی همین مصرف‌کننده است                          |
| [hooks/use-cart-actions.ts](../hooks/use-cart-actions.ts)       | useAddToCart، useMergeGuestCart و useCartItemActions؛ مالک guard درخواست و وضعیت مشترک؛ retry:false و چرخهٔ cancel/invalidate/setQueryData |
| [hooks/use-cart-merge-flow.ts](../hooks/use-cart-merge-flow.ts) | mount بعد از ورود، آغاز merge، تشخیص مسائل و redirect؛ بدون JSX و بدون مسئولیت تأیید OTP                                                   |
| [hooks/use-cart-preview.ts](../hooks/use-cart-preview.ts)       | اتصال reducer پیش‌نمایش به React و محاسبهٔ totals                                                                                          |
| [hooks/use-checkout.ts](../hooks/use-checkout.ts)               | state آدرس، روش پرداخت، کوپن و پیام‌های پیش‌نمایش و فراخوانی قواعد checkout                                                                |

برای query ساده یک flow اضافی نسازید. دادهٔ ServerCart فقط در Query می‌ماند؛ کپی موازی در Zustand یا localStorage نداریم. localStorage متعلق به نشست است، نه اقلام و قیمت‌های معتبر بک.

## کامپوننت‌ها

| فایل                                                                                                    | مسئولیت                                                                                                        |
| ------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| [components/cart-page.tsx](../components/cart-page.tsx)                                                 | ترکیب صفحهٔ واقعی، حالات query، بنر موک و نمایش دادهٔ domain                                                   |
| [components/add-to-cart-button.tsx](../components/add-to-cart-button.tsx)                               | دکمهٔ عمومی افزودن؛ callback و وضعیت هوک، پیام نتیجه و لینک سبد؛ بدون مدیریت Query                             |
| [components/cart-merge-after-login.tsx](../components/cart-merge-after-login.tsx)                       | نمایش وضعیت هوک انتقال بعد از ورود                                                                             |
| [components/cart-list.tsx](../components/cart-list.tsx)                                                 | رندر مجموعهٔ ردیف‌ها و اتصال callback اختیاری هر ردیف                                                          |
| [components/cart-item.tsx](../components/cart-item.tsx)                                                 | نمایش یک ردیف واقعی یا پیش‌نمایش با UI مشترک؛ کنترل ویرایش واقعی/پیش‌نمایش فقط با callback؛ نمونهٔ API خواندنی |
| [components/cart-summary.tsx](../components/cart-summary.tsx)                                           | نمایش جمع‌های دریافتی و دکمهٔ ادامه؛ مبلغ واقعی را محاسبه نمی‌کند                                              |
| [components/cart-empty.tsx](../components/cart-empty.tsx)                                               | وضعیت خالی و لینک محصولات                                                                                      |
| [components/cart-quantity.tsx](../components/cart-quantity.tsx)                                         | draft ورودی تعداد، رقم فارسی، حدود مجاز، blur و پیام خطا                                                       |
| [components/cart-recently-viewed.tsx](../components/cart-recently-viewed.tsx)                           | reuse کاروسل محصول با عنوان دلخواه؛ دادهٔ خالی، خروجی null                                                     |
| [components/cart-steps.tsx](../components/cart-steps.tsx)                                               | نشانگر مرحلهٔ محلی طراحی                                                                                       |
| [components/cart-review.tsx](../components/cart-review.tsx)                                             | صفحهٔ review نمونه و callback بازگشت/تأیید محلی                                                                |
| [components/cart-preview-page.tsx](../components/cart-preview-page.tsx)                                 | ترکیب مراحل پیش‌نمایش و hook آن با ورودی snapshot؛ منبع داده را از props می‌گیرد                               |
| [components/checkout/checkout-preview-page.tsx](../components/checkout/checkout-preview-page.tsx)       | نقطهٔ ورود طراحی پرداخت؛ اتصال fixtureهای domain، مرحلهٔ اولیه و بنر نمونه                                     |
| [components/checkout/cart-checkout.tsx](../components/checkout/cart-checkout.tsx)                       | ترکیب UI پرداخت و useCheckout، مالک باز بودن مودال‌های بانک/لغو                                                |
| [components/checkout/checkout-addresses.tsx](../components/checkout/checkout-addresses.tsx)             | انتخاب آدرس و فرم کوچک افزودن محلی با callback                                                                 |
| [components/checkout/checkout-payment-methods.tsx](../components/checkout/checkout-payment-methods.tsx) | انتخاب روش، نمایش موجودی و callback نمایش بانک/شارژ                                                            |
| [components/checkout/checkout-summary.tsx](../components/checkout/checkout-summary.tsx)                 | جمع پرداخت، کوپن و پیش‌فاکتور؛ PriceBreakdown داخلی برای نمایش مشترک، بدون فایل اضافی                          |
| [components/checkout/checkout-dialog.tsx](../components/checkout/checkout-dialog.tsx)                   | چرخهٔ dialog و focus، دو ظاهر panel/bare                                                                       |
| [components/checkout/checkout-bank-details.tsx](../components/checkout/checkout-bank-details.tsx)       | کارت بانکی، کپی شماره/شبا، tooltip و نتیجهٔ Clipboard؛ CopyField داخلی                                         |

کامپوننت ورودی پیش‌نمایش، عمداً fixture دامنه را ترکیب می‌کند؛ از آن برای دور زدن service در صفحهٔ واقعی الگو نگیرید. متن رابط، labelها و گزینه‌های ثابت روش پرداخت دادهٔ هاردکد کاربر/محصول نیستند.

## مرز عمومی و وابستگی‌های مشترک

[index.ts](../index.ts) چهار کامپوننت مصرف‌شده در بیرون cart را export می‌کند. فایل‌های داخلی از مسیر مستقیم یکدیگر استفاده می‌کنند؛ از barrel خود cart import نمی‌کنند. API، storage، mapper و fixture داخلی export عمومی ندارند.

- HTTP: `@/shared/api`؛ خروجی آن data است، دوباره response.data نخوانید.
- UI: `@/components/ui/button` و آیکن‌های lucide موجود.
- state سرور: TanStack Query و provider فعلی پروژه.
- ProductCardMedia، SimilarProductsCarousel و Product domain فعلاً از مسیر داخلی product مصرف می‌شوند؛ product برای این موارد public export ندارد. این وابستگی موجود مستند است؛ برای اصلاح عمومی product در آینده، export مشخص اضافه و این importها یکجا منتقل شوند. مدل/کامپوننت محصول را در cart کپی نکنید.
- Auth فقط CartMergeAfterLogin عمومی را مصرف می‌کند. cart به OTP، ذخیرهٔ access token یا UI Auth وابسته نیست.

## تست و مستندات

[tests/cart-api.test.cjs](../tests/cart-api.test.cjs) منطق قرارداد، transport جایگزین‌شده، session، merge، منبع موک و کش را بررسی می‌کند. [tests/cart.test.cjs](../tests/cart.test.cjs) reducer و محاسبات پیش‌نمایش/پرداخت را پوشش می‌دهد. تست‌ها TypeScript را در حافظه اجرا می‌کنند و به بک واقعی متصل نیستند.

هر تغییر قرارداد باید در [api-contract.md](api-contract.md)، هر تغییر flow در [flow.md](flow.md) و هر جابه‌جایی فایل در همین inventory به‌روز شود. [decisions.md](decisions.md) راهنمای انتخاب لایه برای توسعهٔ بعدی است.

CartProduct عمداً مدل Product لیست نیست: قیمت‌های آن رشته‌ای باقی می‌مانند. ProductCardMedia برای reuse فقط image/title/source و colors اختیاری لازم دارد؛ cart همان فیلدهای لازم را به آن می‌دهد و نوع کامل Product را جعل نمی‌کند.

## تطبیق نمایش سبد با طرح و کمبودهای داده

چیدمان و پیام‌های کنار فیلدها مطابق طرح سبد تنظیم شده‌اند. مسئولیت helper خالص `utils/cart-presentation.utils.ts` تشخیص وضعیت مقادیر نمایشی است؛ تعداد/حذف واقعی متصل‌اند و ثبت سفارش با توضیح غیرفعال است. قواعد تفاوت دادهٔ مفقود، ساختار نامشخص و «ندارد» در [قرارداد نمایش سبد](api-contract.md#تطبیق-نمایش-سبد-با-طرح-و-کمبودهای-داده) آمده‌اند.

## تطبیق با راهنمای مشترک

مرجع اصلی [feature-development.md](../../../../.project-docs/docs/feature-development.md) است؛ README مستندات مشترک، frontend-architecture.md را سند قدیمی معرفی می‌کند.

- service نشست زمان آغاز درخواست را می‌گیرد و پاسخ معتبر را به mapper می‌دهد؛ mapper به clock یا storage وابسته نیست.
- تنها hooks از React Query استفاده می‌کنند؛ component افزودن صرفاً action.add را فراخوانی می‌کند.
- فرم آدرس مالک state فرم و نمایش خطا است؛ schema مالک قواعد trim/طول/اجباری بودن، هوک مالک لیست آدرس و انتخاب آن است. guard هوک همان schema را پیش از تغییر state اجرا می‌کند.
- utilityهای پول در فایل موجود cart.utils باقی ماندند؛ تعداد فایل‌های کوچک بدون مسئولیت مستقل افزایش نیافت.
- state مودال/Clipboard در UI، state سرور در Query و state پیش‌نمایش در reducer باقی می‌ماند؛ ایجاد store جدید لازم نیست.

## فایل‌های ثبت اولیه

| فایل                                  | مسئولیت                                                                          |
| ------------------------------------- | -------------------------------------------------------------------------------- |
| mappers/cart-submit-order.mapper.ts   | payload دقیق از domain؛ تشخیص سبد ناقص، بدون تبدیل ارز                           |
| services/cart-order.service.ts        | کنترل ورود/منبع، هماهنگی snapshot و idempotency، ارسال API، پیام خطای قابل نمایش |
| utils/cart-order.storage.ts           | ذخیرهٔ کلید و وضعیت دریافت درخواست در sessionStorage؛ fallback حافظه             |
| hooks/use-cart-submit-order.ts        | mutation بدون retry، guard هم‌زمانی، redirect ورود، pending/error و نتیجه        |
| components/cart-order-submitted.tsx   | نمایش دریافت موفق درخواست؛ ادعای تأیید سفارش یا پرداخت ندارد                     |
| tests/fixtures/cart-cny-response.json | پاسخ واقعی CNY و مقادیر IRR برای تست قرارداد و پیلود                             |

CartPage دیگر service یا tokenStorage را مستقیم مصرف نمی‌کند. useCartItemActions و useAddToCart هنگام ثبت اولیه هم از اجرای mutation جدید جلوگیری می‌کنند. قرارداد و محدودیت‌های idempotency در api-contract.md آمده است.


## صفحهٔ واقعی پرداخت

- types/api/checkout-payment-api.types.ts: تایپ مشتق از schema شبکه برای جلوگیری از اختلاف تایپ و اعتبارسنجی.
- schemas/checkout-payment.schema.ts: قرارداد GET شامل order، روش‌ها، wallet، pricing، آدرس‌ها و فاکتور.
- types/domain/checkout-payment.types.ts: مدل مصرف UI مستقل از DTO.
- api/checkout-payment.api.ts → services/checkout-payment.service.ts → mappers/checkout-payment.mapper.ts: انتقال HTTP، اعتبارسنجی هویت سفارش و نگاشت خالص؛ جمع دقیق اعشاری فقط برای تشخیص اختلاف است.
- hooks/use-checkout-payment.ts: Query وابسته به کد پیگیری و شناسه نشست (بدون توکن در query key)، انقضای قیمت، loading/error و refetch دستی.
- components/checkout/checkout-payment-page.tsx: ترکیب UI واقعی با CheckoutAddresses، CheckoutPaymentMethods، CheckoutBankDetails و CartSteps موجود. انتخاب آدرس فعلاً محلی است.
- components/checkout/checkout-payment-summary.tsx: نمایش ردیف‌های واقعی بک؛ محاسبات موک useCheckout وارد آن نمی‌شود.

مسیر /checkout/payment/[trackingCode] با لینک اعلام‌شده از بک سازگار است. صفحهٔ /cart/checkout همچنان preview قدیمی است؛ مسیر واقعی پس از ثبت اولیه از کد پیگیری ساخته می‌شود. وابستگی‌های preview و محاسبات محلی آن جایگزین قیمت واقعی نیستند.
