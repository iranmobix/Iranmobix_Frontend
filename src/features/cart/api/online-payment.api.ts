import { httpPost } from "@/shared/api";
export const onlinePaymentApi = {
  session: (orderId: number, gatewayCode?: string) =>
    httpPost<unknown>(
      "/api/customer/orders/" + orderId + "/payment/online/session/",
      gatewayCode ? { gateway_code: gatewayCode } : {},
      { withCredentials: true },
    ),
  finalize: (paymentId: number) =>
    httpPost<unknown>(
      "/api/customer/checkout/online-payments/" + paymentId + "/finalize/",
      undefined,
      { withCredentials: true },
    ),
};
