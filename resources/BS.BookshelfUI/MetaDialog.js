Ext.define( 'BS.BookshelfUI.MetaDialog', {
	extend: 'MWExt.Dialog',
	requires: [ 'BS.BookshelfUI.MetaGrid' ],

	width: 600,
	autoHeight: true,
	modal:true,

	//Custom settings
	metaData: [],
	metaDataConfig: [],

	makeItems: function() {
		this.setTitle( mw.message('bs-bookshelfui-dlg-metadata-title').plain() );
		this.mgMeta = new BS.BookshelfUI.MetaGrid({
			metaData: this.metaData,
			metaDataConfig: this.metaDataConfig
		});
		return [
			this.mgMeta
		];
	},

	getData: function() {
		var metas = this.mgMeta.getData();
		return this.mgMeta.getData(metas);
	}
});