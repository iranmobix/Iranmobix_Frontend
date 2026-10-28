import Image from "next/image";
import { ServicesCard } from "./services-card";
import { services } from "./services.data";

export function ServicesSection() {
  return (
    <section id="services" className="flex justify-center bg-[#F6F5F3]">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-4 px-2.5 py-6 lg:gap-10 lg:px-[120px] lg:py-20">
        <h1 className="text-center text-sm font-semibold text-neutral-1000 lg:text-heading-lg">
          خدمات ما
        </h1>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3 lg:gap-6">
          {services.map((service) => (
            <ServicesCard
              key={service.title}
              icon={<Image src={service.icon} alt={service.title} />}
              title={service.title}
              description={service.description}
              mobileDescription={service.mobileDescription}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
