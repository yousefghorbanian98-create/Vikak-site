import Link from 'next/link';
import HeroParticles from './hero-particles';
import { products } from '@/data/products';
import { toFa } from '@/lib/format';

export default function Hero() {
  const roasterCount = new Set(products.map(p => p.roaster)).size;
  const originCount = new Set(products.map(p => p.originFa)).size;

  return (
    <section className="hero">
      <HeroParticles />
      <div className="shell hero-inner">
        <div className="hero-copy">
          <span className="eyebrow">گروه برشته‌کاری ویکک در ایران</span>

          <h1 className="display">
            هر دانه،
            <br />
            یک <em>خاستگاه</em>.
            <br />
            هر رست، یک تصمیم.
          </h1>

          <p className="lede">
            ویکک روی یک قاعده‌ی ساده بنا شده است: فقط ۱۰۰٪ عربیکا، فقط دانه‌ی قابل‌ردیابی، و همیشه
            قیمت شفاف به ازای هر کیلوگرم. از دان سبز خام برای رست خانگی تا سینگل‌اوریجین‌های
            اسپشیالتی برای کافه‌های تخصصی.
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link href="#products" className="btn btn-primary">
              دیدن فهرست دانه‌ها
              <span aria-hidden="true">←</span>
            </Link>
            <Link href="#roastery" className="btn btn-ghost">
              داستان رست
            </Link>
          </div>

          <div className="hero-meta">
            <div>
              <b className="num">{toFa(products.length)}</b>
              <span>دانه‌ی موجود</span>
            </div>
            <div>
              <b className="num">{toFa(roasterCount)}</b>
              <span>رستر همکار</span>
            </div>
            <div>
              <b className="num">{toFa(originCount)}</b>
              <span>خاستگاه</span>
            </div>
            <div>
              <b className="num">۱۰۰٪</b>
              <span>عربیکا</span>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <img
            src="/images/hero-beans.jpg"
            alt="دانه‌های قهوه‌ی رست‌شده در فنجان سرامیکی تیره"
            fetchPriority="high"
          />
          <div className="hero-ticket">
            <span className="muted" style={{ fontSize: '0.7rem', letterSpacing: '0.1em' }}>
              رست این هفته
            </span>
            <b>اتیوپی لکمپتی، رست روشن</b>
            <span className="muted" style={{ fontSize: '0.72rem' }}>
              یاس، برگاموت، هلو
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
