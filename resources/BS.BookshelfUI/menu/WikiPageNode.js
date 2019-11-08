Ext.define( 'BS.BookshelfUI.menu.WikiPageNode', {
	extend: 'BS.BookshelfUI.menu.TextNode',

	makeItems: function() {
		this.itmOpen = new Ext.menu.Item({
			text: mw.message('bs-bookshelfui-ctxmnu-open').plain(),
			iconCls: 'icon-external-link',
			handler: this.onItmOpenClick,
			scope: this
		});

		var items = this.callParent(arguments);
		items.open = this.itmOpen;
		return items;
	},

	onItmOpenClick: function( item, e, eOpts  ) {
		var linkurl = mw.util.getUrl(
			this.currentRecord.get('articleTitle')
		);
		window.open( linkurl );
	}
});