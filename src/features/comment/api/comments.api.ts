import type { CommentApiResponse } from "../types/comment.api.types";
import type { CreateCommentPayload } from "../types/comment.payload.types";

import { httpGet, httpPost,  } from "@/shared/api";


class CommentApi {


  async getArticleComments(
    slug: string
  ): Promise<CommentApiResponse[]> {

    return httpGet<CommentApiResponse[]>(
      `/api/articles/${slug}/comments/`
    );

  }


  async create(
    payload: CreateCommentPayload
  ): Promise<CommentApiResponse> {

    return httpPost<CommentApiResponse>(
      "/api/comments/",
      payload
    );

  }


  async getReplies(
    commentId: number
  ): Promise<CommentApiResponse[]> {

    return httpGet<CommentApiResponse[]>(
      `/api/comments/${commentId}/replies/`
    );

  }

}


export const commentApi = new CommentApi();