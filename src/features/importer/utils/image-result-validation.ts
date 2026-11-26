import { z } from "zod";

const price = z.union([z.number(), z.string().trim().min(1)])
  .refine((value) => Number.isFinite(Number(value)) && Number(value) >= 0);
const url = z.string().trim().url().refine((value) => /^https?:\/\//i.test(value));
const imageResultSchema = z.object({
  slug: z.string().trim().min(1),
  primary_image: url,
  source_url: url,
  en_title: z.string().trim().min(1),
  price_in_china_cny: price,
  price_in_china_toman: price,
});

export const isCompleteImageResult = (value: unknown) => imageResultSchema.safeParse(value).success;
export const MAX_IMAGE_SEARCH_RETRIES = 2;
