export interface CommentApiResponse {
  id: number;
  body: string;
  parent: number | null;
  author: number;
  author_name: string;
  commentable_type: string;
  commentable_id: number;
  status: number;
  seen: number;
  approved: number;
  created_at: string;
  replies: CommentApiResponse[] | string;
}