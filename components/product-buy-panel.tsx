'use client';

import Link from 'next/link';
import { useCart } from './cart-provider';
import { useState } from 'react';
import { priceLabel, gramsLabel, toFa } from '@/lib/format';
import type { Product } from '@/data/products';

export default function ProductBuyPanel({
  product,
  headless = false,
}: {
  product: Product;
  headless?: boolean;
}) {
  const { add, open } = useCart();
  const [variantId, setVariantId] = useState(product.variants[0].id);
  const [qty, setQty] = useState(1);

  const variant = product.variants.find(v => v.id === variantId) ?? product.variants[0];

  return (
    <div className="pdp-copy">
      <nav className="crumbs" aria-label="مسیر صفحه">
        <Link href="/">خانه</Link>
        <span aria-hidden="true">/</span>
        <Link href="/#products">فروشگاه</Link>
        <span aria-hidden="true">/</span>
        <span style={{ color: 'var(--bone-dim)' }}>{product.title}</span>
      </nav>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <span className="eyebrow">
          {product.originFa} · {product.roaster}
        </span>
        <h1 className="pdp-title">{product.title}</h1>

        <div className="pdp-meta">
          <span>{product.roastFa}</span>
          <span>{product.body}</span>
          <span>۱۰۰٪ عربیکا</span>
          {variant.kgPrice ? <span>کیلویی {priceLabel(variant.kgPrice)}</span> : null}
        </div>

        <div className="notes-list">
          <div>
            <span>خاستگاه</span>
            <b>
              {product.originFa} <span className="latin" style={{ fontSize: '0.75rem' }}>{product.origin}</span>
            </b>
          </div>
          <div>
            <span>پروفایل</span>
            <b>{product.notes[0]}</b>
          </div>
          <div>
            <span>بدنه</span>
            <b>{product.body}</b>
          </div>
        </div>
      </div>

      <div className="variants">
        <span className="variants-label">وزن و بسته‌بندی</span>
        {product.variants.map(v => (
          <button
            key={v.id}
            type="button"
            className="variant"
            aria-pressed={variantId === v.id}
            onClick={() => setVariantId(v.id)}
          >
            <span className="variant-main">
              <b>{v.label}</b>
              <small>
                {gramsLabel(v.grams)}
                {v.kgPrice ? ` · کیلویی ${priceLabel(v.kgPrice)}` : ''}
                {v.note ? ` · ${v.note}` : ''}
              </small>
            </span>
            <span className="variant-price">{priceLabel(v.price)}</span>
          </button>
        ))}
      </div>

      <div className="buy-row">
        <div className="stepper" aria-label="تعداد">
          <button type="button" onClick={() => setQty(q => Math.max(1, q - 1))} aria-label="کم کردن">
            −
          </button>
          <span className="num" aria-live="polite">
            {toFa(qty)}
          </span>
          <button type="button" onClick={() => setQty(q => Math.min(20, q + 1))} aria-label="زیاد کردن">
            +
          </button>
        </div>

        <button
          className="btn btn-primary btn-block"
          type="button"
          onClick={() => {
            add(
              {
                productId: product.id,
                productSlug: product.slug,
                variantId: variant.id,
                title: product.title,
                variantLabel: variant.label,
                roaster: product.roaster,
                price: variant.price,
                image: product.image,
                wooVariationId: variant.wooVariationId,
              },
              qty,
            );
            open();
          }}
        >
          افزودن به سبد، {priceLabel(variant.price * qty)}
        </button>
      </div>

      {headless ? (
        <p className="fineprint" style={{ margin: 0 }}>
          قیمت و موجودی زنده از ووکامرس خوانده می‌شود؛ پرداخت در درگاه امن ووکامرس انجام می‌شود.
        </p>
      ) : null}

      <p className="fineprint" style={{ margin: 0 }}>
        {variant.note
          ? `توجه: این بسته «${variant.note}» عرضه می‌شود؛ پیش از پرداخت، موجودی تأیید می‌شود.`
          : 'رست سفارشی: دانه‌ها پس از ثبت سفارش برشته و در بسته‌بندی یک‌طرفه با دریچه‌ی تخلیه‌ی گاز ارسال می‌شوند.'}
      </p>

      <div className="accordion">
        <details open>
          <summary>یادداشت‌های طعمی</summary>
          <p>{product.notes.join(' · ')}؛ پروفایل پیشنهادی برای دم‌آوری فیلتر و اسپرسو.</p>
        </details>
        <details>
          <summary>ارسال و نگهداری</summary>
          <p>
            نگهداری در ظرف دربسته، دور از نور و رطوبت. بهترین بازه‌ی مصرف، سه تا شش هفته پس از تاریخ
            رست است. ارسال به سراسر ایران با پست پیشتاز و تیپاکس.
          </p>
        </details>
        <details>
          <summary>خرید عمده و کارگاهی</summary>
          <p>
            برای کافه‌ها و کارگاه‌های رست، بسته‌های ۵ کیلویی و ۲۰ کیلویی دان سبز با نرخ اختصاصی
            عرضه می‌شود. برای دریافت پیش‌فاکتور تماس بگیرید.
          </p>
        </details>
      </div>
    </div>
  );
}
