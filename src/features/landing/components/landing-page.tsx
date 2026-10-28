import { CalculatingSection } from "@/features/calculating/components/calculating-section";
import { HeroSection } from "./hero/hero-section";
import { ProductSources } from "./product-sources/product-sources";
import { ServicesSection } from "./services/services-section";
import { TrustedCustomers } from "./trusted-customers/trusted-customers";
import { SalesExpertsSection } from "@/features/sales-experts/components/SalesExpertsSection";

export function LandingPage() {
  return (
    <div className="flex flex-col">
      {" "}
      <HeroSection />
      <ServicesSection />
      <TrustedCustomers />
      <ProductSources />
      <CalculatingSection />
      <SalesExpertsSection />
    </div>
  );
}
