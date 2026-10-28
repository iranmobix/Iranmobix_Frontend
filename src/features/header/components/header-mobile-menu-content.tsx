"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Dialog } from "radix-ui";
import { ChevronDown, Headphones, Languages, X } from "lucide-react";
import logo from "../assets/logo.svg";

const navigationGroups = [
  [
    { href: "/products", label: "محصولات" },
    { href: "/#sales-experts", label: "تأمین‌کننده‌های چین و امارات" },
    { href: "/#services", label: "خدمات ما" },
    { href: "/contact-us", label: "ثبت حواله ارزی" },
    { href: "/products?source=iranmobix", label: "نمونه واردات" },
  ],
  [
    { href: "/#about-us", label: "درباره ما" },
    { href: "/contact-us", label: "تماس با ما" },
  ],
];
const menuLinkClass = "flex min-h-10 items-center rounded px-0 text-sm text-neutral-800 transition-colors hover:text-primary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300";

export function HeaderMobileMenuContent({ onNavigate, accountMenu }: { onNavigate: () => void; accountMenu?: ReactNode }) {
  return (
    <>
      <div className="flex h-8 items-center justify-between">
        <Link href="/" onClick={onNavigate} aria-label="صفحه اصلی ایران موبیکس">
          <Image src={logo} alt="" width={48} height={28} className="h-7 w-12 object-contain" />
        </Link>
        <Dialog.Title className="sr-only">منوی سایت</Dialog.Title>
        <Dialog.Close aria-label="بستن منو" className="flex size-8 items-center justify-center rounded text-primary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300">
          <X size={18} strokeWidth={1.5} aria-hidden="true" />
        </Dialog.Close>
      </div>
      <Dialog.Description className="sr-only">ورود و دسترسی به بخش‌های سایت ایران موبیکس</Dialog.Description>
      <nav aria-label="منوی موبایل" className="divide-y divide-neutral-200">
        <div className="pb-4 pt-3">
          {accountMenu ?? <Link href="/login" onClick={onNavigate} className={menuLinkClass}>ورود/ثبت نام</Link>}
        </div>
        <div className="py-4">
          <Link href="/contact-us" onClick={onNavigate} className={`${menuLinkClass} gap-2`}>
            <Headphones size={17} strokeWidth={1.5} aria-hidden="true" />
            پشتیبانی
          </Link>
          <details className="group text-sm text-neutral-800">
            <summary className="flex min-h-10 cursor-pointer list-none items-center gap-2 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 [&::-webkit-details-marker]:hidden">
              <Languages size={17} strokeWidth={1.5} aria-hidden="true" />
              زبان
              <ChevronDown size={14} strokeWidth={1.5} aria-hidden="true" className="transition-transform group-open:rotate-180" />
            </summary>
            <p className="py-2 pr-6 text-xs text-neutral-600" aria-current="true">فارسی</p>
          </details>
        </div>
        {navigationGroups.map((group, index) => (
          <div key={index} className="py-4">
            {group.map((item) => (
              <Link key={item.label} href={item.href} onClick={onNavigate} className={menuLinkClass}>
                {item.label}
              </Link>
            ))}
          </div>
        ))}
      </nav>
    </>
  );
}
