import { formatPanelDate } from "../utils/panel-display.utils";
import Image from "next/image";
import emptyOrders from "../assets/empty-orders.svg";
import type {
  PanelOrderStep,
  PanelOrderStepKind,
} from "../types/panel-order.types";
import PanelInvoiceLink from "./panel-invoice-link";
function StepIllustration({ kind }: { kind: PanelOrderStepKind }) {
  if (kind === "package")
    return (
      <Image
        src={emptyOrders}
        width={38}
        height={38}
        alt=""
        className="h-9 w-9"
      />
    );
  return (
    <svg
      width="42"
      height="38"
      viewBox="0 0 64 56"
      fill="none"
      aria-hidden="true"
    >
      {kind === "purchase" || kind === "payment" ? (
        <>
          <path d="m12 8 30-5 10 27-29 7Z" fill="#544577" />
          <path d="m17 12 22-4 7 20-21 6Z" fill="#C0B6D6" />
          <path d="m9 39 22 12 27-13-25-9Z" fill="#403664" />
          <path d="m16 40 15 7 18-9-16-4Z" fill="#E8C979" />
          <path d="M47 8h10v7H47Z" fill="#EAC986" />
        </>
      ) : kind === "sea" ? (
        <>
          <path d="M5 39h54l-10 12H18Z" fill="#35306C" />
          <path d="M1 53h62" stroke="#B0D5E5" strokeWidth="3" />
          <path d="M12 23h13v15H12Z" fill="#E4B145" />
          <path d="M26 23h13v15H26Z" fill="#6553BD" />
          <path d="M40 23h13v15H40Z" fill="#D5A25C" />
          <path d="M20 12h26v10H20Z" fill="#EBBD52" />
          <path d="M9 28V17h9v11" fill="#ECEBF3" />
          <path d="M12 17V8h2v9" stroke="#5B5A70" strokeWidth="2" />
        </>
      ) : kind === "warehouse" || kind === "customs" ? (
        <>
          <path d="m4 23 26-15 29 15-27 15Z" fill="#C2BCD9" />
          <path d="M4 23v22l28 9V32Z" fill="#4D4483" />
          <path d="M32 32v22l27-9V23Z" fill="#796CAA" />
          <path d="M9 29v12l8 3V32Zm12 4v13l7 2V35Z" fill="#E8C36A" />
          <path d="M38 36v11l9-3V33Z" fill="#F2E9D4" />
        </>
      ) : kind === "truck" || kind === "delivery" ? (
        <>
          <path d="m6 12 27-7 14 8-25 9Z" fill="#DAD9E2" />
          <path d="M6 12v23l16 10V22Z" fill="#868591" />
          <path d="m22 22 25-9v24l-25 8Z" fill="#C4C2CE" />
          <path d="m47 25 11 6v14l-11 6Z" fill="#B1ABCA" />
          <path d="m48 29 7 4v7l-7-3Z" fill="#544877" />
          <circle cx="19" cy="45" r="5" fill="#43404F" />
          <circle cx="50" cy="47" r="5" fill="#43404F" />
          <circle cx="19" cy="45" r="2" fill="#DDDCE3" />
          <circle cx="50" cy="47" r="2" fill="#DDDCE3" />
        </>
      ) : (
        <>
          <path d="m10 18 25-9 22 13-24 9Z" fill="#DED6BD" />
          <path d="M10 18v24l23 12V31Z" fill="#50477D" />
          <path d="M33 31v23l24-11V22Z" fill="#7864AD" />
          <path d="m17 16 12-4 22 13-12 4Z" fill="#D9AF4B" />
          <path d="M39 29v12l12-5V25Z" fill="#E4BF6C" />
          <path d="m18 32 9 4v8l-9-4Z" fill="#F7F3EB" />
          <path d="m44 7 9 5-8 4-9-5Z" fill="#EDCC76" />
        </>
      )}
    </svg>
  );
}
export default function PanelOrderTimeline({
  steps,
  code,
  invoice,
}: {
  steps: PanelOrderStep[];
  code: string;
  invoice: string | null;
}) {
  return (
    <section aria-label={"وضعیت سفارش " + code} className="mt-7">
      <h2 className="mb-5 text-sm font-medium text-neutral-900">وضعیت سفارش</h2>
      {steps.length === 0 ? (
        <p className="mb-4 text-xs text-neutral-600">
          مراحل سفارش: بدون مقدار از سمت بک‌اند
        </p>
      ) : (
      <ol className="flex flex-col items-start">
        {steps.map((step, index) => (
          <li
            key={step.id}
            aria-current={step.state === "current" ? "step" : undefined}
            className="relative flex min-h-[94px] w-full items-start gap-4 pb-5 last:min-h-0 last:pb-0"
          >
            {index < steps.length - 1 && (
              <span
                className="absolute right-[29px] top-[58px] bottom-0 border-r border-neutral-200"
                aria-hidden="true"
              />
            )}
            <span
              className={
                "relative z-10 flex size-[60px] shrink-0 items-center justify-center rounded-full border bg-white " +
                (step.state === "upcoming"
                  ? "border-neutral-200 grayscale opacity-70"
                  : "border-secondary-400")
              }
              aria-hidden="true"
            >
              <StepIllustration kind={step.kind} />
            </span>
            <div className="min-w-0 pt-3 text-xs leading-6 text-neutral-700">
              <p>{step.label}</p>
              {step.occurredAt && (
                <time
                  dateTime={step.occurredAt}
                  className="block text-[11px] text-neutral-600"
                >
                  {formatPanelDate(step.occurredAt, true)}
                </time>
              )}
              <span className="sr-only">
                {step.state === "completed"
                  ? "تکمیل شده"
                  : step.state === "current"
                    ? "مرحله فعلی"
                    : "مرحله بعدی"}
              </span>
            </div>
          </li>
        ))}
      </ol>
      )}
      <p className="mt-3 text-[11px] text-neutral-500">
        تاریخ هر مرحله: بدون مقدار از سمت بک‌اند
      </p>
      <p className="mt-2 break-all text-[11px] text-neutral-500">
        فاکتور: <PanelInvoiceLink invoice={invoice} />
      </p>
    </section>
  );
}
