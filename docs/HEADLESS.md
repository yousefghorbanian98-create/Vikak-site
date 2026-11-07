# معماری هدلس: وردپرس بک‌اند، Next.js فرانت

```
        ┌──────────────────────────────┐
        │  Wickak Next.js storefront   │  ← همان دیزاین و سرعت فعلی
        │  (SSG/ISR، RTL، وزیرمتن)     │
        └───────────┬──────────────────┘
                    │  GET  /wp-json/vikak/v1/catalog
                    │  GET  /wp-json/vikak/v1/catalog/<slug>
                    │  POST /wp-json/vikak/v1/cart
        ┌───────────▼──────────────────┐
        │  WordPress + WooCommerce     │  ← تیم قیمت/موجودی را اینجا عوض می‌کند
        │  زرین‌پال · ارسال · فاکتور   │
        └──────────────────────────────┘
```

## اصل حاکم

**ووکامرس تنها مرجع قیمت، موجودی، سبد و پرداخت است.** فرانت هیچ‌کدام را بازنویسی نمی‌کند؛ فقط
می‌خواند و سبد را به checkout واقعی ووکامرس تحویل می‌دهد. دلیل: کوپن، مالیات، هزینه‌ی وزن‌محور،
ایمیل سفارش و درگاه، همه در ووکامرس تست‌شده‌اند.

## نصب

1. `wordpress/vikak-headless.php` را در `wp-content/mu-plugins/` بگذارید (پوشه را بسازید اگر نیست).
2. در `wp-config.php`:

```php
// فقط دامنه‌ی فرانت اجازه‌ی ساخت سبد (POST) دارد
putenv( 'VIKAK_STOREFRONT_ORIGINS=https://vikak.coffee,https://www.vikak.coffee' );
```

3. در فرانت (`.env.local` یا تنظیمات هاست):

```bash
NEXT_PUBLIC_WP_BASE_URL=https://shop.vikak.coffee
WP_REVALIDATE_SECONDS=300
```

4. تست دستی قرارداد:

```bash
curl -s https://shop.vikak.coffee/wp-json/vikak/v1/catalog | head -c 300
curl -s https://shop.vikak.coffee/wp-json/vikak/v1/catalog/espresso-house-blend
curl -s -X POST https://shop.vikak.coffee/wp-json/vikak/v1/cart \
  -H 'Content-Type: application/json' \
  -d '{"items":[{"variation_id":123,"quantity":2}]}'
```

## قرارداد داده

```jsonc
// GET /catalog  →  { "products": CatalogProduct[] }
{
  "id": "wp-1012",
  "woo_id": 1012,
  "slug": "partak-ethiopia-lekempti",
  "title": "عربیکا اتیوپی لکمپتی",
  "origin": "Ethiopia",
  "origin_fa": "اتیوپی",
  "roaster": "پارتاک کافی اصفهان",
  "roast": "light",            // green | light | medium | medium-dark | dark | espresso
  "roast_fa": "رست روشن",
  "notes": ["لیموی شیرین", "یاس", "عسل"],
  "body": "بدنه متوسط",
  "image": "https://…/uploads/2026/11/lekempti.jpg",
  "tag": null,
  "variants": [
    { "id": 5012, "woo_variation_id": 5012, "label": "بسته ۲۵۰ گرمی",
      "grams": 250, "price": 819000, "kg_price": 3276000,
      "in_stock": true, "note": null }
  ]
}
```

فیلدهای فارسی (`origin_fa`, `roast_fa`, `notes`, `body`, `tag`) از meta محصول خوانده می‌شوند:

| meta key | نمونه |
|---|---|
| `_vikak_origin` | `Ethiopia` |
| `_vikak_origin_fa` | `اتیوپی` |
| `_vikak_roaster` | `پارتاک کافی اصفهان` |
| `_vikak_roast` | `light` |
| `_vikak_roast_fa` | `رست روشن` |
| `_vikak_notes` | `لیموی شیرین\|یاس\|عسل` |
| `_vikak_body` | `بدنه متوسط` |
| `_vikak_tag` | `اسپشیالتی` |

اگر متا خالی باشد، افزونه از دسته‌بندی رست (`dan-sabz`, `rost-roshan`, …) استفاده می‌کند و بقیه
مقادیر پیش‌فرض امن می‌گیرند؛ یعنی سایت هرگز با محصول ناقص نمی‌شکند.

نرخ کیلویی از وزن تنوع محاسبه می‌شود: `kg_price = price / weight_kg`. به همین دلیل ایمپورت CSV
ستون `Weight (kg)` را پر می‌کند.

## رفتار در قطعی

| وضعیت | رفتار فرانت |
|---|---|
| `NEXT_PUBLIC_WP_BASE_URL` خالی | کاتالوگ بسته‌بندی‌شده (`data/products.ts`) + متن «نسخه‌ی نمایشی» |
| وردپرس تنظیم شده ولی در دسترس نیست | همان fallback، با `console.warn` در لاگ سرور |
| وردپرس جواب می‌دهد ولی محصولی ندارد | همان fallback |
| درگاه وصل نیست | `POST /api/checkout` با کد ۵۰۳ و پیام فارسی |

هر دو مسیر تست شده‌اند (روشن/خاموش کردن یک استاب محلی با همان قرارداد JSON).

## کش و تازه‌سازی

- صفحات با `export const revalidate = 300` (۵ دقیقه) ساخته می‌شوند؛ ثابت `WP_REVALIDATE_SECONDS`.
- فراخوانی‌های وردپرس `cache: 'no-store'` هستند تا خطای شبکه کش نشود و fallback فوراً برگردد.
- برای به‌روزرسانی فوری پس از تغییر قیمت، یک webhook در وردپرس به
  `POST /api/revalidate?tag=catalog` بزنید (در ادامه اضافه می‌شود).

## چه چیزی حفظ می‌شود

ظاهر، تایپوگرافی، انیمیشن، سبد دراور، سرعت استاتیک و SEO فعلی — چون فرانت همان است.
تنها تغییری که کاربر می‌بیند: دکمه‌ی «ادامه‌ی فرآیند خرید» به checkout ووکامرس می‌رود.
