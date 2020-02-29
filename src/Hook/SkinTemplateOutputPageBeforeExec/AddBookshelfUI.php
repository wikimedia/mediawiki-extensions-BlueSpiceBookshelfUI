<?php

namespace BlueSpice\BookshelfUI\Hook\SkinTemplateOutputPageBeforeExec;

use BlueSpice\BookshelfUI\Panel\BookNav;
use BlueSpice\Hook\SkinTemplateOutputPageBeforeExec;
use BlueSpice\SkinData;

class AddBookshelfUI extends SkinTemplateOutputPageBeforeExec {

	protected function skipProcessing() {
		return false;
	}

	protected function doProcess() {
		$this->addSiteNavTab();
		$this->addGlobalActions();

		return true;
	}

	protected function addGlobalActions() {
		$bookManager = \MediaWiki\MediaWikiServices::getInstance()
			->getSpecialPageFactory()
			->getPage( 'BookshelfBookManager' );
		$this->mergeSkinDataArray(
			SkinData::GLOBAL_ACTIONS,
			[
				'bs-bookshelfui-bookmanager' => [
					'href' => $bookManager->getPageTitle()->getFullURL(),
					'text' => wfMessage( 'bookshelfbookmanager' )->plain(),
					'title' => wfMessage( 'bs-bookshelfui-extension-description' ),
					'iconClass' => 'icon-books'
				]
			]
		);
	}

	protected function addSiteNavTab() {
		$this->mergeSkinDataArray(
			SkinData::SITE_NAV,
			[
				'bs-bookshelfui' => [
					'position' => 30,
					'callback' => function ( $sktemplate ) {
						return new BookNav( $sktemplate );
					}
				]
			]
		);
	}

}
