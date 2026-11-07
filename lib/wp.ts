/**
 * WordPress / WooCommerce bridge.
 *
 * The headless contract is defined by (and served from) our own mu-plugin
 * `wordpress/vikak-headless.php`, not by guessing at Store API internals:
 *
 *   GET  /wp-json/vikak/v1/catalog            → { products: CatalogProduct[] }
 *   GET  /wp-json/vikak/v1/catalog/<slug>     → { product: CatalogProduct }
 *   POST /wp-json/vikak/v1/cart   {items}     → { checkout_url }
 *
 * WooCommerce stays authoritative for price, stock and the cart/checkout
 * (Zarinpal lives there); this file only reads and maps.
 */
import type { Product, RoastLevel, Variant } from '@/data/products';

export type CatalogVariant = {
  id: string | number;
  label: string;
  grams: number;
  price: number;
  kg_price?: number | null;
  in_stock?: boolean;
  note?: string | null;
  woo_variation_id?: number;
};

export type CatalogProduct = {
  id: string | number;
  slug: string;
  title: string;
  origin?: string;
  origin_fa?: string;
  roaster?: string;
  roast?: string;
  roast_fa?: string;
  notes?: string[];
  body?: string;
  image?: string;
  tag?: string | null;
  variants: CatalogVariant[];
  woo_id?: number;
};

const ROASTS: RoastLevel[] = ['green', 'light', 'medium', 'medium-dark', 'dark', 'espresso'];

export function wpBaseUrl(): string | null {
  const raw = process.env.NEXT_PUBLIC_WP_BASE_URL || process.env.WP_BASE_URL || '';
  const trimmed = raw.trim().replace(/\/+$/, '');
  return trimmed ? trimmed : null;
}

export function isHeadlessEnabled(): boolean {
  return Boolean(wpBaseUrl());
}

/** Seconds between refreshes of WP-backed data (ISR). */
export const REVALIDATE_SECONDS = Number(process.env.WP_REVALIDATE_SECONDS || 300);

async function getJson<T>(path: string, init?: RequestInit): Promise<T | null> {
  const base = wpBaseUrl();
  if (!base) return null;

  try {
    const res = await fetch(`${base}${path}`, {
      ...init,
      headers: { Accept: 'application/json', ...(init?.headers || {}) },
      // a WP instance that is down must degrade to the bundled catalogue, not
      // break the build or the page. `no-store` keeps Next from caching a
      // failed or stale catalogue response across requests; pages opt into
      // ISR themselves via `export const revalidate`.
      cache: 'no-store',
    });
    if (!res.ok) {
      console.warn(`[vikak] WP ${path} → ${res.status}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (error) {
    console.warn(`[vikak] WP unreachable (${path}):`, (error as Error).message);
    return null;
  }
}

function toRoast(value: string | undefined): RoastLevel {
  const v = (value || '').toLowerCase().trim() as RoastLevel;
  return ROASTS.includes(v) ? v : 'medium';
}

function toProduct(raw: CatalogProduct): Product {
  const variants: Variant[] = (raw.variants || []).map((v, index) => ({
    id: String(v.id ?? `v${index}`),
    label: v.label,
    grams: Number(v.grams) || 250,
    price: Number(v.price) || 0,
    kgPrice: v.kg_price ?? undefined,
    note: v.note ?? undefined,
    wooVariationId: v.woo_variation_id ?? undefined,
  }));

  return {
    id: String(raw.id ?? raw.slug),
    slug: raw.slug,
    title: raw.title,
    origin: raw.origin || 'Blend',
    originFa: raw.origin_fa || 'ترکیبی',
    roaster: raw.roaster || 'ویکک',
    roast: toRoast(raw.roast),
    roastFa: raw.roast_fa || 'رست متوسط',
    notes: raw.notes?.length ? raw.notes : ['شکلات', 'کارامل', 'بدنه‌ی متعادل'],
    body: raw.body || 'بدنه متوسط',
    variants,
    image: raw.image || '/images/product-bag.jpg',
    tag: raw.tag ?? undefined,
  };
}

/** Every published product, or null when WP is not configured/reachable. */
export async function fetchCatalog(): Promise<Product[] | null> {
  const data = await getJson<{ products?: CatalogProduct[] }>('/wp-json/vikak/v1/catalog?per_page=200');
  if (!data?.products?.length) return null;
  // A product without a priced variant must never reach the UI: a zero price
  // would render as "۰ تومان" and could be checked out for free.
  const mapped = data.products.map(toProduct).filter(hasPricedVariant);
  return mapped.length ? mapped : null;
}

/** True when at least one variant carries a positive integer price. */
export function hasPricedVariant(product: Product): boolean {
  return product.variants.some(v => Number.isInteger(v.price) && v.price > 0);
}

export async function fetchProduct(slug: string): Promise<Product | null> {
  const data = await getJson<{ product?: CatalogProduct }>(
    `/wp-json/vikak/v1/catalog/${encodeURIComponent(slug)}`,
  );
  if (!data?.product) return null;
  const product = toProduct(data.product);
  return hasPricedVariant(product) ? product : null;
}

/**
 * Only trust a checkout URL that points at the configured backend origin.
 *
 * The URL comes from our own mu-plugin, but it crosses a network boundary and is
 * then handed to `window.location` in the browser. A compromised or misconfigured
 * WordPress could return an arbitrary origin and turn the storefront into an open
 * redirect, so the value is validated here instead of being trusted.
 */
export function assertSameOrigin(url: string, base: string): string | null {
  try {
    const target = new URL(url);
    const backend = new URL(base);
    if (target.protocol !== 'https:' && target.protocol !== 'http:') return null;
    if (target.origin !== backend.origin) return null;
    return target.toString();
  } catch {
    return null;
  }
}

/** Ask WP to build a real WooCommerce cart and hand back the checkout URL. */
export async function createCheckout(
  items: { variation_id: number | string; quantity: number }[],
): Promise<{ checkoutUrl?: string; error?: string }> {
  const base = wpBaseUrl();
  if (!base) return { error: 'WORDPRESS_NOT_CONFIGURED' };

  try {
    const res = await fetch(`${base}/wp-json/vikak/v1/cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ items }),
      cache: 'no-store',
    });

    const payload = (await res.json().catch(() => ({}))) as {
      checkout_url?: string;
      message?: string;
    };

    if (!res.ok) return { error: payload.message || `WP_${res.status}` };
    if (!payload.checkout_url) return { error: 'NO_CHECKOUT_URL' };
    const safe = assertSameOrigin(payload.checkout_url, base);
    if (!safe) return { error: 'UNTRUSTED_CHECKOUT_URL' };
    return { checkoutUrl: safe };
  } catch (error) {
    return { error: (error as Error).message };
  }
}
