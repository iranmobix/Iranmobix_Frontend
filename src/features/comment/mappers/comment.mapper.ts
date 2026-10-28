import type { CommentApiResponse } from "../types/comment.api.types";
import type { Comment } from "../types/comment.types";

export function mapComment(dto: CommentApiResponse): Comment {
  return {
    id: dto.id,

    body: dto.body,

    authorName: dto.author_name,

    createdAt: dto.created_at,

    parentId: dto.parent === 0 ? null : dto.parent,

    approved: dto.approved === 1,

    replies: Array.isArray(dto.replies)
      ? dto.replies.map(mapComment)
      : [],
  };
}