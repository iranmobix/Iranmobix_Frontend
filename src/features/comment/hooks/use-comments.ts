import { useQuery } from "@tanstack/react-query";
import { COMMENT_QUERY_KEYS } from "../constants/comment.keys";
import type { Comment } from "../types/comment.types";
import { fetchArticleComments } from "../services/comment.service";


export function useComments(
  slug: string
) {

  return useQuery<Comment[]>({
    queryKey:
      COMMENT_QUERY_KEYS.article(slug),

    queryFn:
      () => fetchArticleComments(slug),

    enabled:
      Boolean(slug),

    staleTime:
      1000 * 60 * 5,

    gcTime:
      1000 * 60 * 10,

    retry:
      1,

    refetchOnWindowFocus:
      false,
  });

}