"use client";

import Link from "next/link";
import { HeaderProductsMenu } from "./header-products-menu";
import { HeaderSupportButton } from "./header-support-button";
import { HeaderSupplierButton } from "./header-supplier-button";

export function HeaderBottom() {
  return (
    <div className="flex items-center justify-between">
      <div className="flex shrink-0 gap-6 whitespace-nowrap xl:gap-14">
        <HeaderProductsMenu />
        <Link
          href="/#services"
          className="text-primary-900 xl:text-label-lg focus-visible:ring-primary-300 rounded text-xs focus-visible:ring-2 focus-visible:outline-none"
        >
          خدمات ما
        </Link>
        <p className="text-xs xl:text-base">درباره ما</p>
      </div>
      <div className="flex w-[248px] shrink-0 items-center justify-between gap-3 pl-[3px] whitespace-nowrap xl:w-[336px]">
        <HeaderSupplierButton />
        <HeaderSupportButton />
      </div>
    </div>
  );
}
