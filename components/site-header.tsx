'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useCart } from './cart-provider';

const NAV = [
  { href: '/#products', label: 'فروشگاه' },
  { href: '/#roastery', label: 'برشته‌کاری' },
  { href: '/#brew', label: 'راهنمای دم‌آوری' },
  { href: '/about', label: 'درباره‌ی ویکک' },
  { href: '/faq', label: 'پرسش‌های متداول' },
];

export default function SiteHeader() {
  const { count, open } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="masthead">
      <div className="shell masthead-inner">
        <Link href="/" className="brand" aria-label="ویکک، صفحه‌ی اصلی">
          <span className="brand-mark" aria-hidden="true">
            V
          </span>
          <span className="brand-word">
            <b>ویکک</b>
            <span>VIKAK COFFEE</span>
          </span>
        </Link>

        <nav className="nav" aria-label="ناوبری اصلی">
          {NAV.map(item => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="masthead-actions">
          <button className="cart-btn" onClick={open} type="button" aria-label="باز کردن سبد خرید">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M4 7h16l-1.4 11.2a2 2 0 0 1-2 1.8H7.4a2 2 0 0 1-2-1.8L4 7Zm4 0V5.5a4 4 0 1 1 8 0V7"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
            <span className="cart-label">سبد خرید</span>
            <span className="cart-count num" data-empty={count === 0}>
              {count}
            </span>
          </button>

          <button
            className="burger"
            type="button"
            aria-label="منو"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(v => !v)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div style={{ borderTop: '1px solid var(--line)', padding: '1rem 0 1.4rem' }}>
          <div className="shell" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {NAV.map(item => (
              <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </header>
  );
}
