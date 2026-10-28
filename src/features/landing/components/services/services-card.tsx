import { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";

type ServicesCardProps = {
  icon: ReactNode;
  title: string;
  description: string;
  mobileDescription?: string;
};

export function ServicesCard({ icon, title, description, mobileDescription }: ServicesCardProps) {
  return (
    <article dir="rtl" className="flex w-full flex-col gap-2.5 rounded-lg bg-white px-4 py-4 lg:px-6 lg:py-8">
      <div className="flex flex-col items-start gap-2.5 lg:items-stretch lg:gap-6">
        <div className="[&_img]:size-8 lg:[&_img]:size-auto">{icon}</div>

        <h3 className="text-xs font-medium leading-5 text-neutral-1000 lg:text-heading-2xs lg:leading-8">
          {title}
        </h3>

        {mobileDescription ? (
          <>
            <p className="whitespace-pre-line text-[10px] leading-[18px] text-neutral-700 lg:hidden">
              {mobileDescription}
            </p>
            <p className="hidden whitespace-pre-line text-body-lg leading-10 text-neutral-700 lg:block">
              {description}
            </p>
          </>
        ) : (
          <p className="whitespace-pre-line text-[10px] leading-[18px] text-neutral-700 lg:text-body-lg lg:leading-10">
            {description}
          </p>
        )}
        <span className="flex items-center gap-1 text-[10px] text-primary-500 lg:hidden">
          جزئیات <ArrowLeft size={12} aria-hidden="true" />
        </span>
      </div>
    </article>
  );
}
