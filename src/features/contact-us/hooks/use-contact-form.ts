import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  contactSchema,
  ContactFormData,
} from "../schemas/contact.schema";

export function useContactForm() {
  return useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),

    defaultValues: {
      username: "",
      email: "",
      message: "",
    },

    mode: "onTouched",
  });
}