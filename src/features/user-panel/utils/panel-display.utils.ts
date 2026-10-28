export function formatPanelMoney(value: string, currency: string): string {
  if (!/^\d+(\.\d+)?$/.test(value)) return "—";
  const [integer, fraction] = value.split(".");
  const amount =
    BigInt(integer).toLocaleString("fa-IR") +
    (fraction
      ? "٫" + fraction.replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)])
      : "");
  const unit =
    currency === "IRT" ? "تومان" : currency === "IRR" ? "ریال" : currency;
  return amount + (unit ? " " + unit : "");
}
export function formatPanelDate(value: string, long = false): string {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "—";
  return date.toLocaleDateString("fa-IR", {
    day: "numeric",
    month: long ? "long" : "numeric",
    year: "numeric",
    timeZone: "Asia/Tehran",
  });
}
