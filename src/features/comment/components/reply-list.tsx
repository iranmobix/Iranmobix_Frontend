"use client";

import { useCommentReplies } from "../hooks/use-comment-replies";

type Props = {
  commentId: number;
};

export default function ReplyList({ commentId }: Props) {
  const { data, isLoading } = useCommentReplies(commentId);

  if (isLoading) {
    return <p>در حال دریافت پاسخ‌ها...</p>;
  }

  return (
    <div>
      {data?.map((reply) => (
        <p key={reply.id}>{reply.body}</p>
      ))}
    </div>
  );
}
