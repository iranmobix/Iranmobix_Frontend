import type {
  CheckoutAddress,
  CheckoutBankAccount,
  CheckoutPaymentMethod,
} from "./checkout.types";
export interface PaymentOption {
  code: string;
  method: CheckoutPaymentMethod | null;
  title: string;
  enabled: boolean;
  reason: string | null;
  description: string | null;
  balanceToman: string | null;
  bankAccount: CheckoutBankAccount | null;
  gateways: Array<{
    code: string;
    title: string;
    enabled: boolean;
    isSandbox: boolean;
  }>;
}
export interface CheckoutPayment {
  orderId: number | null;
  trackingCode: string;
  status: string | null;
  message: string;
  canContinue: boolean;
  expiresAt: string | null;
  addresses: Array<Pick<CheckoutAddress, "id" | "label" | "description">>;
  selectedAddressId: string | null;
  options: PaymentOption[];
  bankAccounts: CheckoutBankAccount[];
  contract: {
    required: boolean;
    accepted: boolean;
    templateId: number | null;
    title: string;
    pdfUrl: string | null;
  } | null;
  currency: string | null;
  total: string;
  quantity: number;
  rows: Array<{ key: string; label: string; amount: string | null }>;
  pricingIssue: string | null;
  wallet?: {
    balanceToman: string;
    shortageToman: string;
    status: string;
    balance?: string;
    shortage?: string;
    currency?: string;
  };
  proforma: { available: boolean; url: string | null; message: string };
}
