export function formatNumber(value: number) {
  return new Intl.NumberFormat("fa-IR").format(value);
}

export function formatResultValue(value: number | null | undefined, unit = "") {
  if (value === null || value === undefined) return "—";
  return `${formatNumber(value)}${unit ? ` ${unit}` : ""}`;
}
