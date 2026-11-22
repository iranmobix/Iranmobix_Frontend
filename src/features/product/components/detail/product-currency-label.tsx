export default function ProductCurrencyLabel({
  currency = "CNY",
}: {
  currency?: string;
}) {
  return (
    <label className="flex shrink-0 items-center gap-2 text-xs text-neutral-700">
      واحد پول:
      <select
        key={currency}
        aria-label="واحد پول قیمت محصول"
        defaultValue={currency}
        className="border-primary-200 text-primary-600 focus-visible:ring-primary-200 h-9 rounded-md border bg-white px-2 text-xs outline-none focus-visible:ring-2"
      >
        <option value={currency}>
          {currency === "CNY" ? "یوان CNY" : currency}
        </option>
      </select>
    </label>
  );
}
