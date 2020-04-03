Ext.define( 'BS.BookshelfUI.dialog.NewPrompt', {
	extend: 'MWExt.Dialog',
	requires:['BS.form.SimpleSelectBox'],
	title: mw.message('bs-bookshelfui-new-book-title').plain(),
	closeAction: 'destroy',

	//custom
	bookTypes: [
		'ns_book', 'user_book'
	],

	makeItems: function() {
		var aTypes = [];
		for( var i = 0; i < this.bookTypes.length; i++ ) {
			var bookType = this.bookTypes[i];
			aTypes.push({
				name: mw.message("bs-bookshelfui-grouping-template-type-"+bookType).parse(),
				value: bookType
			});
		}

		this.tfBookTitle = new Ext.form.field.Text({
			id: this.makeId( 'input-booktitle' ),
			fieldLabel: mw.message('bs-bookshelfui-new-book-text').plain()
		});
		this.cbBookType = new BS.form.SimpleSelectBox({
			fieldLabel: mw.message('bs-bookshelfui-book-type').plain(),
			bsData: aTypes,
			value: aTypes[0].value
		});

		return [
			this.tfBookTitle,
			this.cbBookType
		];
	},

	onBtnOKClick: function() {
		var bookTitle = this.tfBookTitle.getValue();
		var bookType = this.cbBookType.getValue();
		var title = new mw.Title( bookTitle, bs.ns.NS_BOOK );
		if( bookType === 'user_book' ) {
			var prefix = mw.message('bs-bookshelf-personal-books-page-prefix', mw.config.get('wgUserName') ).parse();
			title = new mw.Title( prefix + bookTitle, bs.ns.NS_USER);
		}

		var url = mw.util.getUrl(
			'Special:BookshelfBookUI/'
			+ title.getPrefixedText()
		);
		window.location.href = url;
	}
});