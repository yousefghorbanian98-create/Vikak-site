<?php
/**
 * Plugin Name: Vikak Headless
 * Description: Read-only catalogue endpoint + cart handoff for the Vikak Next.js storefront. WooCommerce stays authoritative for price, stock, cart, checkout and payment.
 * Version:     1.0.0
 * Author:      Vikak
 * Requires at least: 6.5
 * Requires PHP: 8.1
 *
 * Install: drop this file in wp-content/mu-plugins/ (or wp-content/plugins/ and activate).
 * Docs:    wordpress/README.md
 *
 * @package vikak-headless
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

const VIKAK_API_NS = 'vikak/v1';

/**
 * Register routes.
 */
add_action(
	'rest_api_init',
	function () {
		register_rest_route(
			VIKAK_API_NS,
			'/catalog',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => 'vikak_rest_catalog',
				'permission_callback' => '__return_true',
				'args'                => array(
					'per_page' => array(
						'default'           => 100,
						'sanitize_callback' => 'absint',
					),
				),
			)
		);

		register_rest_route(
			VIKAK_API_NS,
			'/catalog/(?P<slug>[a-zA-Z0-9_-]+)',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => 'vikak_rest_product',
				'permission_callback' => '__return_true',
			)
		);

		register_rest_route(
			VIKAK_API_NS,
			'/cart',
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => 'vikak_rest_cart',
				'permission_callback' => '__return_true',
			)
		);
	}
);

/**
 * Roast level from the product's category slug or an ACF/meta field.
 *
 * @param WC_Product $product Product.
 * @return string
 */
function vikak_roast_level( $product ) {
	$meta = (string) $product->get_meta( '_vikak_roast' );
	if ( $meta ) {
		return $meta;
	}

	$map = array(
		'dan-sabz'          => 'green',
		'rost-roshan'       => 'light',
		'rost-motevasset'   => 'medium',
		'rost-motevasset-tireh' => 'medium-dark',
		'rost-tireh'        => 'dark',
		'rost-espresso'     => 'espresso',
	);

	foreach ( $product->get_category_ids() as $term_id ) {
		$term = get_term( $term_id, 'product_cat' );
		if ( $term && ! is_wp_error( $term ) && isset( $map[ $term->slug ] ) ) {
			return $map[ $term->slug ];
		}
	}

	return 'medium';
}

/**
 * Shape one WooCommerce product into the storefront contract.
 *
 * @param WC_Product $product Product.
 * @return array
 */
function vikak_shape_product( $product ) {
	$image_id  = $product->get_image_id();
	$image_url = $image_id ? wp_get_attachment_image_url( $image_id, 'large' ) : null;

	$variants = array();

	if ( $product->is_type( 'variable' ) ) {
		foreach ( $product->get_children() as $child_id ) {
			$variation = wc_get_product( $child_id );
			if ( ! $variation instanceof WC_Product || 'publish' !== $variation->get_status() ) {
				continue;
			}

			$weight = (float) $variation->get_weight();
			$price  = (float) $variation->get_price();

			$variants[] = array(
				'id'                => $child_id,
				'woo_variation_id'  => $child_id,
				'label'             => $variation->get_name(),
				'grams'             => $weight > 0 ? (int) round( $weight * 1000 ) : 250,
				'price'             => $price,
				'kg_price'          => $weight > 0 ? (int) round( $price / $weight ) : null,
				'in_stock'          => $variation->is_in_stock(),
				'note'              => (string) $variation->get_description() ?: null,
			);
		}
	} else {
		$weight = (float) $product->get_weight();

		$variants[] = array(
			'id'               => $product->get_id(),
			'woo_variation_id' => 0,
			'label'            => $product->get_name(),
			'grams'            => $weight > 0 ? (int) round( $weight * 1000 ) : 250,
			'price'            => (float) $product->get_price(),
			'kg_price'         => $weight > 0 ? (int) round( (float) $product->get_price() / $weight ) : null,
			'in_stock'         => $product->is_in_stock(),
			'note'             => null,
		);
	}

	$notes_raw = (string) $product->get_meta( '_vikak_notes' );
	$notes     = $notes_raw ? array_map( 'trim', explode( '|', $notes_raw ) ) : array();

	return array(
		'id'        => 'wp-' . $product->get_id(),
		'woo_id'    => $product->get_id(),
		'slug'      => $product->get_slug(),
		'title'     => $product->get_name(),
		'origin'    => (string) $product->get_meta( '_vikak_origin' ) ?: 'Blend',
		'origin_fa' => (string) $product->get_meta( '_vikak_origin_fa' ) ?: 'ترکیبی',
		'roaster'   => (string) $product->get_meta( '_vikak_roaster' ) ?: 'ویکک',
		'roast'     => vikak_roast_level( $product ),
		'roast_fa'  => (string) $product->get_meta( '_vikak_roast_fa' ) ?: 'رست متوسط',
		'notes'     => $notes,
		'body'      => (string) $product->get_meta( '_vikak_body' ) ?: 'بدنه متوسط',
		'image'     => $image_url,
		'tag'       => (string) $product->get_meta( '_vikak_tag' ) ?: null,
		'variants'  => $variants,
	);
}

/**
 * GET /catalog
 *
 * @param WP_REST_Request $request Request.
 * @return WP_REST_Response
 */
function vikak_rest_catalog( WP_REST_Request $request ) {
	if ( ! function_exists( 'wc_get_products' ) ) {
		return new WP_REST_Response( array( 'message' => 'WooCommerce is not active' ), 503 );
	}

	$products = wc_get_products(
		array(
			'status'  => 'publish',
			'limit'   => max( 1, min( 500, (int) $request->get_param( 'per_page' ) ) ),
			'orderby' => 'menu_order',
			'order'   => 'ASC',
		)
	);

	return new WP_REST_Response(
		array( 'products' => array_map( 'vikak_shape_product', $products ) ),
		200
	);
}

/**
 * GET /catalog/<slug>
 *
 * @param WP_REST_Request $request Request.
 * @return WP_REST_Response
 */
function vikak_rest_product( WP_REST_Request $request ) {
	if ( ! function_exists( 'wc_get_product' ) ) {
		return new WP_REST_Response( array( 'message' => 'WooCommerce is not active' ), 503 );
	}

	$slug    = sanitize_title( $request['slug'] );
	$product = get_page_by_path( $slug, OBJECT, 'product' );

	if ( ! $product ) {
		return new WP_REST_Response( array( 'message' => 'Not found' ), 404 );
	}

	$wc_product = wc_get_product( $product->ID );

	if ( ! $wc_product || 'publish' !== $wc_product->get_status() ) {
		return new WP_REST_Response( array( 'message' => 'Not found' ), 404 );
	}

	return new WP_REST_Response( array( 'product' => vikak_shape_product( $wc_product ) ), 200 );
}

/**
 * POST /cart  { items: [ { variation_id, quantity } ] }
 * Builds a real WooCommerce session and returns the checkout URL, so payment,
 * coupons, shipping and order emails all keep working exactly as WooCommerce
 * does them.
 *
 * @param WP_REST_Request $request Request.
 * @return WP_REST_Response
 */
function vikak_rest_cart( WP_REST_Request $request ) {
	if ( ! function_exists( 'WC' ) || ! WC()->cart ) {
		return new WP_REST_Response( array( 'message' => 'WooCommerce is not active' ), 503 );
	}

	$items = $request->get_json_params()['items'] ?? array();

	if ( ! is_array( $items ) || ! $items ) {
		return new WP_REST_Response( array( 'message' => 'No items' ), 400 );
	}

	WC()->cart->empty_cart();

	foreach ( $items as $item ) {
		$variation_id = isset( $item['variation_id'] ) ? absint( $item['variation_id'] ) : 0;
		$quantity     = isset( $item['quantity'] ) ? max( 1, absint( $item['quantity'] ) ) : 1;

		if ( ! $variation_id ) {
			continue;
		}

		$product_id = wp_get_post_parent_id( $variation_id );
		if ( ! $product_id ) {
			$product_id = $variation_id;
		}

		WC()->cart->add_to_cart( $product_id, $quantity, $variation_id );
	}

	return new WP_REST_Response(
		array( 'checkout_url' => wc_get_checkout_url() ),
		200
	);
}

/**
 * CORS: only the storefront origin may call the cart endpoint, because it
 * creates a session. The read-only catalogue stays open (it is public data).
 */
add_action(
	'rest_api_init',
	function () {
		remove_filter( 'rest_pre_serve_request', 'rest_send_cors_headers' );

		add_filter(
			'rest_pre_serve_request',
			function ( $value ) {
				$allowed = array_filter(
					array_map( 'trim', explode( ',', (string) getenv( 'VIKAK_STOREFRONT_ORIGINS' ) ) )
				);
				$origin  = get_http_origin();

				if ( $origin && ( ! $allowed || in_array( $origin, $allowed, true ) ) ) {
					header( 'Access-Control-Allow-Origin: ' . esc_url_raw( $origin ) );
					header( 'Access-Control-Allow-Credentials: true' );
					header( 'Access-Control-Allow-Headers: Content-Type, Accept' );
					header( 'Access-Control-Allow-Methods: GET, POST, OPTIONS' );
				}

				return $value;
			}
		);
	},
	15
);
