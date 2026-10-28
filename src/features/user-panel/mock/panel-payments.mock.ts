import type { PanelPaymentApi } from "../types/panel-payment.types";
export const panelPaymentsMock: PanelPaymentApi[] = Array.from(
  { length: 10 },
  (_, index) => ({
    id: "sample-payment-" + (index + 1),
    amount: "2720000000",
    currency: "IRT",
    method_label: "درگاه پرداخت",
    paid_at: "2025-08-19T12:00:00+03:30",
  }),
);
