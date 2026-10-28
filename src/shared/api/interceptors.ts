import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import { tokenStorage } from "@/features/auth/utils/token-storage";
import { refreshAccessToken } from "@/features/auth/services/token.service";

const configured = new WeakSet<AxiosInstance>();
type AuthRequestConfig = InternalAxiosRequestConfig & {
  _authAccessToken?: string;
  _authRetried?: boolean;
};
function isAuthRequest(url = "") {
  const pathname = new URL(url, "http://local.invalid").pathname;
  return /^\/api\/auth\/(request-otp|resend-otp|verify-otp|logout)\/$/.test(pathname);
}

export function setupInterceptors(client: AxiosInstance) {
  if (configured.has(client)) return;
  configured.add(client);
  let pending:
    { access: string; refresh: string; promise: Promise<string> } | undefined;
  let renewed: { from: string; to: string } | undefined;

  client.interceptors.request.use((config: AuthRequestConfig) => {
    // Axios uses false to explicitly omit a header, even when defaults exist.
    if (isAuthRequest(config.url) || config.headers.get("Authorization") === false) return config;
    const accessToken = tokenStorage.getAccessToken();
    if (config._authRetried && accessToken !== config._authAccessToken)
      throw new axios.CanceledError("Authentication changed before retry");
    if (accessToken) {
      config.headers.Authorization = "Bearer " + accessToken;
      config._authAccessToken = accessToken;
    } else if (config._authAccessToken) {
      config.headers.delete("Authorization");
      delete config._authAccessToken;
    }
    return config;
  });
  client.interceptors.response.use(
    (response) => response,
    async (error: unknown) => {
      if (!axios.isAxiosError(error) || error.response?.status !== 401)
        throw error;
      const config = error.config as AuthRequestConfig | undefined;
      if (!config || isAuthRequest(config.url) || !config._authAccessToken)
        throw error;
      const sent = config._authAccessToken;
      const current = tokenStorage.getAccessToken();
      if (config._authRetried) {
        if (current === sent) tokenStorage.clearTokens();
        throw error;
      }
      if (!current) throw error;
      config._authRetried = true;
      let next: string;
      if (current !== sent) {
        // Only reuse a token renewed here; never replay against a different login.
        if (renewed?.from !== sent || renewed.to !== current) throw error;
        next = current;
      } else {
        const refresh = tokenStorage.getRefreshToken();
        if (!refresh) {
          tokenStorage.clearTokens();
          throw error;
        }
        if (
          !pending ||
          pending.access !== sent ||
          pending.refresh !== refresh
        ) {
          const operation = {
            access: sent,
            refresh,
            promise: refreshAccessToken(sent, refresh).then((token) => {
              renewed = { from: sent, to: token };
              return token;
            }),
          };
          pending = operation;
          void operation.promise
            .finally(() => {
              if (pending === operation) pending = undefined;
            })
            .catch(() => {});
        }
        next = await pending.promise;
      }
      if (tokenStorage.getAccessToken() !== next) throw error;
      config._authAccessToken = next;
      config.headers.Authorization = "Bearer " + next;
      return client.request(config);
    },
  );
}
