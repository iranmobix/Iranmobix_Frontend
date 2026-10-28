"use client";

import { useComments } from "../hooks/use-comments";

import CommentItem from "./comment-item";

type Props = {
  slug: string;
};

export default function CommentList({ slug }: Props) {
  const { data, isLoading, isError } = useComments(slug);

  if (isLoading) {
    return <p>در حال دریافت کامنت‌ها...</p>;
  }

  if (isError) {
    return <p>خطا در دریافت کامنت‌ها</p>;
  }

  if (!data?.length) {
    return <p>هنوز کامنتی ثبت نشده</p>;
  }

  return (
    <div>
      {data.map((comment) => (
        <CommentItem key={comment.id} comment={comment} />
      ))}
    </div>
  );
}
