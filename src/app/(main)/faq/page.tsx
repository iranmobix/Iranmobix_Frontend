"use client";

import { FaqList } from "@/features/faq/components/faq-list";
import { FaqSearch } from "@/features/faq/components/faq-search";

export default function FaqPage() {
  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">سوالات متداول</h1>

      <FaqSearch />
    </div>
  );
}
