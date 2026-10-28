import {
  ContactFormData,
  ContactSubmitResponse,
} from "../";

const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const contactApi = {
  async submit(
    payload: ContactFormData
  ): Promise<ContactSubmitResponse> {
    await delay(1000);

    console.log("Contact Payload:", payload);

    return {
      success: true,
      message: "پیام شما با موفقیت ارسال شد.",
    };
  },
};