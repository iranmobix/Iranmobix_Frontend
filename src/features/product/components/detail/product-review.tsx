"use client";

import Image from "next/image";
import { useState } from "react";
import type { ProductDetail } from "../../types/domain/product-detail.types";
import down from "../../assets/down.svg";

type ProductReviewProps = {
  product: ProductDetail;
};

const ProductReview = ({ product }: ProductReviewProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const review = product.description.review;

  return (
    <section className="flex w-full flex-col gap-6 rounded-md bg-white px-6 py-8">
      <h2 className="text-body-lg-medium text-neutral-1000">
        نقد و بررسی محصول
      </h2>

      <div>
        <h3 className="text-sm text-neutral-600">خلاصهٔ محصول</h3>
        <p className="mt-2 whitespace-pre-line text-body-md">
          {product.description.summary?.trim() || "—"}
        </p>
      </div>
      <div className="relative">
        <div
          className={`overflow-hidden transition-[max-height] duration-300 ${
            isExpanded ? "max-h-none" : "max-h-[220px]"
          }`}
        >
          <p className="text-body-md text-neutral-900">
            {review?.trim() || "—"}
          </p>
        </div>

        {!isExpanded && review && (
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
        )}

        {review && (
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="relative z-10 mx-auto mt-2 flex items-center gap-1 text-sm font-medium text-primary-500"
          >
            <span>{isExpanded ? "نمایش کمتر" : "نمایش بیشتر"}</span>

            <Image
              src={down}
              alt="dropdown"
              width={20}
              height={20}
              className={`transition-transform duration-300 ${
                isExpanded ? "rotate-180" : ""
              }`}
            />
          </button>
        )}
      </div>
    </section>
  );
};

export default ProductReview;
