import type { z } from "zod";
import type { onlineRedirectSchema } from "../../schemas/online-payment.schema";
export type OnlineRedirect = z.infer<typeof onlineRedirectSchema>;
export interface OnlinePaymentSession {
  orderId: number;
  paymentId: number;
  alreadyPaid: boolean;
  redirect: OnlineRedirect | null;
}
