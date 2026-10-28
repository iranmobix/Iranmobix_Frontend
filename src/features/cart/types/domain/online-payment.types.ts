import type { z } from "zod";
import type { onlineRedirectSchema } from "../../schemas/online-payment.schema";
export type OnlineRedirect = z.infer<typeof onlineRedirectSchema>;
export interface OnlineGateway {
  code: string;
  title: string;
  enabled: boolean;
  selectable: boolean;
  reason: string | null;
  isSandbox: boolean;
  isDefault: boolean;
}
export interface OnlinePaymentSession {
  orderId: number;
  paymentId: number;
  alreadyPaid: boolean;
  redirect: OnlineRedirect | null;
}
