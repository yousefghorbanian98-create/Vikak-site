import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import ProductBuyPanel from '@/components/product-buy-panel';
import ProductCard from '@/components/product-card';
import { products } from '@/data/products';

export function generateStaticParams() {
  return products.map(p => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = products.find(p => p.slug === slug);
  if (!product) return { title: 'محصول پیدا نشد' };

  return {
    title: `${product.title} از ${product.roaster}`,
    description: `${product.title} از ${product.roaster}. ${product.roastFa}، ۱۰۰٪ عربیکا، یادداشت‌های ${product.notes.join('، ')}.`,
    openGraph: {
      title: `${product.title} از ${product.roaster}`,
      description: `${product.roastFa} · ۱۰۰٪ عربیکا · ${product.notes.join(' · ')}`,
      images: [{ url: product.image }],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = products.find(p => p.slug === slug);
  if (!product) notFound();

  const related = products
    .filter(p => p.id !== product.id && (p.origin === product.origin || p.roast === product.roast))
    .slice(0, 3);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    image: [product.image],
    description: `${product.roastFa}، ۱۰۰٪ عربیکا، ${product.notes.join(' / ')}`,
    brand: { '@type': 'Brand', name: product.roaster },
    offers: product.variants.map(v => ({
      '@type': 'Offer',
      priceCurrency: 'IRR',
      price: v.price * 10,
      availability: 'https://schema.org/InStock',
      name: v.label,
    })),
  };

  return (
    <>
      <SiteHeader />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main>
        <div className="shell">
          <div className="pdp">
            <div className="pdp-media">
              <img src={product.image} alt={`${product.title} از ${product.roaster}`} />
            </div>
            <ProductBuyPanel product={product} />
          </div>
        </div>

        <section className="section" style={{ borderTop: '1px solid var(--line)' }}>
          <div className="shell">
            <div className="section-head">
              <div>
                <span className="eyebrow">هم‌خانواده</span>
                <h2 className="section-title">اگر این را دوست داشتید</h2>
              </div>
              <Link href="/#products" className="btn btn-ghost">
                فهرست کامل
                <span aria-hidden="true">←</span>
              </Link>
            </div>
            <div className="grid">
              {related.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
