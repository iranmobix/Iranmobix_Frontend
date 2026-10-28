import { faqApi } from "../api/faq.api";

import {
  mapFaq,
  mapFaqList,
} from "../mappers/faq.mapper";

import type { Faq } from "../types/faq.types";


class FaqService {

  async getFaqs(): Promise<Faq[]> {

    const response = await faqApi.getAll();

    return mapFaqList(response);

  }


  async getFaq(
    slug: string
  ): Promise<Faq> {

    const response = await faqApi.getBySlug(slug);

    return mapFaq(response);

  }

}


export const faqService = new FaqService();