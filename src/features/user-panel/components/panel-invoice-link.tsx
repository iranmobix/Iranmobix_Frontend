const MISSING_VALUE = "بدون مقدار از سمت بک‌اند";

export default function PanelInvoiceLink({
  invoice,
}: {
  invoice: string | null;
}) {
  if (!invoice) return <span>{MISSING_VALUE}</span>;

  let href: string | null = null;
  try {
    href = new URL(
      invoice,
      process.env.NEXT_PUBLIC_API_URL || "http://localhost",
    ).toString();
  } catch {
    // Keep a non-URL invoice value visible instead of creating a broken link.
  }

  return href ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary-500 underline underline-offset-2"
    >
      مشاهده فاکتور PDF
    </a>
  ) : (
    <span>{invoice}</span>
  );
}
