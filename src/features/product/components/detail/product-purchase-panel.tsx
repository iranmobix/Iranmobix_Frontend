"use client";

import {
  buildProductInquiryMessage,
  buildExpertChatLink,
  type ProductInquiryContext,
} from "../../utils/product-expert-chat";

import { useId, useState, type ReactNode } from "react";
import { RiPhoneFill, RiWhatsappFill, RiTelegramFill } from "@remixicon/react";
import PriceSpinner from "./price-spinner";
import PriceSkeleton from "./price-skeleton";
import type { ProductShippingCost } from "../../services/product-shipping-cost";

import type { AddToCartShippingMethod } from "@/features/cart/types/api/cart-payload.types";

export type ProductPurchasePanelProps = {
  shippingMethod?: AddToCartShippingMethod;
  onShippingMethodChange?: (method: AddToCartShippingMethod) => void;
  header?: ReactNode;
  compactSummary?: boolean;
  quantity: ReactNode;
  submit: ReactNode;
  notice?: ReactNode;
  shipping?: ProductShippingCost;
  inquiry?: ProductInquiryContext;
  isLoading?: boolean;
  isRecalculatingQuantity?: boolean;
  error?: string;
  onRetry?: () => void;
};
const formatMoney = (value: number | null | undefined) =>
  value == null
    ? "—"
    : value.toLocaleString("fa-IR", { maximumFractionDigits: 3 });

function ShippingAmount({
  amount,
  placeholder,
  yuan,
}: {
  amount?: number | null;
  placeholder: ReactNode;
  yuan?: number | null;
}) {
  if (placeholder && amount == null && yuan == null) return placeholder;
  return (
    <>
      {placeholder && amount == null ? (
        placeholder
      ) : (
        <>{formatMoney(amount)} تومان</>
      )}
      {yuan !== undefined ? (
        <>
          {" "}
          ≈{" "}
          {placeholder && yuan == null ? (
            placeholder
          ) : (
            <bdi dir="ltr">
              {yuan != null
                ? `¥${yuan.toLocaleString("en-US", { maximumFractionDigits: 3 })}`
                : "—"}
            </bdi>
          )}
        </>
      ) : null}
    </>
  );
}

export default function ProductPurchasePanel({
  quantity,
  shippingMethod,
  onShippingMethodChange,
  header,
  compactSummary = false,
  submit,
  notice,
  shipping,
  inquiry,
  isLoading = false,
  isRecalculatingQuantity = false,
  error,
  onRetry,
}: ProductPurchasePanelProps) {
  const [selectedMethod, setSelectedMethod] = useState("ground");
  const [airMode, setAirMode] = useState<"commercial" | "express">(
    "commercial",
  );
  const currentMethod = shippingMethod
    ? (
        {
          ground: "ground",
          sea: "sea",
          air_express: "express",
          commercial_air: "express",
        } as const
      )[shippingMethod]
    : selectedMethod;
  const currentAirMode = shippingMethod
    ? shippingMethod === "air_express"
      ? "express"
      : "commercial"
    : airMode;
  const chooseMethod = (method: string) => {
    setSelectedMethod(method);
    const selected =
      method === "express"
        ? currentAirMode === "express"
          ? "air_express"
          : "commercial_air"
        : (method as "ground" | "sea");
    onShippingMethodChange?.(selected);
  };
  const chooseAirMode = (mode: "commercial" | "express") => {
    setAirMode(mode);
    onShippingMethodChange?.(
      mode === "express" ? "air_express" : "commercial_air",
    );
  };
  const methodGroupId = useId();
  const cost = currentMethod === "sea" ? shipping?.sea : shipping?.land;
  const expert = shipping?.air?.express
    ? shipping.air.express.assigned_sales_expert
    : shipping?.air?.assigned_sales_expert;
  const chinaToman =
    shipping?.land?.china_total_toman ?? shipping?.sea?.china_total_toman;
  const chinaYuan =
    shipping?.land?.china_total_yuan ?? shipping?.sea?.china_total_yuan;
  const phone = expert?.mobile?.replace(/[\s()-]/g, "");
  const message = buildProductInquiryMessage(inquiry);
  const callablePhone = phone && /^\+?\d{7,15}$/.test(phone) ? phone : null;
  const contacts = [
    {
      label: "تماس تلفنی",
      href: callablePhone ? `tel:${callablePhone}` : null,
      icon: RiPhoneFill,
    },
    {
      label: "واتساپ",
      href: buildExpertChatLink("whatsapp", expert?.whatsapp_url, message),
      icon: RiWhatsappFill,
    },
    {
      label: "تلگرام",
      href: buildExpertChatLink("telegram", expert?.telegram_url, message),
      icon: RiTelegramFill,
    },
  ];
  const isAir = currentMethod === "express";
  const PricePlaceholder = isRecalculatingQuantity
    ? PriceSpinner
    : PriceSkeleton;
  const pricePlaceholder = isLoading ? <PricePlaceholder /> : null;
  return (
    <section
      dir="rtl"
      aria-label="خرید و برآورد ارسال"
      className="overflow-hidden rounded-md bg-white"
    >
      <div
        className="grid grid-cols-3 border-b border-neutral-200 text-center font-sans"
        role="radiogroup"
        aria-label="روش ارسال"
      >
        {[
          {
            id: "ground",
            title: "ارسال زمینی",
            duration: "۵۰ الی ۶۰ روز کاری",
          },
          { id: "sea", title: "ارسال دریایی", duration: "۹۰ الی ۱۲۰ روز کاری" },
          {
            id: "express",
            title: "ارسال هوایی",
            duration: "۱۰ الی ۲۵ روز کاری",
          },
        ].map((method) => (
          <label
            key={method.id}
            className={`relative flex min-w-0 cursor-pointer flex-col items-center gap-1.5 border-l border-neutral-200 px-1 py-2 after:absolute after:inset-x-0 after:bottom-[-1px] after:h-px last:border-l-0 ${currentMethod === method.id ? "after:bg-primary-500" : "after:bg-transparent"}`}
          >
            <span className="text-shipping-method flex items-center justify-center gap-0.5 whitespace-nowrap text-neutral-900">
              <input
                type="radio"
                name={methodGroupId}
                value={method.id}
                checked={currentMethod === method.id}
                onChange={() => chooseMethod(method.id)}
                className="accent-primary-500 focus-visible:outline-primary-500 size-2.5 shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2"
              />
              {method.title}
            </span>
            <span className="text-shipping-duration text-neutral-800">
              {method.duration}
            </span>
          </label>
        ))}
      </div>
      <div className="px-3.5 pt-2 pb-3.5">
        {header}
        <div className="grid min-w-0">
          <div
            aria-hidden={isAir || undefined}
            inert={isAir || undefined}
            className={`col-start-1 row-start-1 min-w-0 ${isAir ? "pointer-events-none invisible" : ""}`}
          >
            <dl
              aria-busy={isLoading}
              className="lg:text-desktop-body-s flex flex-col gap-4 py-3 text-right text-[11px] leading-6 text-neutral-600 lg:text-neutral-800"
            >
              <div className="flex flex-wrap items-baseline gap-1">
                <dt>قیمت در چین:</dt>
                <dd className="lg:text-desktop-label-m text-neutral-900 lg:text-neutral-800">
                  <ShippingAmount
                    amount={cost?.china_total_toman}
                    yuan={cost?.china_total_yuan ?? null}
                    placeholder={pricePlaceholder}
                  />
                </dd>
              </div>
              {!compactSummary &&
                [
                  ["حمل و نقل", cost?.international_shipping_toman],
                  ["بیمه", cost?.insurance_toman],
                  ["ترخیص", cost?.clearance_toman],
                  ["خدمات ایران‌موبیکس", cost?.iranmobix_services_toman],
                ].map(([label, value]) => (
                  <div
                    key={String(label)}
                    className="flex flex-wrap items-baseline gap-1"
                  >
                    <dt>{label}:</dt>
                    <dd className="lg:text-desktop-label-m text-neutral-900 lg:text-neutral-800">
                      <ShippingAmount
                        amount={typeof value === "number" ? value : null}
                        placeholder={pricePlaceholder}
                      />
                    </dd>
                  </div>
                ))}
              <div className="flex flex-wrap items-baseline gap-1 pt-4">
                <dt className="lg:text-desktop-body-m lg:text-neutral-900">
                  قیمت تحویل در ایران:
                </dt>
                <dd className="lg:text-desktop-label-l text-sm font-medium text-neutral-900">
                  <ShippingAmount
                    amount={cost?.total_toman}
                    placeholder={pricePlaceholder}
                  />
                </dd>
              </div>
            </dl>
            <div className="mt-2">
              {isAir ? (
                <div aria-hidden="true" className="h-[74px]" />
              ) : (
                quantity
              )}
            </div>
            {notice}
          </div>
          {isAir && (
            <div className="col-start-1 row-start-1 min-w-0">
              <label
                id={`${methodGroupId}-commercial-label`}
                className="flex cursor-pointer items-center gap-1 text-[10px] leading-5 text-neutral-800"
              >
                <input
                  type="radio"
                  name={`${methodGroupId}-air`}
                  value="commercial"
                  checked={currentAirMode === "commercial"}
                  onChange={() => chooseAirMode("commercial")}
                  aria-controls={`${methodGroupId}-commercial`}
                  className="accent-primary-500 focus-visible:outline-primary-500 size-2.5 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2"
                />
                ارسال هوایی تجاری
              </label>
              <div
                id={`${methodGroupId}-commercial`}
                hidden={currentAirMode !== "commercial"}
                role="region"
                aria-labelledby={`${methodGroupId}-commercial-label`}
              >
                <dl
                  aria-busy={isLoading}
                  className="lg:text-desktop-body-s flex flex-col gap-4 py-2 text-[11px] leading-6 text-neutral-600 lg:text-neutral-800"
                >
                  <div className="flex flex-wrap items-baseline gap-1">
                    <dt>قیمت در چین:</dt>
                    <dd className="lg:text-desktop-label-m text-neutral-900 lg:text-neutral-800">
                      <ShippingAmount
                        amount={chinaToman}
                        yuan={chinaYuan ?? null}
                        placeholder={pricePlaceholder}
                      />
                    </dd>
                  </div>
                  <div className="flex flex-wrap items-baseline gap-1 pt-4">
                    <dt className="lg:text-desktop-body-m lg:text-neutral-900">
                      قیمت تحویل در ایران:
                    </dt>
                    <dd className="lg:text-desktop-label-l font-medium text-neutral-900">
                      <ShippingAmount
                        amount={shipping?.air?.commercial?.total_toman}
                        placeholder={pricePlaceholder}
                      />
                    </dd>
                  </div>
                </dl>
                <div className="mt-1">{quantity}</div>
                {notice}
              </div>
              <div className="mt-2">
                <label
                  id={`${methodGroupId}-express-label`}
                  className="flex cursor-pointer items-center gap-1 text-[10px] leading-5 text-neutral-800"
                >
                  <input
                    type="radio"
                    name={`${methodGroupId}-air`}
                    value="express"
                    checked={currentAirMode === "express"}
                    onChange={() => chooseAirMode("express")}
                    aria-controls={`${methodGroupId}-express`}
                    className="accent-primary-500 focus-visible:outline-primary-500 size-2.5 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2"
                  />
                  ارسال هوایی اکسپرس
                </label>
                <div
                  id={`${methodGroupId}-express`}
                  hidden={currentAirMode !== "express"}
                  role="region"
                  aria-labelledby={`${methodGroupId}-express-label`}
                >
                  <p className="mt-2 text-right text-[10px] leading-5 text-neutral-600">
                    جهت استعلام هزینه‌های ارسال و خدمات با کارشناسان ما تماس
                    بگیرید.
                  </p>
                  <div
                    dir="ltr"
                    className="mt-2 flex items-center justify-end gap-3"
                  >
                    {contacts.map(({ label, href, icon: Icon }) => {
                      const className =
                        "text-primary-700 border-primary-700 hover:bg-primary-50 focus-visible:outline-primary-500 flex size-7 shrink-0 items-center justify-center rounded-full border transition-colors focus-visible:outline-2 focus-visible:outline-offset-4";
                      const name = `${label} با ${expert?.name || "کارشناس"}`;
                      return href ? (
                        <a
                          key={label}
                          href={href}
                          target={
                            href.startsWith("tel:") ? undefined : "_blank"
                          }
                          rel={
                            href.startsWith("tel:")
                              ? undefined
                              : "noopener noreferrer"
                          }
                          aria-label={name}
                          title={
                            label === "تماس تلفنی"
                              ? `${name}؛ ${expert?.mobile}`
                              : name
                          }
                          className={className}
                        >
                          <Icon size={15} aria-hidden="true" />
                        </a>
                      ) : (
                        <span
                          key={label}
                          aria-disabled="true"
                          role="link"
                          aria-label={`${label} از بک دریافت نشده است`}
                          title={`${label} از بک دریافت نشده است`}
                          className={`${className} opacity-35`}
                        >
                          <Icon size={15} aria-hidden="true" />
                        </span>
                      );
                    })}
                  </div>
                </div>
                {!isLoading &&
                  !error &&
                  !contacts.some((contact) => contact.href) && (
                    <p className="mt-2 text-[10px] leading-5 text-neutral-400">
                      اطلاعات تماس کارشناس از بک دریافت نشده است.
                    </p>
                  )}
              </div>
            </div>
          )}
        </div>
        {isLoading && (
          <p role="status" className="text-[10px] leading-5 text-neutral-400">
            {isAir && currentAirMode === "express"
              ? "در حال دریافت اطلاعات کارشناس…"
              : "در حال محاسبه هزینه‌ها…"}
          </p>
        )}
        {error && !isLoading && (
          <p role="alert" className="text-[10px] leading-5 text-neutral-500">
            {error}{" "}
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="text-primary-500 underline"
              >
                تلاش دوباره
              </button>
            )}
          </p>
        )}

        <div className="mt-4 [&_button]:w-full [&_button]:rounded-md">
          {submit}
        </div>
      </div>
    </section>
  );
}
