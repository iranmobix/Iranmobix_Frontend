"use client";

import { HeaderProductsMenu } from "./header-products-menu";
import { HeaderSupportButton } from "./header-support-button";
import { HeaderSupplierButton } from "./header-supplier-button";

export function HeaderBottom() {
  return (
    <div className="flex items-center justify-between">
      <div className="flex gap-14">
        <HeaderProductsMenu />
        <p className="text-label-lg text-primary-900">خدمات ما</p>
        <p>درباره ما</p>
      </div>
      <div className="flex w-[336px] shrink-0 items-center justify-between gap-3 pl-[3px] whitespace-nowrap">
        <HeaderSupplierButton />
        <HeaderSupportButton />
      </div>
    </div>
  );
}
