import { useQuery } from "@tanstack/react-query";

import { fetchCommentReplies } from "../services/comment.service";

import { COMMENT_QUERY_KEYS } from "../constants/comment.keys";
import type { Comment } from "../types/comment.types";

export function useCommentReplies(commentId: number) {
  return useQuery<Comment[]>({
    queryKey: COMMENT_QUERY_KEYS.replies(commentId),

    queryFn: () => fetchCommentReplies(commentId),

    enabled: Boolean(commentId),

    staleTime: 1000 * 60 * 5,

    gcTime: 1000 * 60 * 10,
  });
}
