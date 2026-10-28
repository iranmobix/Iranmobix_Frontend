import Image from "next/image";
import link from "../../assets/link.svg";
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
  if (compact)
    return url ? (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={source || "سایت مرجع"}
        className="inline-flex items-center gap-2 rounded-md border border-primary-500 px-3 py-1 text-xs text-primary-700"
      >
        سایت مرجع <Image src={link} alt="" width={16} height={16} />
      </a>
    ) : (
      <span className="text-xs text-neutral-500">سایت مرجع: —</span>
    );
  return <ProductSource source={{ name: source, label: source, url }} />;
};
export default ProductDetailSource;
