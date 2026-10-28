"use client";

import { useState } from "react";

import type { Faq } from "../types/faq.types";

interface Props {
  faq: Faq;
}

export function FaqItem({ faq }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <article className="mb-3 rounded-xl border p-4">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full text-right font-medium"
      >
        {faq.question}
      </button>

      {isOpen && <div className="mt-2 text-sm text-gray-600">{faq.answer}</div>}
    </article>
  );
}
