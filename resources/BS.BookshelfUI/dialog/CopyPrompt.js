Ext.define( 'BS.BookshelfUI.dialog.CopyPrompt',{
	extend: 'MWExt.Dialog',
	requires: [
		'BS.form.NamespaceCombo', 'BS.action.APIEditPage',
		'BS.action.APICopyPage', 'BS.dialog.BatchActions'
	],
	//modal:true,

	makeItems: function() {
		this.tfTargetBookTitle = new Ext.form.field.Text({
			labelAlign: 'right',
			fieldLabel: mw.message('bs-bookshelfui-dlg-copy-target-name-label').plain()
		});

		//We want a short list of custum namespaces
		var exNamespaces = Ext.Array.merge(
			bs.ns.filter.ONLY_CUSTOM_NS,
			[ bs.ns.NS_BOOK, bs.ns.NS_BOOK_TALK ],
			bs.ns.filter.NO_TALK
		);
		exNamespaces.splice( exNamespaces.indexOf( bs.ns.NS_MAIN ), 1 ); //Remove NS_MAIN from blacklist

		this.cbTargetNamespace = new BS.form.NamespaceCombo({
			excludeIds: exNamespaces,
			value: null,
			inputAttrTpl: " data-qtip='"+  mw.message('bs-bookshelfui-dlg-copy-target-namespace-qtip').plain() +"' " //UGLY!
		});

		return [
			this.tfTargetBookTitle,
			this.cbTargetNamespace
		];
	},

	setData: function( data ) {
		this.currentData = data;
		this.setTitle( mw.message('bs-bookshelfui-dlg-copy-title', data.page_title ).plain() );
		this.tfTargetBookTitle.setValue( data.page_title + mw.message('bs-bookshelfui-dlg-copy-name-addition').plain() );
		this.cbTargetNamespace.reset();
	},

	dlgBatchActions: null,
	onBtnOKClick: function() {
		this.setLoading();
		var me = this;

		if( !this.dlgBatchActions ) {
			this.dlgBatchActions = new BS.dialog.BatchActions();
			this.dlgBatchActions.on( 'ok', this.onDlgBatchActionsOK, this );
		}

		//Retrieve book content
		var getBookPageWikiTextAPI = new mw.Api();
			getBookPageWikiTextAPI.get({
				action: 'query',
				pageids: this.currentData.page_id,
				prop: 'revisions',
				rvprop: 'content',
				indexpageids : ''
			})
			.done(function( resp, jqXHR ){
				var pageId = resp.query.pageids[0];
				var content = resp.query.pages[pageId].revisions[0]['*'];
				var actions = me.getActionsFromBookPageContent(content);
				//me.close();

				me.dlgBatchActions.setData( actions );
				me.dlgBatchActions.show();
				me.dlgBatchActions.startProcessing();
			});

		//this.fireEvent( 'ok', this, this.getData() );
		//this.close();
	},

	getActionsFromBookPageContent: function( content ) {
		var me = this;
		var targetTitlePrefix = this.getTargetNSPrefix();
		var actions = [];

		var modifiedContent = content.replace(/\[\[(.*?)\]\]/gi, function( fullmatch, group ) {
			var linkParts = group.split('|');
			var actionCfg = {
				sourceTitle: '',
				targetTitle: ''
			};
			actionCfg.sourceTitle = linkParts[0];

			var title = false;
			try {
				title = new mw.Title( linkParts[0] );
			}
			catch( e ) {
				console.log( e );
				return fullmatch;
			}

			//TODO: How about collisions? "User:WikiSysop" and "Contact:WikiSysop" would both be transformed to "<target-ns>:WikiSysop"
			//For now: YAGNI!
			if( !title || title.getNamespaceId() < 3000 && title.getNamespaceId() !== bs.ns.NS_MAIN ) { //This is BlueSpice! Custom namespaces start from 3000
				return fullmatch;
			}
			linkParts[0] = targetTitlePrefix + title.getNameText();
			actionCfg.targetTitle = linkParts[0];

			var action = new BS.action.APICopyPage( actionCfg );
			action.on( 'beforesaveedit', me.modifyCopiedPageContent, me );

			actions.push( action );

			return '[['+linkParts.join( '|' )+']]';
		});

		var targetBookPageTitle = new mw.Title(
			this.tfTargetBookTitle.getValue(),
			bs.ns.NS_BOOK
		);

		var bookPageCreateAction = new BS.action.APIEditPage({
			pageTitle: targetBookPageTitle.getPrefixedText(),
			pageContent: modifiedContent
		});

		actions.unshift( bookPageCreateAction );

		return actions;
	},

	modifyCopiedPageContent: function( action, edit ) {
		var targetTitlePrefix = this.getTargetNSPrefix();
		var bookTitle = this.tfTargetBookTitle.getValue();
		bookTitle = new mw.Title( bookTitle, bs.ns.NS_BOOK );

		edit.content = edit.content.replace(/\[\[(.*?)\]\]/gi, function( fullmatch, group ) {
			var linkParts = group.split('|');
			var title = false;
			try {
				title = new mw.Title( linkParts[0] );
			}
			catch( e ) {
				return fullmatch;
				console.log( e );
			}
			if( !title || ( title.getNamespaceId() < 3000 && title.getNamespaceId() !== bs.ns.NS_MAIN ) ) {
				return fullmatch;
			}

			linkParts[0] = targetTitlePrefix + title.getNameText();
			return '[['+linkParts.join( '|' )+']]';
		});
		edit.content = edit.content.replace(/<(bs:)?bookshelf.*?(src|book)=\"(.*?)\".*?\/>/gi, function( fullmatch, group ) {
			return '<bs:bookshelf src="'+bookTitle.getPrefixedText()+'" />';
		});
	},

	getTargetNSPrefix: function () {
		var targetTitlePrefix = '';
		var targetNsText = this.cbTargetNamespace.getRawValue();
		var targetNsId = this.cbTargetNamespace.getValue();
		if( targetNsText !== '' && targetNsId !== bs.ns.NS_MAIN ) {
			targetTitlePrefix = targetNsText + ':';
		}
		return targetTitlePrefix;
	},

	onDlgBatchActionsOK: function( sender, data ) {
		this.setLoading( false );
		this.fireEvent( 'ok', this, data );
		this.close();
	}
});