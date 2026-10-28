export const FAQ_QUERY_KEYS = {
  all: ["faqs"] as const,

  lists: () => [...FAQ_QUERY_KEYS.all, "list"] as const,

  list: (search?: string) =>
    [...FAQ_QUERY_KEYS.lists(), { search }] as const,

  details: () => [...FAQ_QUERY_KEYS.all, "detail"] as const,

  detail: (slug: string) =>
    [...FAQ_QUERY_KEYS.details(), slug] as const,
};