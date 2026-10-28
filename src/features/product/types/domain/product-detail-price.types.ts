// Display amounts follow the existing domain convention: numbers, not API decimal strings.
// The mapper must validate conversions and normalize omitted arrays to [] and range to null.
export interface ProductConvertedAmount {
  amount: number;
  currency: string;
  amountToman: number;
  amountUsd: number | null;
}

export interface ProductDetailPrice extends ProductConvertedAmount {
  minimum: number;
  maximum: number;
  originalAmount: number | null;
  finalAmount: number;
  hasDiscount: boolean;
  discountAmount: number | null;
  finalAmountToman: number;
  finalAmountUsd: number | null;
  discountPercentage: number;
  ladderPrices: ProductPriceTier[];
  attributes: ProductPriceAttribute[];
  range: ProductPriceRange | null;
}

export interface ProductPriceTier extends ProductConvertedAmount {
  minQuantity: number | null;
  // null means that this price tier has no upper quantity boundary.
  maxQuantity: number | null;
  quantityText: string;
  label: string;
  rawPriceText: string;
}

export interface ProductPriceAttribute {
  name: string;
  values: ProductPriceAttributeValue[];
}

export interface ProductPriceAttributeValue extends ProductConvertedAmount {
  value: string;
  rawSkuId: string;
  rawPriceText: string;
}

export interface ProductPriceRange {
  minimum: number;
  maximum: number;
  currency: string;
  minimumToman: number;
  minimumUsd: number | null;
  maximumToman: number;
  maximumUsd: number | null;
}
