<?php
/**
 * Admin and Dashboard options
 *
 * Use to customise the WP Admin
 *
 * @package WordPress
 * @subpackage cncf-theme
 * @since 1.0.0
 */

/**
 * Move menu elements in WP Admin
 */
add_filter(
	'custom_menu_order',
	function () {
		return true;
	}
);
add_filter( 'menu_order', 'my_new_admin_menu_order' );

/**
 * New Admin Menu Order
 *
 * @param array $menu_order The menu order.
 */
function my_new_admin_menu_order( $menu_order ) {
	$new_positions = array(
		'upload.php' => 8,
		// 'edit.php?post_type=page' => 4,
	);
	/**
	 * Sorting
	 *
	 * @param array $array The menu order.
	 * @param array $a The menu order.
	 * @param array $b The menu order.
	 */
	function move_element( &$array, $a, $b ) {
		$out = array_splice( $array, $a, 1 );
		array_splice( $array, $b, 0, $out );
	}
	foreach ( $new_positions as $value => $new_index ) {
		if ( $current_index = array_search( $value, $menu_order ) ) { // phpcs:ignore
			move_element( $menu_order, $current_index, $new_index );
		}
	}
	return $menu_order;
};

/**
 * Add theme usage box into WordPress Dashboard
 */
function add_dashboard_widget_info() {
	wp_add_dashboard_widget( 'dashboard_widget_1', 'Website Details', 'website_details' );
}
add_action( 'wp_dashboard_setup', 'add_dashboard_widget_info' );

/**
 * Add content to new dashboard widget
 */
function website_details() {
	echo "<ul>
	<li><a href='#' target='_blank'>Link to editing guide will be here</a></li>
<li><strong>Developed By:</strong> <a href='mailto:cjyabraham@gmail.com'>Chris Abraham</a>, <a href='mailto:jim@thetwopercent.co.uk'>James Hunt</a></li>
<li><strong>Development Repo:</strong> <a href='https://github.com/cncf/cncf.io' target='_blank'>Github</a>
</li>
</ul>";
}


/**
 * Add custom post types to Dashboard
 *
 * @param int $items Number.
 */
function custom_glance_items( $items = array() ) {
	$post_types = array( 'cncf_webinar', 'cncf_event', 'cncf_case_study', 'cncf_case_study_ch', 'cncf_project', 'cncf_person' );

	foreach ( $post_types as $type ) {

		if ( ! post_type_exists( $type ) ) {
			continue;
		}

		$num_posts = wp_count_posts( $type );

		if ( $num_posts ) {

			$published = intval( $num_posts->publish );
			$post_type = get_post_type_object( $type );
			/* translators: %2$s is replaced with the number of translations */
			$text = _n( '%s ' . $post_type->labels->singular_name, '%s ' . $post_type->labels->name, $published, 'your_textdomain' ); // phpcs:ignore
			$text = sprintf( $text, number_format_i18n( $published ) );

			if ( current_user_can( $post_type->cap->edit_posts ) ) {
				$items[] = sprintf( '<a class="%1$s-count" href="edit.php?post_type=%1$s">%2$s</a>', $type, $text ) . "\n";
			} else {
				$items[] = sprintf( '<span class="%1$s-count">%2$s</span>', $type, $text ) . "\n";
			}
		}
	}
	return $items;
}
add_filter( 'dashboard_glance_items', 'custom_glance_items', 10, 1 );

/**
 * Removes dashboard widgets.
 */
function remove_dashboard_widgets() {
	remove_meta_box( 'wpseo-dashboard-overview', 'dashboard', 'side' );
	remove_meta_box( 'dashboard_recent_comments', 'dashboard', 'normal' );
	remove_meta_box( 'dashboard_incoming_links', 'dashboard', 'normal' );
	remove_meta_box( 'dashboard_plugins', 'dashboard', 'normal' );
	remove_meta_box( 'dashboard_quick_press', 'dashboard', 'side' );
	remove_meta_box( 'dashboard_recent_drafts', 'dashboard', 'side' );
	remove_meta_box( 'dashboard_primary', 'dashboard', 'side' );
}
add_action( 'wp_dashboard_setup', 'remove_dashboard_widgets' );

/**
 * Remove pages from sidebar.
 */
function custom_menu_page_removing() {
	remove_menu_page( 'edit-comments.php' );
}
add_action( 'admin_menu', 'custom_menu_page_removing' );