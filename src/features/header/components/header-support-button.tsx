import support from "../assets/support.svg";
import Image from "next/image";
export function HeaderSupportButton() {
  return (
    <button
      type="button"
      className="flex items-center justify-center gap-2 rounded-md py-2.5"
    >
      <Image src={support} alt="IranMobix" priority />
      <span className="text-primary-900 xl:text-label-lg text-xs whitespace-nowrap">
        پشتیبانی
      </span>
    </button>
  );
}
