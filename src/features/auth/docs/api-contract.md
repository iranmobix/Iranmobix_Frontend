# قرارداد مصرف‌شدهٔ API در Auth

منبع این قرارداد [auth.api.ts](../api/auth.api.ts)، [payloadها](../types/auth.payload.types.ts)، [پاسخ‌ها](../types/auth.api.types.ts) و [typeهای user](../types/user.types.ts) است. نمونه‌ها آموزشی‌اند؛ از بک زنده دریافت نشده‌اند.

## تنظیم HTTP

کلاینت `@/shared/api` آدرس پایه را از NEXT_PUBLIC_API_URL می‌گیرد و timeout برابر 10000 میلی‌ثانیه، Content-Type برابر application/json و withCredentials برابر true دارد. مسیرهای زیر با همان شکل، شامل اسلش آخر، به کلاینت داده می‌شوند. آدرس پایه را طوری تنظیم کنید که /api تکرار نشود.

httpPost پاسخ `response.data` را برمی‌گرداند، نه AxiosResponse کامل. generic تایپ درخواست اعتبارسنجی runtime نیست. status موفق، شکل خطا، محدودیت ارسال و الزام cookie باید از بک تأیید شوند؛ این کد آن‌ها را مستند نمی‌کند.

## endpointها

| عملیات     | method و مسیر               | payload           | نتیجه              |
| ---------- | --------------------------- | ----------------- | ------------------ |
| ارسال کد   | POST /api/auth/request-otp/ | RequestOtpPayload | RequestOtpResponse |
| ارسال مجدد | POST /api/auth/resend-otp/  | ResendOtpPayload  | RequestOtpResponse |
| تأیید کد   | POST /api/auth/verify-otp/  | VerifyOtpPayload  | VerifyOtpResponse  |

### ارسال کد

```json
{
  "id": "user@example.com",
  "user_type": "real"
}
```

UI فقط `real` و `legal` می‌فرستد. RequestOtpPayload فعلاً user_type را string تعریف می‌کند و از UserType استفاده نمی‌کند؛ محدود بودن دامنه از روی این interface تضمین نشده است.

پاسخ نمونه:

```json
{
  "token": "example-otp-challenge-token",
  "resend_after_seconds": 60,
  "message": "کد ارسال شد"
}
```

token این پاسخ برای challenge کد است، نه access token. پیام پاسخ در flow فعلی به کاربر نمایش داده نمی‌شود. resend_after_seconds فعلاً نادیده گرفته می‌شود.

### ارسال مجدد

```json
{
  "token": "example-otp-challenge-token"
}
```

ساختار پاسخ همان RequestOtpResponse است؛ flow token پاسخ جدید را جایگزین می‌کند.

### تأیید

```json
{
  "token": "example-otp-challenge-token",
  "otp": "123456"
}
```

پاسخ نمونه مطابق type فعلی:

```json
{
  "access": "example-access-token",
  "refresh": "example-refresh-token",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "mobile": null,
    "first_name": null,
    "last_name": null,
    "full_name": null,
    "user_type": "real",
    "person_type": "example",
    "email_verify_at": null,
    "mobile_verified_at": null,
    "activation": 1,
    "status": 1
  }
}
```

مقدار person_type در مثال صرفاً placeholder است؛ enum مورد قبول بک مشخص نشده است. در type فعلی تمام کلیدهای این user اجباری‌اند؛ nullable بودن به معنی optional بودن نیست.

| فیلدهای UserApiResponse                         | type           |
| ----------------------------------------------- | -------------- |
| id                                              | number         |
| email، mobile، first_name، last_name، full_name | string یا null |
| user_type، person_type                          | string         |
| email_verify_at، mobile_verified_at             | string یا null |
| activation، status                              | 0 یا 1         |

نام `email_verify_at` دقیقاً مطابق type موجود است؛ نباید بدون توافق بک به email_verified_at تغییر داده شود.

## خروجی سرویس و دامنه

```ts
// شرح شکل خروجی موجود؛ پیاده‌سازی کامل در فایل‌های مرتبط است.
interface VerifyOtpResult {
  access: string;
  refresh: string;
  user: User;
}

interface User {
  id: number;
  email: string | null;
  mobile: string | null;
  firstName: string | null;
  lastName: string | null;
  user_type: string;
}
```

mapUser دو نام first_name و last_name را camelCase می‌کند و باقی metadataهای DTO را وارد مدل UI نمی‌کند. اما user_type نیز برخلاف تعریف اجباری User جا افتاده است؛ این مورد خطای type تأییدشده است، نه رفتار مطلوب mapper.

## توکن و بخش نامشخص قرارداد

کد verify توکن‌های access و refresh را از بدنه می‌گیرد و در localStorage ذخیره می‌کند. `withCredentials: true` تنها اجازهٔ ارسال credential در درخواست را تنظیم می‌کند؛ اثبات نمی‌کند بک Session را فقط با HttpOnly Cookie مدیریت می‌کند.

در shared client فعلی تزریق خودکار Authorization، endpoint تمدید توکن، گردش refresh، logout و current-user پیاده‌سازی نشده‌اند. پیش از اتصال فیچر محافظت‌شده، باید با بک مشخص شود درخواست‌های بعدی Bearer می‌خواهند یا cookie یا هر دو، توکن چگونه منقضی/تمدید می‌شود و 401 چه معنایی دارد. endpoint یا header جدید را از روی حدس به قرارداد اضافه نکنید.

## به‌روزرسانی تمدید توکن — ۲۰۲۶-۰۹-۲۹

قرارداد اعلام‌شده: POST /api/auth/token/refresh/ با بدنهٔ { "refresh": "..." }. پاسخ در سرویس با access غیرخالی اعتبارسنجی می‌شود؛ اگر refresh جدید نیز وجود داشته باشد جایگزین می‌شود، در غیر این صورت قبلی حفظ می‌شود. نمونهٔ واقعی پاسخ موفق هنوز ارائه نشده؛ پاسخ ناسازگار به‌عنوان خطا رد می‌شود.

کلاینت مشترک پس از 401 درخواست دارای access، یک بار تمدید می‌کند و همان درخواست را با همان بدنه و هدر مهمان تکرار می‌کند. درخواست‌های هم‌زمان در همان کلاینت یک عملیات رفرش دارند؛ هماهنگی اتمیک بین چند تب پیاده نشده است. مسیرهای /api/auth/ و درخواست‌های مهمان وارد این چرخه نمی‌شوند. قطع شبکه، 403 و 5xx باعث تکرار خودکار درخواست اصلی نمی‌شوند.

401 رفرش، یا 400 با code=token_not_valid، توکن‌های همان نشست را پاک می‌کند. خطای شبکه/سرور یا پاسخ نامعتبر توکن‌ها را حفظ می‌کند. پاسخ رفرش بعد از خروج یا ورود حساب دیگر نمی‌تواند نشست قبلی را برگرداند. تکرار 401 بعد از تمدید متوقف می‌شود. این تغییر جایگزین توضیح قدیمی «نبود ارسال Bearer و refresh» در همین مستند است.
