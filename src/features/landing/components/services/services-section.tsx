import Image from "next/image";
import { ServicesReveal } from "./services-reveal";
import { ServicesCard } from "./services-card";
import { services } from "./services.data";

export function ServicesSection() {
  return (
    <ServicesReveal>
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-4 px-2.5 py-6 lg:gap-10 lg:px-[120px] lg:py-20">
        <h1
          data-service-reveal
          className="text-neutral-1000 lg:text-heading-lg text-center text-sm font-semibold"
        >
          خدمات ما
        </h1>

        <div
          data-service-grid
          className="grid grid-cols-1 gap-3 lg:grid-cols-3 lg:gap-6"
        >
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
    </ServicesReveal>
  );
}
