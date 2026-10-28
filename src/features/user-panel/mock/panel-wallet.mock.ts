import type { PanelWalletApi } from "../types/panel-wallet.types";
export const emptyPanelWalletMock: PanelWalletApi = {
  balance: "0",
  currency: "IRT",
  charges: [],
};
export const panelWalletMock: PanelWalletApi = {
  balance: "200000000",
  currency: "IRT",
  charges: [
    {
      id: "sample-wallet-charge-3",
      amount: "50000000",
      charged_at: "2025-08-21T12:00:00+03:30",
      balance_after: "200000000",
    },
    {
      id: "sample-wallet-charge-2",
      amount: "50000000",
      charged_at: "2025-08-20T12:00:00+03:30",
      balance_after: "150000000",
    },
    {
      id: "sample-wallet-charge-1",
      amount: "100000000",
      charged_at: "2025-08-19T12:00:00+03:30",
      balance_after: "100000000",
    },
  ],
};
