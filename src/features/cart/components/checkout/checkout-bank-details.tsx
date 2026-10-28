"use client";

import { useId, useState } from "react";
import { Check } from "lucide-react";
import type { CheckoutBankAccount } from "../../types/domain/checkout.types";
import CheckoutDialog from "./checkout-dialog";
import { formatCartMoney } from "../../utils/cart.utils";

type CopyFieldProps = {
  value: string;
  label: string;
  format: "card" | "iban";
  disabled: boolean;
  onCopy: (value: string) => void;
};

function CopyField({ value, label, format, disabled, onCopy }: CopyFieldProps) {
  const tooltipId = useId();
  const groups =
    format === "iban"
      ? [
          value.slice(0, 2),
          value.slice(2, 4),
          ...(value.slice(4).match(/.{1,4}/g) ?? []),
        ]
      : (value.match(/.{1,4}/g) ?? []);
  return (
    <button
      type="button"
      dir="ltr"
      aria-label={label}
      aria-describedby={tooltipId}
      disabled={disabled}
      onClick={() => onCopy(value)}
      className="group relative block w-full cursor-copy rounded py-2 font-sans text-[#fffbea] focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none disabled:cursor-wait"
    >
      <span
        className={`flex items-center justify-between whitespace-nowrap ${format === "card" ? "text-[clamp(16px,4.4vw,20px)] leading-7 font-medium" : "text-[clamp(10px,3.3vw,16px)] leading-6 font-normal tracking-[0.08em]"}`}
      >
        {groups.map((part, index) => (
          <span key={index}>{part}</span>
        ))}
      </span>
      <span
        id={tooltipId}
        role="tooltip"
        dir="rtl"
        className="pointer-events-none absolute bottom-full left-1/2 z-10 -translate-x-1/2 rounded bg-neutral-800 px-3 py-2 font-sans text-xs whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-t-neutral-800"
      >
        {label}
      </span>
    </button>
  );
}

function BankCard({ account }: { account: CheckoutBankAccount }) {
  const textureId = useId();
  const [status, setStatus] = useState<"idle" | "copying" | "copied" | "error">(
    "idle",
  );

  const copy = async (value: string) => {
    setStatus("copying");
    try {
      await navigator.clipboard.writeText(value.replace(/\s/g, ""));
      setStatus("copied");
    } catch {
      setStatus("error");
    }
  };

  return (
    <>
      <div>
        <p
          role="status"
          aria-live="polite"
          className={`mb-5 flex min-h-6 flex-row-reverse items-center justify-center gap-1 text-[11px] ${status === "error" ? "text-red-500" : "text-[#009b87]"}`}
        >
          {status === "copied" && (
            <>
              <Check size={14} aria-hidden="true" />
              کپی شد
            </>
          )}
          {status === "copying" && "در حال کپی…"}
          {status === "error" &&
            "کپی انجام نشد؛ دسترسی کلیپ‌بورد مرورگر را بررسی کنید."}
        </p>
        <div className="pointer-events-auto relative mx-auto aspect-[396/210] w-full rounded-[20px] border border-[#ac913d]/40 bg-[linear-gradient(110deg,#b79a39_0%,#c9ad49_48%,#d9c16a_100%)] shadow-[inset_1px_1px_1px_#947c31,0_1px_1px_#0000000a]">
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 size-full overflow-hidden rounded-[inherit] opacity-30 mix-blend-soft-light"
          >
            <filter id={textureId}>
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.85"
                numOctaves={3}
                stitchTiles="stitch"
              />
              <feColorMatrix type="saturate" values="0" />
            </filter>
            <rect width="100%" height="100%" filter={`url(#${textureId})`} />
          </svg>
          <svg
            aria-hidden="true"
            viewBox="0 0 48 32"
            className="pointer-events-none absolute top-[12%] left-[7.5%] w-[12%] text-[#e1c64f]/80"
            fill="currentColor"
          >
            <path d="M23 22C11 23 3 16 1 4c6 5 11 5 17 8 4 2 6 5 5 10ZM25 22C37 23 45 16 47 4c-6 5-11 5-17 8-4 2-6 5-5 10ZM24 20l5 7-5 4-5-4 5-7Z" />
          </svg>
          <p className="absolute top-[13%] right-[7.5%] max-w-[65%] text-right text-[clamp(10px,2.7vw,12px)] leading-6 text-[#fffbea]">
            {account.holderName}
            {account.bankName ? " — " + account.bankName : ""}
          </p>
          <div className="absolute inset-x-[7.5%] top-[38%]">
            <CopyField
              format="card"
              value={account.cardNumber}
              label="کپی شماره کارت"
              disabled={status === "copying"}
              onCopy={copy}
            />
          </div>
          <div className="absolute inset-x-[7.5%] top-[64%]">
            <CopyField
              format="iban"
              value={account.iban}
              label="کپی شبا"
              disabled={status === "copying"}
              onCopy={copy}
            />
          </div>
        </div>
        {account.amount != null && (
          <p className="mt-2 text-center text-xs text-white">
            مبلغ واریز:{" "}
            <bdi>
              {formatCartMoney(
                account.amount,
                account.currency === "IRR" ? "ریال" : (account.currency ?? ""),
              )}
            </bdi>
          </p>
        )}
        {account.isMock && (
          <p className="sr-only">اطلاعات نمونه است؛ برای واریز استفاده نشود.</p>
        )}
      </div>
    </>
  );
}

export default function CheckoutBankDetails({
  account,
  accounts,
  onDismiss,
}: {
  account?: CheckoutBankAccount | null;
  accounts?: readonly CheckoutBankAccount[];
  onDismiss: () => void;
}) {
  const cards = accounts ?? (account ? [account] : []);
  return (
    <CheckoutDialog
      title="شماره کارت و شبا"
      onDismiss={onDismiss}
      variant="bare"
    >
      <div className="space-y-6">
        {cards.map((card, index) => (
          <BankCard key={card.index ?? index} account={card} />
        ))}
        {cards.length === 0 && (
          <p role="status" className="p-5 text-center text-sm text-white">
            اطلاعات واریز بانکی از بک دریافت نشده است.
          </p>
        )}
      </div>
    </CheckoutDialog>
  );
}
