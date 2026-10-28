export type PanelCommentStatus = "approved" | "pending" | "rejected";
export interface PanelComment {
  id: string;
  productTitle: string;
  productImage: string | null;
  body: string;
  status: PanelCommentStatus | null;
}
// Provisional preview transport; replace when the comment API is agreed.
export interface PanelCommentApi {
  id: string;
  product_title: string;
  product_image: string | null;
  body: string;
  status: PanelCommentStatus;
}

export interface CustomerCommentApi {
  product_name?: string | null;
  comment?: string | null;
  status?: string | null;
}
