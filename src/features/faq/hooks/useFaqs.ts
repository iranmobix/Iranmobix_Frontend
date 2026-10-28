import { useQuery } from "@tanstack/react-query";

import { FAQ_QUERY_KEYS } from "../constants/faq-query-keys";
import { faqService } from "../services/faq.service";

export function useFaqs() {
  return useQuery({
    queryKey: FAQ_QUERY_KEYS.lists(),

    queryFn: () => faqService.getFaqs(),

    staleTime: 1000 * 60 * 5,

    gcTime: 1000 * 60 * 10,
  });
}