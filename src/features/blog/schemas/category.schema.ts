import { z } from "zod";

export const CategorySchema = z.object({
  id: z.number(),
  name: z.string(),
  parent: z.number().nullable(),
  description: z.string(),
  slug: z.string(),
  status: z.number(),
  image: z.string(),
  tags: z.string(),
  createdAt: z.string(),
});