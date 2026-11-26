import Image from "next/image";
import { isAlibabaSource } from "../../utils/is-alibaba-source";
import link from "../../assets/link.svg";
import alibaba from "../../assets/alibaba.svg";
import ProductSource from "../product-card/product-source";

type ProductDetailSourceProps = {
  source: string;
  url: string;
  compact?: boolean;
  glass?: boolean;
};
const ProductDetailSource = ({
  source,
  url,
  compact = false,
  glass = false,
}: ProductDetailSourceProps) => {
  const isAlibaba = isAlibabaSource(source, url);
  if (glass) return url ? (
    <a href={url} target="_blank" rel="noopener noreferrer"
      aria-label={isAlibaba ? "سایت مرجع علی‌بابا" : "سایت مرجع"}
      className="text-mobile-label-l text-neutral-1000 inline-flex h-8 items-center justify-center gap-1.5 rounded-xl border border-white/80 bg-white/40 px-2 shadow-sm backdrop-blur-[20px] transition-colors hover:bg-white/60 focus-visible:ring-2 focus-visible:ring-primary-300">
      <span>سایت مرجع</span>
      <Image src={isAlibaba ? alibaba : link} alt="" width={24} height={24} className="size-6 object-contain" />
    </a>
  ) : null;
  if (compact || isAlibaba)
    return url ? (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={isAlibaba ? "سایت مرجع علی‌بابا" : source || "سایت مرجع"}
        className="text-mobile-caption lg:text-desktop-caption text-primary-700 hover:text-primary-500 inline-flex shrink-0 items-center gap-1.5"
      >
        سایت مرجع{" "}
        <Image
          src={isAlibaba ? alibaba : link}
          alt=""
          width={20}
          height={20}
          className="size-5 object-contain"
        />
      </a>
    ) : (
      <span className="text-mobile-caption lg:text-desktop-caption text-neutral-700">
        سایت مرجع: —
      </span>
    );
  return <ProductSource source={{ name: source, label: source, url }} />;
};
export default ProductDetailSource;
