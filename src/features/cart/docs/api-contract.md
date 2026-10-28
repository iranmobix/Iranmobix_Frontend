# قرارداد API سبد خرید

مبنای قرارداد، نمونه‌های ارسالی بک در گفتگو است. تست زندهٔ سرور در این ریفکتور انجام نشده است. DTOها در [cart-api.types.ts](../types/api/cart-api.types.ts)، payload در [cart-payload.types.ts](../types/api/cart-payload.types.ts) و اعتبارسنجی در [cart.schema.ts](../schemas/cart.schema.ts) قرار دارند.

## HTTP و احراز هویت

baseURL از `NEXT_PUBLIC_API_URL` در shared client می‌آید. [cart.api.ts](../api/cart.api.ts) این درخواست‌ها را دارد:

| method | path دقیق                        | body                   | خروجی مورد مصرف                  |
| ------ | -------------------------------- | ---------------------- | -------------------------------- |
| POST   | `/api/cart/session/`             | ندارد                  | CartSessionApiResponse           |
| POST   | `/api/add-to-cart/{encodedSlug}` | AddToCartPayload       | unknown؛ قرارداد پاسخ ارائه نشده |
| GET    | `/api/cart/`                     | ندارد                  | CartApiResponse                  |
| PATCH  | `/api/cart/{item-id}`            | `{ quantity: number }` | unknown؛ سپس GET                 |
| DELETE | `/api/cart/{item-id}`            | ندارد                  | unknown؛ سپس GET                 |
| POST   | `/api/cart/merge/`               | ندارد                  | CartMergeApiResponse             |

در مسیر add اسلش پایانی اضافه نمی‌شود. slug با encodeURIComponent کدگذاری می‌شود. همهٔ درخواست‌های cart دارای `withCredentials: true` هستند. اگر session وجود داشته باشد، فقط به درخواست‌های مربوط به cart هدر `X-Guest-Cart-Token` اضافه می‌شود؛ shared interceptor عمومی برای آن نداریم.

توکن مهمان، access token ورود نیست. نسخهٔ Auth موجود در این برنچ پاسخ verify شامل user/message دارد، endpointهای `/auth/...` را صدا می‌زند و credentials مرورگر را ارسال می‌کند. موفقیت این مدل cookie/session باید روی بک تأیید شود؛ تنظیم withCredentials خودش نشست کاربر تولید نمی‌کند.

نسخهٔ جدید `feature/auth` متفاوت است: endpointهای `/api/auth/.../` و پاسخ access/refresh دارد. [گزارش آن نسخه](https://github.com/nima-toghraee/iranmobix/blob/docs/feature-guide/src/features/auth/docs/review.md) صریحاً نبود اتصال ارسال Bearer/refresh را ثبت کرده است. این ریفکتور، Auth جدید را merge نکرده و حمل توکن ورود جدید را پیاده نکرده است. پیش از ادغام آن نسخه، قرارداد cookie یا Bearer، CORS، refresh/logout و cache حساب‌ها یکجا هماهنگ شود.

## Session

```ts
interface CartSessionApiResponse {
  token: string;
  header: "X-Guest-Cart-Token";
  expires_in: number; // ثانیه
  expires_at: string; // ISO datetime
}
```

schema توکن خالی، header متفاوت، طول اعتبار نامثبت و تاریخ نامعتبر را رد می‌کند. domain زمان پایان اعتبار را به expiresAt عددی تبدیل می‌کند. مقدار واقعی توکن در مستندات، لاگ یا fixture عمومی ثبت نشود.

## افزودن

```ts
interface AddToCartPayload {
  quantity: number;
  color?: string;
  guarantee?: string;
  number?: number;
  selected_attributes?: Array<{
    category_attribute: number;
    category_value: number;
    value: string;
  }>;
  sku_attributes?: Record<string, string>;
}
interface AddToCartInput {
  slug: string;
  payload: AddToCartPayload;
}
```

- quantity تعداد انتخاب‌شده و عدد صحیح امن مثبت است.
- color و guarantee مطابق تأیید کاربر **شناسهٔ رشته‌ای** مثل `"1"` هستند.
- number مفهوم مستقل و هنوز نامشخص دارد؛ خودکار برابر quantity ارسال نمی‌شود.
- انتخاب‌های بدون مقدار در فرم محصول ارسال نمی‌شوند. اجباری بودن گزینه‌ها برای هر محصول باید از قرارداد آن محصول بیاید.
- فرم مشترک دیتیل، sku_attributes را از product.price.attributes به شکل نام دقیق ویژگی → مقدار دقیق انتخاب‌شده می‌سازد؛ فقط رنگ در فرم قابل تغییر است؛ سایر ویژگی‌ها بدون کنترل نمایشی با اولین مقدار معتبر برگشتی بک ارسال می‌شوند. رنگ نیز ابتدا اولین مقدار معتبر را دارد. نبود مقدار معتبر برای هر ویژگی الزامی، افزودن را غیرفعال می‌کند. این نگاشت بر مبنای مدل فعلی دیتیل است و تأیید نمونهٔ موفق از بک هنوز لازم است. selected_attributes شناسه‌های دسته‌بندی می‌خواهد و چون این شناسه‌ها در ویژگی‌های قیمت نیستند، مقدار ساختگی برای آن ارسال نمی‌شود.
- schema فعلی slug را trim و غیرخالی بررسی می‌کند؛ color/guarantee رشته‌اند و format شناسه را به integer coercion تبدیل نمی‌کند.
- پاسخ add مشخص نیست؛ سرویس فعلاً Promise<void> می‌دهد و موفقیت HTTP را مبنای invalidate قرار می‌دهد. اگر بک خطای تجاری در پاسخ 2xx دارد، schema و نتیجهٔ این عملیات باید تکمیل شود.

## پاسخ دریافت سبد

مبنای فعلی، پاسخ واقعی پنج‌ردیفی کاربر است: currency برابر IRR و دو ردیف مستقل از یک محصول با رنگ‌های Black و White. fixture کامل در [cart-api.mock.ts](../mock/cart-api.mock.ts) و تعریف دقیق فیلدها در [cart-api.types.ts](../types/api/cart-api.types.ts) ثبت شده‌اند.

| بخش               | فیلدهای شناخته‌شده                                                                                                                                                                                                                                                               |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| owner             | type و user_id قابل null؛ در نمونه guest/null                                                                                                                                                                                                                                    |
| envelope          | currency، item_count، total_quantity، subtotal، discount_total، final_total، checkout_ready، issues، items                                                                                                                                                                       |
| items             | id، catalog_id، source، product، selected_options، quantity، availability، pricing، issues، updated_at                                                                                                                                                                           |
| product           | id، slug، title، short_title، short_description، image، source، colors، price، brand، seller، guarantee، in_iranmobix_inventory، official_url، marketable                                                                                                                        |
| product.source    | name، label، url                                                                                                                                                                                                                                                                 |
| product.price     | amount، currency، amount_irr، has_discount، original_amount، discount_amount، discount_percentage                                                                                                                                                                                |
| product.guarantee | available، type، label؛ دو مورد آخر nullable                                                                                                                                                                                                                                     |
| selected_options  | color و guarantee در نمونه null؛ attributes آرایهٔ name/value                                                                                                                                                                                                                    |
| availability      | marketable، available_quantity، is_available                                                                                                                                                                                                                                     |
| pricing           | priced_at، base_price، unit_price، final_unit_price، final_total_price، unit_discount_amount، total_discount_amount، color_price_increase، guarantee_price_increase، attributes_price_increase، available_quantity، is_available، inventory_tracking_enabled، effective_discount |
| related_products  | در پاسخ جدید []؛ به‌علت نبود نمونهٔ غیرخالی، اقلام unknown؛ فیلد برای پاسخ merge قدیمی optional است                                                                                                                                                                              |

schema ساختارهای شناخته‌شده را در runtime بررسی می‌کند؛ قیمت‌ها رشتهٔ ده‌دهی نامنفی، تعدادها عدد صحیح امن نامنفی، تاریخ‌ها ISO و id ردیف‌ها یکتا هستند. catalog_id می‌تواند میان چند ردیف رنگ/انتخاب متفاوت تکراری باشد. جمع ردیف‌ها یا quantity مبنای بازنویسی مبالغ سرور نیست.

image و available_quantity می‌توانند null باشند. original_amount، discount_amount و discount_percentage نیز nullable پذیرفته می‌شوند. فیلدها برای پنهان کردن خطای پاسخ با مقدار نمونه یا صفر پر نمی‌شوند؛ شکل ناسازگار خطای schema می‌دهد.

### mapping و مصرف در UI

| API                                                | domain / نمایش                                                                    |
| -------------------------------------------------- | --------------------------------------------------------------------------------- |
| owner.user_id                                      | owner.userId                                                                      |
| items[].id                                         | شناسهٔ رشته‌ای همان ردیف و key لیست؛ نه catalog_id                                |
| product                                            | CartProduct تایپ‌شده؛ productData خام قبلی حذف شده است                            |
| product.title / slug / image                       | نام، لینک داخلی و تصویر با ProductCardMedia مشترک                                 |
| product.source                                     | لینک سایت مرجع با همان name/label/url                                             |
| selected_options.attributes[name=color/colour/رنگ] | selectedColor.name؛ نام رنگ واقعی همان ردیف                                       |
| سایر selected_options.attributes                   | حفظ در domain؛ ویژگی‌های خارج از طرح در ردیف سبد نمایش داده نمی‌شوند              |
| product.guarantee                                  | وضعیت دسترسی؛ انتخاب ردیف از selected_options مستقل است؛ کمبود انتخاب مشخص می‌شود |
| pricing.final_total_price                          | pricing.finalTotalPrice؛ مبلغ نهایی کل ردیف                                       |
| pricing.final_unit_price                           | pricing.finalUnitPrice؛ قیمت واحد برای تعداد بیشتر از یک                          |
| pricing.total_discount_amount                      | pricing.totalDiscountAmount؛ تخفیف ردیف فقط اگر مثبت باشد                         |
| availability / pricing                             | نام‌های camelCase در domain؛ unknown کلی این دو بخش حذف شده                       |
| related_products                                   | relatedProducts؛ تا مشخص شدن شکل اقلام، کاروسل واقعی برای آن ساخته نمی‌شود        |

**واحد قیمت ردیف از currency سبد می‌آید.** در نمونه، product.price.currency برای دوربین CNY است، اما pricing.final_total_price برابر 3236400 و واحد سبد IRR است. UI مبلغ ردیف را 3,236,400 IRR نشان می‌دهد؛ قیمت محصول یا نرخ ارز دلخواه جایگزین آن نمی‌شود. رشته‌ها برای حفظ دقت به Number تبدیل نمی‌شوند. هزینهٔ حمل مستقل در پاسخ و طرح فعلی خلاصه نداریم؛ مقدار حمل ساختگی نمایش داده نمی‌شود.

در این پاسخ selected_options.color مقدار null دارد، بنابراین رنگ از attributes خوانده می‌شود. مقدار CSS رنگ موجود نیست؛ فرانت دایرهٔ رنگ حدسی نمی‌سازد. seller، brand، selected_options.guarantee، selected_options.color و effective_discount فقط نمونهٔ null دارند و product.colors خالی است؛ شکل غیرخالی آن‌ها هنوز unknown و محفوظ است، نه قرارداد حدسی. جای فروشنده یا گارانتی نامشخص، توضیح کمبود همان فیلد نمایش داده می‌شود.

## پاسخ انتقال

```ts
interface CartMergeApiResponse {
  transferred_items: number;
  combined_items: number;
  issues: string[];
  cart: CartApiResponse;
}
```

cart برگشتی مبنای cache است؛ جمع دو سبد در فرانت محاسبه نمی‌شود. نبود issues در سطح merge، cart و items شرط فعلی پاک‌کردن توکن مهمان است. معنای کامل موفقیت/انتقال ناقص و سیاست تکرار merge باید با بک نهایی شود.

## موارد باقی‌ماندهٔ قرارداد

- نمونهٔ غیر null برای selected_options.color/guarantee، seller، brand و effective_discount؛ همچنین اقلام colors و related_products.
- حداقل/حداکثر و گام تعداد، پاسخ محصول حذف‌شده/ناموجود و قیمت nullable در آن حالت.
- پاسخ add و idempotency، کد خطاهای نشست و قواعد احراز هویت/انتقال.
- قرارداد پاسخ PATCH/DELETE و endpoint/DTO ثبت و لغو سفارش و تأیید کارشناس.
- قرارداد آدرس، هزینهٔ ارسال، کوپن، کیف پول، رسید و پرداخت.

نمایش نام، عکس، رنگ SKU و قیمت ردیف به پاسخ جدید متصل است؛ مسیر /cart/checkout همچنان پیش‌نمایش طراحی باقی می‌ماند.

## تطبیق نمایش سبد با طرح و کمبودهای داده

چیدمان دسکتاپ: فهرست سمت راست، خلاصهٔ پرداخت سمت چپ با عرض ۳۰٪؛ در موبایل زیر هم. ردیف کالا فقط عنوان، تصویر، رنگ، گارانتی، فروشنده، قیمت و کنترل تعداد/حذف طرح را نمایش می‌دهد. ویژگی‌های دیگر همچنان در domain محفوظ‌اند.

- helper خالص `utils/cart-presentation.utils.ts` متن وضعیت فیلدهای پاسخ را تعیین می‌کند؛ دادهٔ نمونه یا رنگ CSS حدسی نمی‌سازد.
- رنگ از attributes می‌آید؛ در نبود کد رنگ، نام واقعی همراه پیام «کد رنگ از بک ارسال نشده» نمایش داده می‌شود.
- فروشندهٔ null با «از بک ارسال نشده» مشخص است. شکل غیر null که هنوز قرارداد ندارد، پیام «ساختار ... مشخص نیست» دارد.
- گارانتی unavailable به معنی «ندارد (طبق پاسخ بک)» است، نه خطای بک. گارانتی موجود محصول، اثبات گارانتی انتخاب‌شدهٔ ردیف نیست؛ در نبود انتخاب، همین کمبود نشان داده می‌شود.
- صفر تخفیف دادهٔ معتبر است؛ سود صفر مخفی نمی‌شود. برای ردیف دارای تخفیف، مبلغ واقعی نشان داده می‌شود؛ درصد و قیمت کل اصلی در ارز سبد قرارداد ندارند و کمبودشان همان‌جا نوشته می‌شود. original_amount محصول با ارز مبدأ جای قیمت ردیف قرار نمی‌گیرد.
- کنترل‌های تعداد/حذف در سبد واقعی به API متصل‌اند؛ در preview با callback محلی کار می‌کنند و نمونهٔ API خواندنی است. ثبت اولیه نیز با علت غیرفعال بودن داخل خلاصه نمایش داده می‌شود.
- پاسخ نامعتبر در فیلدهای اجباری همچنان توسط schema رد می‌شود؛ صفحه مسیر دقیق فیلدهای ناقص/نامعتبر را نشان می‌دهد. قرارداد مالی برای نمایش ناقص به مقدار صفر یا دادهٔ ساختگی تبدیل نمی‌شود.

## تغییر تعداد و حذف ردیف سبد

- `PATCH /api/cart/{item-id}` با بدنهٔ `{ "quantity": 99 }`؛ شناسهٔ ردیف سبد است، نه محصول یا catalog_id.
- `DELETE /api/cart/{item-id}` بدون بدنه.
- هر دو با credentials و توکن مهمان موجود ارسال می‌شوند؛ session تازه نمی‌سازند. مسیر بدون اسلش انتهایی مطابق قرارداد اعلام‌شده است.
- پاسخ mutation هنوز قرارداد مشخصی ندارد و unknown می‌ماند؛ mapper جدید ساختگی اضافه نشده است. پس از عملیات (حتی خطای مبهم شبکه) Query سبد واقعی invalidate و GET با schema/mapper فعلی اجرا می‌شود؛ Query موک دست‌نخورده می‌ماند.
- `useCartItemActions` درخواست هم‌زمان/تکراری را مسدود می‌کند، retry خودکار ندارد و تا پایان تازه‌سازی pending می‌ماند. خطا در صفحه نمایش داده می‌شود؛ GET ناموفق کنترل‌ها را تا دریافت موفق غیرفعال نگه می‌دارد.
- ورودی تعداد فقط با blur/Enter ثبت می‌شود، دکمه‌های +/- مستقیم درخواست می‌فرستند. عدد باید صحیح، مثبت و امن باشد؛ صفر جای حذف نیست. سقف موجودی فقط در صورت فعال بودن inventory_tracking_enabled اعمال می‌شود؛ بک مرجع نهایی اعتبار تعداد است.
- کنترل‌های سبد واقعی اکنون فعال‌اند؛ عبارت‌های تاریخی «API تغییر تعداد و حذف مشخص نیست» در بررسی‌های قبلی دیگر برقرار نیستند. دادهٔ نمونهٔ API همچنان قابل ویرایش شبکه‌ای نیست.

## ثبت اولیهٔ واقعی — قرارداد جدید

`POST /api/cart/submit-order` بدون اسلش پایانی؛ payload تایپ‌شده شامل idempotency_key و items است. طبق `SubmitOrderItemRequest` در سواگر، هر ردیف slug، quantity، نام رنگ و نام گارانتی یا null و price دارد. برای گزینه‌های آبجکتی در selected_options از `color.name` و `guarantee.name` استفاده می‌شود، نه id؛ رنگ نمایشی SKU جایگزین انتخاب مستقل سبد نمی‌شود. price فقط از `pricing.unit_price_irr`، `pricing.total_discount_amount_irr` و `pricing.final_total_price_irr` ساخته می‌شود؛ تبدیل CNY به IRR یا ضرب مجدد قیمت در فرانت نداریم.

فیلدهای جدید `product.price.amount_cny`، `pricing.currency` و شش مبلغ `*_irr` در DTO/schema/domain/mapper حفظ می‌شوند. برای خواندن پاسخ قدیمی optional هستند و در domain نبودشان null است؛ ثبت اولیه بدون سه مبلغ ریالی الزامی مسدود می‌شود. fixture قدیمی موک صرفاً خواندنی است؛ پاسخ جدید برای تست در tests/fixtures/cart-cny-response.json ثبت شده است.

- مسیر فعلی ثبت نیازمند access token است؛ نبود آن در هوک به /login?returnTo=/cart می‌رود. backend مرجع اعتبار توکن است. client هنگام ساخت، interceptor را یک‌بار نصب می‌کند و هر درخواست token جاری را می‌خواند؛ guest token موجود هم برای snapshot مهمان ارسال می‌شود.
- ثبت برای source=mock، سبد خالی، checkoutReady=false، issues یا دادهٔ ناقص ممنوع است. UI هنگام mutationهای Cart و GET ناموفق/درحال‌اجرا دکمه را غیرفعال می‌کند.
- hash هویت و snapshot، کلید idempotency را تعیین می‌کند. خود token و payload در storage ذخیره نمی‌شوند. sessionStorage فقط fingerprint/key/accepted نگه می‌دارد؛ در نبود دسترسی fallback حافظه داریم. در همان نشست و snapshot، retry و reload کلید قبلی را استفاده می‌کنند. تلاش مجدد خودکار برای خطای شبکه/سرور نداریم؛ تنها 401 پس از تمدید موفق توکن، یک‌بار با همان بدنه و کلید تکرار می‌شود.
- snapshot تغییرکرده کلید جدید می‌گیرد. درخواست هم‌زمان یک snapshot در همین تب مشترک می‌شود؛ تضمین اتمیک بین تب‌ها یا انقضای کلید سمت بک در این قرارداد مشخص نشده است. برای owner بدون userId، scope به شناسهٔ غیرمحرمانهٔ نشست ورود وابسته است؛ refresh آن را تغییر نمی‌دهد، اما ورود جدید شناسهٔ جدید می‌سازد.
- پاسخ ثبت هنوز unknown است؛ 2xx بدون error envelope فقط تأیید دریافت درخواست محسوب می‌شود. شناسه سفارش، وضعیت تأیید کارشناسی، پرداخت یا redirect از روی حدس ساخته نمی‌شود. CartOrderSubmitted نتیجهٔ ارسال را نشان می‌دهد و GET سبد تازه می‌شود.
- اعتبارسنجی guarantee غیر null و ساختار پاسخ موفق باید با نمونهٔ واقعی بک تکمیل شود. صفحه checkout همچنان پیش‌نمایش است و مقصد موفقیت ثبت واقعی نیست.

این بخش، عبارت‌های قدیمیِ «نبود endpoint ثبت سفارش» و «ارسال نشدن Bearer» در اسناد قبلی را برای ثبت اولیه جایگزین می‌کند؛ API تأیید کارشناسی و پرداخت هنوز نداریم.

## اطلاعات پرداخت سفارش تأییدشده

GET /api/customer/checkout/payment/{tracking_code}/ با access token و پشتیبانی refresh کلاینت مشترک. داده از checkoutPaymentSchema عبور می‌کند؛ شناسه سفارش و کد پیگیری دو بخش order/payment_options با درخواست تطبیق داده می‌شوند. مبالغ رشته‌ای حفظ می‌شوند. refund، invoice و آرایه‌های خالی بدون نمونهٔ ساختار واقعی unknown می‌مانند؛ فیلدهای نامشخص جعل نمی‌شوند.

نمایش مبلغ نهایی از pricing.final_amount و واحد از pricing.currency است. در نمونهٔ دریافتی جمع کالاها منهای تخفیف به‌علاوه delivery برابر 4,367,800 ریال است، ولی مبلغ نهایی بک 5,367,800 ریال است. فرانت آن را اصلاح نمی‌کند و اختلاف را کنار جزئیات نشان می‌دهد.

این GET قرارداد mutation نیست. دریافت قرارداد POST پرداخت، ثبت آدرس، کوپن، شارژ کیف پول، لغو و بارگذاری رسید هنوز لازم است. URLهای اعلام‌شده از بک به‌طور خودکار اجرا نمی‌شوند. پیش‌فاکتور محافظت‌شده نیز بدون مسیر دریافت احرازشده به لینک عمومی تبدیل نشده است.

پاسخ ثبت اولیه اکنون با submitOrderResponseSchema اعتبارسنجی می‌شود و tracking_code در نتیجه و رسید محلی idempotency حفظ می‌شود. پاسخ خالی قدیمی فقط تأیید دریافت را نگه می‌دارد و مسیر سفارش برای آن جعل نمی‌شود.

ثبت آدرس: POST /api/customer/addresses/ از فرم checkout به کلاینت احرازشده متصل شد. کلید fullname شامل فاصلهٔ انتهایی است، عین قرارداد ارسالی. title و address_title جداگانه ارسال می‌شوند. استان و شهر تا ارائه API فهرست‌ها با شناسهٔ معتبر وارد می‌شوند؛ شناسهٔ فرضی نداریم. پاسخ ساخت هنوز unknown است؛ پس از موفقیت Queryهای پرداخت invalidate می‌شوند تا آدرس‌ها از GET واقعی خوانده شوند. این POST آدرس را به سفارش اختصاص نمی‌دهد.

پاسخ خلاصهٔ جدید پرداخت شامل wallet.balance_toman/shortage_toman/status، proforma_invoice.pdf_url/pdf_status و pricing.items_total/item_count/shipping_packaging_amount/domestic_shipping_amount/discounted_price/final_amount نیز پشتیبانی می‌شود. این پاسخ وضعیت کارشناس، مجوز روش‌ها و واحد قیمت ندارد؛ domain برای وضعیت/واحد null نگه می‌دارد و مجوز پرداخت نمی‌سازد. چیدمان آدرس‌ها، روش‌ها و خلاصهٔ قیمت حفظ شده است. کیف پول واحد تومان صریح دارد.
آدرس‌ها مستقل از GET /api/customer/addresses/ خوانده می‌شوند و بعد از POST همان مسیر refetch می‌شوند. فعلاً آرایهٔ مستقیم و قالب results پشتیبانی می‌شوند؛ قالب ناشناخته خطاست. در پاسخ صفحه‌بندی‌شده، وجود next همراه با پیام محدودبودن فهرست به صفحهٔ اول اعلام می‌شود؛ نمونهٔ واقعی پاسخ برای نهایی‌کردن قرارداد لازم است.

قرارداد GET آدرس‌ها با نمونهٔ Swagger تأیید شد: آرایهٔ مستقیم با id، title/address_title/display_title، province/province_name، city/city_name، postal_code، address/display_address، no، unit، fullname، mobile و status. نوع شناسه‌ها عدد است؛ نمایش از display_title و display_address با fallback متنی استفاده می‌کند. fullname در GET بدون فاصله است؛ این پاسخ به‌تنهایی تغییر نام کلید POST قبلی (fullname با فاصلهٔ انتهایی) را اثبات نمی‌کند. برای اصلاح POST باید نمونهٔ درخواست صحیح آن تأیید شود.

استان و شهر: GET /api/customer/provinces/ → آرایهٔ id/name/status. طبق Schema خوانده‌شده از /api/schema/?format=json در ۲۰۲۶-۰۹-۳۰، شهرها GET /api/customer/cities/?province={نام دقیق استان} هستند؛ province پارامتر query است و body ارسال نمی‌شود. پاسخ شهر شامل id/name/province/province_name/status است. همهٔ درخواست‌ها از کلاینت احرازشده می‌گذرند. گزینه‌ها از داده واقعی ساخته می‌شوند؛ شهر قبلی با تغییر استان پاک می‌شود و پاسخ ناسازگار با شناسه استان رد می‌شود. POST آدرس همچنان شناسه عددی استان و شهر را می‌فرستد.


### روش ارسال ثبت اولیه
فیلد shipping_method در POST /api/cart/submit-order اجباری است: air (هوایی اکسپرس)، commercial_air (هوایی تجاری/کارگو)، sea (دریایی)، ground (زمینی). صفحه سبد به‌صورت پیش‌فرض زمینی را انتخاب می‌کند. مقدار انتخابی همراه snapshot سرور ارسال و در fingerprint ثبت تکراری لحاظ می‌شود؛ تغییر روش ارسال کلید جدید می‌سازد و تلاش مجدد همان روش/سبد کلید قبلی را نگه می‌دارد. انتخاب هنگام ثبت یا تغییر سبد غیرفعال است. قیمت سمت کلاینت محاسبه یا جایگزین نمی‌شود.


### پاسخ پرداخت دارای payment_window و چند حساب مقصد
در پاسخ compact فیلدهای payment_window، payment_methods، offline_payment_destinations و pricing.currency نگهداری و مپ می‌شوند. برای سازگاری با پاسخ قبلی، نبودن این فیلدها همچنان پشتیبانی می‌شود؛ نبودن پنجره پرداخت مجوز پرداخت ایجاد نمی‌کند. wallet.balance و shortage با currency و مقادیر تومان به صورت رشته حفظ می‌شوند. وضعیت approved همراه can_continue_payment و مهلت معتبر برای ادامه لازم است. هر مقصد واریز با index، amount، bank_name، card_number، sheba_number، account_owner و currency روی کارت جدا در همان مودال نمایش داده می‌شود. صفحه واقعی از کارت ثابت استفاده نمی‌کند؛ پیش‌نمایش موک همچنان داده نمونه دارد.


### قرارداد نهایی شش روش ارسال (۲۰۲۶-۱۰-۰۳)
مقادیر قبلی air، ground، commercial_air و sea دیگر معتبر نیستند. shipping_method اجباری با این مقادیر ارسال می‌شود: air_express (هوایی اکسپرس)، commercial_air_iran (هوایی تجاری تحویل ایران)، commercial_air_dubai (هوایی تجاری تحویل دبی)، sea_china_iran (دریایی چین به ایران)، sea_china_dubai (دریایی چین به دبی)، ground_china_iran (زمینی چین به ایران). گزینه پیش‌فرض زمینی است. مقصد دبی طبق قرارداد جدید جایگزین برداشت قبلی تحویل در چین شد. snapshot و fingerprint همان مقدار دقیق انتخاب‌شده را دارند.


### مطالعه قرارداد و پیش‌نمایش کوپن
GET payment مقدار اختیاری coupon_code را در query می‌گیرد؛ کلید کش صفحه به سفارش و نشست وابسته است. اعمال یا حذف کوپن درخواست جداگانه دارد؛ تنها پس از پاسخ موفق، قیمت‌های سرور و وضعیت موجودی کیف پول در همان صفحه به‌روز می‌شوند. خطای کوپن کنار ورودی نمایش داده می‌شود و آخرین قیمت و کد معتبر حفظ می‌شوند؛ مرحله، آدرس، روش پرداخت و پذیرش قرارداد تغییر نمی‌کنند. حین بررسی کوپن پرداخت مسدود است. درخواست پرداخت تنها کد موفق اعمال‌شده را ارسال می‌کند؛ رفرش وضعیت نیز همان کد را برای محاسبه قیمت نگه می‌دارد. contract.required/accepted/template_id/title/pdf_url حفظ می‌شوند. تیک پذیرش صریح برای قرارداد فعلی و نشست جاری لازم است؛ accepted بک آن را خودکار فعال نمی‌کند. PDF فقط از origin سرویس و مسیر /api/ با bearer مشترک و responseType blob دریافت می‌شود.
POST همان endpoint طبق Swagger با tracking_code، address_id، payment_type (online/wallet/offline/hawala)، contract_accepted:true و final_amount فعلی و coupon_code استفاده‌شده ارسال می‌شود. POST retry خودکار ندارد؛ حین ارسال و پس از پاسخ موفق ثبت دوباره مسدود است. پیام next_action نمایش داده می‌شود؛ redirect درگاه، بارگذاری فایل رسید و ثبت حواله مرحله بعدی مستقل هستند.


### دریافت پیش‌فاکتور
دکمه مشاهده پیش‌فاکتور با proforma_invoice.pdf_url و وضعیت آماده بودن فایل فعال می‌شود. فایل همانند قرارداد از کلاینت احرازشده با responseType: blob دریافت و در تب جدا باز می‌شود؛ دریافت ناموفق در همان بخش پیام خطا نشان می‌دهد. نبودن فایل دکمه را غیرفعال نگه می‌دارد.


### رسید پرداخت آفلاین
کلیک بارگذاری رسید فقط مودال را باز می‌کند. ارسال فرم ابتدا POST payment با payment_type: offline را ثبت می‌کند و order.id را می‌گیرد؛ سپس POST /api/customer/orders/{id}/offline-receipt/ با FormData و tracking_number و فایل اختیاری receipt_image ارسال می‌شود. tracking_number طبق Swagger فعلی اجباری و حداکثر ۲۰۰ کاراکتر است؛ ارسال تنها عکس نیاز به تغییر قرارداد بک دارد. JPG/JPEG/PNG/PDF تا ۱۰ مگابایت پذیرفته می‌شوند. تلاش مجدد آپلود برای همان نشست و snapshot از شناسه سفارش آماده‌شده استفاده می‌کند. ارسال موفق رسید به معنی پرداخت تأییدشده نیست؛ payment_status_label بک نمایش داده می‌شود.


### پرداخت آنلاین و برگشت از درگاه
GET /api/customer/payment-gateways/ گزینه‌های واقعی درگاه را می‌دهد؛ فقط enabled و selectable قابل انتخاب‌اند. POST payment با gateway_code، پذیرش قرارداد، آدرس و کوپن موفق ارسال می‌شود. redirect آماده در پاسخ استفاده می‌شود؛ اگر فقط سفارش برگردد، POST /api/customer/orders/{id}/payment/online/session/ با gateway_code نشست درگاه را می‌سازد. redirect.method برای GET با پارامترهای fields و برای POST با فرم مخفی پشتیبانی می‌شود. اطلاعات احراز هویت به درگاه ارسال نمی‌شوند.
بک callback درگاه را تأیید می‌کند و باید مرورگر را به آدرس فرانت /cart/payment/return?payment_id={payment_id} برگرداند. این return_url در قرارداد درخواست فعلی وجود ندارد و باید سمت بک تنظیم شود. صفحه برگشت با POST /api/customer/checkout/online-payments/{payment_id}/finalize/ نتیجه را دریافت می‌کند؛ پارامترهای success یا Status مرورگر مجوز نمایش پرداخت موفق نیستند. خطا/عدم تأیید امکان بررسی مجدد دارند. در همان تب، شناسه پرداخت جاری در sessionStorage همراه نشست و کد پیگیری برای لینک بررسی نتیجه نگه داشته می‌شود. پرداخت واقعی در تست‌ها انجام نمی‌شود.
