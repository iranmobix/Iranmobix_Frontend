import { httpGet } from "@/shared/api/http";
import type { CustomerPaymentApi } from "../types/panel-payment.types";

export const customerPaymentsApi = {
  list() {
    return httpGet<CustomerPaymentApi[]>("/api/customer/payments/profile/");
  },
};
