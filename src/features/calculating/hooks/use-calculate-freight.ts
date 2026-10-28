import { useMutation } from "@tanstack/react-query";

import { calculateFreight } from "../services/calculating.service";

import type { CalculatingApiPayload } from "../types/calculating-api.types";
import type { CalculatingResult } from "../types/calculating.types";

export function useCalculateFreight() {
  return useMutation<CalculatingResult, Error, CalculatingApiPayload>({
    mutationFn: calculateFreight,
  });
}
