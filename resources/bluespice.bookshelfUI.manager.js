(function( mw ) {
	var config = mw.config.get('bsBookshelfBookManagerConfig');
	mw.loader.using( config.dependencies ).done(function(){
		Ext.onReady(function(){
			Ext.Loader.setPath(
				'BS.BookshelfUI',
				bs.em.paths.get( 'BlueSpiceBookshelfUI' ) + '/resources/BS.BookshelfUI'
			);
			Ext.create( 'BS.BookshelfUI.panel.BookManager', {
				renderTo: 'bs-bookshelfui-managerpanel'
			});
		});
	});
})( mediaWiki );