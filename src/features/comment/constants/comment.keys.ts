export const COMMENT_QUERY_KEYS = {
  all: ["comments"] as const,

  lists: () =>
    [
      ...COMMENT_QUERY_KEYS.all,
      "list",
    ] as const,

  article: (slug: string) =>
    [
      ...COMMENT_QUERY_KEYS.lists(),
      "article",
      slug,
    ] as const,

  replies: (commentId: number) =>
    [
      ...COMMENT_QUERY_KEYS.all,
      "replies",
      commentId,
    ] as const,
};