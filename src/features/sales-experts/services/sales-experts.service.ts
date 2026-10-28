import { salesExpertsApi } from "../api/sales-experts.api";

export const salesExpertsService = {
  getSalesExperts: () => salesExpertsApi.getSalesExperts(),
};
