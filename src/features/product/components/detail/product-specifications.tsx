"use client";
import { useId, useState } from "react";
import { ChevronLeft } from "lucide-react";
import type { ProductDetail } from "../../types/domain/product-detail.types";

type ProductSpecificationsProps = {
  product: Pick<ProductDetail, "translatedSpecifications">;
};

const ProductSpecifications = ({ product }: ProductSpecificationsProps) => {
  const [expanded, setExpanded] = useState(false);
  const id = useId();
  const specifications = Object.entries(product.translatedSpecifications);
  const columnLength = Math.ceil(specifications.length / 2);
  const rows = specifications
    .slice(0, columnLength)
    .map((entry, index) => [entry, specifications[index + columnLength]]);

  return (
    <section className="flex h-auto flex-col gap-3 rounded-md bg-white px-3 py-4 lg:gap-4 lg:px-4 lg:py-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-neutral-1000 lg:text-desktop-label-l text-xs font-medium lg:text-neutral-900">
          جدول مشخصات
        </h2>
        {specifications.length > 4 && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
            aria-controls={id}
            className="text-primary-500 focus-visible:ring-primary-300 flex items-center gap-0.5 rounded text-[10px] focus-visible:ring-2 lg:hidden"
          >
            {expanded ? "مشاهده کمتر" : "مشاهده بیشتر"}
            <ChevronLeft size={12} />
          </button>
        )}
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
      <div id={id} className="flex flex-1 flex-col gap-0 lg:hidden">
        {specifications.length === 0 && (
          <p className="text-sm text-neutral-500">—</p>
        )}
        {specifications.map(([key, value], index) => (
          <div
            key={key}
            className={`${!expanded && index >= 4 ? "hidden lg:grid" : "grid"} grid-cols-[30%_10%_60%] items-start border-b border-neutral-200 last:border-b-0 lg:border-b-0`}
          >
            {/* Key */}
            <span className="lg:text-body-md py-3 text-right text-[11px] text-neutral-600 lg:py-4">
              {key}
            </span>

            {/* Gap */}
            <div />

            {/* Value */}
            <span className="lg:text-body-md min-w-0 py-3 text-center text-[11px] break-words text-neutral-900 lg:border-b lg:border-neutral-200 lg:py-4 lg:text-right">
              {value?.trim() || "—"}
            </span>
          </div>
        ))}
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
