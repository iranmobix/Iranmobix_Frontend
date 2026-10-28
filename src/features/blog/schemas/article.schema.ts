import { z } from "zod";

export const ArticleSchema = z.object({
  id: z.number(),
  title: z.string(),
  summary: z.string(),
  slug: z.string(),
  status: z.number(),
  image: z.string(),

  tags: z.array(z.string()),

  publishedAt: z.string(),

  category: z.object({
    id: z.number(),
    name: z.string(),
  }),

  authorId: z.number(),
  createdAt: z.string(),
});