Ext.onReady(function(){
	Ext.Loader.setPath(
		'BS.BookshelfUI',
		bs.em.paths.get( 'BlueSpiceBookshelfUI' ) + '/resources/BS.BookshelfUI'
	);
	var oConfig = mw.config.get('bsBookshelfData');
	oConfig.renderTo = 'bs-bookshelfui-editorpanel';
	Ext.create( 'BS.BookshelfUI.panel.BookEditor', oConfig );
});