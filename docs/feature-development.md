# راهنمای ساخت فیچر جدید

این سند الگوی پیشنهادی تیم است، نه فهرست قابلیت‌های تکمیل‌شدهٔ Auth. نمونهٔ زیر یک فیچر فرضی «آدرس‌های ذخیره‌شده» است؛ endpoint و DTO آن باید با قرارداد واقعی جایگزین شوند. این فایل‌ها در پروژه ایجاد نشده‌اند.

## ۱. پیش از ساخت پوشه‌ها

ابتدا صفحه، عملیات، ورودی‌ها، پاسخ موفق، خطاها و دادهٔ لازم UI را مشخص کنید. برای هر مقدار بدانید از بک می‌آید، state موقت کاربر است یا متن ثابت رابط. مدل API را از روی JSON واقعی و مدل domain را از روی نیاز مصرف‌کننده بنویسید.

پوشهٔ خالی صرفاً برای شبیه شدن به سایر فیچرها لازم نیست. اگر فیچر درخواست شبکه ندارد، api/service نسازید. اگر چند مقدار ثابت فقط در یک فایل مصرف دارند، همان‌جا بمانند. اگر یک بخش UI مسئولیت یا استفادهٔ مجدد مستقل ندارد، آن را بی‌دلیل به فایل جدا تبدیل نکنید.

## ۲. ساختار قابل گسترش

```text
src/features/saved-addresses/
  api/addresses.api.ts
  services/addresses.service.ts
  mappers/address.mapper.ts
  types/address-api.types.ts
  types/address.types.ts
  schemas/address.schema.ts
  hooks/use-addresses.ts
  components/addresses-page.tsx
  index.ts
  docs/README.md
```

در صورت نیاز واقعی اضافه شوند: `mock/` برای دادهٔ نمونه، `api/*.api.mock.ts` برای adapter موک، `utils/` برای helperهای خالص یا wrapperهای محیط، `constants/` برای مقادیر مشترک، `store/` برای state کلاینت بین مصرف‌کننده‌ها، `tests/` برای منطق حساس و `assets/` برای فایل تصویری اختصاصی.

برای قرارداد بزرگ، types را به api و domain یا چند موضوع محدود تقسیم کنید؛ برای سه type کوچک پوشه و فایل جدا برای هر property نسازید.

## ۳. types: مرز داده را صریح بنویسید

مسئول type API ثبت قرارداد شبکه است. snake_case و nullability بک را حفظ کنید. فیلدی که مقدار آن ممکن است null باشد با فیلدی که ممکن است اصلاً نیاید فرق دارد.

`types/address-api.types.ts`:

```ts
export interface AddressDto {
  id: number;
  title: string;
  street: string;
}

export interface AddressListResponse {
  results: AddressDto[];
}

export interface CreateAddressPayload {
  title: string;
  street: string;
}
```

`types/address.types.ts`:

```ts
export interface Address {
  id: string;
  title: string;
  street: string;
}
```

مدل domain را مستقل از AxiosResponse، form register و JSX بنویسید. برای type مشترک موجود import کنید؛ کپی جدید از User یا Product با همان مفهوم نسازید. اگر دو مدل فقط بخشی مشترک دارند، به مدل کامل وابسته نشوید؛ Pick یا مدل کوچک مشترک وقتی مفهوم واقعاً یکسان است مناسب است.

نوع VerifyOtpResult در Auth نمونهٔ خروجی سرویس است: DTO خالص نیست. این جای‌گذاری فعلی را قانون نام‌گذاری فیچر جدید نکنید.

## ۴. schemas: اعتبارسنجی runtime

`schemas/address.schema.ts`:

```ts
import { z } from "zod";

export const addressSchema = z.object({
  title: z.string().trim().min(1, "عنوان را وارد کنید"),
  street: z.string().trim().min(1, "نشانی را وارد کنید"),
});

export type AddressFormValues = z.infer<typeof addressSchema>;
```

قواعد ورودی قابل تکرار در schema قرار می‌گیرند؛ پیام نمایشی نزدیک همان قانون است. اگر schema transform دارد، نوع ورودی و خروجی فرم را آگاهانه تعیین کنید. اعتبارسنجی فرم جای اعتبارسنجی بک را نمی‌گیرد. generic مثل httpGet<Response> نیز JSON نامعتبر را رد نمی‌کند؛ اگر قرارداد نیازمند بررسی runtime است، schema پاسخ را قبل از mapping اجرا کنید. مثال سادهٔ این سند برای پاسخ شبکه schema ندارد.

## ۵. api: فقط HTTP

`api/addresses.api.ts`:

```ts
import { httpGet, httpPost } from "@/shared/api";
import type {
  AddressDto,
  AddressListResponse,
  CreateAddressPayload,
} from "../types/address-api.types";

export const addressesApi = {
  list: () =>
    httpGet<AddressListResponse>("/api/example/addresses/"),
  create: (payload: CreateAddressPayload) =>
    httpPost<AddressDto>("/api/example/addresses/", payload),
};
```

این URL نمونهٔ آموزشی است. برای endpoint واقعی، method، اسلش پایانی، query و body را طبق قرارداد بنویسید. تنظیم request مانند signal یا header اختصاصی همین‌جا می‌آید. query/body/header را در کامپوننت نچینید. singleton کلاس Auth و object نمونه هر دو برای مرز api قابل استفاده‌اند؛ کلاس صرفاً وقتی state یا نیاز مشخص دارد ضروری است.

خروجی httpGet/httpPost همین data است؛ دوباره response.data ننویسید. catch خالی، تبدیل هر خطا به [] و بازگرداندن موفقیت موک، خطای واقعی را پنهان می‌کند.

## ۶. mapper: تبدیل بدون side effect

`mappers/address.mapper.ts`:

```ts
import type { AddressDto } from "../types/address-api.types";
import type { Address } from "../types/address.types";

export function mapAddress(dto: AddressDto): Address {
  return {
    id: String(dto.id),
    title: dto.title,
    street: dto.street,
  };
}
```

همهٔ فیلدهای اجباری domain را پوشش دهید؛ با `as Address` خطای mapper را مخفی نکنید. fetch، localStorage، toast و setState در mapper نباشند. برای مقدار مفقود، رفتار محصول را مشخص کنید؛ عدد صفر، نام یا تصویر نمونه را بدون قرارداد جایگزین نکنید. مقدار null در داده می‌تواند در UI به «—» نمایش داده شود.

## ۷. service: هماهنگی یک عملیات

`services/addresses.service.ts`:

```ts
import { addressesApi } from "../api/addresses.api";
import { mapAddress } from "../mappers/address.mapper";
import type { CreateAddressPayload } from "../types/address-api.types";

export async function getAddresses() {
  const response = await addressesApi.list();
  return response.results.map(mapAddress);
}

export async function createAddress(payload: CreateAddressPayload) {
  const response = await addressesApi.create(payload);
  return mapAddress(response);
}
```

خروجی service برای مصرف هوک آماده است؛ component نباید دوباره DTO را تبدیل کند. تصمیم‌هایی مانند هماهنگی چند درخواست، رفع نیاز session یا انتخاب adapter اینجا یا سرویس اختصاصی همان مسئولیت قرار می‌گیرند. service نباید hook React یا navigation مخصوص صفحه داشته باشد.

اگر چند عملیات فقط به هم نزدیک‌اند، یک فایل کافی است. مثل cart-session یا checkout فقط وقتی چرخهٔ مستقل دارند آن‌ها را جدا کنید. توابع خالص محاسباتی را برای تست مستقل از API نگه دارید.

## ۸. hook: وضعیت درخواست و cache

`hooks/use-addresses.ts`:

```ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createAddress, getAddresses } from "../services/addresses.service";

const queryKey = ["saved-addresses", "list"] as const;

export function useAddresses() {
  return useQuery({ queryKey, queryFn: getAddresses });
}

export function useCreateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAddress,
    retry: false,
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });
}
```

query key باید همهٔ پارامترهای مؤثر بر پاسخ مانند فیلتر و صفحه و زمینهٔ کاربر را پوشش دهد. دادهٔ کاربران مختلف را بدون سیاست پاک‌سازی/تفکیک cache به هم ندهید. این نمونه فیلتر یا پارامتر ندارد. برای mutation غیر idempotent، retry خودکار را بدون قرارداد فعال نکنید.

هوک flow مثل useOtpFlow وقتی لازم است که چند عملیات و مراحل UI هماهنگ شوند؛ برای یک query ساده یک flow اضافی نسازید. state فرم در فرم، دادهٔ بک در Query، و مرحلهٔ چندبخشی در flow نگهداری می‌شود. Zustand را صرفاً به دلیل نصب بودن استفاده نکنید.

خطای mutation را به مصرف‌کننده برگردانید یا در flow مدل خطای مشخص داشته باشید. فایل hook نباید JSX، کلاس‌های ظاهری یا اطلاعات محرمانه در console داشته باشد.

## ۹. component: رندر و callback

`components/addresses-page.tsx`:

```tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addressSchema, type AddressFormValues } from "../schemas/address.schema";
import { useAddresses, useCreateAddress } from "../hooks/use-addresses";

export default function AddressesPage() {
  const query = useAddresses();
  const create = useCreateAddress();
  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: { title: "", street: "" },
  });

  return (
    <section dir="rtl">
      <h1>آدرس‌ها</h1>
      {query.isPending && <p role="status">در حال دریافت…</p>}
      {query.isError && (
        <div role="alert">
          دریافت آدرس‌ها ناموفق بود.
          <Button
            type="button"
            disabled={query.isFetching}
            onClick={() => void query.refetch()}
          >
            تلاش دوباره
          </Button>
        </div>
      )}
      {query.data && (
        query.data.length ? (
          <ul>{query.data.map(address => (
            <li key={address.id}>{address.title}: {address.street}</li>
          ))}</ul>
        ) : <p>آدرسی ثبت نشده است.</p>
      )}
      <form onSubmit={form.handleSubmit(values => {
        create.mutate(values, { onSuccess: () => form.reset() });
      })}>
        <label htmlFor="address-title">عنوان</label>
        <Input
          id="address-title"
          {...form.register("title")}
          aria-invalid={Boolean(form.formState.errors.title)}
          aria-describedby={form.formState.errors.title ? "title-error" : undefined}
        />
        {form.formState.errors.title && (
          <p id="title-error" role="alert">{form.formState.errors.title.message}</p>
        )}
        <label htmlFor="address-street">نشانی</label>
        <Input
          id="address-street"
          {...form.register("street")}
          aria-invalid={Boolean(form.formState.errors.street)}
          aria-describedby={form.formState.errors.street ? "street-error" : undefined}
        />
        {form.formState.errors.street && (
          <p id="street-error" role="alert">{form.formState.errors.street.message}</p>
        )}
        {create.isError && <p role="alert">ثبت آدرس ناموفق بود.</p>}
        <Button type="submit" disabled={create.isPending}>ثبت آدرس</Button>
      </form>
    </section>
  );
}
```

این مثال برای یک صفحه و یک فرم است؛ اگر چند instance هم‌زمان رندر می‌شود، idها را با useId یکتا کنید. برای رفتار مهم، guard و اعتبارسنجی سطح عملیات را هم در نظر بگیرید؛ disabled به‌تنهایی تضمین سمت سرور برای عدم تکرار درخواست نیست.

ابتدا component با همین مسئولیت بسازید؛ اگر فرم مستقل شد یا جای دیگری مصرف شد، آن را با props مانند onSubmit/loading/error جدا کنید. یک Label یا متن ثابت به‌تنهایی دلیل کامپوننت جدید نیست. presentational component نباید مستقیم API یا storage بخواند.

## ۱۰. public API و route

`index.ts` پیشنهادی:

```ts
export { default as AddressesPage } from "./components/addresses-page";
export type { Address } from "./types/address.types";
```

route پیشنهادی، پس از فراهم کردن QueryClientProvider در layout مناسب:

```tsx
import { AddressesPage } from "@/features/saved-addresses";

export default function Page() {
  return <AddressesPage />;
}
```

فقط چیزی را export کنید که مصرف خارجی دارد. داخل فیچر از فایل مستقیم import کنید تا import از barrel خود فیچر باعث چرخه نشود. برای مرزهای server/client، exportهای server-only را با entry کلاینت مخلوط نکنید.

route محل تعریف دوبارهٔ DTO، mapper، query یا منطق کامل صفحه نیست. ترتیب نوشتن برعکس مسیر نمایش است: قرارداد → schema/mapper → api/service → hook → component → route.

## ۱۱. الگوی فایل‌های اختیاری

| نوع فایل | روش نوشتن |
| --- | --- |
| utils | ورودی و خروجی مشخص، نام بر اساس کار؛ تابع pure با دادهٔ ورودی، wrapper محیط با guard و رفتار خطای مشخص |
| constants | مقدار مشترک واقعی و ترجیحاً as const؛ دادهٔ نمونهٔ کاربر/محصول در constants نباشد |
| mock | DTO یا domain متناسب با هدف تست؛ اگر برای تست جریان API است از همان schema و mapper عبور کند؛ انتخاب mock صریح باشد |
| store | مالک state کلاینت بین چند بخش؛ اطلاعات قابل مشتق از Query را موازی ذخیره نکند |
| assets | تصویر/آیکن اختصاصی؛ قبل از افزودن، shared UI و آیکن‌های موجود را بررسی کنید |
| tests | رفتار مهم: ورودی مرزی، mapping، خطا، retry، state transition و cache؛ کپی خط‌به‌خط پیاده‌سازی نباشد |
| docs | کاربرد، فایل‌ها، public exports، endpointها، جریان داده، موک و محدودیت‌ها، روش بررسی |

## ۱۲. انتخاب فایل مناسب برای تغییر

- تغییر نام فیلد بک: API type و mapper، سپس سرویس/تست مرتبط.
- تغییر مسیر یا header: api و در صورت عمومی بودن، shared transport با بررسی مصرف‌کنندگان.
- تغییر قانون ورودی: schema و پیام فرم.
- تغییر مراحل صفحه: flow hook و component ترکیب‌کننده.
- تغییر layout: component؛ domain را برای کلاس CSS تغییر ندهید.
- تغییر ذخیره‌سازی: wrapper storage و مصرف‌کنندهٔ مستقیم آن؛ همهٔ componentها را با localStorage درگیر نکنید.
- نیاز قابلیت مشترک: ابتدا بخش موجود را import کنید؛ اگر قرارداد متفاوت است، مدل اشتراک را مشخص کنید.

## ۱۳. معیار آماده بودن تحویل

loading/error/empty/success، اعتبار ورودی، disabled و تکرار درخواست، nullهای بک و تغییر پارامتر صفحه بررسی شده باشند. برای فرم label و خطای قابل دسترس، برای لیست key پایدار، و برای listener/timer cleanup داشته باشید.

بررسی type با `npx tsc --noEmit` و lint هدفمند با `npx eslint src/features/<feature>` روی ابزار نصب‌شدهٔ پروژه انجام شود؛ اگر محیط پیشنهاد نصب ابزار داد، آن را بررسی خودکارِ آفلاین فرض نکنید. فایل‌های مهم منطق، تست رفتار داشته باشند. نتیجهٔ اجرا و خطاهای قبلی پروژه را جدا گزارش کنید؛ تست منطق جای مشاهدهٔ واقعی UI در مرورگر یا آزمون قرارداد زنده نیست.

مستندات، رفتار موجود و محدودیت‌های باقی‌مانده را توضیح دهند. استفاده از این الگو به معنی کامل بودن refresh/logout یا کیفیت همهٔ اجزای Auth فعلی نیست.
