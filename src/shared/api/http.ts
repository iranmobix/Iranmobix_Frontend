import client from "./client";

import type { AxiosRequestConfig } from "axios";

export async function httpGet<T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await client.get<T>(url, config);

  return response.data;
}

export async function httpPost<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await client.post<T>(url, body, config);

  return response.data;
}
export async function httpPatch<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await client.patch<T>(url, body, config);
  return response.data;
}
export async function httpDelete<T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await client.delete<T>(url, config);
  return response.data;
}
