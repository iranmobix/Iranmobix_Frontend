import Image from "next/image";
import spinner from "../../assets/Spinner.svg";

export default function PriceSpinner() {
  return (
    <span className="inline-flex min-w-16 items-center align-middle">
      <span className="sr-only">در حال محاسبهٔ قیمت</span>
      <Image
        src={spinner}
        alt=""
        width={16}
        height={16}
        unoptimized
        className="size-4 motion-reduce:hidden"
      />
      <span
        aria-hidden="true"
        className="border-primary-500 hidden size-3 rounded-full border-2 motion-reduce:inline-block"
      />
    </span>
  );
}
