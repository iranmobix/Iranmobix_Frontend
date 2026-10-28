import { TrustedCustomersHeader } from "./trusted-customers-header";
import { TrustedCustomersSlider } from "./trusted-customers-slider";

export function TrustedCustomers() {
  return (
    <section className="w-full bg-neutral-100 pb-8 lg:pb-24">
      <div className="container mx-auto flex flex-col items-center justify-center gap-4 lg:gap-12">
        <TrustedCustomersHeader />
        <TrustedCustomersSlider />
      </div>
    </section>
  );
}
