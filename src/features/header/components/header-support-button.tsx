import support from "../assets/support.svg";
import supportWhite from "../assets/sapport.svg";
import HeaderThemeIcon from "./header-theme-icon";
export function HeaderSupportButton() {
  return (
    <button
      type="button"
      className="flex items-center justify-center gap-2 rounded-md py-2.5"
    >
      <HeaderThemeIcon dark={support} light={supportWhite} width={20} />
      <span
        data-header-label
        className="text-desktop-body-m text-neutral-900 whitespace-nowrap"
      >
        پشتیبانی
      </span>
    </button>
  );
}
