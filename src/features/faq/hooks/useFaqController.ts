import { useMemo, useState } from "react";

import { useDebounce } from "./useDebounce";
import { useFaqs } from "./useFaqs";

import type { Faq } from "../types/faq.types";

export function useFaqController(): {
  query: string;
  setQuery: (v: string) => void;
  faqs: Faq[];
  isLoading: boolean;
  isSearching: boolean;
} {
  const [query, setQuery] = useState("");

  const debouncedQuery = useDebounce(query, 300);

  const faqsQuery = useFaqs();

  const isSearching = debouncedQuery.trim().length > 0;

  const faqs = useMemo(() => {
    if (!faqsQuery.data) return [];

    if (!isSearching) {
      return faqsQuery.data;
    }

    const search = debouncedQuery.toLowerCase();

    return faqsQuery.data.filter(
      (faq) =>
        faq.question.toLowerCase().includes(search) ||
        faq.answer.toLowerCase().includes(search) ||
        faq.tags.some((tag) => tag.toLowerCase().includes(search))
    );
  }, [faqsQuery.data, debouncedQuery, isSearching]);

  return {
    query,
    setQuery,
    faqs,
    isLoading: faqsQuery.isLoading,
    isSearching,
  };
}