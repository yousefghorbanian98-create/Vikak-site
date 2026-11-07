import type { Metadata, Viewport } from 'next';
import { CartProvider } from '@/components/cart-provider';
import '@fontsource-variable/vazirmatn';
import '@fontsource/instrument-serif/400-italic.css';
import '@fontsource/instrument-serif';
import './globals.css';

export const viewport: Viewport = {
  themeColor: '#0d0a08',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://vikak.coffee'),
  title: {
    default: 'ویکک — برشته‌کاری دانه قهوه ۱۰۰٪ عربیکا',
    template: '%s | ویکک',
  },
  description:
    'ویکک، گروه برشته‌کاری قهوه‌ی تخصصی در ایران. دانه قهوه ۱۰۰٪ عربیکا، از دان سبز خام تا سینگل‌اوریجین‌های اسپشیالتی؛ رست تازه، قیمت شفاف به ازای هر کیلوگرم.',
  keywords: ['قهوه', 'دانه قهوه', 'عربیکا', 'اسپشیالتی', 'رست قهوه', 'قهوه تخصصی', 'ویکک'],
  openGraph: {
    type: 'website',
    locale: 'fa_IR',
    siteName: 'ویکک',
    title: 'ویکک — برشته‌کاری دانه قهوه ۱۰۰٪ عربیکا',
    description:
      'از دان سبز خام تا سینگل‌اوریجین اسپشیالتی. رست تازه، قیمت شفاف، ارسال به سراسر ایران.',
    images: [{ url: '/images/hero-beans.jpg', width: 1536, height: 1024, alt: 'دانه قهوه عربیکا' }],
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
