import type { FaqApiResponse } from "../types/faq.api.types";
import type { Faq } from "../types/faq.types";


export function mapFaq(
  response: FaqApiResponse
): Faq {
  return {
    id: response.id,
    question: response.question,
    answer: response.answer,
    slug: response.slug,

    tags: response.tags
      ? response.tags
          .split(",")
          .map((tag) => tag.trim())
      : [],

    status: response.status === 1,

    createdAt: new Date(response.created_at),
  };
}


export function mapFaqList(
  response: FaqApiResponse[]
): Faq[] {
  return response.map(mapFaq);
}