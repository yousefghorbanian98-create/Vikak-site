import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="shell" style={{ paddingBlock: 'clamp(4rem, 12vw, 9rem)', textAlign: 'center' }}>
        <span className="eyebrow" style={{ justifyContent: 'center' }}>
          ۴۰۴
        </span>
        <h1 className="display" style={{ margin: '1rem auto', maxWidth: '16ch' }}>
          این دانه در فهرست ما نیست
        </h1>
        <p className="lede" style={{ margin: '0 auto 2rem' }}>
          صفحه‌ای که دنبالش بودید پیدا نشد. شاید محصول از فهرست خارج شده یا نشانی اشتباه است.
        </p>
        <Link href="/" className="btn btn-primary">
          بازگشت به فروشگاه
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
