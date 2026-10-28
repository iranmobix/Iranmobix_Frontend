
import { mapComment } from "../mappers/comment.mapper";

import type { Comment } from "../types/comment.types";
import type { CreateCommentPayload } from "../types/comment.payload.types";
import { commentApi } from "../api/comments.api";


export async function fetchArticleComments(
  slug: string
): Promise<Comment[]> {

  const response =
    await commentApi.getArticleComments(slug);

  return response.map(mapComment);
}


export async function submitComment(
  payload: CreateCommentPayload
): Promise<Comment> {

  const response =
    await commentApi.create(payload);

  return mapComment(response);
}


export async function fetchCommentReplies(
  commentId: number
): Promise<Comment[]> {

  const response =
    await commentApi.getReplies(commentId);

  return response.map(mapComment);
}