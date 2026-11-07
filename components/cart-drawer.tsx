'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useCart } from './cart-provider';
import { priceLabel } from '@/lib/format';

export default function CartDrawer() {
  const { lines, subtotal, isOpen, close, setQty, remove } = useCart();

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
          <button className="icon-btn" onClick={close} aria-label="بستن سبد خرید">
            ✕
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
            <button className="btn btn-primary btn-block" type="button">
              ادامه‌ی فرآیند خرید
            </button>
            <p className="fineprint">
              نمونه‌ی نمایشی: درگاه پرداخت در این نسخه متصل نیست. سفارش‌ها پس از تأیید موجودی و
              هماهنگی تلفنی نهایی می‌شوند.
            </p>
          </footer>
        ) : null}
      </aside>
    </>
  );
}
