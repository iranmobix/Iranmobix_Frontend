const MAX_SPECIFICATIONS = 6;
const aliases: Record<string, string> = {
  weight: "weight", weightkg: "weight", actualweightkg: "weight",
  وزن: "weight", وزنکیلوگرم: "weight",
  singlepackagesize: "package", packagesize: "package",
  ابعادبسته: "package", ابعادبستهبندی: "package",
  cbm: "cbm", حجمبسته: "cbm", حجمبستهcbm: "cbm",
};
const identity = (label: string) => {
  const normalized = label.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
  return aliases[normalized] ?? normalized;
};
const text = (value: unknown) =>
  typeof value === "string" ? value.trim()
    : typeof value === "number" && Number.isFinite(value) ? String(value) : "";
const nonnegative = (value: unknown) => {
  if (typeof value === "number") return Number.isFinite(value) && value >= 0 ? String(value) : "";
  const valueText = text(value);
  return /^\d+(?:\.\d+)?$/.test(valueText) && Number.isFinite(Number(valueText))
    ? String(Number(valueText)) : "";
};
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown> : {};

/** Prioritize logistics fields, then key attributes, then full specifications. */
export function buildMainSpecifications(
  weight: unknown,
  attributes: unknown,
  options: { singlePackageSize?: unknown; cbm?: unknown; specifications?: unknown } = {},
): Record<string, string> {
  const entries: [string, string][] = [];
  const seen = new Set<string>();
  const add = (label: string, value: unknown) => {
    const key = label.trim();
    const valueText = text(value);
    const id = identity(key);
    if (!key || !valueText || seen.has(id) || entries.length >= MAX_SPECIFICATIONS) return;
    entries.push([key, valueText]);
    seen.add(id);
  };
  const weightText = nonnegative(weight);
  const volumeText = nonnegative(options.cbm);
  add("وزن", weightText ? weightText + " کیلوگرم" : "");
  add("ابعاد بسته‌بندی", options.singlePackageSize);
  add("حجم بسته (CBM)", volumeText ? volumeText + " مترمکعب" : "");
  for (const source of [attributes, options.specifications]) {
    for (const [label, value] of Object.entries(record(source))) add(label, value);
  }
  return Object.fromEntries(entries);
}
