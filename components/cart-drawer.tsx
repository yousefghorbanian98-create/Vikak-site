'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useCart } from './cart-provider';
import { priceLabel } from '@/lib/format';

export default function CartDrawer() {
  const { lines, subtotal, isOpen, close, setQty, remove } = useCart();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Hand the cart to WooCommerce: it owns the session, coupons, shipping and
   * the payment gateway. The response is a real checkout URL.
   */
  const checkout = async () => {
    setError(null);
    setBusy(true);

    try {
      const items = lines
        .map(line => ({ variation_id: line.wooVariationId, quantity: line.qty }))
        .filter(item => Boolean(item.variation_id));

      if (!items.length) {
        // Nothing in the cart maps to a WooCommerce variation, so there is no
        // real order to create. Sending the visitor to /api/checkout would hit a
        // POST-only route with a GET request; say what is wrong instead.
        setError('این اقلام به ووکامرس وصل نیستند. صفحه را تازه کنید و دوباره تلاش کنید.');
        return;
      }

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        checkoutUrl?: string;
        message?: string;
      };

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }

      setError(data.message || 'پرداخت در این نسخه فعال نیست.');
    } catch {
      setError('ارتباط با سرور برقرار نشد. دوباره تلاش کنید.');
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, close]);

  return (
    <>
      <div className="scrim" data-open={isOpen} onClick={close} aria-hidden="true" />
      <aside
        className="drawer"
        data-open={isOpen}
        aria-hidden={!isOpen}
        aria-label="سبد خرید"
        role="dialog"
        aria-modal="true"
      >
        <header className="drawer-head">
          <h3>سبد خرید {lines.length ? `(${lines.length})` : ''}</h3>
          <button className="icon-btn" onClick={close} aria-label="بستن سبد خرید" type="button">
            <svg width="13" height="13" viewBox="0 0 14 14" aria-hidden="true">
              <path d="M2 2l10 10M12 2 2 12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        <div className="drawer-body">
          {lines.length === 0 ? (
            <div className="cart-empty">
              <b>سبد خرید خالی است</b>
              <p style={{ margin: 0, fontSize: '0.84rem' }}>
                از میان پنجاه‌وچند محصول ۱۰۰٪ عربیکا یکی را انتخاب کنید.
              </p>
              <Link href="/#products" className="btn btn-ghost" onClick={close}>
                دیدن محصولات
              </Link>
            </div>
          ) : (
            lines.map(line => (
              <article className="line-item" key={line.key}>
                <img src={line.image} alt={line.title} width={68} height={68} loading="lazy" />
                <div>
                  <h4>{line.title}</h4>
                  <small>{line.variantLabel}</small>
                  <small>{line.roaster}</small>
                  <div className="qty">
                    <button onClick={() => setQty(line.key, line.qty - 1)} aria-label="کم کردن تعداد">
                      −
                    </button>
                    <span className="num">{line.qty}</span>
                    <button onClick={() => setQty(line.key, line.qty + 1)} aria-label="زیاد کردن تعداد">
                      +
                    </button>
                    <button
                      onClick={() => remove(line.key)}
                      style={{ width: 'auto', border: 0, fontSize: '0.72rem' }}
                      aria-label={`حذف ${line.title}`}
                    >
                      حذف
                    </button>
                  </div>
                </div>
                <div className="line-total">{priceLabel(line.price * line.qty)}</div>
              </article>
            ))
          )}
        </div>

        {lines.length > 0 ? (
          <footer className="drawer-foot">
            <div className="sum-line">
              <span>جمع کالاها</span>
              <b>{priceLabel(subtotal)}</b>
            </div>
            <div className="sum-line">
              <span>هزینه ارسال</span>
              <span>در مرحله‌ی بعد</span>
            </div>
            <div className="sum-line sum-total">
              <span>مبلغ قابل پرداخت</span>
              <b>{priceLabel(subtotal)}</b>
            </div>
            <button className="btn btn-primary btn-block" type="button" onClick={checkout} disabled={busy}>
              {busy ? 'در حال انتقال به درگاه…' : 'ادامه‌ی فرآیند خرید'}
            </button>
            {error ? (
              <p className="fineprint" role="alert" style={{ color: '#e2a05f' }}>
                {error}
              </p>
            ) : null}
            <p className="fineprint">
              پرداخت و ارسال در درگاه ووکامرس نهایی می‌شود؛ اگر درگاه هنوز وصل نشده باشد، سفارش‌ها
              پس از تأیید موجودی و هماهنگی تلفنی ثبت می‌شوند.
            </p>
          </footer>
        ) : null}
      </aside>
    </>
  );
}
