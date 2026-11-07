import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import Hero from '@/components/hero';
import Catalogue from '@/components/catalogue';
import NewsletterForm from '@/components/newsletter-form';
import { products } from '@/data/products';
import { toFa } from '@/lib/format';

const MARQUEE = [
  '100% Arabica',
  'Single Origin',
  'اسپشیالتی',
  'رست تازه',
  'دان سبز خام',
  'برزیل · اتیوپی · کلمبیا',
  'کنیا · هند · سوماترا',
];

const PILLARS = [
  {
    i: 'I',
    title: 'فقط ۱۰۰٪ عربیکا',
    body: 'هیچ روبوستا، هیچ پرکننده. اگر روی بسته عربیکا نوشته شده، کل بسته عربیکاست — همان چیزی که در فهرست می‌بینید.',
  },
  {
    i: 'II',
    title: 'قیمت شفاف به کیلو',
    body: 'برای هر بسته، نرخ کیلویی معادل را نشان می‌دهیم تا بتوانید بسته‌ی ۱۲۵ گرمی را با کیسه‌ی ۱ کیلویی مقایسه کنید. بدون قیمت پنهان.',
  },
  {
    i: 'III',
    title: 'رست تازه، نه انباری',
    body: 'دانه پس از ثبت سفارش برشته می‌شود و در بسته‌بندی یک‌طرفه با دریچه‌ی تخلیه‌ی گاز به دستتان می‌رسد.',
  },
];

const BREW = [
  { name: 'V60', fa: 'دمی فیلتر', body: '۱۵ گرم قهوه، ۲۵۰ گرم آب ۹۳ درجه، سه پور. رست روشن را به بهترین شکل نشان می‌دهد.' },
  { name: 'Espresso', fa: 'اسپرسو', body: '۱۸ گرم دانه، ۳۶ گرم عصاره در ۲۷ تا ۳۰ ثانیه. برای ترکیب‌های تیره‌تر و رست اسپرسو.' },
  { name: 'AeroPress', fa: 'ایروپرس', body: '۱۶ گرم، ۲۰۰ گرم آب ۸۵ درجه، یک دقیقه و نیم. سازگارترین روش برای شروع.' },
  { name: 'Chemex', fa: 'کمکس', body: '۳۰ گرم، ۵۰۰ گرم آب، فیلتر ضخیم. برای دانه‌های اتیوپی و کنیا، تمیزی بالا.' },
];

export default function HomePage() {
  const featured = products.filter(p => p.origin === 'Ethiopia').slice(0, 3);

  return (
    <>
      <SiteHeader />

      <main>
        <Hero />

        <div className="marquee" aria-hidden="true">
          <div className="marquee-track">
            {[...MARQUEE, ...MARQUEE].map((item, i) => (
              <span key={`${item}-${i}`}>{item}</span>
            ))}
          </div>
        </div>

        <section className="pillars" aria-label="اصول ویکک">
          {PILLARS.map(p => (
            <article className="pillar" key={p.title}>
              <span className="pillar-index">{p.i}</span>
              <h3>{p.title}</h3>
              <p>{p.body}</p>
            </article>
          ))}
        </section>

        <Catalogue />

        <section className="section" id="roastery" style={{ scrollMarginTop: '90px' }}>
          <div className="shell split">
            <div className="split-media">
              <img
                src="/images/roastery-fire.jpg"
                alt="دستگاه رست دان قهوه در کارگاه ویکک"
                loading="lazy"
              />
            </div>

            <div className="split-copy">
              <span className="eyebrow">کارگاه رست</span>
              <h2 className="section-title">
                پروفایل رست، جایی بین <em className="latin">first crack</em> و شکلات تلخ
              </h2>
              <p className="lede">
                هر خاستگاه، رفتار حرارتی خودش را دارد. اتیوپی زودتر از برزیل به کِرَک اول می‌رسد و
                اگر یک درجه بیشتر بماند، گل‌ها جای خود را به آجیل می‌دهند. کار ما تنظیم همین فاصله
                است: کوتاه کردن زمان بین شکوفه و تیرگی، تا شیرینی حفظ شود و تلخی شروع نشود.
              </p>

              <div className="stats">
                <div>
                  <b className="num">۱۰۰٪</b>
                  <span>عربیکا، بدون استثنا</span>
                </div>
                <div>
                  <b className="num">{toFa(7)}</b>
                  <span>روز استراحت پیشنهادی</span>
                </div>
                <div>
                  <b className="num">{toFa(6)}</b>
                  <span>هفته بازه‌ی اوج طعم</span>
                </div>
              </div>

              <div className="notice">
                فهرست قیمت بالا، موجودی واقعی و نرخ روز بازار است؛ چون نرخ دانه‌ی سبز هفتگی تغییر
                می‌کند، قیمت نهایی سفارش پیش از پرداخت تأیید می‌شود.
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="brew" style={{ scrollMarginTop: '90px' }}>
          <div className="shell">
            <div className="section-head">
              <div>
                <span className="eyebrow">راهنمای دم‌آوری</span>
                <h2 className="section-title">چهار روش، چهار نسبت</h2>
                <p className="lede">
                  دانه‌ی خوب با نسبت غلط هم بد می‌شود. این چهار دستور، نقطه‌ی شروع برای هر
                  خاستگاهی است که در فروشگاه می‌بینید.
                </p>
              </div>
            </div>

            <div className="brew">
              {BREW.map(b => (
                <article key={b.name}>
                  <b>{b.fa}</b>
                  <span>{b.name}</span>
                  <p>{b.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section" aria-label="پیشنهاد سینگل‌اوریجین">
          <div className="shell">
            <div className="section-head">
              <div>
                <span className="eyebrow">پیشنهاد این هفته</span>
                <h2 className="section-title">اگر تازه شروع کرده‌اید، از اتیوپی شروع کنید</h2>
                <p className="lede">
                  روشن‌ترین و گل‌دارترین بخش فهرست. برای کسی که می‌خواهد تفاوت یک سینگل‌اوریجین با
                  ترکیب روزمره را بچشد، اینها بی‌رحم‌ترین انتخاب‌اند.
                </p>
              </div>
              <Link href="#products" className="btn btn-ghost">
                همه‌ی اتیوپی‌ها
                <span aria-hidden="true">←</span>
              </Link>
            </div>

            <div className="grid">
              {featured.map(p => {
                const cheapest = [...p.variants].sort((a, b) => a.price - b.price)[0];
                return (
                  <Link href={`/products/${p.slug}`} className="card" key={p.id}>
                    <div className="card-media">
                      <img src={p.image} alt={p.title} loading="lazy" />
                      {p.tag ? <span className="card-tag">{p.tag}</span> : null}
                    </div>
                    <div className="card-body">
                      <div className="card-origin">
                        <i aria-hidden="true" />
                        {p.originFa}
                      </div>
                      <h3>{p.title}</h3>
                      <span className="card-roaster">{p.roaster}</span>
                      <div className="card-notes">
                        {p.notes.map(n => (
                          <span key={n}>{n}</span>
                        ))}
                      </div>
                      <div className="card-foot">
                        <div className="price">
                          <b className="num">
                            {new Intl.NumberFormat('fa-IR').format(cheapest.price)} تومان
                          </b>
                          <small>{cheapest.label}</small>
                        </div>
                        <span className="card-cta">
                          جزئیات <span aria-hidden="true">←</span>
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <section className="section" style={{ paddingTop: 0 }}>
          <div className="shell">
            <div className="panel">
              <div className="panel-copy">
                <span className="eyebrow">خبرنامه‌ی رست</span>
                <h2 className="section-title">هر پنجشنبه، فهرست تازه و نرخ روز</h2>
                <p className="muted" style={{ margin: 0, fontSize: '0.9rem' }}>
                  یک ایمیل کوتاه: خاستگاه‌های تازه‌رسیده، دان‌های سبز موجود، و تغییرات نرخ. بدون
                  تبلیغ، بدون اسپم.
                </p>
              </div>

              <NewsletterForm />
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
