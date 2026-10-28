import { useMutation } from "@tanstack/react-query";

import { contactService } from "../services/contact.service";

export function useSubmitContact() {
  return useMutation({
    mutationFn: contactService.submit,

    onSuccess: (response) => {
      console.log(response);
    },

    onError: (error) => {
      console.error(error);
    },
  });
}