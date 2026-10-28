"use client";

import { useContactForm } from "../hooks/use-contact-form";
import { useSubmitContact } from "../hooks/use-submit-contact";

export function ContactForm() {
  const form = useContactForm();

  const mutation = useSubmitContact();
  const onSubmit = form.handleSubmit((data) => {
    mutation.mutate(data);
  });

  return (
    <form onSubmit={onSubmit}>
      <div>
        <input
          type="text"
          placeholder="نام کاربری"
          {...form.register("username")}
        />

        {form.formState.errors.username && (
          <p>{form.formState.errors.username.message}</p>
        )}
      </div>
      <div>
        <input type="email" placeholder="ایمیل" {...form.register("email")} />

        {form.formState.errors.email && (
          <p>{form.formState.errors.email.message}</p>
        )}
      </div>
      <div>
        <textarea placeholder="پیام شما" {...form.register("message")} />

        {form.formState.errors.message && (
          <p>{form.formState.errors.message.message}</p>
        )}
      </div>
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "در حال ارسال..." : "ارسال"}
      </button>
    </form>
  );
}
