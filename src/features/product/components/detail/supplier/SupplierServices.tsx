type SupplierServicesProps = {
  services: string[];
};

const SupplierServices = ({ services }: SupplierServicesProps) => {
  const visibleServices = [...new Set(services.map((service) => service.trim()).filter(Boolean))];
  if (!visibleServices.length) return null;
  return (
    <div className="mt-4 border-t border-[#e5e1dc] pt-4 first:mt-0 first:border-t-0 first:pt-0">
      <h3 className="text-xs text-neutral-700 lg:text-sm">خدمات و کنترل کیفیت</h3>

      <ul className="mt-4 grid grid-cols-1 gap-4 pb-2 text-xs text-neutral-700 sm:grid-cols-2 lg:grid-cols-4">
        {visibleServices.map((service) => (
          <li key={service} className="flex items-start gap-2">
            <span aria-hidden="true">•</span>
            <span>{service}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SupplierServices;
