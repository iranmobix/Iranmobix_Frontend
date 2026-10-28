import Image, { StaticImageData } from "next/image";
import Link from "next/link";
import arrowleft from "../../assets/arrow-left.svg";

type ProductSourceCardProps = {
  title: string;
  description: string[];
  image: StaticImageData;
  href: string;
  buttonText: string;
  featured?: boolean;
  comingSoon?: boolean;
  className?: string;
};

export function ProductSourceCard({
  title,
  description,
  image,
  href,
  buttonText,
  featured = false,
  comingSoon = false,
  className = "",
}: ProductSourceCardProps) {
  return (
    <article dir="rtl" className={`relative flex items-start justify-between gap-3 overflow-hidden bg-white lg:min-h-[380px] lg:flex-col lg:items-stretch lg:gap-6 lg:rounded-md lg:p-6 ${featured ? "min-h-[300px] flex-col rounded-xl p-5 shadow-[0_2px_12px_rgba(197,164,51,0.14)] ring-1 ring-[#eadba5]/40" : "min-h-[228px] flex-col rounded-lg p-3.5"} ${className}`}>
      {featured && (
        <div className="pointer-events-none absolute left-0 top-0 size-40 overflow-hidden lg:size-32">
          <span className="absolute -left-12 top-10 w-56 -rotate-45 bg-[#cfad36] py-1 text-center text-base text-white lg:-left-10 lg:top-7 lg:w-44 lg:text-xs">
            پیشنهاد ایران موبیکس
          </span>
        </div>
      )}
      <Image src={image} alt={title} width={80} height={60} className={`${featured ? "h-14 w-20" : "h-10 w-14"} shrink-0 object-contain lg:hidden`} />
      <div className="flex w-full min-w-0 flex-1 flex-col items-start gap-2 text-right lg:hidden">
        <h3 className={`${featured ? "text-lg leading-7" : "text-sm leading-6"} font-semibold`}>{title}</h3>
        <ul className={featured ? "w-full space-y-1 text-base leading-7 text-neutral-700" : "w-full space-y-1 text-xs leading-6 text-neutral-700"}>
          {description.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span aria-hidden="true">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="hidden flex-col items-start gap-6 lg:flex">
        <Image src={image} alt={title} width={80} height={60} className="h-[60px] w-20 object-contain" />
        <h3 className="text-heading-2xs font-medium leading-8">{title}</h3>
        <ul className="w-full space-y-2 text-base leading-7 text-neutral-700">
          {description.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span aria-hidden="true" className="shrink-0">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-auto hidden lg:block">
        {comingSoon ? (
          <button type="button" disabled className="flex h-11 min-w-[130px] items-center justify-center rounded-md bg-[#d4d0c6] px-5 text-sm text-white disabled:cursor-not-allowed">
            به‌زودی!
          </button>
        ) : (
          <Link href={href} className="flex h-11 w-fit min-w-[130px] items-center justify-center gap-1 rounded-md bg-primary-700 px-5 text-sm text-neutral-50">
            {buttonText}
            <Image src={arrowleft} alt="" width={24} height={24} />
          </Link>
        )}
      </div>
      <div className="mt-auto lg:hidden">
        {comingSoon ? (
          <button type="button" disabled className="flex h-10 min-w-[92px] items-center justify-center rounded-lg bg-[#d4d0c6] px-3 text-sm text-white disabled:cursor-not-allowed">
            به‌زودی!
          </button>
        ) : (
          <Link href={href} className={`flex items-center justify-center gap-1 rounded-md bg-primary-700 text-neutral-50 ${featured ? "h-12 rounded-lg px-4 text-base" : "h-10 rounded-lg px-3 text-sm"}`}>
            {buttonText}
            <Image src={arrowleft} alt="" width={20} height={20} />
          </Link>
        )}
      </div>
    </article>
  );
}
