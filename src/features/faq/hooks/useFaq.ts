import { useQuery } from "@tanstack/react-query";

import { FAQ_QUERY_KEYS } from "../constants/faq-query-keys";
import { faqService } from "../services/faq.service";

export function useFaq(slug: string) {
  return useQuery({
    queryKey: FAQ_QUERY_KEYS.detail(slug),

    queryFn: () => faqService.getFaq(slug),

    enabled: !!slug,

    staleTime: 1000 * 60 * 5,
  });
}