"use client";
import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { ProductDetail } from "../../types/domain/product-detail.types";

type ProductSpecificationsProps = {
  product: Pick<ProductDetail, "translatedSpecifications">;
};

const ProductSpecifications = ({ product }: ProductSpecificationsProps) => {
  const [expanded, setExpanded] = useState(false);
  const id = useId();
  const specifications = Object.entries(product.translatedSpecifications);
  const visibleSpecifications = expanded
    ? specifications
    : specifications.slice(0, 4);
  const columnLength = Math.ceil(specifications.length / 2);
  const rows = specifications
    .slice(0, columnLength)
    .map((entry, index) => [entry, specifications[index + columnLength]]);

  return (
    <section className="flex h-auto flex-col gap-4 rounded-md bg-white px-2 py-4 lg:gap-6 lg:px-4 lg:py-6">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-mobile-h6 text-neutral-1000 lg:text-desktop-label-l lg:text-neutral-900">
          <span className="lg:hidden">مشخصات محصول</span>
          <span className="hidden lg:inline">جدول مشخصات</span>
        </h2>
      </div>

      <div className="hidden overflow-hidden rounded-md lg:block" dir="rtl">
        <table className="w-full table-fixed border-collapse text-xs leading-6">
          <caption className="sr-only">جدول مشخصات محصول</caption>
          <colgroup>
            <col className="w-[14%]" />
            <col className="w-[36%]" />
            <col className="w-[14%]" />
            <col className="w-[36%]" />
          </colgroup>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="border border-neutral-200 p-3 text-neutral-500"
                >
                  —
                </td>
              </tr>
            )}
            {rows.map((row, index) => (
              <tr key={row[0]?.[0] ?? index}>
                <SpecificationCells entry={row[0]} valueSpan={row[1] ? 1 : 3} />
                {row[1] && <SpecificationCells entry={row[1]} />}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="lg:hidden">
        <div
          id={id}
          className="overflow-hidden rounded-md border border-neutral-200"
          dir="rtl"
        >
          <table className="w-full table-fixed border-collapse">
            <caption className="sr-only">مشخصات محصول</caption>
            <colgroup>
              <col className="w-[36%]" />
              <col className="w-[64%]" />
            </colgroup>
            <tbody>
              {visibleSpecifications.length === 0 && (
                <tr>
                  <td
                    colSpan={2}
                    className="text-mobile-body-s px-2 py-4 text-neutral-800"
                  >
                    مشخصاتی برای نمایش ثبت نشده است.
                  </td>
                </tr>
              )}
              {visibleSpecifications.map(([key, value]) => (
                <tr
                  key={key}
                  className="border-b border-neutral-200 last:border-b-0"
                >
                  <th
                    scope="row"
                    className="text-mobile-body-s border-l border-neutral-200 px-2 py-4 text-right align-middle leading-5 font-normal break-words text-neutral-800"
                  >
                    {key}
                  </th>
                  <td className="text-mobile-body-s px-2 py-4 text-right align-middle leading-5 break-words text-neutral-900">
                    {value?.trim() || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {specifications.length > 4 && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
            aria-controls={id}
            className="text-mobile-label-m text-primary-600 focus-visible:ring-primary-300 mx-auto mt-4 flex items-center gap-1 rounded focus-visible:ring-2 focus-visible:outline-none"
          >
            {expanded ? "مشاهده کمتر" : "مشاهده بیشتر"}
            <ChevronDown
              size={16}
              aria-hidden="true"
              className={expanded ? "rotate-180" : undefined}
            />
          </button>
        )}
      </div>
    </section>
  );
};

function SpecificationCells({
  entry,
  valueSpan = 1,
}: {
  entry?: [string, string];
  valueSpan?: number;
}) {
  if (!entry) return null;
  return (
    <>
      <th
        scope="row"
        className="text-desktop-body-s h-10 border border-neutral-200 px-2 py-2 text-right align-top break-words text-neutral-800"
      >
        {entry?.[0]}
      </th>
      <td
        colSpan={valueSpan}
        className="text-desktop-label-m h-10 border border-neutral-200 px-2 py-2 text-right align-top break-words text-neutral-900"
      >
        {entry ? entry[1]?.trim() || "—" : null}
      </td>
    </>
  );
}

export default ProductSpecifications;
