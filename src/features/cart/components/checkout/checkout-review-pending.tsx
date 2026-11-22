import Image from "next/image";
import { ClipboardList, Clock3, Mail, Phone, UserRound } from "lucide-react";
import type { CartAssignedExpert } from "../../schemas/cart-expert.schema";

const text = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";
const profileLabels: Record<string, string> = {
  first_name: "نام",
  last_name: "نام خانوادگی",
  title: "عنوان",
  job_title: "سمت",
  department: "واحد",
  extension: "داخلی",
  office_phone: "تلفن دفتر",
};
const profileFields = new Set([
  "id",
  "name",
  "mobile",
  "phone",
  "email",
  "image",
  "profile_photo",
  "whatsapp_url",
  "telegram_url",
]);
const safeUrl = (value: unknown, hosts: string[]) => {
  try {
    const url = new URL(text(value));
    return url.protocol === "https:" && hosts.includes(url.hostname)
      ? url.href
      : null;
  } catch {
    return null;
  }
};

export default function CheckoutReviewPending({
  expert,
}: {
  expert: CartAssignedExpert | null;
}) {
  const name = text(expert?.name);
  const image = text(expert?.profile_photo) || text(expert?.image);
  const avatar =
    /^https?:\/\//.test(image) ||
    (image.startsWith("/") && !image.startsWith("//"))
      ? image
      : null;
  const mobile = text(expert?.mobile) || text(expert?.phone);
  const phone = mobile.replace(/[^\d+]/g, "");
  const email = text(expert?.email);
  const whatsapp = safeUrl(expert?.whatsapp_url, [
    "wa.me",
    "api.whatsapp.com",
    "web.whatsapp.com",
  ]);
  const telegram = safeUrl(expert?.telegram_url, ["t.me", "telegram.me"]);
  const details = Object.entries(expert ?? {}).filter(
    ([key, value]) =>
      !profileFields.has(key) &&
      (typeof value === "number" || Boolean(text(value))),
  );

  return (
    <section
      dir="rtl"
      aria-labelledby="order-review-title"
      className="relative isolate mx-auto flex min-h-[420px] w-full flex-col items-center overflow-hidden rounded-2xl bg-white px-5 py-10 text-center sm:px-10 sm:py-12"
    >
      <div
        aria-hidden="true"
        className="from-primary-50/50 pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 bg-linear-to-b to-white"
      />
      <div
        aria-hidden="true"
        className="relative mb-7 grid size-32 place-items-center"
      >
        <span className="border-primary-200/70 absolute inset-0 rounded-full border border-dashed motion-safe:animate-spin motion-safe:[animation-duration:24s]" />
        <span className="bg-primary-50 absolute inset-3 rounded-full" />
        <span className="border-primary-100 text-primary-500 relative grid size-20 -rotate-6 place-items-center rounded-2xl border bg-white shadow-sm">
          <ClipboardList size={38} strokeWidth={1.4} />
        </span>
        <span className="bg-secondary-50 text-secondary-600 absolute right-0 bottom-1 grid size-11 place-items-center rounded-full border-4 border-white">
          <Clock3 size={22} strokeWidth={1.6} />
        </span>
      </div>
      <span className="text-mobile-caption lg:text-desktop-caption text-primary-600 bg-primary-50 mb-4 inline-flex items-center gap-2 rounded-full px-3 py-2">
        <span
          aria-hidden="true"
          className="bg-secondary-500 size-1.5 rounded-full motion-safe:animate-pulse"
        />
        در حال بررسی سفارش
      </span>
      <h2
        id="order-review-title"
        className="text-mobile-h5 lg:text-desktop-h5 text-neutral-1000 leading-relaxed"
      >
        منتظر تأیید کارشناس باشید
      </h2>
      <p
        role="status"
        className="text-mobile-body-s lg:text-desktop-body-s mt-3 max-w-lg leading-7 text-neutral-800"
      >
        سفارش شما ثبت شده و برای بررسی قیمت نهایی به کارشناس ارجاع داده شده است.
        پس از تأیید، مرحله پرداخت در همین صفحه فعال می‌شود.
      </p>
      <div className="border-primary-100/70 mt-7 w-full max-w-lg rounded-xl border bg-white p-4 text-right sm:p-5">
        <p className="text-mobile-caption lg:text-desktop-caption mb-4 text-neutral-700">
          کارشناس مسئول بررسی سفارش شما
        </p>
        {expert &&
        (name ||
          mobile ||
          email ||
          avatar ||
          whatsapp ||
          telegram ||
          details.length > 0) ? (
          <>
            <div className="flex items-center gap-3">
              {avatar ? (
                <Image
                  src={avatar}
                  alt=""
                  width={44}
                  height={44}
                  className="size-11 shrink-0 rounded-full object-cover"
                />
              ) : (
                <span
                  aria-hidden="true"
                  className="bg-primary-50 text-primary-500 grid size-11 shrink-0 place-items-center rounded-full"
                >
                  <UserRound size={22} strokeWidth={1.5} />
                </span>
              )}
              <p className="text-mobile-label-l lg:text-desktop-label-l flex min-w-0 items-center gap-2 leading-relaxed text-neutral-900">
                {name || "کارشناس فروش"}
              </p>
            </div>
            <dl className="text-mobile-body-s lg:text-desktop-body-s mt-4 space-y-3 text-neutral-800">
              {mobile && phone && (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <dt className="flex items-center gap-2">
                    <Phone size={15} aria-hidden="true" />
                    تماس
                  </dt>
                  <dd>
                    <a
                      href={"tel:" + phone}
                      className="text-primary-500"
                      dir="ltr"
                    >
                      {mobile}
                    </a>
                  </dd>
                </div>
              )}
              {email && (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <dt className="flex items-center gap-2">
                    <Mail size={15} aria-hidden="true" />
                    ایمیل
                  </dt>
                  <dd className="min-w-0 break-all">
                    <a
                      href={"mailto:" + encodeURIComponent(email)}
                      className="text-primary-500"
                      dir="ltr"
                    >
                      {email}
                    </a>
                  </dd>
                </div>
              )}
              {details.map(([key, value]) => (
                <div
                  key={key}
                  className="flex flex-wrap items-baseline justify-between gap-3"
                >
                  <dt>{profileLabels[key] ?? key.replaceAll("_", " ")}</dt>
                  <dd className="min-w-0 break-words">{String(value)}</dd>
                </div>
              ))}
            </dl>
            {(whatsapp || telegram) && (
              <div className="text-mobile-label-m lg:text-desktop-label-m text-primary-500 mt-4 flex gap-4">
                {whatsapp && (
                  <a href={whatsapp} target="_blank" rel="noopener noreferrer">
                    واتساپ
                  </a>
                )}
                {telegram && (
                  <a href={telegram} target="_blank" rel="noopener noreferrer">
                    تلگرام
                  </a>
                )}
              </div>
            )}
          </>
        ) : (
          <p className="text-mobile-body-s lg:text-desktop-body-s leading-7 text-neutral-800">
            اطلاعات کارشناس هنوز اعلام نشده است.
          </p>
        )}
      </div>
      <p className="text-mobile-caption lg:text-desktop-caption mt-5 leading-6 text-neutral-700">
        وضعیت سفارش به‌صورت خودکار به‌روزرسانی می‌شود.
      </p>
    </section>
  );
}
