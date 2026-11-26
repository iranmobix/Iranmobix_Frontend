import ImportHeaderInput from "@/features/importer/components/import-header-input";
import { HeaderLogo } from "./header-logo";
import { HeaderTopActions } from "./header-top-actions";

export function HeaderTop() {
  return (
    <div className="grid min-w-0 grid-cols-[minmax(0,30fr)_minmax(0,36fr)_minmax(0,34fr)] items-center gap-3 xl:grid-cols-[336px_minmax(0,1fr)_336px] xl:gap-4">
      <div className="flex min-w-0 items-center justify-between gap-2 whitespace-nowrap xl:gap-3">
        <HeaderLogo />
        <p
          data-header-label
          className="text-desktop-body-m text-neutral-900"
        >
          ثبت حواله ارزی
        </p>
        <p
          data-header-label
          className="text-desktop-body-m text-neutral-900"
        >
          نمونه واردات
        </p>
      </div>
      <div className="flex min-w-0 -translate-x-[clamp(0px,calc((100vw_-_1280px)_/_4),30px)] justify-center">
        <ImportHeaderInput />
      </div>
      <HeaderTopActions />
    </div>
  );
}
