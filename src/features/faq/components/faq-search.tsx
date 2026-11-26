"use client";
import PageLoading from "@/shared/components/page-loading";

import { useFaqController } from "../hooks/useFaqController";

import { FaqList } from "./faq-list";
import { FaqSearchInput } from "./faq-search-input";

export function FaqSearch() {
  const { query, setQuery, faqs, isLoading } = useFaqController();

  return (
    <section>
      <FaqSearchInput value={query} onChange={setQuery} />

      {isLoading ? <PageLoading title="در حال دریافت پرسش‌های متداول" description="پاسخ پرسش‌های شما در حال دریافت هستند." /> : <FaqList faqs={faqs} />}
    </section>
  );
}
