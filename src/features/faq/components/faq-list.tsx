import type { Faq } from "../types/faq.types";

import { FaqItem } from "./faq-item";

type Props = {
  faqs: Faq[];
};

export function FaqList({ faqs }: Props) {
  if (!faqs.length) {
    return <div>موردی یافت نشد</div>;
  }

  return (
    <div>
      {faqs.map((faq) => (
        <FaqItem key={faq.slug} faq={faq} />
      ))}
    </div>
  );
}
