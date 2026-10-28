import { httpGet, httpPost } from "@/shared/api";
export const onlinePaymentApi = {
  gateways: (signal?: AbortSignal) =>
    httpGet<unknown>("/api/customer/payment-gateways/", {
      signal,
      withCredentials: true,
    }),
  session: (orderId: number, gatewayCode: string) =>
    httpPost<unknown>(
      "/api/customer/orders/" + orderId + "/payment/online/session/",
      { gateway_code: gatewayCode },
      { withCredentials: true },
    ),
  finalize: (paymentId: number) =>
    httpPost<unknown>(
      "/api/customer/checkout/online-payments/" + paymentId + "/finalize/",
      undefined,
      { withCredentials: true },
    ),
};
