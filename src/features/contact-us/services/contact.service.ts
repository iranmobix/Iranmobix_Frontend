import {
    contactApi,
  ContactFormData,
  ContactSubmitResponse,
} from "../";

export const contactService = {
  submit(
    payload: ContactFormData
  ): Promise<ContactSubmitResponse> {
    return contactApi.submit(payload);
  },
};