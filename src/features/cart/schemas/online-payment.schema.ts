import { z } from "zod";
export const gatewayCodeSchema = z
  .string()
  .min(1)
  .max(50)
  .regex(/^[-a-zA-Z0-9_]+$/);
const paymentId = z.number().int().positive();
const redirectUrl = z
  .string()
  .url()
  .refine((value) => {
    const url = new URL(value);
    return (
      ["https:", "http:"].includes(url.protocol) &&
      !url.username &&
      !url.password
    );
  }, "آدرس درگاه معتبر نیست.");
export const onlineRedirectSchema = z.object({
  method: z.enum(["GET", "POST"]),
  url: redirectUrl.nullable(),
  fields: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])),
});
export const paymentGatewayListSchema = z.object({
  default_gateway_code: gatewayCodeSchema.nullable(),
  gateways: z.array(
    z
      .object({
        code: gatewayCodeSchema,
        title: z.string(),
        enabled: z.boolean(),
        selectable: z.boolean(),
        reason: z.string().nullable(),
        sandbox: z.boolean(),
        is_default: z.boolean(),
      })
      .passthrough(),
  ),
});
export const onlineSessionSchema = z
  .object({
    order_id: paymentId,
    payment_id: paymentId,
    gateway_code: gatewayCodeSchema,
    already_paid: z.boolean(),
    redirect: onlineRedirectSchema,
  })
  .passthrough();
export const onlineFinalizeSchema = z
  .object({
    success: z.boolean(),
    message: z.string(),
    status: z.string(),
    order_id: paymentId,
    payment_id: paymentId,
    tracking_code: z.string().min(1),
  })
  .passthrough();
export const onlinePaymentContextSchema = z.object({
  paymentId,
  trackingCode: z.string().min(1),
  sessionId: z.string().min(1),
});
