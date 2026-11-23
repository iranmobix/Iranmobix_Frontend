import { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";

type ServicesCardProps = {
  icon: ReactNode;
  title: string;
  description: string;
  mobileDescription?: string;
};

export function ServicesCard({
  icon,
  title,
  description,
  mobileDescription,
}: ServicesCardProps) {
  return (
    <article
      data-service-reveal
      dir="rtl"
      className="flex w-full flex-col gap-2.5 rounded-lg bg-white px-4 py-4 lg:px-6 lg:py-8"
    >
      <div className="flex flex-col items-start gap-2.5 lg:items-stretch lg:gap-6">
        <div className="[&_img]:size-8 lg:[&_img]:size-auto">{icon}</div>

        <h3 className="text-mobile-h6 text-neutral-1000 lg:text-heading-2xs lg:leading-8 lg:font-medium">
          {title}
        </h3>

        {mobileDescription ? (
          <>
            <p className="text-mobile-body-s leading-[calc(1em+8px)] whitespace-pre-line text-neutral-900 lg:hidden">
              {mobileDescription}
            </p>
            <p className="text-body-lg hidden leading-10 whitespace-pre-line text-neutral-700 lg:block">
              {description}
            </p>
          </>
        ) : (
          <p className="text-mobile-body-s lg:text-body-lg leading-[calc(1em+8px)] whitespace-pre-line text-neutral-900 lg:leading-10 lg:text-neutral-700">
            {description}
          </p>
        )}
        <span className="text-mobile-label-l text-primary-600 flex items-center gap-1 lg:hidden">
          جزئیات <ArrowLeft size={18} className="shrink-0" aria-hidden="true" />
        </span>
      </div>
    </article>
  );
}
