/**
 * Catalogue access for pages.
 *
 * One rule: WooCommerce when configured, bundled data when not. Pages never
 * branch on this: they always get a Product[].
 */
import { products as bundledProducts } from '@/data/products';
import { fetchCatalog, fetchProduct, isHeadlessEnabled } from './wp';
import type { Product } from '@/data/products';

export type CatalogueSource = 'wordpress' | 'bundled';

export type CatalogueResult = {
  products: Product[];
  source: CatalogueSource;
};

export async function getCatalogue(): Promise<CatalogueResult> {
  if (isHeadlessEnabled()) {
    const live = await fetchCatalog();
    if (live) return { products: live, source: 'wordpress' };
    console.warn('[vikak] WordPress configured but returned no catalogue; using bundled data');
  }
  return { products: bundledProducts, source: 'bundled' };
}

export async function getCatalogueMeta(): Promise<CatalogueSource> {
  return (await getCatalogue()).source;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (isHeadlessEnabled()) {
    const live = await fetchProduct(slug);
    if (live) return live;
  }
  return bundledProducts.find(p => p.slug === slug) ?? null;
}

export async function getAllSlugs(): Promise<string[]> {
  return (await getCatalogue()).products.map(p => p.slug);
}
