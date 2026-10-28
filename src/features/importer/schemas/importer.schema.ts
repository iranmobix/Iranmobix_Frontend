import { z } from "zod";
export const importUrlSchema = z
  .string()
  .trim()
  .transform((v) => (/^www\./i.test(v) ? "https://" + v : v))
  .pipe(z.url())
  .refine(
    (v) => ["http:", "https:"].includes(new URL(v).protocol),
    "لینک معتبر وارد کنید.",
  );
export const importAcceptedSchema = z.object({
  job_id: z.number().int().positive(),
  status: z.enum(["pending", "processing", "done", "failed"]),
  status_url: z.string(),
  next_poll_after_seconds: z.number().nonnegative(),
  import_type: z.string(),
  result_mode: z.string(),
  ready_for_frontend: z.boolean(),
});
export const discoverAcceptedSchema = z.object({
  job_id: z.number().int().positive(),
  status: z.string().min(1),
  status_url: z.string().min(1),
  next_poll_after_seconds: z.number().nonnegative(),
  import_type: z.string(),
  result_mode: z.string(),
  ready_for_frontend: z.boolean(),
});
export const importProductSchema = z
  .object({
    id: z.number().int(),
    slug: z.string().min(1),
    title: z.string(),
    short_title: z.string().optional(),
    source: z.string().optional(),
    source_url: z.string().optional(),
    currency: z.string().optional(),
    min_price: z.string().nullable().optional(),
    min_price_display: z.string().optional(),
    colors: z
      .array(
        z.object({ id: z.number(), color_name: z.string(), color: z.string() }),
      )
      .nullish(),
    brand: z
      .object({
        id: z.number().nullable(),
        persian_name: z.string(),
        original_name: z.string(),
        logo: z.string().nullish(),
      })
      .nullish(),
    images: z
      .array(
        z.object({ image_url: z.string(), is_primary: z.boolean().optional() }),
      )
      .optional(),
  })
  .passthrough();
export type ImportedProduct = z.infer<typeof importProductSchema>;
export const discoveredCandidateSchema = z
  .object({
    title: z.string().nullish(),
    status: z.string().nullish(),
    is_primary: z.boolean().nullish(),
    source_url: z.string().nullish(),
    candidate_id: z.number().int().nullish(),
    card_metadata_status: z.string().nullish(),
    rank: z.number().nullish(),
    detail_action: z.string().nullish(),
    import_payload: z.object({ url: z.string().nullish() }).passthrough().nullish(),
  })
  .passthrough();
export type DiscoveredCandidate = z.infer<typeof discoveredCandidateSchema>;
export const importCandidateRequestSchema = z.object({
  candidate_id: z.number().int().positive().optional(),
  source_url: importUrlSchema.optional(),
  force_refresh: z.boolean().optional(),
}).refine((value) => value.candidate_id !== undefined || value.source_url !== undefined, {
  message: "اطلاعات کارت انتخاب‌شده کامل نیست.",
});
export const candidateImportStatusSchema = z.object({
  job_id: z.number().int().positive(),
  status: z.string().min(1),
  ready_for_frontend: z.boolean(),
  redirect_ready: z.boolean(),
  selected_product_slug: z.string().nullish(),
  product_detail_url: z.string().nullish(),
  next_poll_after_seconds: z.number().nonnegative(),
  candidates: z.array(z.object({
    candidate_id: z.number().int().positive().nullish(),
    source_url: z.string().nullish(),
    status: z.string().nullish(),
    import_timeout: z.boolean().optional(),
    slug: z.string().nullish(),
    detail_url: z.string().nullish(),
  }).passthrough()),
}).passthrough();
export const importJobSchema = z
  .object({
    id: z.number().int().positive(),
    status: z.enum(["pending", "processing", "done", "failed"]),
    ready_for_frontend: z.boolean(),
    next_poll_after_seconds: z.number().nonnegative(),
    status_label: z.string().optional(),
    error_message: z.string().optional(),
    import_type: z.string(),
    result_mode: z.string(),
    results: z.array(z.union([importProductSchema, discoveredCandidateSchema])),
    product: z.union([importProductSchema, discoveredCandidateSchema]).nullish(),
    main_product: discoveredCandidateSchema.nullish(),
    other_products: z.array(discoveredCandidateSchema).optional(),
    discovery: z.object({
      candidates: z.array(discoveredCandidateSchema).optional(),
      pagination: z.object({
        has_more: z.boolean().optional(),
        next_cursor: z.string().nullish(),
      }).passthrough().optional(),
    }).passthrough().optional(),
  })
  .passthrough();
