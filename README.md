# ویکک — فروشگاه دانه قهوه ۱۰۰٪ عربیکا

سایت فارسی (RTL) فروش دانه قهوه و ملزومات، ساخته‌شده با **Next.js 16 (App Router) + TypeScript**،
بدون هیچ کتابخانه‌ی UI اضافه — استایل‌ها CSS دست‌نویس با دیزاین‌تاکِن هستند.

> این نسخه **دمو** است: سبد خرید در `localStorage` مرورگر ذخیره می‌شود و درگاه پرداخت متصل نیست.

## دانلود پیش‌نمایش بدون سرور

نسخه‌ی استاتیک کامل سایت (۵۸ صفحه، مسیرهای نسبی، فونت و تصاویر محلی) به‌صورت یک آرشیو:

- **دانلود مستقیم:** [`preview/vikak-static-preview.zip`](https://raw.githubusercontent.com/yousefghorbanian98-create/Vikak-site/arena/2b6af4dd-vikak-site/preview/vikak-static-preview.zip)
- یا صفحه‌ی فایل در گیت‌هاب: [`preview/vikak-static-preview.zip`](https://github.com/yousefghorbanian98-create/Vikak-site/blob/arena/2b6af4dd-vikak-site/preview/vikak-static-preview.zip)

پس از دانلود، از حالت فشرده خارج کنید و `dist/index.html` را در مرورگر باز کنید.
بازتولید آرشیو: `npm run build && npm run export:static && zip -qr preview/vikak-static-preview.zip dist`

## اجرا

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # 61 صفحه: خانه، ۵۳ محصول، درباره، پرسش‌ها، sitemap/robots
```

## ساختار

```
app/
  layout.tsx          # lang="fa" dir="rtl"، متادیتا، فونت وزیرمتن + Instrument Serif
  page.tsx            # خانه: هیرو، اصول، کاتالوگ، برشته‌کاری، دم‌آوری، پیشنهاد، خبرنامه
  products/[slug]/    # صفحه محصول با SSG (۵۳ مسیر) + JSON-LD Product
  about/ faq/         # صفحات محتوایی + JSON-LD FAQPage
  sitemap.ts robots.ts icon.svg not-found.tsx
components/
  cart-provider.tsx   # Context + localStorage + toast
  cart-drawer.tsx     # دراور RTL از سمت راست
  site-header.tsx site-footer.tsx hero.tsx catalogue.tsx
  product-card.tsx product-buy-panel.tsx newsletter-form.tsx
data/
  products.ts         # منبع واحد حقیقت: ۵۳ محصول، ۶۸ تنوع وزن، از فهرست آبان ۱۴۰۵
lib/format.ts         # اعداد فارسی، تومان، برچسب گرم/کیلو
```

## دیتا

تمام محصولات، رسترها، وزن‌ها و قیمت‌ها مستقیماً از فهرست «قیمت روز قهوه ۱۰۰٪ عربیکا — آبان ۱۴۰۵»
وارد شده‌اند. قیمت‌ها به تومان و به‌ازای همان بسته‌ای است که انتخاب می‌شود؛ جایی که فهرست نرخ
کیلویی معادل داده بود، در `kgPrice` نگه داشته شده. یادداشت‌های طعمی (notes) و بدنه، **پروفایل
پیشنهادی** است و از فهرست قیمت گرفته نشده.

## دیزاین سیستم

| توکن | مقدار |
|---|---|
| پس‌زمینه | `#0d0a08` (زغال گرم) |
| متن | `#f3ebe1` (استخوانی) |
| اکسنت | `#c8752e` (مسی) |
| فونت فارسی | Vazirmatn Variable (وزن ۱۰۰–۹۰۰) |
| فونت لاتین نمایشی | Instrument Serif Italic |

تصاویر در `public/images/` قرار دارند (تولیدشده برای این پروژه؛ جایگزینی با عکس واقعی محصول
کافی است، نام فایل‌ها را نگه دارید).

## کارهای بعدی (برای نسخه‌ی واقعی)

- اتصال درگاه پرداخت ایرانی (زرین‌پال/آیدی‌پی) + سبد سمت سرور
- جایگزینی تصاویر با عکس واقعی بسته‌ها و بچ‌های رست
- شماره تماس، نشانی و شبکه‌های اجتماعی واقعی
- فرم سفارش عمده با اعتبارسنجی سمت سرور
