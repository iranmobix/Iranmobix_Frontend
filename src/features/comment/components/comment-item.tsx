"use client";

import { useState } from "react";
import type { Comment } from "../types/comment.types";

import ReplyList from "./reply-list";

type Props = {
  comment: Comment;
};

export default function CommentItem({ comment }: Props) {
  const [showReplies, setShowReplies] = useState(false);

  return (
    <article>
      <p>{comment.authorName}</p>

      <p>{comment.body}</p>

      <small>{comment.createdAt}</small>

      <button onClick={() => setShowReplies((prev) => !prev)}>
        {showReplies ? "بستن پاسخ‌ها" : "نمایش پاسخ‌ها"}
      </button>

      {showReplies && <ReplyList commentId={comment.id} />}
    </article>
  );
}
