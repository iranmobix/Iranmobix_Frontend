import { ContactForm } from "@/features/contact-us/components/contact-form";

export default function cantactUsPage() {
  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">تماس با ما </h1>

      <ContactForm />
    </div>
  );
}
