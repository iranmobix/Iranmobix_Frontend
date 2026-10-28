import { CreditCard, Landmark, Wallet } from "lucide-react";
import { useId } from "react";
import type {
  CheckoutPayment,
  PaymentOption,
} from "../../types/domain/checkout-payment.types";
import type { CheckoutPaymentMethod } from "../../types/domain/checkout.types";
import { formatCheckoutMoney } from "../../utils/cart.utils";

const methods = [
  { id: "online", label: "پرداخت آنلاین", icon: CreditCard },
  { id: "wallet", label: "کیف پول ایران‌موبیکس", icon: Wallet },
  { id: "bank-transfer", label: "کارت به کارت یا شبا", icon: CreditCard },
  { id: "foreign-transfer", label: "حواله ارزی", icon: Landmark },
] as const;

type CheckoutPaymentMethodsProps = {
  value: CheckoutPaymentMethod | null;
  walletBalanceIrr?: number;
  walletSnapshot?: CheckoutPayment["wallet"];
  serverOptions?: PaymentOption[];
  disabled?: boolean;
  totalIrr?: number;
  onChange: (method: CheckoutPaymentMethod) => void;
  onWalletTopUp?: () => void;
  onBankDetails: () => void;
};

const CheckoutPaymentMethods = ({
  value,
  walletBalanceIrr = 0,
  walletSnapshot,
  totalIrr = 0,
  serverOptions,
  disabled = false,
  onChange,
  onWalletTopUp,
  onBankDetails,
}: CheckoutPaymentMethodsProps) => {
  const id = useId();
  const balance =
    walletSnapshot?.balanceToman ??
    serverOptions?.find((option) => option.method === "wallet")?.balanceToman;
  const insufficientFunds = walletSnapshot
    ? walletSnapshot.status === "insufficient" ||
      Number(walletSnapshot.shortageToman) > 0
    : walletBalanceIrr < totalIrr;
  const displayedMethods =
    serverOptions === undefined
      ? methods.map((m) => ({
          key: m.id,
          method: m.id as CheckoutPaymentMethod | null,
          label: m.label as string,
          icon: m.icon,
          enabled: true,
          reason: null as string | null,
        }))
      : serverOptions.map((option) => ({
          key: option.code,
          method: option.method,
          label: option.title,
          icon: methods.find((m) => m.id === option.method)?.icon ?? CreditCard,
          enabled: option.enabled && option.method !== null,
          reason:
            option.reason ??
            (option.method === null
              ? "این روش پرداخت هنوز در فرانت پشتیبانی نمی‌شود."
              : null),
        }));
  return (
    <section aria-labelledby={id} className="rounded-lg bg-white p-2.5 sm:p-6">
      <h2
        id={id}
        className="text-neutral-1000 sm:text-body-md mb-3 text-xs font-medium sm:mb-6"
      >
        روش پرداخت
      </h2>
      <fieldset className="space-y-2 sm:space-y-3" disabled={disabled}>
        <legend className="sr-only">انتخاب روش پرداخت</legend>
        {displayedMethods.map(
          ({ key, method, label, icon: Icon, enabled, reason }) => (
            <div
              key={key}
              className={`focus-within:ring-primary-300 rounded-lg border focus-within:ring-2 ${value === method && enabled && !disabled ? "border-primary-500" : "border-primary-100"}`}
            >
              <label className="flex cursor-pointer items-center gap-1.5 px-2.5 py-2 text-[11px] text-neutral-900 sm:gap-2 sm:px-4 sm:py-3 sm:text-sm">
                <input
                  type="radio"
                  name={`${id}-method`}
                  value={key}
                  checked={value === method && enabled && !disabled}
                  disabled={!enabled}
                  onChange={() => {
                    if (method && enabled && !disabled) onChange(method);
                  }}
                  aria-describedby={
                    method === "online" || method === "wallet"
                      ? `${id}-${method}-description`
                      : undefined
                  }
                  className="accent-primary-500 size-3.5 shrink-0 sm:size-4"
                />
                <Icon
                  size={17}
                  className="size-4 text-neutral-700 sm:size-[17px]"
                  aria-hidden="true"
                />
                {label}
              </label>
              {reason && (
                <p className="px-2.5 pb-2 text-[10px] leading-5 text-red-500 sm:px-4 sm:pb-3 sm:text-xs sm:leading-6">
                  {reason}
                </p>
              )}
              {method === "online" && (
                <p
                  id={`${id}-online-description`}
                  className="px-2.5 pb-2.5 text-[10px] leading-5 text-neutral-700 sm:px-4 sm:pb-4 sm:text-xs sm:leading-6"
                >
                  پرداخت امن با تمامی کارت‌های بانکی از طریق درگاه پرداخت
                </p>
              )}
              {method === "wallet" && (
                <div className="flex flex-wrap items-center justify-between gap-2 px-2.5 pb-2.5 text-[10px] sm:gap-3 sm:px-4 sm:pb-4 sm:text-xs">
                  <p
                    id={`${id}-wallet-description`}
                    className={
                      insufficientFunds ? "text-red-500" : "text-emerald-700"
                    }
                  >
                    {balance != null ? (
                      <>
                        <bdi>{balance} تومان</bdi>{" "}
                        {insufficientFunds ? "موجودی ناکافی" : ""}
                      </>
                    ) : walletSnapshot === undefined &&
                      serverOptions === undefined ? (
                      <>
                        {formatCheckoutMoney(walletBalanceIrr)}{" "}
                        {insufficientFunds ? "موجودی ناکافی" : "موجودی کافی"}
                      </>
                    ) : (
                      "موجودی از بک دریافت نشده"
                    )}
                  </p>
                  <button
                    type="button"
                    onClick={onWalletTopUp}
                    disabled={!onWalletTopUp}
                    title={
                      !onWalletTopUp
                        ? "اتصال شارژ کیف پول هنوز آماده نیست"
                        : undefined
                    }
                    className="text-primary-500 focus-visible:ring-primary-300 flex items-center gap-1 rounded text-[10px] focus-visible:ring-2 focus-visible:outline-none sm:text-xs"
                  >
                    <Wallet size={14} aria-hidden="true" />
                    شارژ کیف پول
                  </button>
                </div>
              )}
              {method === "bank-transfer" && (
                <div className="flex justify-end px-2.5 pb-2 sm:px-4 sm:pb-3">
                  <button
                    type="button"
                    onClick={onBankDetails}
                    className="text-primary-500 focus-visible:ring-primary-300 rounded text-[10px] focus-visible:ring-2 focus-visible:outline-none sm:text-xs"
                  >
                    نمایش شماره کارت و شبا
                  </button>
                </div>
              )}
            </div>
          ),
        )}
        {displayedMethods.length === 0 && (
          <p role="status" className="text-xs text-neutral-700">
            روش پرداختی از بک دریافت نشده است.
          </p>
        )}
      </fieldset>
    </section>
  );
};

export default CheckoutPaymentMethods;
