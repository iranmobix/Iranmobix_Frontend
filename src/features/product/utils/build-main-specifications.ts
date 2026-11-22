/** The compact card is independent of the full specifications below the product. */
export function buildMainSpecifications(
  weight: unknown,
  attributes: unknown,
): Record<string, string> {
  const entries: [string, string][] = [];
  if (
    (typeof weight === "number" ||
      (typeof weight === "string" && /^\d+(?:\.\d+)?$/.test(weight.trim()))) &&
    Number.isFinite(Number(weight)) &&
    Number(weight) >= 0
  ) {
    entries.push(["وزن (کیلوگرم)", String(Number(weight))]);
  }
  if (
    attributes &&
    typeof attributes === "object" &&
    !Array.isArray(attributes)
  ) {
    for (const [label, value] of Object.entries(attributes)) {
      if (!label.trim() || entries.some(([key]) => key === label)) continue;
      const text =
        typeof value === "string"
          ? value.trim()
          : typeof value === "number" && Number.isFinite(value)
            ? String(value)
            : "";
      if (text) entries.push([label, text]);
      if (entries.length >= 6) break;
    }
  }
  return Object.fromEntries(entries.slice(0, 6));
}
