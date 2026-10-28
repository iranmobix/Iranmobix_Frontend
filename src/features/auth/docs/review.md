# گزارش تطبیق کد و مستندات Auth

مبنای بررسی: همهٔ فایل‌های متنی پیاده‌سازی Auth، مستندات قبلی، فهرست و ارجاع assetها، route و layout ورود، provider، کلاینت‌های HTTP و store موجود در برنچ feature/auth، کامیت 82901fc. تصویرهای PNG به‌عنوان asset و محل مصرف بررسی شده‌اند؛ بازبینی بصری UI یا اجرای بک انجام نشده است.

## اصلاح‌های مستندات

| متن قبلی | واقعیت کد و اصلاح سند |
| --- | --- |
| tokenها در localStorage ذخیره نمی‌شوند | useOtpFlow با tokenStorage هر دو access و refresh را ذخیره می‌کند |
| ورود صرفاً Session و HttpOnly Cookie است | verify پاسخ access/refresh دارد؛ نقش دقیق cookie از کد قابل اثبات نیست |
| payload شامل login_id است | payload فعلی id و user_type است |
| endpointها /auth/... هستند | authApi از /api/auth/.../ استفاده می‌کند |
| پاسخ request فقط token/message است | resend_after_seconds نیز در type تعریف شده است |
| verify فقط user می‌دهد | DTO شامل access، refresh و user است |
| login-form.tsx در معماری آمده | آن فایل در این برنچ نیست؛ ترکیب فعال AuthFlow و LoginPage است |
| فایل useResendTimer.ts معرفی شده | فایل واقعی useOtpResendTimer.ts است؛ export آن useResendTimer نام دارد |
| ساختار پوشه‌ها ناقص بود | schema، storage، user types، همهٔ کامپوننت‌ها و assetها معرفی شدند |
| بلاک JSON قرارداد بسته نشده بود | نمونه‌ها و توضیحات از هم جدا و fenceها اصلاح شدند |

## یافته‌های پیاده‌سازی که در این تسک تغییر نکردند

| مورد | شاهد | اثر / اقدام پیشنهادی |
| --- | --- | --- |
| User و mapper ناسازگارند | [User](../types/user.types.ts) و [mapUser](../mappers/user.mapper.ts) | user_type اجباری مپ نمی‌شود؛ خروجی mapper باید با تصمیم domain کامل شود |
| ارسال خودکار access/refresh وجود ندارد | [client](../../../shared/api/client.ts)، [interceptors](../../../shared/api/interceptors.ts) | ذخیرهٔ توکن را احراز هویت درخواست بعدی فرض نکنید؛ قرارداد حمل توکن و تمدید تعیین شود |
| state ورود بازیابی نمی‌شود | [useOtpFlow](../hooks/useOtpFlow.ts) | mount جدید همیشه مرحلهٔ اول است؛ current-user/bootstrap مشخص شود |
| pending ارسال اولیه وصل نیست | [AuthFlow](../components/auth-flow.tsx) | isSending به loading فرم داده نمی‌شود؛ دکمه از درخواست در حال اجرا آگاه نیست |
| زمان برگشتی بک مصرف نمی‌شود | [response type](../types/auth.api.types.ts)، useOtpFlow | عدد ۶۰ مستقل از resend_after_seconds استفاده می‌شود |
| خطاهای بک به UI نمی‌رسند | useOtpFlow و [useRequestOtp](../hooks/useRequestOtp.ts) | onError/error برای صفحه expose نمی‌شود؛ console.log جای پیام رابط نیست |
| خطای محلی OTP رندر نمی‌شود | [OtpForm](../components/otp-form.tsx) | error تنظیم می‌شود ولی در JSX دیده نمی‌شود |
| reset logout نیست | useOtpFlow | توکن‌های پایدار، user و mutation state را پاک نمی‌کند |
| storage خطا را مدیریت نمی‌کند | [token-storage](../utils/token-storage.ts) | حالت localStorage مسدود یا خطای نوشتن باید رفتار مشخص داشته باشد |
| ورودی OTP نیاز به اصلاح رفتار دارد | [OtpInput](../components/otp-input.tsx) | حذف خانهٔ وسط و join رشته، خانه‌های بعدی را جابه‌جا می‌کند؛ ارقام فارسی حذف می‌شوند |
| موک ناقص است | mockSendOtp در useOtpFlow | تایمر شروع نمی‌شود و verify/resend واقعی باقی می‌مانند؛ در UI مصرف ندارد |
| درخواست‌های کد هماهنگی کامل ندارند | useOtpFlow و OtpForm | verify و resend ممکن است هم‌زمان اجرا شوند؛ guard جریان و پاسخ قدیمی بررسی شود |
| برخی کنترل‌ها فقط نمایشی‌اند | [LoginActions](../components/login-header-actions.tsx) | دکمه‌های زبان/تم handler ندارند |
| state سراسری جدا و ناسازگار وجود دارد | [authStore](../../../store/authStore.ts) | مدل user و token متفاوت است و به flow متصل نیست؛ مرجع موازی برای ورود نسازید |

عرض‌های ثابت OTP و layout نیز نیاز به بررسی در موبایل دارند؛ overflow واقعی در مرورگر در این بازبینی تأیید نشده است. لایهٔ UI را بدون این بررسی نمونهٔ قطعی responsive معرفی نکنید.

## تأیید انجام‌شده

بررسی TypeScript با compiler نصب‌شدهٔ پروژه و بدون تولید فایل انجام شد. در فایل‌های Auth یک diagnostic پیدا شد:

```text
mappers/user.mapper.ts:
Property 'user_type' is missing ... but required in type 'User'.
```

این بررسی خطای type بالا را تأیید می‌کند؛ رفتار واقعی API، درست بودن OTP روی بک و کامل بودن سیاست امنیتی ورود را تأیید نمی‌کند.

در این تغییر فقط docs بازنویسی شده‌اند. یافته‌های بالا backlog اصلاح کد هستند. پیش از استفاده از Auth به‌عنوان مرجع کامل یک فیچر محافظت‌شده، ابتدا قرارداد حمل/تمدید توکن، mapper و مسیر خطا و pending تعیین و اصلاح شوند.
