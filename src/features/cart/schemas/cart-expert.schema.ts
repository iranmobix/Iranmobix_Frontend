import { z } from "zod";

/** Preserve the assigned expert returned by the order API, including extra profile fields. */
export const cartAssignedExpertSchema = z
  .object({
    id: z.number().int().positive().optional(),
    name: z.string().optional(),
    mobile: z.string().nullish().catch(null),
    phone: z.string().nullish().catch(null),
    email: z.string().nullish().catch(null),
    whatsapp_url: z.string().nullish().catch(null),
    telegram_url: z.string().nullish().catch(null),
    image: z.string().nullish().catch(null),
    profile_photo: z.string().nullish().catch(null),
  })
  .passthrough();

export type CartAssignedExpert = z.infer<typeof cartAssignedExpertSchema>;
