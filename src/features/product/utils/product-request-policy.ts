export const PRODUCT_DETAIL_TIMEOUT = 30_000;

/** Retry transient transport failures only; never retry invalid data or missing products. */
export function retryProductDetail(failureCount: number, error: unknown): boolean {
  if (failureCount >= 2 || !error || typeof error !== "object") return false;
  const value = error as {name?: string; message?: string; code?: string; status?: number; response?: {status?: number}};
  if (value.name === "AbortError" || value.code === "ERR_CANCELED") return false;
  const status = value.response?.status ?? value.status;
  if (status !== undefined) return status === 408 || status === 429 || (status >= 500 && status <= 599);
  return value.name === "TimeoutError" || (value.name === "TypeError" && /fetch|network|load failed/i.test(value.message ?? ""))
    || ["ECONNABORTED", "ETIMEDOUT", "ERR_NETWORK"].includes(value.code ?? "");
}
