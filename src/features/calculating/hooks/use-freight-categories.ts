import { useQuery } from "@tanstack/react-query";
import { getFreightCategories } from "../services/calculating.service";

export function useFreightCategories() {
  return useQuery({
    queryKey: ["shipping", "freight", "categories"],
    queryFn: getFreightCategories,
    staleTime: 5 * 60_000,
    retry: 1,
  });
}
