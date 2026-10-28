import { z } from "zod";


export const commentSchema = z.object({

  body: z
    .string()
    .min(3, "متن کامنت باید حداقل ۳ کاراکتر باشد")
    .max(1000, "متن کامنت نباید بیشتر از ۱۰۰۰ کاراکتر باشد"),

});


export type CommentFormValues =
  z.infer<typeof commentSchema>;