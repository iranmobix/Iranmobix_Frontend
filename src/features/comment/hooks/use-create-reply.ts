import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  submitComment,
} from "../services/comment.service";

import {
  COMMENT_QUERY_KEYS,
} from "../constants/comment.keys";

import type {
  CreateCommentPayload,
} from "../types/comment.payload.types";


export function useCreateReply(
  commentId: number
) {

  const queryClient = useQueryClient();


  return useMutation({

    mutationFn:
      (payload: CreateCommentPayload) =>
        submitComment(payload),


    onSuccess: () => {

      queryClient.invalidateQueries({

        queryKey:
          COMMENT_QUERY_KEYS.replies(commentId),

      });

    },

  });

}