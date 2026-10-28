import type { ProductDetail } from "../../types/domain/product-detail.types";

import ProductDetailSource from "./product-detail-source";

type ProductSummaryProps = {
  product: ProductDetail;
  mobileLayout?: boolean;
};

const ProductSummary = ({
  product,
  mobileLayout = false,
}: ProductSummaryProps) => {
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <h1
        dir="auto"
        className="text-start text-sm font-medium leading-6 sm:text-base sm:leading-7 text-neutral-900"
      >
        {product.title || "—"}
      </h1>

      <div
        dir="ltr"
        className={
          mobileLayout
            ? "flex flex-col items-start justify-between gap-3 lg:flex-row lg:flex-wrap lg:items-center"
            : "flex flex-wrap items-center justify-between gap-3"
        }
      >
        <div className="flex min-w-0 flex-1 items-center gap-1.5 text-neutral-600">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            className="shrink-0"
            aria-hidden="true"
          >
            <path
              d="M4 10v11h16V10M3 6l2-3h14l2 3v4a3 3 0 0 1-4 0 3 3 0 0 1-5 0 3 3 0 0 1-5 0 3 3 0 0 1-4 0V6Zm0 0h18M9 21v-7h6v7"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <span
            dir="auto"
            className="min-w-0 break-words text-xs leading-5 sm:text-sm"
          >
            {product.seller?.name || "—"}
          </span>

          {product.seller?.trust.verified && (
            <span
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#009681] text-white"
              aria-label="فروشنده تأییدشده"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="m6 12 4 4 8-9"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          )}
        </div>

        <div dir="rtl" className="shrink-0">
          <ProductDetailSource
            source={product.source}
            url={product.officialUrl}
            compact
          />
        </div>
      </div>
    </div>
  );
};

export default ProductSummary;
