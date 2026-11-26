import PageLoading from "./page-loading";
import { CloudOff, MessageSquare } from "lucide-react";

type SectionDataStateProps = {
  kind?: "loading" | "empty" | "error";
  title: string;
  description: string;
  onRetry?: () => void;
};

export function SectionDataState({
  kind = "empty",
  title,
  description,
  onRetry,
}: SectionDataStateProps) {
  if (kind === "loading") return <PageLoading title={title} description={description} className="rounded-xl border border-neutral-200 bg-white px-5 lg:px-8" />;
  const Icon = kind === "error" ? CloudOff : MessageSquare;
  return (
    <div
      role={kind === "error" ? "alert" : "status"}

      className="flex w-full flex-col items-center gap-3 rounded-xl border border-neutral-200 bg-white px-5 py-8 text-center lg:px-8 lg:py-12"
    >
      <span className="bg-primary-50 text-primary-500 flex size-12 items-center justify-center rounded-full">
        <Icon
          size={24}
          aria-hidden="true"
        />
      </span>
      <p className="text-mobile-label-l lg:text-desktop-label-l text-neutral-1000">
        {title}
      </p>
      <p className="text-mobile-body-s lg:text-desktop-body-s max-w-md leading-relaxed text-neutral-800">
        {description}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="text-mobile-label-m lg:text-desktop-label-m bg-primary-500 hover:bg-primary-600 focus-visible:ring-primary-300 mt-1 rounded-lg px-4 py-2.5 text-white focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          تلاش دوباره
        </button>
      )}
    </div>
  );
}
