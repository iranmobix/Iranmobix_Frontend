import { httpDelete, httpGet, httpPatch, httpPost } from "@/shared/api";
import type {
  CustomerAddressPatchPayload,
  CustomerAddressPayload,
} from "../types/api/customer-address-api.types";
export const checkoutPaymentApi = {
  getCities: (provinceName: string, signal?: AbortSignal) =>
    httpGet<unknown>("/api/customer/cities/", {
      params: { province: provinceName },
      signal,
      withCredentials: true,
    }),
  getProvinces: (signal?: AbortSignal) =>
    httpGet<unknown>("/api/customer/provinces/", {
      signal,
      withCredentials: true,
    }),
  getAddresses: (signal?: AbortSignal) =>
    httpGet<unknown>("/api/customer/addresses/", {
      signal,
      withCredentials: true,
    }),
  createAddress: (payload: CustomerAddressPayload) =>
    httpPost<unknown>("/api/customer/addresses/", payload, {
      withCredentials: true,
    }),
  updateAddress: (id: number, payload: CustomerAddressPatchPayload) =>
    httpPatch<unknown>(`/api/customer/addresses/${id}/`, payload, {
      withCredentials: true,
    }),
  deleteAddress: (id: number) =>
    httpDelete<unknown>(`/api/customer/addresses/${id}/`, {
      withCredentials: true,
    }),
  get: (trackingCode: string, signal?: AbortSignal, couponCode?: string) =>
    httpGet<unknown>(
      "/api/customer/checkout/payment/" +
        encodeURIComponent(trackingCode) +
        "/",
      {
        signal,
        withCredentials: true,
        params: couponCode ? { coupon_code: couponCode } : undefined,
      },
    ),
};
