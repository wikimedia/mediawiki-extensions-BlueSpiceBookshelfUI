Ext.define( 'BS.BookshelfUI.panel.BookManager', {
	extend: 'BS.CRUDGridPanel',
	requires: [
		'BS.BookshelfUI.dialog.CopyPrompt', 'BS.BookshelfUI.dialog.NewPrompt'
	],

	initComponent: function() {

		this.makeCopyButton();

		this.colMainConf.columns = this.makeColumns();

		this.groupingFeature = new Ext.grid.feature.Grouping({
			enableGroupingMenu:false,
			enableNoGroups: false,
			groupHeaderTpl: [
				'{name:this.formatName(values.rows.length)}', {
					formatName: function( name, count ) {
						var groupName = mw.message("bs-bookshelfui-grouping-template-type-"+name).parse();
						var groupInfo = mw.message("bs-bookshelfui-grouping-template-books", count).parse();
						return groupName + ' ' + groupInfo;
					}
				}
			]
		});

		this.gpMainConf.features = [
			this.groupingFeature
		];

		var storeFields = [ 'page_id', 'page_title', 'page_namespace',
			'book_first_chapter_prefixedtext', 'book_prefixedtext',
			'book_type', 'book_displaytext', 'book_meta' ];

		$(document).trigger('BSBookshelfUIManagerPanelInit', [ this, this.colMainConf, storeFields ]);

		//this.colMainConf.columns.defaults.sortable=false would be better but
		//due to poor design of BS.CRUDGridPanel this is not possible
		for( var i = 0; i < this.colMainConf.columns.length; i++ ) {
			if( this.colMainConf.columns[i].sortable !== true ) {
				this.colMainConf.columns[i].sortable = false;
			}
		}

		this.strMain = Ext.create( 'Ext.data.JsonStore', {
			proxy: {
				type: 'ajax',
				url: mw.util.wikiScript('api'),
				reader: {
					type: 'json',
					rootProperty: 'results',
					idProperty: 'page_id',
					totalProperty: 'total'
				},
				extraParams: {
					action: 'bs-bookshelf-store',
					format: 'json'
				}
			},
			autoLoad: true,
			remoteSort: true,
			fields: storeFields,
			groupField:'book_type',
			sortInfo: {
				field: 'page_title',
				direction: 'ASC'
			}
		});

		this.callParent(arguments);
	},

	onBtnAddClick: function( oButton, oEvent ) {
		var dlgNew = new BS.BookshelfUI.dialog.NewPrompt();
		dlgNew.show();
		this.callParent(arguments);
	},

	onActionCopyClick:function(grid, rowIndex, colIndex) {
		this.grdMain.getSelectionModel().select(
			this.grdMain.getStore().getAt( rowIndex )
		);
		this.onBtnCopyClick( this.btnCopy, {} );
	},

	dlgCopy: null,
	onBtnCopyClick: function(  oButton, oEvent  ) {
		if( !this.dlgCopy ) {
			this.dlgCopy = new BS.BookshelfUI.dialog.CopyPrompt();
			this.dlgCopy.on( 'ok', function() {
				this.grdMain.getStore().reload();
			}, this );
		}
		var record = this.getSingleSelection();

		this.dlgCopy.setData( record.getData() );
		this.dlgCopy.show();
	},

	onGrdMainRowClick: function( oSender, iRowIndex, oEvent ) {
		this.callParent(arguments);
		this.btnCopy.enable();

		var selectedRecords = this.grdMain.getSelectionModel().getSelection();
		if( selectedRecords.length > 1 ) {
			this.btnCopy.disable();
		}
	},

	onBtnEditClick: function(  oButton, oEvent  ) {
		var record = this.getSingleSelection();
		var url = mw.util.getUrl(
			'Special:BookshelfBookUI/'
			+ record.get('book_prefixedtext')
		);
		window.location.href = url;
		this.callParent(arguments);
	},

	onBtnRemoveClick: function( oButton, oEvent ) {
		bs.util.confirm(
			'bs-bookshelfui-confirm-delete',
			{
				titleMsg: 'bs-bookshelfui-delete-book-title',
				textMsg: 'bs-bookshelfui-delete-book-text'
			},
			{
				ok: this.doDeleteBook,
				scope: this
			}
		);
		this.callParent(arguments);
	},

	progressMsg: null,
	doDeleteBook: function() {
		var record = this.getSingleSelection();
		var me = this;
		var pageId = record.get('page_id');

		this.progressMsg = Ext.Msg.wait(
			mw.message('bs-bookshelfui-manager-deletingprogress-text').plain(),
			mw.message('bs-bookshelfui-manager-deletingprogress-title').plain()
		);

		var api = new mw.Api();
		api.postWithToken( 'csrf', {
			action: 'bs-bookshelf-manage',
			task: 'deleteBook',
			taskData: Ext.encode( {
				'book_page_id': pageId
			} )
		})
		.fail(function( protocol, response ) {
			me.progressMsg.hide();
			bs.util.alert(
				'bs-bui-editor-delete-error',
				{
					text: response.exception
				}
			);
		})
		.done(function( response, xhr ){
			if (response.success) {
				mw.notify(
					mw.msg( 'bs-bookshelfui-manager-deletionsuccess-text' ),
					{ title: mw.msg( 'bs-bookshelfui-manager-deletionsuccess-title' ) }
				);
			}
			else {
				bs.util.alert(
					'bs-bui-editor-delete-error',
					{
						titleMsg: 'bs-bookshelfui-manager-deletionfailure-title',
						text: mw.message(
							'bs-bookshelfui-manager-deletionfailure-text',
							response.message
						).parse()
					}
				);
			}
			me.progressMsg.hide();
			me.strMain.reload();
		});
	},

	makeCopyButton: function () {
		this.btnCopy = Ext.create( 'Ext.Button', {
			id: this.getId()+'-btn-copy',
			icon: mw.config.get( 'wgScriptPath') + '/extensions/BlueSpiceBookshelfUI/resources/images/bs-btn_bookclone.png',
			iconCls: 'btn'+this.tbarHeight,
			tooltip: mw.message('bs-bookshelfui-extjs-tooltip-copy').plain(),
			height: 50,
			width: 52,
			disabled: true
		});
		this.btnCopy.on( 'click', this.onBtnCopyClick, this );

		this.colMainConf.actions.push({
			iconCls: 'bs-extjs-actioncolumn-icon icon-copy contructive',
			glyph: true,
			tooltip: mw.message('bs-bookshelfui-extjs-tooltip-copy').plain(),
			handler: this.onActionCopyClick,
			scope: this
		});
	},

	makeTbarItems: function() {
		this.callParent( arguments );
		return [
			this.btnAdd,
			this.btnCopy,
			this.btnEdit,
			this.btnRemove
		];
	},

	makeColumns: function() {
		return [
			{
				dataIndex: 'book_displaytext',
				header: mw.message( 'bs-bookshelfui-manager-title' ).plain(),
				sortable: true,
				groupable: false,
				filter: {
					type: 'string'
				},
				renderer: function( value, metaData, record, rowIndex, colIndex, store ) {
					//TODO: make a BSF util like 'bs.uril.makePageLink( prefixedText )'
					//that sets all required attributes
					var title = new mw.Title(
						record.get('page_title'),
						record.get('page_namespace')
					);

					return mw.html.element(
						'a',
						{
							'href': mw.util.getUrl( 'Special:BookshelfBookUI/' + title.getPrefixedText() ),
							'data-bs-title': title.getPrefixedText()
						},
						value
					);
				}
			}
		];
	}
});