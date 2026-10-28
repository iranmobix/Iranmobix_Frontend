import Link from "next/link";
import { Button } from "@/components/ui/button";

const CartEmpty = () => (
  <section
    aria-labelledby="cart-empty-heading"
    className="flex min-h-[152px] flex-col items-center justify-center rounded-lg bg-white px-4 py-4 lg:min-h-[520px] lg:px-6 lg:py-12"
  >
    <svg
      viewBox="0 0 128 100"
      fill="none"
      aria-hidden="true"
      className="h-8 w-10 text-neutral-700 lg:h-24 lg:w-32"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path
        d="M13 75h79L108 7h12a3 3 0 0 1 0 6h-8L97 79a3 3 0 0 1-3 2H13a3 3 0 0 1 0-6Z"
        fill="#e7e3f0"
      />
      <path d="M4 19h93L86 71H13L4 19Z" />
      <path d="m24 19 5 52m14-52 2 52m18-52-2 52m21-52-5 52M7 36h86M10 54h79" />
      <circle cx="31" cy="90" r="6" />
      <circle cx="65" cy="90" r="6" />
    </svg>

    <h1
      id="cart-empty-heading"
      className="mt-1 text-center text-[10px] font-normal text-neutral-700 lg:mt-4 lg:text-body-md"
    >
      سبد خرید شما خالی است.
    </h1>

    <Button
      asChild
      variant="secondary"
      className="mt-2 h-5 min-h-0 rounded-lg border-primary-500 px-3 py-0 text-[10px] text-primary-500 lg:mt-8 lg:h-9 lg:px-6 lg:py-2 lg:text-sm"
    >
      <Link href="/products">مشاهده محصولات</Link>
    </Button>
  </section>
);

export default CartEmpty;
