export const TOMAN = 'تومان';

const faDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

export function toFa(input: string | number): string {
  return String(input).replace(/\d/g, d => faDigits[Number(d)]);
}

/** 2250000 → "۲٬۲۵۰٬۰۰۰" (Persian digits, Arabic thousands separator). */
export function formatToman(value: number): string {
  try {
    return new Intl.NumberFormat('fa-IR', {
      maximumFractionDigits: 0,
      useGrouping: true,
    }).format(value);
  } catch {
    return toFa(value.toLocaleString('en-US'));
  }
}

export function priceLabel(value: number): string {
  return `${formatToman(value)} ${TOMAN}`;
}

export function gramsLabel(grams: number): string {
  if (grams >= 1000) {
    const kg = grams / 1000;
    return `${toFa(Number.isInteger(kg) ? kg : kg.toFixed(1))} کیلوگرم`;
  }
  return `${toFa(grams)} گرم`;
}

/** ~۴٫۲ میلیون تومان — used for compact badges. */
export function compactToman(value: number): string {
  if (value >= 1_000_000) {
    const millions = value / 1_000_000;
    const rounded = millions >= 10 ? millions.toFixed(0) : millions.toFixed(1).replace(/\.0$/, '');
    return `${toFa(rounded)} میلیون`;
  }
  return formatToman(value);
}
