import { NextResponse } from 'next/server';
import { createCheckout, isHeadlessEnabled } from '@/lib/wp';

export const dynamic = 'force-dynamic';

type Body = {
  items?: { variation_id?: number | string; quantity?: number }[];
};

/**
 * Hands the cart to WooCommerce.
 *
 * WooCommerce owns the session, the coupon logic, shipping rules, tax and the
 * payment gateway (Zarinpal), so the storefront never re-implements any of it:
 * we only forward the chosen variations and redirect to the checkout URL.
 */
export async function POST(request: Request) {
  if (!isHeadlessEnabled()) {
    return NextResponse.json(
      {
        error: 'WORDPRESS_NOT_CONFIGURED',
        message:
          'این نسخه نمایشی است و درگاه پرداخت به آن متصل نیست. برای فروش واقعی، WordPress و ووکامرس را در تنظیمات وصل کنید.',
      },
      { status: 503 },
    );
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'BAD_JSON' }, { status: 400 });
  }

  const items = (body.items || [])
    .map(item => ({
      variation_id: Number(item.variation_id) || 0,
      quantity: Math.max(1, Math.min(20, Number(item.quantity) || 1)),
    }))
    .filter(item => item.variation_id > 0);

  if (!items.length) {
    return NextResponse.json({ error: 'EMPTY_CART' }, { status: 400 });
  }

  const result = await createCheckout(items);

  if (result.error || !result.checkoutUrl) {
    return NextResponse.json(
      { error: result.error || 'CHECKOUT_FAILED', message: 'ساخت سبد در ووکامرس ناموفق بود.' },
      { status: 502 },
    );
  }

  return NextResponse.json({ checkoutUrl: result.checkoutUrl });
}
