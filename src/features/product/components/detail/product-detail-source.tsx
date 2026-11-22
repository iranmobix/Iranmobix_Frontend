import Image from "next/image";
import link from "../../assets/link.svg";
import alibaba from "../../assets/alibaba.svg";
import ProductSource from "../product-card/product-source";

type ProductDetailSourceProps = {
  source: string;
  url: string;
  compact?: boolean;
};
const ProductDetailSource = ({
  source,
  url,
  compact = false,
}: ProductDetailSourceProps) => {
  let isAlibaba = /^(alibaba(?:\.com)?|علی\s?بابا)$/i.test(source.trim());
  try {
    const host = new URL(url).hostname;
    isAlibaba ||= host === "alibaba.com" || host.endsWith(".alibaba.com");
  } catch {
    /* Source name still identifies the marketplace. */
  }
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
