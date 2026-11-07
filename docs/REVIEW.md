# بازبینی کامل با ECC

این سند نتیجه‌ی گذر کامل پروژه از زنجیره‌ابزار ECC است: از نصب تا آخرین گیت.
تاریخ: ۱۴۰۵/۰۸/۱۷ (2026-11-08).

## ۱. نصب و هویت

| ابزار ECC | مرحله | نتیجه |
|---|---|---|
| `ecc install` | نصب پین‌شده | `claude-project`, profile `minimal` + `framework:nextjs`, `lang:typescript`, `skill:security-review` |
| `ecc list-installed` | تأیید نصب | ۱۳۷ مهارت، ۹۴ دستور، ۶۸ ایجنت، ۲۳ بسته‌ی rule |
| `ecc status` | آمادگی | `Readiness: ok`، صفر مورد نیازمند توجه |
| `ecc doctor` | سلامت نصب | OK در CI (پس از نصب بازتولیدشده) |
| `ecc consult` | انتخاب اجزا | تأیید `capability:security`، `agent:code-reviewer` |
| `ecc security-ioc-scan` | زنجیره‌ی تأمین | پاس |
| `security-scan` (AgentShield) | امنیت `.claude` | نمره B؛ صفر یافته در فایل‌های تحت کنترل ما |
| `harness-audit` | سنجش هارنس | ۳۹/۳۹ |
| `skills-health` | پایش مهارت | ۱۳۷ مهارت سالم/بدون رگرسیون |
| `accessibility` (axe-core) | دسترس‌پذیری | ۰ نقض WCAG 2.2 AA در ۵ صفحه |
| `architecture-decision-records` | تصمیم‌ها | ۵ ADR در `docs/adr/` |
| `code-review` | بازبینی کد | ۳ یافته‌ی واقعی، همه رفع شد (پایین) |

## ۲. یافته‌های بازبینی کد و وضعیتشان

| شدت | یافته | وضعیت |
|---|---|---|
| HIGH | **Open redirect**: `checkout_url` از بک‌اند بدون اعتبارسنجی به `window.location` می‌رفت؛ وردپرس آلوده می‌توانست کاربر را به هر دامنه‌ای بفرستد | رفع شد: `assertSameOrigin()` در `lib/wp.ts` + ایوال `security/checkout-url-same-origin` |
| HIGH | **قهوه‌ی مجانی**: محصول بدون تنوع قیمت‌دار با `price: 0` به کاتالوگ می‌رسید | رفع شد: `hasPricedVariant()` محصول بی‌قیمت را حذف می‌کند + ایوال `money/no-zero-priced-product` |
| MEDIUM | `window.location.href = '/api/checkout'` روی مسیر POST-only وقتی سبد به ووکامرس وصل نبود | رفع شد: پیام خطای فارسی جای ناوبری |
| LOW | `data/products.ts` با ۸۹۷ خط بالاتر از آستانه‌ی ۸۰۰ خط است | پذیرفته: فایل داده است، نه منطق؛ شکستنش خوانایی را کم می‌کند |

## ۳. گیت‌های اجراشده

```
tsc --noEmit ................. پاک
evals/run.mjs ................ 18/18
harness-audit ................ 39/39
npm run build ................ 58 صفحه
smoke.mjs .................... 284/284
check-export.mjs ............. PASS (بدون em dash، بدون مبدأ مطلق)
axe-core WCAG 2.2 AA ......... 0 نقض
```

## ۴. محدودیت‌های صادقانه

- PHP در این محیط اجرا نشد؛ `wordpress/vikak-headless.php` فقط ایستا بررسی شده است.
- یک استاب وردپرس جای ووکامرس واقعی را گرفت؛ آزمون نهایی روی هاست واقعی لازم است.
- تصاویر محصول فعلاً تولیدشده با AI هستند و پیش از راه‌اندازی باید با عکس واقعی
  دانه‌ها جایگزین شوند.
