export const NAVIGATION_QUERY_KEYS = {
  all: ["navigation"] as const,

  menus: () => [
    ...NAVIGATION_QUERY_KEYS.all,
    "menus",
  ] as const,
};