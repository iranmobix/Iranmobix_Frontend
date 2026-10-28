import type { z } from "zod";
import type { checkoutPaymentSchema } from "../../schemas/checkout-payment.schema";
/** Validated wire contract. Empty/nullable undocumented structures remain unknown. */
export type CheckoutPaymentResponse = z.infer<typeof checkoutPaymentSchema>;
