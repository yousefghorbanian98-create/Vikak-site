# ADR-0004: ECC تنها زنجیره‌ابزار پروژه است

**Date**: 2026-11-08
**Status**: accepted
**Deciders**: کارفرما (تصحیح صریح)، تیم اجرا

## Context

قرار بود پروژه کاملاً با ECC ساخته شود، اما در عمل فقط CLI آن با دستور `plan` صدا زده شد،
که فقط نقشه‌ی نصب چاپ می‌کند و هیچ فایلی نمی‌نویسد. در همان بازه پنج بسته‌ی مهارت
شخص‌ثالث (`taste`, `finn-build`, `finn-spec`, `ui-ux-pro-max`,
`design-motion-principles`) در `.claude/skills/` کار را هدایت می‌کردند. کارفرما این
انحراف را گرفت.

## Decision

ECC (`ecc-universal@2.2.3`) تنها منبع rule، agent، command و skill است و داخل خود مخزن
نصب می‌شود. هیچ بسته‌ی مهارت شخص‌ثالثی مجاز نیست. نصب پین‌شده:

```bash
npx -y ecc-universal@2.2.3 install \
  --target claude-project --profile minimal \
  --with framework:nextjs --with lang:typescript --with skill:security-review
```

نتیجه: ۱۳۷ مهارت، ۹۴ دستور، ۶۸ ایجنت، ۲۳ بسته‌ی rule. وضعیت نصب در
`.claude/ecc/install-state.json` و قابل بازتولید در CI.

## Alternatives Considered

### گزینه ۱: نگه داشتن مهارت‌های شخص‌ثالث در کنار ECC
- **Pros**: بعضی خروجی‌های دیزاین از آن‌ها آمده بود.
- **Cons**: دقیقاً همان چیزی که کارفرما رد کرد؛ دو مرجع متناقض برای قواعد پروژه.
- **Why not**: دستور کارفرما صریح بود: «فقط ECC».

### گزینه ۲: ECC سراسری (user-level) به‌جای نصب داخل پروژه
- **Pros**: یک نصب برای همه‌ی پروژه‌ها.
- **Cons**: نسخه بین پروژه‌ها شناور می‌شود و CI نمی‌تواند بازتولیدش کند.
- **Why not**: نسخه باید در مخزن قفل باشد تا گیت‌ها در CI و ماشین توسعه یکی باشند.

## Consequences

### Positive
- یک مرجع واحد برای قواعد؛ هارنس ECC از ۱۹/۳۹ به ۳۹/۳۹ رسید.
- نصب در CI بازتولید و با `doctor` تأیید می‌شود.
- خروجی‌های دیزاین قبلی در کد زنده‌اند؛ فقط مهارت‌ها حذف شدند، نه نتیجه‌شان.

### Negative
- حجم مخزن: `.claude/` حدود ۷٫۷ مگابایت و ۸۴۷ فایل.

### Risks
- **ریسک**: مسیرهای مطلق نصب‌کننده در `install-state.json` که در CI خطای
  `unsafe-managed-destination` می‌دهد.
  **کاهش**: `scripts/normalize-ecc-state.mjs` مسیرها را نسبی می‌کند و CI با `--check`
  و بازنصب، پورتال بودن را اثبات می‌کند.
- **ریسک**: برگشت مهارت شخص‌ثالث.
  **کاهش**: `.claude/hooks/guard-bash.js` و مرحله‌ی «No third-party skill bundles» در CI.
