import { httpGet, httpPost } from "@/shared/api/http";
import type {
  CustomerWalletCashoutApi,
  CustomerWalletChargeApi,
  CustomerWalletTransactionsApi,
} from "../types/panel-wallet.types";

export const customerWalletApi = {
  getTransactions() {
    return httpGet<CustomerWalletTransactionsApi>(
      "/api/customer/wallet/profile/transactions/",
    );
  },
  cashout(amount: string, sheba_number: string) {
    return httpPost<CustomerWalletCashoutApi>(
      "/api/customer/wallet/profile/cashout/",
      { amount, sheba_number },
    );
  },
  charge(amount: string) {
    return httpPost<CustomerWalletChargeApi>(
      "/api/customer/wallet/profile/charge/",
      { amount },
    );
  },
};
