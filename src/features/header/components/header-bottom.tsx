"use client";

import Link from "next/link";
import { HeaderProductsMenu } from "./header-products-menu";
import { HeaderSupportButton } from "./header-support-button";
import { HeaderSupplierButton } from "./header-supplier-button";

export function HeaderBottom() {
  return (
    <div className="grid min-w-0 grid-cols-[minmax(0,30fr)_minmax(0,36fr)_minmax(0,34fr)] items-center gap-3 xl:grid-cols-[336px_minmax(0,1fr)_336px] xl:gap-4">
      <div className="flex min-w-0 items-center justify-between gap-2 whitespace-nowrap xl:gap-3">
        <HeaderProductsMenu />
        <Link
          data-header-label
          href="/#services"
          className="text-desktop-body-m text-neutral-900 focus-visible:ring-primary-300 rounded focus-visible:ring-2 focus-visible:outline-none"
        >
          خدمات ما
        </Link>
        <p data-header-label className="text-desktop-body-m text-neutral-900">
          درباره ما
        </p>
      </div>
      <div className="col-start-3 flex w-full max-w-[clamp(296px,calc(10vw_+_194px),336px)] min-w-0 items-center justify-between gap-2 whitespace-nowrap xl:gap-3">
        <HeaderSupplierButton />
        <HeaderSupportButton />
      </div>
    </div>
  );
}
