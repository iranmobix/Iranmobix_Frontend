import { z } from "zod";
import { onlinePaymentApi } from "../api/online-payment.api";
import {
  gatewayCodeSchema,
  onlineRedirectSchema,
  onlineSessionSchema,
  onlineFinalizeSchema,
} from "../schemas/online-payment.schema";
import type { OnlinePaymentSession } from "../types/domain/online-payment.types";
import {
  submitCheckout,
  type CheckoutSubmitInput,
} from "./checkout-submit.service";
export async function startOnlinePayment(
  input: CheckoutSubmitInput,
): Promise<OnlinePaymentSession> {
  const gatewayCode = gatewayCodeSchema.optional().parse(input.gateway_code);
  if (input.payment_type !== "online")
    throw new Error("روش پرداخت آنلاین انتخاب نشده است.");
  const response = await submitCheckout({
    ...input,
    gateway_code: gatewayCode,
  });
  if (response.payment_type !== "online" || !response.order)
    throw new Error("اطلاعات سفارش پرداخت آنلاین ناقص است.");
  const detail = z
    .object({
      redirect: onlineRedirectSchema.optional(),
      already_paid: z.boolean().optional(),
      payment_id: z.number().int().positive().optional(),
      order_id: z.number().int().positive().optional(),
      gateway_code: gatewayCodeSchema.optional(),
    })
    .passthrough()
    .parse(response.online_payment ?? {});
  if (
    (detail.order_id && detail.order_id !== response.order.id) ||
    (gatewayCode &&
      detail.gateway_code &&
      detail.gateway_code !== gatewayCode) ||
    (detail.payment_id &&
      response.payment?.id &&
      detail.payment_id !== response.payment.id)
  )
    throw new Error("اطلاعات درگاه با سفارش یا پرداخت فعلی یکسان نیست.");
  if (
    typeof response.order.tracking_code === "string" &&
    response.order.tracking_code !== input.tracking_code
  )
    throw new Error("کد پیگیری پاسخ با سفارش فعلی یکسان نیست.");
  const paymentId = detail.payment_id ?? response.payment?.id;
  const directRedirect =
    detail.redirect ??
    (response.next_action.redirect
      ? onlineRedirectSchema.parse(response.next_action.redirect)
      : undefined);
  if (paymentId && (directRedirect?.url || detail.already_paid))
    return {
      orderId: response.order.id,
      paymentId,
      alreadyPaid: detail.already_paid ?? false,
      redirect: directRedirect ?? null,
    };
  const session = onlineSessionSchema.parse(
    await onlinePaymentApi.session(response.order.id, gatewayCode),
  );
  if (
    session.order_id !== response.order.id ||
    (gatewayCode && session.gateway_code !== gatewayCode)
  )
    throw new Error("پاسخ درگاه با سفارش یا درگاه انتخاب‌شده یکسان نیست.");
  if (!session.already_paid && !session.redirect.url)
    throw new Error("لینک انتقال به درگاه از بک دریافت نشد.");
  return {
    orderId: session.order_id,
    paymentId: session.payment_id,
    alreadyPaid: session.already_paid,
    redirect: session.redirect,
  };
}
export async function finalizeOnlinePayment(paymentId: number) {
  z.number().int().positive().parse(paymentId);
  const response = onlineFinalizeSchema.parse(
    await onlinePaymentApi.finalize(paymentId),
  );
  if (response.payment_id !== paymentId)
    throw new Error("پاسخ پرداخت با شناسه درخواست یکسان نیست.");
  return response;
}
