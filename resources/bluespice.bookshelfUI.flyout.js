(function( mw, $, bs, undefined ) {
	bs.util.registerNamespace( 'bs.bookshelfUI' );

	bs.bookshelfUI.flyoutTriggerCallback = function( $body ) {
		var dfd = $.Deferred();
		Ext.create( 'BS.BookshelfUI.flyout.GeneralBooks', {
			renderTo: $body[0]
		} );

		dfd.resolve();
		return dfd.promise();
	};

})( mediaWiki, jQuery, blueSpice );
