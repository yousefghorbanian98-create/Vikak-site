import Link from 'next/link';

const COLS = [
  {
    title: 'فروشگاه',
    items: [
      { href: '/#products', label: 'همه‌ی دانه‌ها' },
      { href: '/#products', label: 'دان سبز خام' },
      { href: '/#products', label: 'رست اسپرسو' },
      { href: '/#products', label: 'سینگل‌اوریجین' },
    ],
  },
  {
    title: 'ویکک',
    items: [
      { href: '/about', label: 'درباره‌ی ما' },
      { href: '/#roastery', label: 'برشته‌کاری' },
      { href: '/#brew', label: 'راهنمای دم‌آوری' },
      { href: '/faq', label: 'پرسش‌های متداول' },
    ],
  },
  {
    title: 'پشتیبانی',
    items: [
      { href: '/faq', label: 'شرایط ارسال' },
      { href: '/faq', label: 'بازگشت کالا' },
      { href: '/faq', label: 'خرید عمده' },
      { href: '/faq', label: 'تماس با ما' },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="footer">
      <div className="shell">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link href="/" className="brand">
              <span className="brand-mark" aria-hidden="true">
                V
              </span>
              <span className="brand-word">
                <b>ویکک</b>
                <span>VIKAK COFFEE</span>
              </span>
            </Link>
            <p>
              گروه برشته‌کاری ویکک؛ کار بر روی دانه‌ی ۱۰۰٪ عربیکا، از انتخاب دان سبز تا تنظیم پروفایل
              رست. رست تازه، بسته‌بندی محافظ، و قیمت شفاف به ازای هر کیلوگرم.
            </p>
          </div>

          {COLS.map(col => (
            <div key={col.title}>
              <h4>{col.title}</h4>
              <ul>
                {col.items.map(item => (
                  <li key={item.label}>
                    <Link href={item.href}>{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="footer-bottom">
          <span>© ۱۴۰۵ ویکک — همه‌ی حقوق محفوظ است.</span>
          <span>
            قیمت‌ها به تومان و بر پایه‌ی فهرست آبان ۱۴۰۵ است؛ پیش از ثبت سفارش، موجودی و نرخ روز
            تأیید می‌شود.
          </span>
        </div>
      </div>
    </footer>
  );
}
