import { z } from "zod";
import { httpPost } from "@/shared/api";
const schema = z.object({
  tracking_code: z.string().min(1),
  address_id: z.number().int().positive(),
  payment_type: z.enum(["online", "wallet", "offline", "hawala"]),
  contract_accepted: z.literal(true),
  coupon_code: z.string().optional(),
  gateway_code: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[-a-zA-Z0-9_]+$/)
    .optional(),
  final_amount: z.string().regex(/^\d+(\.\d+)?$/),
});
export type CheckoutSubmitInput = z.infer<typeof schema>;
const responseSchema = z
  .object({
    order: z
      .object({ id: z.number().int().positive() })
      .passthrough()
      .optional(),
    payment: z
      .object({ id: z.number().int().positive() })
      .passthrough()
      .nullable()
      .optional(),
    online_payment: z.unknown().optional(),
    payment_type: z.string(),
    idempotent_replay: z.boolean(),
    next_action: z
      .object({ type: z.string(), message: z.string().optional() })
      .passthrough(),
  })
  .passthrough();
export async function submitCheckout(input: CheckoutSubmitInput) {
  const payload = schema.parse(input);
  return responseSchema.parse(
    await httpPost<unknown>(
      "/api/customer/checkout/payment/" +
        encodeURIComponent(payload.tracking_code) +
        "/",
      payload,
      { withCredentials: true },
    ),
  );
}
