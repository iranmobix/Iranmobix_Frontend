import { CloudOff, ShoppingBag } from "lucide-react";

export default function CartUnavailable() {
  return (
    <section
      role="alert"
      aria-labelledby="cart-unavailable-title"
      className="relative isolate flex min-h-[360px] flex-col items-center justify-center overflow-hidden rounded-2xl bg-white px-6 py-12 text-center lg:min-h-[460px]"
    >
      <div
        aria-hidden="true"
        className="from-primary-50/40 pointer-events-none absolute inset-0 -z-10 bg-linear-to-b via-white to-white"
      />
      <div
        aria-hidden="true"
        className="relative mb-7 flex size-36 items-center justify-center"
      >
        <div className="border-primary-200/60 absolute inset-0 rounded-full border border-dashed" />
        <div className="bg-primary-50/70 absolute inset-3 rounded-full" />
        <div className="border-primary-100 text-primary-500 shadow-primary-100/40 relative flex size-20 -rotate-6 items-center justify-center rounded-2xl border bg-white shadow-lg">
          <ShoppingBag size={38} strokeWidth={1.4} />
        </div>
        <span className="bg-secondary-50 text-secondary-600 absolute right-0 bottom-3 flex size-12 items-center justify-center rounded-full border-4 border-white">
          <CloudOff size={23} strokeWidth={1.6} />
        </span>
        <span className="bg-secondary-400 absolute top-4 left-1 size-2 rounded-full" />
        <span className="bg-primary-200 absolute bottom-2 left-5 size-1.5 rounded-full" />
      </div>
      <h1
        id="cart-unavailable-title"
        className="text-mobile-h5 lg:text-desktop-h5 text-neutral-1000 leading-relaxed"
      >
        سبد خرید فعلاً در دسترس نیست
      </h1>
      <p className="text-mobile-body-s lg:text-desktop-body-s mt-3 max-w-md leading-7 text-neutral-800">
        در حال حاضر امکان دریافت اطلاعات سبد خرید وجود ندارد.
        <br />
        لطفاً کمی بعد دوباره به این صفحه سر بزنید.
      </p>
    </section>
  );
}
