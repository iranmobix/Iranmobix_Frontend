import { httpGet } from "@/shared/api";

import type {
  FaqApiResponse,
} from "../types/faq.api.types";


class FaqApi {

  async getAll(): Promise<FaqApiResponse[]> {
    return httpGet<FaqApiResponse[]>(
      "/api/faqs/"
    );
  }


  async getBySlug(
    slug: string
  ): Promise<FaqApiResponse> {

    return httpGet<FaqApiResponse>(
      `/api/faqs/${slug}`
    );

  }

}


export const faqApi = new FaqApi();