import ImportHeaderInput from "@/features/importer/components/import-header-input";
import { HeaderLogo } from "./header-logo";
import { HeaderTopActions } from "./header-top-actions";

export function HeaderTop() {
  return (
    <div className="flex min-w-0 items-center justify-between gap-4 xl:gap-0">
      <div className="flex shrink-0 items-center gap-3 whitespace-nowrap xl:gap-5">
        <HeaderLogo />
        <p className="xl:text-label-lg text-xs text-neutral-900">
          ثبت حواله ارزی
        </p>
        <p className="xl:text-label-lg text-xs text-neutral-900">
          نمونه واردات
        </p>
      </div>
      <ImportHeaderInput />
      <HeaderTopActions />
    </div>
  );
}
