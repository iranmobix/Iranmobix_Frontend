import ImportHeaderInput from "@/features/importer/components/import-header-input";
import { HeaderLogo } from "./header-logo";
import { HeaderTopActions } from "./header-top-actions";

export function HeaderTop() {
  return (
    <div className="flex items-center justify-between">
      <div className="flex gap-5">
        <HeaderLogo />
        <p className="text-label-lg text-neutral-900">ثبت حواله ارزی</p>
        <p className="text-label-lg text-neutral-900">نمونه واردات</p>
      </div>
      <ImportHeaderInput />
      <HeaderTopActions />
    </div>
  );
}
