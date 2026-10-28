export interface PanelPayment {
  id: string;
  amount: string;
  currency: string | null;
  methodLabel: string;
  paidAt: string | null;
  paidTime: string | null;
}

export interface CustomerPaymentApi {
  price?: string | null;
  payment_method?: string | null;
  date?: string | null;
  time?: string | null;
}
// Provisional mock transport; replace with the agreed payment-history API.
export interface PanelPaymentApi {
  id: string;
  amount: string;
  currency: string;
  method_label: string;
  paid_at: string;
}
