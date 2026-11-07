'use client';

import { useMemo, useState } from 'react';
import ProductCard from './product-card';
import { products, roastFilters, roasters, lowestKgPrice, type RoastLevel } from '@/data/products';
import { toFa } from '@/lib/format';

type Sort = 'recommended' | 'kg-asc' | 'kg-desc' | 'price-asc';

const SORTS: { id: Sort; label: string }[] = [
  { id: 'recommended', label: 'پیشنهاد ویکک' },
  { id: 'kg-asc', label: 'ارزان‌ترین به کیلو' },
  { id: 'kg-desc', label: 'گران‌ترین به کیلو' },
  { id: 'price-asc', label: 'ارزان‌ترین بسته' },
];

export default function Catalogue() {
  const [roast, setRoast] = useState<RoastLevel | 'all'>('all');
  const [roaster, setRoaster] = useState<string>('all');
  const [sort, setSort] = useState<Sort>('recommended');

  const list = useMemo(() => {
    const filtered = products.filter(
      p => (roast === 'all' || p.roast === roast) && (roaster === 'all' || p.roaster === roaster),
    );

    const sorted = [...filtered];
    switch (sort) {
      case 'kg-asc':
        sorted.sort((a, b) => lowestKgPrice(a) - lowestKgPrice(b));
        break;
      case 'kg-desc':
        sorted.sort((a, b) => lowestKgPrice(b) - lowestKgPrice(a));
        break;
      case 'price-asc':
        sorted.sort(
          (a, b) =>
            Math.min(...a.variants.map(v => v.price)) - Math.min(...b.variants.map(v => v.price)),
        );
        break;
      default:
        // keep curated order: greens → espresso staples → single origins
        break;
    }
    return sorted;
  }, [roast, roaster, sort]);

  return (
    <section className="section" id="products" style={{ scrollMarginTop: '90px' }}>
      <div className="shell">
        <div className="section-head">
          <div>
            <span className="eyebrow">فهرست محصولات — آبان ۱۴۰۵</span>
            <h2 className="section-title">
              پنجاه‌وچند دانه‌ی <em className="latin">100% Arabica</em>، از دان سبز تا اسپشیالتی
            </h2>
            <p className="lede">
              هر ردیف، یک انتخاب واقعی از فهرست موجودی است: خاستگاه، رستر، وزن بسته و نرخ مصوب.
              قیمت‌ها به تومان و برای همان بسته‌ای است که انتخاب می‌کنید.
            </p>
          </div>
        </div>

        <div className="toolbar" role="group" aria-label="فیلتر رست">
          {roastFilters.map(f => (
            <button
              key={f.id}
              className="chip"
              aria-pressed={roast === f.id}
              onClick={() => setRoast(f.id)}
              type="button"
            >
              {f.label}
            </button>
          ))}

          <div className="toolbar-end">
            <label htmlFor="roaster" className="muted" style={{ fontSize: '0.78rem' }}>
              رستر
            </label>
            <select
              id="roaster"
              className="select"
              value={roaster}
              onChange={e => setRoaster(e.target.value)}
            >
              <option value="all">همه‌ی رسترها</option>
              {roasters.map(r => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>

            <select
              className="select"
              aria-label="ترتیب نمایش"
              value={sort}
              onChange={e => setSort(e.target.value as Sort)}
            >
              {SORTS.map(s => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="muted" style={{ fontSize: '0.8rem', marginBottom: '1.5rem' }}>
          {toFa(list.length)} محصول نمایش داده می‌شود
        </p>

        <div className="grid">
          {list.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {list.length === 0 ? (
          <div className="notice">
            با این فیلترها محصولی پیدا نشد. فیلتر رست را روی «همه» بگذارید یا رستر را عوض کنید.
          </div>
        ) : null}
      </div>
    </section>
  );
}
