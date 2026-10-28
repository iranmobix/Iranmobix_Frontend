"use client";

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import {
  commentSchema,
  type CommentFormValues,
} from "../schemas/comment.schema";

import { useCreateComment } from "../hooks/use-create-comment";

type Props = {
  articleId: number;
  slug: string;
};

export default function CommentForm({ articleId, slug }: Props) {
  const { register, handleSubmit, reset } = useForm<CommentFormValues>({
    resolver: zodResolver(commentSchema),

    defaultValues: {
      body: "",
    },
  });

  const createComment = useCreateComment(slug);

  function onSubmit(values: CommentFormValues) {
    createComment.mutate(
      {
        body: values.body,

        commentable_type: "article",

        object_id: articleId,
      },

      {
        onSuccess() {
          reset();
        },
      },
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <textarea {...register("body")} placeholder="نظر خود را بنویسید..." />

      <button type="submit" disabled={createComment.isPending}>
        {createComment.isPending ? "در حال ارسال..." : "ارسال"}
      </button>
    </form>
  );
}
