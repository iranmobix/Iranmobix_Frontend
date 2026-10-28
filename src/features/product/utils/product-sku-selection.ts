import type { ProductPriceAttribute } from "../types/domain/product-detail-price.types";

export function isProductColorAttribute(
  attribute: Pick<ProductPriceAttribute, "name">,
): boolean {
  return /^(colou?r|رنگ)$/i.test(attribute.name.trim());
}

export function getProductSkuValues(
  attribute: ProductPriceAttribute,
): string[] {
  return [
    ...new Set(
      attribute.values
        .map((option) => option.value)
        .filter((value) => value.trim().length > 0),
    ),
  ];
}

/** Only color is editable; other required attributes use the first valid backend value. */
export function resolveProductSkuSelection(
  attributes: readonly ProductPriceAttribute[],
  selection: Readonly<Record<string, string>>,
) {
  const entries: Array<[string, string]> = [];
  for (const attribute of attributes) {
    const values = getProductSkuValues(attribute);
    const chosen = Object.prototype.hasOwnProperty.call(
      selection,
      attribute.name,
    )
      ? selection[attribute.name]
      : undefined;
    const value =
      isProductColorAttribute(attribute) &&
      chosen !== undefined &&
      values.includes(chosen)
        ? chosen
        : values[0];
    if (attribute.name.trim() && value !== undefined)
      entries.push([attribute.name, value]);
  }
  return {
    attributes: Object.fromEntries(entries) as Record<string, string>,
    isComplete:
      entries.length === attributes.length &&
      new Set(attributes.map((attribute) => attribute.name)).size ===
        attributes.length,
  };
}
