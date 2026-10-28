/** Accept raw slugs and previously escaped route/backend slugs as one identity. */
export function normalizeProductSlug(slug: string): string {
  let normalized = slug.trim();
  // Bound legacy nested escaping; malformed literal percent signs remain safe to encode.
  for (let depth = 0; depth < 5; depth++) {
    try {
      const decoded = decodeURIComponent(normalized);
      if (decoded === normalized) return normalized;
      normalized = decoded;
    } catch {
      return normalized;
    }
  }
  return normalized;
}

export function getProductDetailsHref(slug: string): string {
  return `/products/${encodeURIComponent(normalizeProductSlug(slug))}`;
}

export function getProductDetailApiPath(slug: string): string {
  return `/api/product/${encodeURIComponent(normalizeProductSlug(slug))}/`;
}
