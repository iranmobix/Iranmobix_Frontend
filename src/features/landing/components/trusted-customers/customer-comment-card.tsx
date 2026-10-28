import { Star } from "lucide-react";

type CustomerCommentCardProps = {
  rating: number;
  comment: string;
  author: string;
  mobileAuthor?: string;
};

export function CustomerCommentCard({
  rating,
  comment,
  author,
  mobileAuthor,
}: CustomerCommentCardProps) {
  return (
    <article dir="rtl" className="flex h-full w-full max-w-[1196px] flex-col items-start gap-5 rounded-xl bg-white px-5 py-5 text-right shadow-sm lg:gap-6 lg:rounded-md lg:px-10 lg:py-20 lg:shadow-none">
      <div className="flex items-center gap-3 lg:gap-1">
        {Array.from({ length: rating }, (_, index) => (
          <Star
            key={index}
            className="size-4 fill-[#dfbd50] text-[#dfbd50] lg:size-5 lg:fill-warning lg:text-warning"
          />
        ))}
      </div>

      <p className="w-full text-justify text-base leading-7 text-neutral-800 lg:text-right lg:text-body-lg lg:leading-[30px] lg:text-neutral-1000">
        {comment}
      </p>

      <span className="text-base font-medium text-neutral-800 lg:text-heading-2xs lg:text-neutral-1000">
        <span className="lg:hidden">{mobileAuthor ?? author}</span>
        <span className="hidden lg:inline">{author}</span>
      </span>
    </article>
  );
}
