/**
 * Canonical origin for metadata, sitemap and robots.
 *
 * The storefront is moving to a `.ir` domain, so the origin must never be
 * hardcoded in components. Set NEXT_PUBLIC_SITE_URL in production; the
 * fallback keeps local builds and previews valid without inventing a domain.
 */
export function siteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/+$/, '');
  return 'http://localhost:3000';
}

/** Absolute URL for a path, safe for metadata and sitemaps. */
export function absoluteUrl(path = '/'): string {
  const base = siteUrl();
  return path === '/' ? base : `${base}${path.startsWith('/') ? path : `/${path}`}`;
}
