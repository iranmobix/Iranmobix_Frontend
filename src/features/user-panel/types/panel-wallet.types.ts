export interface PanelWalletCharge {
  id: string;
  amount: string | null;
  currency: string | null;
  details: string | null;
  chargedAt: string | null;
  balanceAfter: string | null;
}
export interface PanelWallet {
  balance: string | null;
  currency: string | null;
  charges: PanelWalletCharge[];
}
// Mock preview transport only; no live wallet endpoint is assumed.
export interface PanelWalletApi {
  balance: string;
  currency: string;
  charges: Array<{
    id: string;
    amount: string;
    charged_at: string;
    balance_after: string;
  }>;
}

export interface CustomerWalletTransactionsApi {
  total_balance?: string | null;
  currency?: string | null;
  transactions?: Array<{
    amount?: string | null;
    currency?: string | null;
    date?: string | null;
    remaining?: string | null;
    details?: string | null;
  }> | null;
}

export interface CustomerWalletCashoutApi {
  id: number;
  amount: string;
  remaining: string;
  status: string;
  sheba_number: string;
  currency: string;
}

export interface CustomerWalletChargeApi {
  charge_request_id: number;
  payment_url: string;
  redirect_method: string;
  redirect_fields: Record<string, string | number | boolean>;
  status: string;
  currency: string;
}
