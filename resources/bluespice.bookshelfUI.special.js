( function( mw, $, bs, undefined ) {
	$( function () {
		// DOM Ready
		var $cnt = $( '#bs-bookshelf-container' );

		bs.loadIndicator.pushPending();
		Ext.create( 'BS.BookshelfUI.flyout.GeneralBooks', {
			renderTo: $cnt[0],
			listeners: {
				render: function() {
					bs.loadIndicator.popPending();
				}
			},
			defaultTab: mw.user.options.get( 'bs-bookshelfui-defaultview' ),
			gridFeatures: [ new Ext.grid.feature.Grouping( {} ) ],
			storeGrouper: {
				groupFn: function( val ) {
					return val.data.page_title[0];
				}
			}
		} );

	} );

} )( mediaWiki, jQuery, blueSpice );