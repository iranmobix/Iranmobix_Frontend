import { httpGet } from "@/shared/api/http";
import type {
  CustomerOrderApi,
  CustomerOrderDetailApi,
} from "../types/panel-order.types";

export const customerOrdersApi = {
  list() {
    return httpGet<CustomerOrderApi[]>("/api/customer/orders/profile/");
  },
  get(orderCode: string) {
    return httpGet<CustomerOrderDetailApi>(
      `/api/customer/orders/profile/${encodeURIComponent(orderCode)}/`,
    );
  },
};
