export interface CreateCommentPayload {
  body: string;

  commentable_type: "article";

  object_id: number;

  parent_id?: number;
}