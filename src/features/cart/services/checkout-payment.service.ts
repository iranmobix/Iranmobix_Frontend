import { checkoutPaymentApi } from "../api/checkout-payment.api";
import { checkoutPaymentSchema } from "../schemas/checkout-payment.schema";
import { mapCheckoutPayment } from "../mappers/checkout-payment.mapper";
export const checkoutPaymentService = {
  async get(trackingCode: string, signal?: AbortSignal, couponCode?: string) {
    if (!trackingCode.trim()) throw new Error("کد پیگیری سفارش مشخص نیست.");
    const dto = checkoutPaymentSchema.parse(
      await checkoutPaymentApi.get(trackingCode, signal, couponCode),
    );
    if (
      "order" in dto &&
      (dto.order.tracking_code !== trackingCode ||
        dto.payment_options.tracking_code !== trackingCode ||
        dto.order.id !== dto.payment_options.order_id)
    )
      throw new Error("پاسخ بک با سفارش درخواستی مطابقت ندارد.");
    return mapCheckoutPayment(dto, trackingCode);
  },
};
