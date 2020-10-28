Ext.define('BS.BookshelfUI.panel.BookEditor', {
	extend: 'BS.CRUDPanel',
	requires: [
		'BS.BookshelfUI.model.CheckablePageNode', 'BS.BookshelfUI.MetaDialog',
		'BS.BookshelfUI.BookTreePanel', 'BS.BookshelfUI.TreeHelper',
		'BS.BookshelfUI.dialog.WikiPageNode', 'BS.dialog.BatchActions',
		'BS.action.APIEditPage', 'BS.action.APICopyPage', 'BS.BookshelfUI.dialog.AddMass'
	],
	width: 'auto',

	//Custom settings
	bookTree: {},
	bookMeta: [],
	bookMetaConfig: {},
	bookExists: false,
	bookEdit: false,

	isDirty: false,

	initComponent: function() {
		this.makeAddMassButton();

		this.miSaveAndModifyArticles = new Ext.menu.Item({
			id: this.getId() + '-btn-save-and-modify-articles',
			text: mw.message('bs-bookshelfui-save-and-modify').plain()
		});
		this.miSaveAndModifyArticles.on('click', this.onMiSaveAndModifyArticles, this);

		this.btnOK = Ext.create('Ext.button.Split', {
			text: mw.message('bs-extjs-save').plain(),
			id: this.getId() + '-btn-save',
			menu: new Ext.menu.Menu({
				items: [
					this.miSaveAndModifyArticles
				]
			})
		});
		this.btnOK.on('click', this.onBtnOKClick, this);

		this.btnCancel = Ext.create('Ext.Button', {
			text: mw.message('bs-extjs-cancel').plain(),
			id: this.getId() + '-btn-cancel'
		});
		this.btnCancel.on('click', this.onBtnCancelClick, this);

		//Allow exportmodules to add their menu item
		var exportMenuItems = [];
		$(document).trigger('BSUniversalExportMenuItems', [this, exportMenuItems]);
		if (exportMenuItems.length > 0) {
			var menu = new Ext.menu.Menu({
				ignoreParentClicks: true,
				items: exportMenuItems
			});
			this.btnExportSelection = Ext.create( 'Ext.Button', {
				id: this.getId()+'-btn-export',
				text: mw.message('bs-bookshelfui-export-selection').plain(),
				menu: menu
			});
			menu.on('click', this.onExportMenuClick, this);
		}

		$(document).trigger('BSBookshelfEditorPanelInit', [ this, [] ]);
		this.tpChapters = new BS.BookshelfUI.BookTreePanel( {
			allowEdit: this.bookEdit,
			treeData: this.bookTree
		} );
		this.tpChapters.on('select', this.onTpChaptersSelect, this );
		this.tpChapters.on('dirty', this.onTpChaptersDirty, this );

		//Buttons only if user may edit
		if( this.bookEdit ) {
			this.buttons = [
				this.btnOK,
				this.btnCancel
			];
		}

		this.callParent(arguments);
	},

	makeAddMassButton: function() {
		this.btnAddMass = Ext.create( 'Ext.Button', {
			id: this.getId()+'-btn-add-mass',
			icon: mw.config.get( 'wgScriptPath') + '/extensions/BlueSpiceBookshelfUI/resources/images/bs-btn_massadd.png',
			iconCls: 'btn'+this.tbarHeight,
			tooltip: mw.message( 'bs-bookshelfui-extjs-tooltip-add-mass' ).plain(),
			height: 50,
			width: 52,
			disabled: true
		});
		this.btnAddMass.on( 'click', this.onBtnAddMassClick, this );
	},

	makeTbarItems: function() {
		this.callParent( arguments );
		var items = [];
		if( this.bookEdit ) {
			this.btnEdit.enable();
			this.btnAddMass.enable();
			items = [
				this.btnAdd,
				this.btnAddMass,
				this.btnRemove,
				'-',
				this.btnEdit
			];
		}

		if( this.btnExportSelection ) {
			items.push( '->' );
			items.push( this.btnExportSelection );
		}
		return items;
	},

	//Knock out base class code
	afterInitComponent: function() {},

	makeItems: function() {
		this.callParent();
		return [
			this.tpChapters
		];
	},

	onTpChaptersSelect: function( treemodel, record, index, eOpts ) {
		this.btnRemove.enable();

		if( record.isRoot() ) {
			this.btnEdit.enable();
			this.btnRemove.disable();
		}
		else {
			this.btnEdit.disable();
		}
	},

	onTpChaptersDirty: function( sender ) {
		this.setDirty(true);
	},

	onExportMenuClick: function( menu, item, e, eOpts ){
		var selectedArticles = BS.BookshelfUI.TreeHelper.serializeTree(
			this.tpChapters, { onlyChecked: true }
		);

		if( selectedArticles === '[]' ) { //Nothing was selected
			bs.util.alert(
				'bs-bui-editor-alert-nothingtoexport',
				{
					textMsg: 'bs-bookshelfui-nothingtoexport-text'
				}
			);
			return;
		}

		this.setLoading( mw.message('bs-bookshelfui-export-book-text').plain() );
		var me = this;
		var targetUrl = mw.util.getUrl(
			'Special:UniversalExport/' + this.tpChapters.getRootNode().get( 'articleTitle' )
		);
		var params = {
			'ue[module]': item.exportModule,
			'ue[articles]': selectedArticles
		};
		var encParams = $.param( params );
		var fileExtension = item.fileExtension;

		//HINT: https://nehalist.io/downloading-files-from-post-requests/
		var request = new XMLHttpRequest();
		request.open( 'POST', targetUrl, true );
		request.setRequestHeader(
			'Content-Type',
			'application/x-www-form-urlencoded; charset=UTF-8'
		);
		request.responseType = 'blob';
		request.onload = function() {
			if( request.status === 200 ) {
				// Try to find out the filename from the content disposition `filename` value
				var disposition = request.getResponseHeader( 'content-disposition' );
				var matches = /"([^"]*)"/.exec( disposition );
				var filename = matches !== null && matches[1]
					? matches[1]
					: 'file.' + fileExtension;

				//Even though the HTTP headers look fine in the network panel,
				//`XMLHttpRequest::getResponseHeader` double UTF8 encodes the value.
				//This is something like "decode_utf8".
				filename = decodeURIComponent( escape( filename ) );

				var blob = request.response;

				 if (navigator.msSaveOrOpenBlob) {
					navigator.msSaveOrOpenBlob( blob, filename );
				} else {
					var objectUrl = window.URL.createObjectURL( blob );

					//HINT: Alternatively `window.open( objectUrl );` would open the file in a new tab.
					//But then again we'd have no filename and the user would need to save the file
					//manually.
					var link = document.createElement( 'a' );
					link.href = objectUrl;
					link.download = filename;

					document.body.appendChild( link );
					link.click();
					document.body.removeChild( link );
					window.URL.revokeObjectURL( objectUrl );
				}
			}
			me.setLoading( false );
		};

		request.send( encParams );
	},

	onBtnOKClick: function() {
		// Allow creating empty books
		if( this.isDirty === false && !this.isNewEmpty() ) {
			return;
		}
		this.doSaveHierarchy( false );
	},

	isNewEmpty: function() {
		return this.bookTree.children.length === 0 && this.bookExists === false;
	},

	onMiSaveAndModifyArticles: function() {
		bs.util.confirm(
			'bs-bui-editor-confirm-override',
			{
				titleMsg: 'bs-bookshelfui-override-tag-title',
				textMsg: 'bs-bookshelfui-override-tag-text'
			},
			{
				ok: function() {
					this.doSaveHierarchy( true );
				},
				scope: this
			}
		);
	},

	doSaveHierarchy: function( overrideTags ) {
		var me = this;

		if( !this.dlgBatchActions ) {
			this.dlgBatchActions = new BS.dialog.BatchActions( {
				id: this.makeId( 'dialog-batchactions-save' )
			} );
			this.dlgBatchActions.on( 'ok', this.onDlgBatchActionsOK, this );
		}

		me.dlgBatchActions.setData( this.makeSaveActions( overrideTags ) );
		me.dlgBatchActions.show();
		me.dlgBatchActions.startProcessing();
	},

	makeSaveActions: function( overrideTags ) {
		var me = this;
		var actions = [];
		var bookTargetTitle = this.tpChapters.getRootNode().get('articleTitle');

		var aBookPageContentLines = [];
		aBookPageContentLines.push( this.makeMetaTag() );

		this.tpChapters.getRootNode().cascadeBy( function( node ) {
			if( node.isRoot() ) {
				return;
			}
			var bookshelfData = node.get( 'bookshelf' );
			var type = bookshelfData.type;
			var serializedNode = node.get( 'text' );

			//TODO: external serialization for types 'wikipage' and 'tag'
			if( type === 'wikipage' ) {
				var Title = mw.Title.newFromText( bookshelfData.page_title, bookshelfData.page_namespace );
				serializedNode = '[[{0}|{1}]]'.format(
					Title.getPrefixedText(),
					node.get( 'articleDisplayTitle' )
				);

				if( overrideTags ) {
					var bookshelfTag = '<bookshelf src="' + bookTargetTitle + '" />' + "\n";

					if( bookshelfData.page_id === 0 ) {
						var action =  new BS.action.APIEditPage({
							pageTitle: Title.getPrefixedText(),
							pageContent: bookshelfTag
						});
					}
					else {
						var action = new BS.action.APICopyPage({
							sourceTitle: Title.getPrefixedText(),
							targetTitle: Title.getPrefixedText() //We just want to modify the content
						});
						action.on( 'beforesaveedit', function( action, edit ) {
							edit.content = edit.content.replace(/<(bs:)?bookshelf.*?(src|book)=\"(.*?)\".*?\/>/gi, function( fullmatch, group ) {
								return '';
							});
							edit.content = bookshelfTag + me.trimPageContent( edit.content );
						});
					}
					actions.push( action );
				}
			} else if ( type === 'text' ) {
				serializedNode = node.get( 'articleDisplayTitle' );
			}

			aBookPageContentLines.push(
				Ext.String.repeat( '*', node.getDepth() ) +
				" " + serializedNode );
		});

		var bookPageEditAction = new BS.action.APIEditPage({
			pageTitle: bookTargetTitle,
			pageContent: aBookPageContentLines.join( "\n" )
		});

		actions.unshift( bookPageEditAction );

		return actions;
	},

	trimPageContent: function( text ) {
		//'trim()' does not remove "new lines"
		return text.replace( /^\s+|\s+$/g, '').trim();
	},

	makeMetaTag: function() {
		return mw.html.element( 'bookmeta', this.bookMeta );
	},

	onDlgBatchActionsOK: function() {
		this.setDirty(false);
	},

	onBtnCancelClick: function() {
		window.history.back();
	},

	onBtnAddClick: function( oButton, oEvent ) {
		if( !this.dlgAddArticle ) {
			this.dlgAddArticle = new BS.BookshelfUI.dialog.WikiPageNode( {
				id: this.makeId( 'add-wikipage-node-dialog' )
			} );
			this.dlgAddArticle.on( 'ok', this.onDlgAddArticleOk, this );
		}
		this.dlgAddArticle.show();
		this.callParent(arguments);
	},

	onBtnAddMassClick: function( oButton, oEvent ) {
		if( !this.dlgMassAdd ) {
			this.dlgMassAdd = new BS.BookshelfUI.dialog.AddMass();
			this.dlgMassAdd.on( 'ok', this.onDlgMassAddOk, this );
		}
		this.dlgMassAdd.show();
	},

	onDlgAddArticleOk: function( dialog, data ) {
		var selectedNode = this.tpChapters.getSingleSelection();
		if( !selectedNode ) {
			selectedNode = this.tpChapters.getRootNode();
		}

		data.children = []; //Allow D&D into this node
		if( data.id === 0 ) { //Avoid treenode-id-collision with non-existing pages
			data.id = data.text;
		}
		selectedNode.appendChild(data);
	},

	onDlgMassAddOk: function( dialog, data ) {
		var selectedNode = this.tpChapters.getSingleSelection();
		if( !selectedNode ) {
			selectedNode = this.tpChapters.getRootNode();
		}

		this.addMassPages( data, selectedNode );
	},

	onDlgMetaOk: function( dialog, data ) {
		this.bookMeta = data;
		this.setDirty(true);
	},

	onBtnEditClick: function(  oButton, oEvent  ) {
		if( !this.dlgMeta ) {
			this.dlgMeta = new BS.BookshelfUI.MetaDialog({
				metaData: this.bookMeta,
				metaDataConfig: this.bookMetaConfig
			});
			this.dlgMeta.on( 'ok', this.onDlgMetaOk, this );
		}
		this.dlgMeta.show();
		this.callParent(arguments);
	},

	onBtnRemoveClick: function( oButton, oEvent ) {
		bs.util.confirm(
			'bs-bui-editor-confirm-remove',
			{
				titleMsg: 'bs-bookshelfui-confirm-delete-title',
				textMsg: 'bs-bookshelfui-confirm-delete-text'
			},
			{
				ok: function() {
					var node = this.tpChapters.getSingleSelection();
					if( node ) {
						node.remove();
					}

					//Let's see if there are "checked" nodes beside the selected one
					var checkedNodes = this.tpChapters.getView().getChecked();
					for( var i = 0; i < checkedNodes.length; i++ ) {
						checkedNodes[i].remove();
					}
				},
				scope: this
			}
		);
		this.callParent(arguments);
	},

	setDirty: function( dirty ) {
		this.isDirty = dirty;
		if( dirty ) {
			this.tpChapters.addCls('bs-bookeditor-dirty');
			if( this.btnExportSelection ) {
				this.btnExportSelection.disable();
			}
		}
		else {
			this.tpChapters.removeCls('bs-bookeditor-dirty');
			if( this.btnExportSelection ) {
				this.btnExportSelection.enable();
			}
		}
	},

	addMassPages: function( data, selectedNode ) {
		var api = new mw.Api();
		var me = this;
		api.get( {
			action: 'bs-bookshelf-mass-add-page-store',
			'root': data.root,
			'type': data.selectedType
		} )
		.done( function( response ){
			var pages = response.results;
			me.addPages( pages, selectedNode );
		});
	},

	addPages: function( pages, selectedNode ) {
		for( var i = 0; i < pages.length; i++ ) {
			var currentPage = pages[i];
			var individualPage = {
				bookshelf: {
					type: 'wikipage'
				}
			};

			individualPage.children = [];
			individualPage.id = currentPage.prefixed_text;
			individualPage.text = currentPage.page_title;
			individualPage.prefixedText = currentPage.prefixed_text;

			individualPage.bookshelf.page_id = currentPage.page_id;
			individualPage.bookshelf.page_namespace = currentPage.page_namespace;
			individualPage.bookshelf.page_title = currentPage.page_title;

			//Mapping to TreePanel config
			individualPage.articleTitle = currentPage.prefixed_text;
			individualPage.articleId = currentPage.page_id;

			individualPage.text = currentPage.prefixed_text;
			individualPage.articleDisplayTitle = currentPage.prefixed_text;

			selectedNode.appendChild( individualPage );
		}
	}
});
