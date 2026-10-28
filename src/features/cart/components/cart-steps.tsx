import Image from "next/image";
import ship from "../assets/shape.svg";

const steps = [
  { id: "account", label: "ورود/ثبت‌نام" },
  { id: "cart", label: "ثبت اولیه" },
  { id: "review", label: "تأیید کارشناسی" },
  { id: "payment", label: "انتخاب آدرس و پرداخت" },
] as const;

type CartStepsProps = { currentStep: (typeof steps)[number]["id"] };

export default function CartSteps({ currentStep }: CartStepsProps) {
  const activeIndex = steps.findIndex((step) => step.id === currentStep);
  return (
    <nav
      dir="rtl"
      aria-label="مراحل سفارش"
      className="mx-auto w-full max-w-[600px] py-1 sm:py-6"
    >
      <ol className="before:border-primary-300 relative grid grid-cols-4 before:absolute before:inset-x-[12.5%] before:top-[17px] before:border-t-2 before:border-dotted sm:before:top-[35px]">
        {steps.map((step, index) => (
          <li
            key={step.id}
            aria-current={index === activeIndex ? "step" : undefined}
            className="relative flex min-w-0 flex-col items-center gap-1 px-0.5 text-center sm:gap-2 sm:px-1"
          >
            <span className="flex h-5 w-full items-end justify-center sm:h-10">
              {index === activeIndex ? (
                <Image
                  src={ship}
                  alt=""
                  width={115}
                  height={36}
                  className="relative h-auto w-8 max-w-full bg-neutral-50 sm:w-[115px]"
                />
              ) : (
                <span
                  aria-hidden="true"
                  className={
                    "border-primary-500 relative -bottom-0.5 size-1.5 rounded-full border sm:-bottom-1 sm:size-2.5 " +
                    (index < activeIndex ? "bg-primary-500" : "bg-neutral-50")
                  }
                />
              )}
            </span>
            <span className="text-primary-700 text-[7px] leading-3 sm:text-xs sm:leading-5">
              {step.label}
            </span>
            <span className="sr-only">
              {index < activeIndex
                ? "تکمیل شده"
                : index === activeIndex
                  ? "مرحلهٔ فعلی"
                  : "مرحلهٔ بعدی"}
            </span>
          </li>
        ))}
      </ol>
    </nav>
  );
}
