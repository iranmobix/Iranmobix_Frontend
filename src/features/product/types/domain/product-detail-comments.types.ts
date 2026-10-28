// Empty API examples do not establish comment item schemas yet.
// Keep those values unknown until the product comment contract is available.
export interface ProductCommentCollection {
  count: number;
  results: unknown[];
}

export interface ProductSourceComments {
  count: number;
  productReviews: unknown[];
  storeReviews: unknown[];
}

export interface ProductComments extends ProductCommentCollection {
  mainComments: ProductCommentCollection;
  sourceComments: ProductSourceComments;
}
