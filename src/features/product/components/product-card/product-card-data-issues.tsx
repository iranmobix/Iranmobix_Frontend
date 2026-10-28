import type { ProductDataIssue } from "../../types/domain/product.types";

const statusLabels = {
  missing: "کلید ارسال نشده",
  empty: "مقدار ندارد",
  invalid: "مقدار نامعتبر است",
};

export default function ProductCardDataIssues({ issues }: { issues?: ProductDataIssue[] }) {
  if (!issues?.length) return null;
  const missing = issues.filter((issue) => issue.status === "missing").length;
  const empty = issues.filter((issue) => issue.status === "empty").length;
  const invalid = issues.length - missing - empty;
  const summary = [
    missing ? `${missing.toLocaleString("fa-IR")} کلید ارسال نشده` : "",
    empty ? `${empty.toLocaleString("fa-IR")} مقدار خالی` : "",
    invalid ? `${invalid.toLocaleString("fa-IR")} مقدار نامعتبر` : "",
  ].filter(Boolean).join("، ");
  return (
    <details dir="rtl" className="mt-2 min-w-0 border-t border-neutral-200 pt-2 text-[10px] leading-5 text-neutral-700">
      <summary className="cursor-pointer text-primary-700">داده‌های بک: {summary}</summary>
      <ul className="mt-1 space-y-1">
        {issues.map((issue) => (
          <li key={issue.label} className="break-words">
            <span>{issue.label}: {statusLabels[issue.status]}</span>
            <code dir="ltr" className="block break-all text-left text-[9px] text-neutral-600">{issue.keys.join(" / ")}</code>
          </li>
        ))}
      </ul>
    </details>
  );
}
