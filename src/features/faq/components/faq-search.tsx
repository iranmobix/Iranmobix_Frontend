"use client";

import { useFaqController } from "../hooks/useFaqController";

import { FaqList } from "./faq-list";
import { FaqSearchInput } from "./faq-search-input";

export function FaqSearch() {
  const { query, setQuery, faqs, isLoading } = useFaqController();

  return (
    <section>
      <FaqSearchInput value={query} onChange={setQuery} />

      {isLoading ? <p>Loading...</p> : <FaqList faqs={faqs} />}
    </section>
  );
}
