'use client';

import Link from 'next/link';
import { useCart } from './cart-provider';
import { priceLabel, gramsLabel, compactToman, toFa } from '@/lib/format';
import { startingPrice, lowestKgPrice, type Product } from '@/data/products';

export default function ProductCard({ product }: { product: Product }) {
  const { add, open } = useCart();
  const start = startingPrice(product);
  const cheapestVariant = [...product.variants].sort((a, b) => a.price - b.price)[0];

  return (
    <article className="card">
      <Link href={`/products/${product.slug}`} className="card-media" aria-label={product.title}>
        <img src={product.image} alt={`${product.title} — ${product.roaster}`} loading="lazy" />
        {product.tag ? <span className="card-tag">{product.tag}</span> : null}
      </Link>

      <div className="card-body">
        <div className="card-origin">
          <i aria-hidden="true" />
          {product.originFa}
          <span className="latin" style={{ fontSize: '0.7rem', color: 'var(--muted-2)' }}>
            {product.origin}
          </span>
        </div>

        <h3>
          <Link href={`/products/${product.slug}`}>{product.title}</Link>
        </h3>

        <span className="card-roaster">
          {product.roaster} · {product.roastFa}
        </span>

        <div className="card-notes">
          {product.notes.slice(0, 3).map(note => (
            <span key={note}>{note}</span>
          ))}
        </div>

        <div className="card-foot">
          <div className="price">
            <b>{priceLabel(start.price)}</b>
            <small>
              {start.grams >= 1000 ? gramsLabel(start.grams) : `${toFa(start.grams)} گرم`} · کیلویی{' '}
              {compactToman(lowestKgPrice(product))}
            </small>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', alignItems: 'flex-end' }}>
            <button
              className="card-cta"
              type="button"
              onClick={() => {
                add({
                  productId: product.id,
                  productSlug: product.slug,
                  variantId: cheapestVariant.id,
                  title: product.title,
                  variantLabel: cheapestVariant.label,
                  roaster: product.roaster,
                  price: cheapestVariant.price,
                  image: product.image,
                });
                open();
              }}
            >
              افزودن به سبد
              <span aria-hidden="true">←</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
