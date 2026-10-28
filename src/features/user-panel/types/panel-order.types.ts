export type PanelOrderTab = "current" | "delivered" | "canceled";
export type PanelOrderStepKind =
  | "purchase"
  | "payment"
  | "package"
  | "warehouse"
  | "sea"
  | "customs"
  | "clearance"
  | "truck"
  | "delivery";
export interface PanelOrderStep {
  id: string;
  label: string;
  kind: PanelOrderStepKind;
  state: "completed" | "current" | "upcoming";
  occurredAt: string | null;
}
export interface PanelOrder {
  id: string;
  productTitle: string;
  code: string;
  quantity: number | null;
  amount: string;
  currency: string | null;
  invoice: string | null;
  tab: PanelOrderTab;
  statusLabel: string;
  orderedAt: string | null;
  steps: PanelOrderStep[];
}

export interface CustomerOrderApi {
  product_name?: string | null;
  order_code?: string | null;
  number?: number | null;
  final_price?: string | null;
  last_status?: string | null;
  order_date?: string | null;
  invoice?: string | null;
  order_status?: Array<{
    code?: string | null;
    title?: string | null;
    active?: boolean | null;
  }> | null;
}

export interface CustomerOrderDetailApi {
  order_code?: string | null;
}
// Provisional mock transport only; this is not an agreed backend contract.
export interface PanelOrderApi {
  id: string;
  product_title: string;
  code: string;
  quantity: number;
  amount: string;
  currency: string;
  tab: PanelOrderTab;
  status_label: string;
  ordered_at: string;
  steps: Array<{
    id: string;
    label: string;
    kind: PanelOrderStepKind;
    state: PanelOrderStep["state"];
    occurred_at: string | null;
  }>;
}
