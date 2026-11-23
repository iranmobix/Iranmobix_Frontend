"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Dialog } from "radix-ui";
import { X } from "lucide-react";
import { RiPhoneFill, RiWhatsappFill, RiTelegramFill } from "@remixicon/react";
import { Button } from "@/components/ui/button";
import {
  ShippingAmount,
  type ProductPurchasePanelProps,
} from "./product-purchase-panel";
import PriceSkeleton from "./price-skeleton";
import PriceSpinner from "./price-spinner";
import {
  buildExpertChatLink,
  buildProductInquiryMessage,
} from "../../utils/product-expert-chat";
import type { AddToCartShippingMethod } from "@/features/cart/types/api/cart-payload.types";
import styles from "./product-mobile-purchase.module.css";

type Props = ProductPurchasePanelProps & {
  canOpen: boolean;
  onResetQuantityEditing?: () => void;
};
const methods: { id: AddToCartShippingMethod; title: string }[] = [
  { id: "ground", title: "ارسال زمینی" },
  { id: "sea", title: "ارسال دریایی" },
  { id: "commercial_air", title: "ارسال هوایی تجاری" },
  { id: "air_express", title: "ارسال هوایی اکسپرس" },
];

export default function ProductMobilePurchase({
  shipping,
  shippingMethod = "ground",
  onShippingMethodChange,
  quantity,
  submit,
  notice,
  inquiry,
  isLoading = false,
  isRecalculatingQuantity = false,
  error,
  onRetry,
  canOpen,
  onResetQuantityEditing,
}: Props) {
  const [open, setOpen] = useState(false);
  const groupId = useId();
  const barRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = () => {
      if (desktop.matches) {
        onResetQuantityEditing?.();
        setOpen(false);
      }
    };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, [onResetQuantityEditing]);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    const root = document.documentElement;
    const property = "--product-mobile-purchase-height";
    const previous = root.style.getPropertyValue(property);
    const update = () => {
      const height = bar.getBoundingClientRect().height;
      if (height > 0) root.style.setProperty(property, height + "px");
    };
    const observer = new ResizeObserver(update);
    observer.observe(bar);
    update();
    return () => {
      observer.disconnect();
      if (previous) root.style.setProperty(property, previous);
      else root.style.removeProperty(property);
    };
  }, []);

  const setSheetOpen = (next: boolean) => {
    if (!next) onResetQuantityEditing?.();
    setOpen(next);
  };
  const chooseMethod = (method: AddToCartShippingMethod) => {
    onResetQuantityEditing?.();
    onShippingMethodChange?.(method);
  };
  const cost = shippingMethod === "sea" ? shipping?.sea : shipping?.land;
  const isAir =
    shippingMethod === "commercial_air" || shippingMethod === "air_express";
  const isExpress = shippingMethod === "air_express";
  const chinaToman =
    cost?.china_total_toman ??
    shipping?.land?.china_total_toman ??
    shipping?.sea?.china_total_toman;
  const chinaYuan =
    cost?.china_total_yuan ??
    shipping?.land?.china_total_yuan ??
    shipping?.sea?.china_total_yuan;
  const total =
    shippingMethod === "commercial_air"
      ? shipping?.air?.commercial?.total_toman
      : cost?.total_toman;
  const expert =
    shipping?.air?.express?.assigned_sales_expert ??
    shipping?.air?.assigned_sales_expert;
  const phone = expert?.mobile?.replace(/[\s()-]/g, "");
  const message = buildProductInquiryMessage(inquiry);
  const contacts = [
    {
      title: "تماس تلفنی",
      href: phone && /^\+?\d{7,15}$/.test(phone) ? "tel:" + phone : null,
      Icon: RiPhoneFill,
    },
    {
      title: "واتساپ",
      href: buildExpertChatLink("whatsapp", expert?.whatsapp_url, message),
      Icon: RiWhatsappFill,
    },
    {
      title: "تلگرام",
      href: buildExpertChatLink("telegram", expert?.telegram_url, message),
      Icon: RiTelegramFill,
    },
  ];
  const Placeholder = isRecalculatingQuantity ? PriceSpinner : PriceSkeleton;
  const placeholder = isLoading ? <Placeholder /> : null;
  const deliveryPrice = isExpress ? (
    <span>نیاز به استعلام</span>
  ) : (
    <ShippingAmount amount={total} placeholder={placeholder} />
  );

  return (
    <Dialog.Root open={open} onOpenChange={setSheetOpen}>
      <div
        ref={barRef}
        className={`${styles.bar} fixed inset-x-0 bottom-0 z-[60] bg-white px-4 pt-2 pb-[calc(8px+env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(0,0,0,0.06)] inset-shadow-[0_1px_0] inset-shadow-neutral-200 lg:hidden`}
        dir="rtl"
      >
        <div className="mx-auto flex max-w-xl flex-col gap-4">
          <dl
            aria-busy={isLoading}
            className="text-mobile-caption space-y-4 leading-5 text-neutral-800"
          >
            <div className="flex min-h-5 flex-wrap items-baseline gap-1">
              <dt className="text-mobile-body-s text-neutral-800">
                قیمت در چین:
              </dt>
              <dd className="text-mobile-label-m text-neutral-800">
                <ShippingAmount
                  amount={chinaToman}
                  yuan={chinaYuan ?? null}
                  placeholder={placeholder}
                />
              </dd>
            </div>
            <div className="flex min-h-5 flex-wrap items-baseline gap-1">
              <dt className="text-mobile-body-m text-neutral-900">
                قیمت تحویل در ایران:
              </dt>
              <dd className="text-mobile-label-l text-neutral-900">
                {deliveryPrice}
              </dd>
            </div>
          </dl>
          <Dialog.Trigger asChild>
            <Button
              disabled={!canOpen}
              className="text-mobile-label-l h-12 w-full rounded-md text-white before:absolute before:inset-0 before:z-10"
            >
              افزودن به سبد خرید
            </Button>
          </Dialog.Trigger>
        </div>
      </div>
      <Dialog.Portal>
        <Dialog.Overlay
          className={`${styles.overlay} fixed inset-0 z-[80] modal-backdrop lg:hidden`}
        />
        <Dialog.Content
          dir="rtl"
          className={`${styles.sheet} fixed inset-x-0 bottom-0 z-[81] mx-auto flex max-h-[calc(100dvh-12px)] w-full max-w-xl flex-col rounded-t-2xl bg-white px-3 pt-2 pb-[calc(12px+env(safe-area-inset-bottom))] shadow-xl outline-none lg:hidden`}
        >
          <div
            aria-hidden="true"
            className="mx-auto mb-3 h-1 w-9 shrink-0 rounded-full bg-neutral-400"
          />
          <div className="mb-3 flex shrink-0 items-center gap-2">
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="بستن روش ارسال"
                className="text-primary-600 focus-visible:ring-primary-300 flex size-6 items-center justify-center rounded focus-visible:ring-2 focus-visible:outline-none"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </Dialog.Close>
            <Dialog.Title className="text-mobile-h6 text-neutral-1000">
              روش ارسال
            </Dialog.Title>
          </div>
          <Dialog.Description className="sr-only">
            روش ارسال و تعداد کالا را انتخاب کنید و سپس افزودن به سبد خرید را
            بزنید.
          </Dialog.Description>
          <div
            className="min-h-0 overflow-y-auto overscroll-y-contain"
            role="radiogroup"
            aria-label="روش ارسال"
          >
            <div className="space-y-2">
              {methods.map((method) => {
                const selected = shippingMethod === method.id;
                return (
                  <section
                    key={method.id}
                    className={`rounded-md border ${selected ? "border-primary-500" : "border-primary-50"}`}
                  >
                    <label className="text-desktop-label-m flex cursor-pointer items-center gap-1 px-2 py-2.5 text-neutral-900">
                      <input
                        type="radio"
                        name={groupId}
                        value={method.id}
                        checked={selected}
                        onChange={() => chooseMethod(method.id)}
                        aria-controls={`${groupId}-${method.id}`}
                        className="accent-primary-500 size-3 shrink-0"
                      />
                      {method.title}
                    </label>
                    {selected && (
                      <div
                        id={`${groupId}-${method.id}`}
                        className="px-2 pb-2.5"
                      >
                        {isExpress ? (
                          <div className="pt-2 pb-0.5 text-right">
                            <p className="text-mobile-body-s leading-6 text-neutral-800">
                              جهت استعلام هزینه‌های ارسال و خدمات با کارشناسان
                              ما تماس بگیرید.
                            </p>
                            <div className="mt-5 flex flex-row-reverse justify-end gap-5">
                              {contacts.map(({ title, href, Icon }) =>
                                href ? (
                                  <a
                                    key={title}
                                    href={href}
                                    aria-label={title}
                                    target={
                                      href.startsWith("tel:")
                                        ? undefined
                                        : "_blank"
                                    }
                                    rel={
                                      href.startsWith("tel:")
                                        ? undefined
                                        : "noopener noreferrer"
                                    }
                                    className="text-primary-800 border-primary-600 flex size-11 items-center justify-center rounded-full border"
                                  >
                                    <Icon size={22} aria-hidden="true" />
                                  </a>
                                ) : null,
                              )}
                            </div>
                            {!isLoading &&
                              !contacts.some(({ href }) => href) && (
                                <p className="text-mobile-caption mt-2 text-neutral-800">
                                  راه‌های ارتباط با کارشناس فعلاً در دسترس نیست.
                                </p>
                              )}
                          </div>
                        ) : (
                          <dl
                            aria-busy={isLoading}
                            className="space-y-3 text-neutral-800"
                          >
                            <div className="flex flex-wrap items-baseline gap-1">
                              <dt className="text-desktop-body-s">قیمت در چین:</dt>
                              <dd className="text-desktop-label-m">
                                <ShippingAmount
                                  amount={chinaToman}
                                  yuan={chinaYuan ?? null}
                                  placeholder={placeholder}
                                />
                              </dd>
                            </div>
                            {!isAir &&
                              [
                                [
                                  "حمل و نقل بین‌الملل",
                                  cost?.international_shipping_toman,
                                ],
                                ["بیمه", cost?.insurance_toman],
                                ["ترخیص", cost?.clearance_toman],
                                [
                                  "خدمات ایران‌موبیکس",
                                  cost?.iranmobix_services_toman,
                                ],
                              ].map(([label, value]) => (
                                <div
                                  key={String(label)}
                                  className="flex flex-wrap items-baseline gap-1"
                                >
                                  <dt className="text-desktop-body-s">{label}:</dt>
                                  <dd className="text-desktop-label-m">
                                    <ShippingAmount
                                      amount={
                                        typeof value === "number" ? value : null
                                      }
                                      placeholder={placeholder}
                                    />
                                  </dd>
                                </div>
                              ))}
                            <div className="flex flex-wrap items-baseline gap-1 pt-2 text-neutral-900">
                              <dt className="text-desktop-body-m">قیمت تحویل در ایران:</dt>
                              <dd className="text-desktop-label-l">{deliveryPrice}</dd>
                            </div>
                          </dl>
                        )}
                        {!isExpress && (<div className="mt-3 [&_label]:sr-only [&_input]:text-desktop-label-m [&_input]:text-neutral-800 [&_input::placeholder]:text-desktop-label-m [&_input::placeholder]:text-neutral-600">{quantity}</div>)}
                        {notice}
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
            {error && !isLoading && (
              <p
                role="alert"
                className="text-mobile-caption mt-3 leading-6 text-neutral-800"
              >
                {error}{" "}
                {onRetry && (
                  <button
                    type="button"
                    onClick={onRetry}
                    className="text-primary-600 underline"
                  >
                    تلاش دوباره
                  </button>
                )}
              </p>
            )}
          </div>
          <div className="mt-3 shrink-0 [&_button]:w-full [&_button]:text-white [&>div]:h-auto">
            {submit}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
