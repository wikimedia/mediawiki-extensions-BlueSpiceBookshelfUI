<?php

namespace BlueSpice\BookshelfUI\Hook\OutputPageBeforeHTML;

use BlueSpice\BookshelfUI\Panel\BookNav;
use BlueSpice\Hook\OutputPageBeforeHTML;
use BlueSpice\SkinData;

class AddBookshelfUI extends OutputPageBeforeHTML {

	protected function doProcess() {
		$this->addSiteNavTab();
		$this->addGlobalActions();

		return true;
	}

	protected function addGlobalActions() {
		$bookManager = \MediaWiki\MediaWikiServices::getInstance()
			->getSpecialPageFactory()
			->getPage( 'BookshelfBookManager' );

		if ( !$this->getContext()
			->getUser()
			->isAllowed( $bookManager->getRestriction() )
		) {
			return true;
		}

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
