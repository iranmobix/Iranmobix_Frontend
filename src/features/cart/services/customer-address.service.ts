import axios from "axios";
import { checkoutPaymentApi } from "../api/checkout-payment.api";
import {
  customerCityListSchema,
  customerProvinceListSchema,
  customerAddressListSchema,
  customerAddressSchema,
} from "../schemas/customer-address.schema";
import type { CustomerAddressInput } from "../types/domain/customer-address.types";
import type {
  CustomerAddressPatchPayload,
  CustomerAddressPayload,
} from "../types/api/customer-address-api.types";
export function mapCustomerAddressPayload(
  input: CustomerAddressInput,
): CustomerAddressPayload {
  const value = customerAddressSchema.parse(input);
  return {
    title: value.title,
    address_title: value.addressTitle,
    province: value.provinceId,
    city: value.cityId,
    postal_code: value.postalCode,
    address: value.address,
    no: value.no,
    unit: value.unit,
    "fullname ": value.fullName,
    mobile: value.mobile,
  };
}
export function mapCustomerAddressPatchPayload(
  input: CustomerAddressInput,
): CustomerAddressPatchPayload {
  const value = customerAddressSchema.parse(input);
  return {
    title: value.title,
    address_title: value.addressTitle,
    province: value.provinceId,
    city: value.cityId,
    postal_code: value.postalCode,
    address: value.address,
    no: value.no,
    unit: value.unit,
    fullname: value.fullName,
    mobile: value.mobile,
  };
}
function parseAddressId(id: string): number {
  const parsed = Number(id);
  if (!Number.isSafeInteger(parsed) || parsed <= 0)
    throw new Error("شناسه آدرس معتبر نیست.");
  return parsed;
}
function assertAddressMutationSucceeded(response: unknown) {
  if (
    response &&
    typeof response === "object" &&
    "error" in response &&
    response.error
  )
    throw new Error("سرور تغییر آدرس را تأیید نکرد.");
}
export async function createCustomerAddress(
  input: CustomerAddressInput,
): Promise<void> {
  const response = await checkoutPaymentApi.createAddress(
    mapCustomerAddressPayload(input),
  );
  assertAddressMutationSucceeded(response);
  // The create response shape is undocumented. Reload the authoritative address list.
}
export async function updateCustomerAddress({
  id,
  input,
}: {
  id: string;
  input: CustomerAddressInput;
}): Promise<void> {
  const response = await checkoutPaymentApi.updateAddress(
    parseAddressId(id),
    mapCustomerAddressPatchPayload(input),
  );
  assertAddressMutationSucceeded(response);
}
export async function deleteCustomerAddress(id: string): Promise<void> {
  const response = await checkoutPaymentApi.deleteAddress(parseAddressId(id));
  assertAddressMutationSucceeded(response);
}
export function getAddressError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 401)
      return "نشست ورود معتبر نیست؛ دوباره وارد شوید.";
    const data = error.response?.data;
    if (data && typeof data === "object") {
      const fields = data.error?.fields ?? data;
      const details = Object.entries(fields)
        .filter(([key]) => key !== "error")
        .flatMap(([key, value]) =>
          typeof value === "string"
            ? [key + ": " + value]
            : Array.isArray(value)
              ? value
                  .filter((v) => typeof v === "string")
                  .map((v) => key + ": " + v)
              : [],
        );
      if (details.length) return details.join("؛ ");
      if (typeof data.error?.message === "string") return data.error.message;
    }
  }
  return error instanceof Error && !axios.isAxiosError(error)
    ? error.message
    : "عملیات آدرس تأیید نشد؛ پیش از تلاش مجدد فهرست آدرس‌ها را بررسی کنید.";
}

export async function getCustomerAddresses(signal?: AbortSignal) {
  const response = customerAddressListSchema.parse(
    await checkoutPaymentApi.getAddresses(signal),
  );
  const items = Array.isArray(response) ? response : response.results;
  return {
    items: items.map((a) => ({
      id: String(a.id),
      label:
        a.display_title ||
        a.address_title ||
        a.title ||
        "عنوان آدرس از بک دریافت نشده",
      description:
        a.display_address || a.address || "متن آدرس از بک دریافت نشده",
      provinceId: a.province,
      province: a.province_name,
      cityId: a.city,
      city: a.city_name,
      street: a.address ?? "",
      no: a.no,
      unit: a.unit,
      postalCode: a.postal_code,
      receiverName: a.fullname ?? "",
      receiverMobile: a.mobile,
    })),
    hasMore: !Array.isArray(response) && Boolean(response.next),
  };
}

export async function getCustomerProvinces(signal?: AbortSignal) {
  const provinces = customerProvinceListSchema.parse(
    await checkoutPaymentApi.getProvinces(signal),
  );
  return provinces.map(({ id, name }) => ({ id, name }));
}

export async function getCustomerCities(
  province: { id: number; name: string },
  signal?: AbortSignal,
) {
  if (
    !Number.isSafeInteger(province.id) ||
    province.id <= 0 ||
    !province.name.trim()
  )
    throw new Error("استان معتبر انتخاب نشده است.");
  const cities = customerCityListSchema.parse(
    await checkoutPaymentApi.getCities(province.name, signal),
  );
  if (cities.some((city) => city.province !== province.id))
    throw new Error("شهرهای دریافتی با استان انتخاب‌شده مطابقت ندارند.");
  return cities.map(({ id, name }) => ({ id, name }));
}
