export interface ProductPriceApi {
  amount: string | null;
  currency: string;
  amount_irr: string | null;

  has_discount: boolean;

  original_amount: string | null;
  discount_amount: string | null;
  discount_percentage: number | null;
}
