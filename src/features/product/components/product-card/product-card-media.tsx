import Image from "next/image";
import type { Product } from "../../types/domain";
import plus from "../../assets/plus.svg";
import ProductSource from "./product-source";

type ProductCardMediaProps = {
  product: Pick<Product, "image" | "title" | "source"> & {
    colors?: Product["colors"];
  };
  showColors?: boolean;
  sizes?: string;
  compactMobile?: boolean;
};

// استایل مشترک شیشه‌ای برای هر دو باکس (Source و Colors)
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

const ProductCardMedia = ({
  product,
  showColors = true,
  compactMobile = false,
  sizes = "(max-width: 640px) 80vw, 260px",
}: ProductCardMediaProps) => {
  const colors = "colors" in product ? product.colors : undefined;
  const hasMultipleColors =
    showColors && colors !== undefined && colors.length > 1;
  const extraColorsCount = (colors?.length ?? 0) - 3;

  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-md">
      {product.image && (
        <Image
          src={product.image}
          alt={product.title}
          sizes={sizes}
          fill
          className="object-cover"
        />
      )}

      {!product.image && (
        <p className="flex h-full items-center justify-center text-sm text-neutral-500">
          تصویر: —
        </p>
      )}
      {showColors && colors === undefined && (
        <span
          className={
            compactMobile
              ? "absolute right-2 bottom-2 hidden rounded bg-white/80 px-2 text-xs text-neutral-500 lg:inline"
              : "absolute right-2 bottom-2 rounded bg-white/80 px-2 text-xs text-neutral-500"
          }
        >
          رنگ: —
        </span>
      )}
      {/* Source */}
      <div
        className={
          compactMobile
            ? "absolute top-1 left-1 z-10 lg:top-3 lg:left-3"
            : "absolute top-3 left-3 z-10"
        }
      >
        <ProductSource source={product.source} compactMobile={compactMobile} />
      </div>

      {/* Colors */}
      {hasMultipleColors && (
        <div
          className={
            compactMobile
              ? "absolute top-1 right-1 z-10 lg:top-3 lg:right-3"
              : "absolute top-3 right-3 z-10"
          }
        >
          <div
            className={` ${glassBase} rounded-[14px] before:h-[90%] before:w-[80%] before:rounded-tl-[14px] after:h-[90%] after:w-[80%] after:rounded-br-[14px]`}
          >
            <div
              className={
                compactMobile
                  ? "flex flex-col items-center gap-1 p-1 lg:gap-2 lg:px-2 lg:py-2"
                  : "flex flex-col items-center gap-2 px-2 py-2"
              }
            >
              {colors?.slice(0, 3).map((color) => (
                <span
                  key={color.id}
                  title={color.name}
                  className={
                    compactMobile
                      ? "size-1.5 rounded-full lg:size-4"
                      : "h-4 w-4 rounded-full"
                  }
                  style={{ backgroundColor: color.value }}
                />
              ))}
              {extraColorsCount > 0 && (
                <Image
                  src={plus}
                  alt={`+${extraColorsCount} رنگ دیگر`}
                  width={15}
                  height={15}
                  className={
                    compactMobile
                      ? "size-2 shrink-0 lg:size-[15px]"
                      : "shrink-0"
                  }
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductCardMedia;
