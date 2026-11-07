<?php
/**
 * Vikak Child theme bootstrap.
 *
 * Loads the design system from the Next.js build (tokens, type, card styling),
 * enqueues the local Vazirmatn files, and makes WooCommerce markup follow the
 * same structure the design was built against.
 *
 * @package vikak-child
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'VIKAK_CHILD_VERSION', '1.0.0' );

/**
 * Styles + fonts.
 */
function vikak_enqueue_assets() {
	$dir = get_stylesheet_directory();
	$uri = get_stylesheet_directory_uri();

	// Vazirmatn, self-hosted (no Google Fonts: faster in Iran, no external call).
	wp_enqueue_style(
		'vikak-fonts',
		$uri . '/assets/fonts.css',
		array(),
		VIKAK_CHILD_VERSION
	);

	// The design system: same tokens as app/globals.css.
	wp_enqueue_style(
		'vikak-design',
		$uri . '/assets/vikak.css',
		array( 'vikak-fonts' ),
		file_exists( $dir . '/assets/vikak.css' ) ? (string) filemtime( $dir . '/assets/vikak.css' ) : VIKAK_CHILD_VERSION
	);

	// Parent theme styles must come after ours only for layout fallbacks.
	wp_enqueue_style( 'vikak-child', get_stylesheet_uri(), array( 'vikak-design' ), VIKAK_CHILD_VERSION );
}
add_action( 'wp_enqueue_scripts', 'vikak_enqueue_assets', 20 );

/**
 * WooCommerce: 4 products per row, matching the card grid of the design.
 */
add_filter(
	'loop_shop_columns',
	function () {
		return 4;
	}
);

/**
 * Product card: drop the default "Add to cart" button from the loop so the
 * custom card markup controls the whole footer (price + link), exactly as in
 * components/product-card.tsx.
 */
function vikak_loop_card_parts() {
	remove_action( 'woocommerce_after_shop_loop_item', 'woocommerce_template_loop_add_to_cart', 10 );
	remove_action( 'woocommerce_after_shop_loop_item_title', 'woocommerce_template_loop_rating', 5 );
}
add_action( 'init', 'vikak_loop_card_parts' );

/**
 * Expose the published per-kilo price on the single product page, the way the
 * Next.js product page does (price transparency is a brand promise).
 */
function vikak_price_per_kilo() {
	global $product;
	if ( ! $product || ! $product->is_type( 'variable' ) ) {
		return;
	}

	$prices = array();
	foreach ( $product->get_children() as $child_id ) {
		$variation = wc_get_product( $child_id );
		if ( ! $variation ) {
			continue;
		}
		$weight = (float) $variation->get_weight(); // stored in kg by the importer
		$price  = (float) $variation->get_price();
		if ( $weight > 0 && $price > 0 ) {
			$prices[] = $price / $weight;
		}
	}

	if ( ! $prices ) {
		return;
	}

	printf(
		'<p class="vikak-per-kilo">%s <strong>%s</strong> %s</p>',
		esc_html__( 'نرخ کیلویی معادل:', 'vikak-child' ),
		esc_html( number_format_i18n( min( $prices ) ) ),
		esc_html__( 'تومان', 'vikak-child' )
	);
}
add_action( 'woocommerce_single_product_summary', 'vikak_price_per_kilo', 12 );

/**
 * Persian formatting for prices in the theme layer (WooCommerce still owns the
 * value; only the rendering changes).
 */
add_filter(
	'wc_price',
	function ( $html ) {
		return strtr(
			$html,
			array(
				'0' => '۰', '1' => '۱', '2' => '۲', '3' => '۳', '4' => '۴',
				'5' => '۵', '6' => '۶', '7' => '۷', '8' => '۸', '9' => '۹',
			)
		);
	}
);

/**
 * Trust strap under the add-to-cart button — same three claims as the site.
 */
function vikak_product_trust() {
	echo '<ul class="vikak-trust">';
	echo '<li>' . esc_html__( '۱۰۰٪ عربیکا، بدون روبوستا', 'vikak-child' ) . '</li>';
	echo '<li>' . esc_html__( 'رست پس از ثبت سفارش', 'vikak-child' ) . '</li>';
	echo '<li>' . esc_html__( 'قیمت شفاف به ازای هر کیلوگرم', 'vikak-child' ) . '</li>';
	echo '</ul>';
}
add_action( 'woocommerce_single_product_summary', 'vikak_product_trust', 31 );
