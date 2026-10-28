import Image from "next/image";
import link from "../../assets/link.svg";
import { Product } from "../../types/domain";

type ProductSourceProps = {
  source: Product["source"];
  compactMobile?: boolean;
};

const glassBase = `
  relative grid place-items-center
  overflow-hidden
  bg-white/40
  backdrop-blur-[2px]
  backdrop-saturate-[180%]
  border border-white/25
  shadow-[0_4px_20px_rgba(0,0,0,0.08),inset_0_1px_1px_rgba(255,255,255,0.65)]
  before:content-['']
  before:absolute
  before:inset-0
  before:pointer-events-none
  before:bg-gradient-to-br
  before:from-white/20
  before:via-white/5
  before:to-transparent
  after:content-['']
  after:absolute
  after:inset-0
  after:pointer-events-none
  after:bg-gradient-to-br
  after:from-transparent
  after:via-transparent
  after:to-black/5
`;

const ProductSource = ({
  source,
  compactMobile = false,
}: ProductSourceProps) => {
  if (!source.url)
    return (
      <span
        className={
          compactMobile
            ? "text-[8px] text-neutral-500 lg:text-sm"
            : "text-sm text-neutral-500"
        }
      >
        سایت مرجع: {source.label || source.name || "—"}؛ لینک: —
      </span>
    );
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={source.label || source.name || "—"}
      className={` ${glassBase} group rounded-[12px] transition-colors duration-300 before:h-[80%] before:w-[90%] before:rounded-tl-[12px] after:h-[80%] after:w-[90%] after:rounded-br-[12px] hover:bg-[rgba(139,128,198,0.4)]`}
    >
      <div
        className={
          compactMobile
            ? "flex items-center gap-0.5 px-1 py-1 lg:px-2 lg:py-2"
            : "flex items-center gap-0.5 px-2 py-2"
        }
      >
        <span
          className={
            compactMobile
              ? "text-primary-1000 lg:text-label-md text-[8px] transition-colors duration-300 group-hover:text-white"
              : "text-label-md text-primary-1000 transition-colors duration-300 group-hover:text-white"
          }
        >
          {source.label || source.name || "—"}
        </span>

        <Image
          src={link}
          alt=""
          width={18}
          height={18}
          className={
            compactMobile
              ? "size-3 shrink-0 transition-all duration-300 group-hover:brightness-0 group-hover:invert lg:size-[18px]"
              : "shrink-0 transition-all duration-300 group-hover:brightness-0 group-hover:invert"
          }
        />
      </div>
    </a>
  );
};

export default ProductSource;
