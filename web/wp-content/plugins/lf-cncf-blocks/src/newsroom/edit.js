/**
 * Edit screen code
 *
 * @package WordPress
 * @since 1.0.0
 *
 * @tags
 * @phpcs:disable WordPress.WhiteSpace.OperatorSpacing.NoSpaceAfter
 * @phpcs:disable WordPress.WhiteSpace.OperatorSpacing.NoSpaceBefore
 * @phpcs:disable Generic.WhiteSpace.ScopeIndent.IncorrectExact
 * @phpcs:disable Generic.WhiteSpace.ScopeIndent.Incorrect
 * @phpcs:disable PEAR.Functions.FunctionCallSignature.Indent
 */

import get from 'lodash/get';
import head from 'lodash/head';
import mapValues from 'lodash/mapValues';
import pickBy from 'lodash/pickBy';
import isUndefined from 'lodash/isUndefined';

const { __ } = wp.i18n;
const { Component, Fragment } = wp.element;
const { InspectorControls } = wp.blockEditor || wp.editor;
const { RangeControl, PanelBody, ToggleControl, SelectControl, Placeholder, Spinner } = wp.components;
const { withSelect } = wp.data;

// import helper functions.
import { formatDate } from '../helper-functions.js';

class Newsroom extends Component {
	constructor() {
		super( ...arguments );
		this.toggleAttribute = this.toggleAttribute.bind( this );
	}

	toggleAttribute( attribute ) {
		return ( newValue ) => {
			this.props.setAttributes( { [ attribute ]: newValue } );
		};
	}

	renderControl = () => {
		const { attributes, setAttributes, categories } = this.props;
		const { category, numberposts, showImages, order } = attributes;

		// get the list of categories to select.
		const menuOptions = [
			{ value: 0, label: __( 'All' ) },
			...categories.map( x => ( { value: x.id, label: x.name } ) ),
		];

		return (
			<InspectorControls key="lf-newsroom-block-panel">
				<PanelBody title={ __( 'Settings' ) } initialOpen={ true }>

					<SelectControl
						label={ __( 'Category' ) }
						value={ category }
						options={ menuOptions }
						onChange={ value =>
							setAttributes( { category: '' !== value ? value : '' } )
						  }
					/>
					<RangeControl
						label={ __( 'Number of Posts' ) }
						min={ 1 }
						max={ 12 }
						value={ numberposts }
						onChange={ value => setAttributes( { numberposts: value } ) }
					/>
					<SelectControl
						label={ __( 'Order' ) }
						value={ order }
						options={ [
							{
								label: __( 'Newest Posts First' ),
								value: 'desc',
							},
							{
								label: __( 'Oldest Posts First' ),
								value: 'asc',
							},
						] }
						onChange={ ( value ) => setAttributes( { order: value } ) }
					/>
					<ToggleControl
						label={ __( 'Show Images' ) }
						help={ showImages ? 'Shows featured images.' : 'No images.' }
						checked={ showImages }
						onChange={ this.toggleAttribute( 'showImages' ) }
					/>
				</PanelBody>
			</InspectorControls>
		);
	}

	renderList = () => {
		const {
			attributes: { numberposts },
			className,
			posts,
		} = this.props;
		const data = posts.map( p => ( { ...p, meta: mapValues( p.meta, head ) } ) ).slice( 0, numberposts );
		// featured image not working in loop below.
		const thumbnail = get( posts.find( p => !! p.featured_media_url ), 'featured_media_url' );

		return (
			<div className={ `${ className }__body` }>
				{ data.map(
					 post => (
						<div key={ post.id } className={ `${ className }__post` }>
							{ /* { image here}, based on toggle state */ }
							<p
								className={ `${ className }__name` }
								dangerouslySetInnerHTML={ { __html: post.title.rendered } }
							/>
							<span className={ `${ className }__date` }>{ formatDate( post.date ) }</span>
						</div>
					)
				)
				}
			</div>
		);
	}

	render() {
		const { posts, className } = this.props;

		return ! posts ? (
			<Placeholder label={ __( 'Loading...' ) }>
				<Spinner />
			</Placeholder>
		) : (
			<Fragment>
				{ this.renderControl() }
				<div className={ className }>
					<div className={ `${ className }__block` }>
						{ this.renderList() }
					</div>
				</div>
			</Fragment>
		);
	}
}

export default withSelect(
	 ( select, props ) => {
		const { getEntityRecords } = select( 'core' );
		const { category, order, numberposts } = props.attributes;
		const latestPostsQuery = pickBy(
			{
				categories: category,
				order,
				per_page: numberposts,
			},
			( value ) => ! isUndefined( value )
		);
		return {
			posts: getEntityRecords( 'postType', 'post', latestPostsQuery ),
			categories: getEntityRecords( 'taxonomy', 'category' ) || [],
		};
	}
)( Newsroom );