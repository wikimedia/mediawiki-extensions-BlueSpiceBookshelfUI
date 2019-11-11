<?php

use BlueSpice\Special\ManagerBase;

class SpecialBookshelfBookUI extends ManagerBase {

	public function __construct() {
		parent::__construct( 'BookshelfBookUI', 'bookshelfbookui-viewspecialpage', false );
	}

	/**
	 *
	 * @param string $par
	 * @return void
	 */
	function execute( $par ) {
		$this->checkPermissions();

		if( empty( $par ) ) {
			$par = $this->getRequest()->getVal( 'book', '' );
		}
		if( empty( $par ) ) {
			$this->getOutput()->addWikiMsg( 'bs-bookshelfui-editor-no-title-provided' );
			return;
		}

		parent::execute( $par );
		$oTitle = Title::newFromText( $par, NS_BOOK );
		$sBookTitle = $oTitle->getText();
		if( $oTitle->getNamespace() === NS_USER ) {
			$sBookTitle = $oTitle->getSubpageText();
		}

		$this->getOutput()->setPageTitle( wfMessage('bs-bookshelfui-editor-title', $sBookTitle )->plain() );
		$sBookManagerLink = Linker::link(
			SpecialPage::getTitleFor( 'BookshelfBookManager' ),
			wfMessage( 'bookshelfbookmanager' )->escaped()
		);
		$sBookTitleLink = Linker::link(
			$oTitle,
			wfMessage( 'bs-bookshelfui-open-source' )->escaped()
		);
		$sBookTitleEditLink = Linker::link(
			$oTitle,
			wfMessage( 'bs-bookshelfui-edit-source' )->escaped(),
			array(),
			array( 'action' => 'edit' )
		);

		$this->getOutput()->setSubtitle(
			$sBookManagerLink .' | '. $sBookTitleLink .' | '. $sBookTitleEditLink
		);

		$oMeta = new stdClass();
		try {
			$oPHP = PageHierarchyProvider::getInstanceFor( $oTitle->getPrefixedText() );
			$oTree = $oPHP->getExtendedTOCJSON( array( 'suppress-number-in-text' => true ) );
			$oMeta = (object)$oPHP->getBookMeta();
			if ($oTree === null) {
				throw new Exception();
			}
			$oTree->text = $sBookTitle;
		} catch ( Exception $ex ) {
			//This is a new book
			$oTree = array(
				'text' => $sBookTitle,
				'articleTitle' => $oTitle->getPrefixedText(),
				'articleDisplayTitle' => $oTitle->getPrefixedText(),
				'children' => array()
			);
		}

		$oBookMetaConfig = array(
			'title' => array(
				'displayName' => wfMessage('bs-bookshelfui-bookmetatag-title')->text()
			),
			'subtitle' => array(
				'displayName' => wfMessage('bs-bookshelfui-bookmetatag-subtitle')->text()
			),
			'author1' => array(
				'displayName' => wfMessage('bs-bookshelfui-bookmetatag-author1')->text()
			),
			'author2' => array(
				'displayName' => wfMessage('bs-bookshelfui-bookmetatag-author2')->text()
			),
			'docummentidentifier' => array(
				'displayName' => wfMessage('bs-bookshelfui-bookmetatag-docummentidentifier')->text()
			),
			'docummenttype' => array(
				'displayName' => wfMessage('bs-bookshelfui-bookmetatag-docummenttype')->text()
			),
			'department' => array(
				'displayName' => wfMessage('bs-bookshelfui-bookmetatag-department')->text()
			),
			'version' => array(
				'displayName' => wfMessage('bs-bookshelfui-bookmetatag-version')->text()
			),
		);

		$oData = new stdClass();
		$oData->bookTree = $oTree;
		$oData->bookMeta = $oMeta;
		$oData->bookMetaConfig = $oBookMetaConfig;
		$oData->bookEdit = $oTitle->userCan( 'edit' );

		Hooks::run( 'BSBookshelfBookUI', array( $this, $this->getOutput(), $oData ) );
		$this->getOutput()->addJsConfigVars( 'bsBookshelfData', $oData );
	}

	/**
	 * @return string ID of the HTML element being added
	 */
	protected function getId() {
		return 'bs-bookshelfui-editorpanel';
	}

	/**
	 * @return array
	 */
	protected function getModules() {
		return [
			'ext.bluespice.bookshelf.styles',
			'ext.bluespice.bookshelfUI.editor'
		];
	}
}
